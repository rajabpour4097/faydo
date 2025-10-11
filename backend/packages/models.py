from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.forms import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


# Comment Model - Generic برای همه مدل‌ها
class Comment(BaseModel):
    # Generic Foreign Key برای ارتباط با هر مدلی
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # کاربری که کامنت گذاشته
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='comments')
    
    # محتوای کامنت
    text = models.TextField()
    
    class Meta:
        verbose_name = 'کامنت'
        verbose_name_plural = 'کامنت‌ها'
        ordering = ['-created_at']
        unique_together = ['content_type', 'object_id', 'user']
    
    def __str__(self):
        return f'{self.user.username} - {self.text[:50]}'

# CommentLike Model
class CommentLike(BaseModel):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='comment_likes')
    
    class Meta:
        verbose_name = 'لایک کامنت'
        verbose_name_plural = 'لایک‌های کامنت'
        unique_together = ['comment', 'user']  # یک کاربر فقط یک بار می‌تواند لایک کند
    
    def __str__(self):
        return f'{self.user.username} liked {self.comment.id}'
    

#Business Package
class Package(BaseModel):
    business = models.ForeignKey('accounts.BusinessProfile', on_delete=models.CASCADE, related_name="packages")
    is_active = models.BooleanField(default=False)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=10, 
                              choices=[('draft', 'پیش‌نویس'),
                                       ('pending', 'درحال بررسی'),
                                       ('approved', 'تایید شده'),
                                       ('rejected', 'نیاز به ویرایش'),
                                       ('canceled', 'لغو شده'),
                                       ('expired', 'منقضی شده')
                                       ], 
                              default='draft'
                              )
    is_complete = models.BooleanField(default=False)

    class Meta:
        verbose_name = "پکیج"
        verbose_name_plural = "پکیج‌ها"

    def __str__(self):
        return f'{self.business.name} - {self.id}'
    
    def check_completion(self):
        """
        بررسی کامل بودن پکیج:
        - باید DiscountAll داشته باشد
        - باید EliteGift داشته باشد  
        - باید حداقل یک VipExperience داشته باشد
        - باید start_date و end_date پر شده باشد
        """
        has_discount_all = hasattr(self, 'discount_all')
        has_elite_gift = hasattr(self, 'elite_gift')
        has_vip_experiences = self.experiences.exists()
        has_dates = bool(self.start_date and self.end_date)
        
        return bool(has_discount_all and has_elite_gift and has_vip_experiences and has_dates)
    
    def get_active_package_for_business(self):
        """
        دریافت پکیج فعال کسب‌وکار
        """
        return Package.objects.filter(
            business=self.business,
            is_active=True,
            status='approved'
        ).first()
    
    def has_active_package_with_less_than_10_days(self):
        """
        بررسی اینکه آیا کسب‌وکار پکیج فعالی دارد که کمتر از ۱۰ روز به پایان آن مانده
        """
        from django.utils import timezone
        from datetime import timedelta
        
        active_package = self.get_active_package_for_business()
        if not active_package or not active_package.end_date:
            return False
        
        today = timezone.now().date()
        days_remaining = (active_package.end_date - today).days
        return days_remaining < 10
    
    def is_first_package_for_business(self):
        """
        بررسی اینکه آیا این اولین پکیج کسب‌وکار است
        """
        return not Package.objects.filter(
            business=self.business,
            status__in=['approved', 'pending']
        ).exclude(id=self.id).exists()
    
    def can_activate_immediately(self):
        """
        بررسی اینکه آیا پکیج می‌تواند فوراً فعال شود
        """
        # اگر اولین پکیج کسب‌وکار است، می‌تواند فوراً فعال شود
        if self.is_first_package_for_business():
            return True
        
        # اگر پکیج فعالی وجود ندارد، می‌تواند فعال شود
        if not self.get_active_package_for_business():
            return True
        
        # اگر پکیج فعالی وجود دارد اما کمتر از ۱۰ روز به پایان آن مانده، نمی‌تواند فعال شود
        return False
    
    def activate_package(self):
        """
        فعال کردن پکیج
        """
        # ابتدا تمام پکیج‌های فعال کسب‌وکار را غیرفعال کن
        self.deactivate_all_business_packages()
        
        # حالا این پکیج را فعال کن
        self.is_active = True
        # استفاده از update برای جلوگیری از signal recursion
        Package.objects.filter(id=self.id).update(is_active=True)

    def deactivate_package(self):
        """
        غیرفعال کردن پکیج
        """
        # استفاده از update برای جلوگیری از signal recursion
        Package.objects.filter(id=self.id).update(is_active=False)
    
    def deactivate_all_business_packages(self):
        """
        غیرفعال کردن تمام پکیج‌های فعال کسب‌وکار
        """
        Package.objects.filter(
            business=self.business,
            is_active=True,
            status='approved'
        ).update(is_active=False)
    
    @classmethod
    def activate_pending_packages_for_expired(cls):
        """
        فعال‌سازی خودکار پکیج‌های در انتظار پس از انقضای پکیج‌های فعال
        """
        from django.utils import timezone
        
        today = timezone.now().date()
        activated_count = 0
        
        # پیدا کردن پکیج‌های فعالی که امروز منقضی شده‌اند
        expired_active_packages = cls.objects.filter(
            is_active=True,
            status='approved',
            end_date__lte=today
        )
        
        for expired_package in expired_active_packages:
            # غیرفعال کردن پکیج منقضی شده
            expired_package.deactivate_package()
            
            # پیدا کردن پکیج بعدی در انتظار برای همان کسب‌وکار
            next_pending_package = cls.objects.filter(
                business=expired_package.business,
                status='approved',
                is_active=False,
                is_complete=True
            ).order_by('created_at').first()
            
            if next_pending_package:
                # فعال کردن پکیج بعدی
                next_pending_package.activate_package()
                activated_count += 1
        
        return activated_count

    def save(self, *args, **kwargs):
        # بررسی کامل بودن قبل از ذخیره
        if self.pk:
            # اگر تغییر از admin panel آمده، is_complete را دستی کنترل کن
            if not hasattr(self, '_admin_override'):
                self.is_complete = self.check_completion()
        else:
            # برای packages جدید، is_complete را False تنظیم کن
            self.is_complete = False
        super().save(*args, **kwargs)

#Discount for products or services
class DiscountAll(BaseModel):
    package = models.OneToOneField(Package, on_delete=models.CASCADE, related_name="discount_all")
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=1
    )
    # Generic Relation برای کامنت‌ها
    comments = GenericRelation(Comment, related_query_name='discount_all')

    class Meta:
        verbose_name = 'تخفیف روی تمام محصولات'
        verbose_name_plural = 'تخفیف‌های روی تمام محصولات'

    def __str__(self):
        return "تمام محصولات"


#Discount for a specific product or service. It should be bigger than Discount All in each package
class SpecificDiscount(BaseModel):
    package = models.OneToOneField(Package, on_delete=models.CASCADE, related_name="specific_discount")
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=1
    )
    # Generic Relation برای کامنت‌ها
    comments = GenericRelation(Comment, related_query_name='specific_discount')

    class Meta:
        verbose_name = 'تخفیف برای موارد خاص'
        verbose_name_plural = 'تخفیف‌های برای موارد خاص'

    def __str__(self):
        return self.title


#Gift for loyal customer
class EliteGift(BaseModel):
    package = models.OneToOneField(Package, on_delete=models.CASCADE, related_name="elite_gift")
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, 
        validators=[MinValueValidator(1)], blank=True, null=True
    )
    count = models.PositiveIntegerField(
        validators=[MinValueValidator(1)], blank=True, null=True
    )
    gift = models.CharField(max_length=255)
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=1
    )
    # Generic Relation برای کامنت‌ها
    comments = GenericRelation(Comment, related_query_name='elite_gift')

    def clean(self):
        if not self.amount and not self.count:
            raise ValidationError("یکی از فیلدها باید پر شود")

    class Meta:
        verbose_name = 'هدیه ویژه'
        verbose_name_plural = 'هدایای ویژه'

    def __str__(self):
        return f'elite gift - {self.gift}'


#For create all VIP experience that can be use in Package VIP Experience
class VipExperienceCategory(BaseModel):
    STAR_CHOICES = [
        ("VIP", "VIP"),
        ("VIP+", "VIP+"),
    ]
    vip_type = models.CharField(max_length=5, choices=STAR_CHOICES)
    category = models.ForeignKey('accounts.ServiceCategory', on_delete=models.CASCADE, related_name="category")#category for business
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "دسته‌بندی VIP"
        verbose_name_plural = "دسته‌بندی‌های VIP"

    def __str__(self):
        return f"{self.name} - {self.vip_type}"

#Choose VIP Experience by business in every packages
class VipExperience(BaseModel):
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name="experiences")
    vip_experience_category = models.ForeignKey(VipExperienceCategory, on_delete=models.CASCADE)
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=1
    )
    # Generic Relation برای کامنت‌ها
    comments = GenericRelation(Comment, related_query_name='vip_experience')

    class Meta:
        verbose_name = "انتخاب VIP"
        verbose_name_plural = "انتخاب‌های VIP"

    def __str__(self):
        return f"{self.package} - {self.vip_experience_category}"
