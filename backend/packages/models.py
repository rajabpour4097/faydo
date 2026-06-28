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
    text = models.TextField(blank=True, null=True)
    
    # امتیاز (1 تا 5)
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    
    # نوع سرویس که نظر برای آن است
    SERVICE_TYPE_CHOICES = [
        ('discount_all', 'تخفیف روی همه'),
        ('specific_discount', 'تخفیف خاص'),
        ('elite_gift', 'هدیه ویژه'),
        ('vip_experience', 'تجربه VIP'),
    ]
    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPE_CHOICES,
        null=True,
        blank=True,
        verbose_name='نوع سرویس'
    )
    
    class Meta:
        verbose_name = 'کامنت'
        verbose_name_plural = 'کامنت‌ها'
        ordering = ['-created_at']
        unique_together = ['content_type', 'object_id', 'user']
    
    def __str__(self):
        return f'{self.user.user.get_full_name() if hasattr(self.user, "user") else self.user} - {self.text[:50] if self.text else "بدون متن"}'

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
    
    def get_average_rating(self):
        """
        محاسبه میانگین امتیازات تمام نظرات این پکیج
        """
        from django.db.models import Avg
        
        total_scores = []
        
        # امتیازات DiscountAll
        if hasattr(self, 'discount_all'):
            discount_scores = self.discount_all.comments.exclude(score__isnull=True).values_list('score', flat=True)
            total_scores.extend(discount_scores)
        
        # امتیازات SpecificDiscount
        if hasattr(self, 'specific_discount'):
            specific_scores = self.specific_discount.comments.exclude(score__isnull=True).values_list('score', flat=True)
            total_scores.extend(specific_scores)
        
        # امتیازات EliteGift
        if hasattr(self, 'elite_gift'):
            gift_scores = self.elite_gift.comments.exclude(score__isnull=True).values_list('score', flat=True)
            total_scores.extend(gift_scores)
        
        # امتیازات VipExperience
        for vip_exp in self.experiences.all():
            vip_scores = vip_exp.comments.exclude(score__isnull=True).values_list('score', flat=True)
            total_scores.extend(vip_scores)
        
        # محاسبه میانگین
        if total_scores:
            return round(sum(total_scores) / len(total_scores), 1)
        return 0.0
    
    def get_total_comments_count(self):
        """
        تعداد کل نظرات این پکیج
        """
        count = 0
        
        if hasattr(self, 'discount_all'):
            count += self.discount_all.comments.count()
        
        if hasattr(self, 'specific_discount'):
            count += self.specific_discount.comments.count()
        
        if hasattr(self, 'elite_gift'):
            count += self.elite_gift.comments.count()
        
        for vip_exp in self.experiences.all():
            count += vip_exp.comments.count()
        
        return count
    
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
        # هر دو سطح طلایی (VIP) و VIP (VIP+) باید وجود داشته باشند
        has_gold = self.experiences.filter(vip_experience_category__vip_type='VIP').exists()
        has_vip = self.experiences.filter(vip_experience_category__vip_type='VIP+').exists()
        has_dates = bool(self.start_date and self.end_date)

        return bool(has_discount_all and has_elite_gift and has_gold and has_vip and has_dates)
    
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
    
    def get_customer_progress(self, customer):
        """
        محاسبه پیشرفت کاربر برای دریافت هدیه ویژه
        بر اساس تراکنش‌های تایید شده در بازه زمانی این پکیج
        
        روش محاسبه:
        1. مجموع تمام تراکنش‌های تایید شده
        2. منهای مجموع تمام Elite Gift های تایید شده (هر کدام به اندازه target)
        3. باقی‌مانده = پیشرفت فعلی
        
        Returns:
            dict: {
                'type': 'amount' یا 'count',
                'target': مقدار هدف (مبلغ یا تعداد),
                'current': مقدار فعلی کاربر,
                'remaining': باقی‌مانده تا هدف,
                'percentage': درصد پیشرفت,
                'eligible': آیا واجد شرایط دریافت هدیه است,
                'transactions_count': تعداد تراکنش‌های محاسبه شده
            }
        """
        from loyalty.models import Transaction, EliteGiftClaim
        from django.db.models import Sum, Count
        
        # بررسی اینکه پکیج تاریخ شروع و پایان دارد
        if not self.package.start_date or not self.package.end_date:
            return {
                'type': 'amount' if self.amount else 'count',
                'target': float(self.amount) if self.amount else self.count,
                'current': 0,
                'remaining': float(self.amount) if self.amount else self.count,
                'percentage': 0,
                'eligible': False,
                'transactions_count': 0,
                'error': 'پکیج فاقد تاریخ شروع یا پایان است'
            }
        
        # فیلتر تراکنش‌های تایید شده در بازه زمانی پکیج
        transactions = Transaction.objects.filter(
            customer=customer,
            business=self.package.business,
            package=self.package,
            status='approved',
            created_at__gte=self.package.start_date,
            created_at__lte=self.package.end_date
        )
        
        # تعداد Elite Gift های تایید شده
        approved_claims_count = EliteGiftClaim.objects.filter(
            customer=customer,
            package=self.package,
            elite_gift=self,
            status='approved'
        ).count()
        
        if self.amount:
            # محاسبه بر اساس مبلغ
            total_amount = transactions.aggregate(
                total=Sum('final_amount')
            )['total'] or 0
            
            target = float(self.amount)
            
            # کسر مقدار Elite Gift های تایید شده
            total_deducted = target * approved_claims_count
            current = float(total_amount) - total_deducted
            
            # اطمینان از اینکه current منفی نمی‌شود
            current = max(0, current)
            
            remaining = max(0, target - current)
            percentage = min(100, (current / target * 100) if target > 0 else 0)
            eligible = current >= target
            
            return {
                'type': 'amount',
                'target': target,
                'current': current,
                'remaining': remaining,
                'percentage': round(percentage, 1),
                'eligible': eligible,
                'transactions_count': transactions.count(),
                'approved_claims': approved_claims_count,
                'total_deducted': total_deducted
            }
        
        elif self.count:
            # محاسبه بر اساس تعداد
            total_count = transactions.count()
            
            target = self.count
            
            # کسر تعداد Elite Gift های تایید شده
            total_deducted = target * approved_claims_count
            current = total_count - total_deducted
            
            # اطمینان از اینکه current منفی نمی‌شود
            current = max(0, current)
            
            remaining = max(0, target - current)
            percentage = min(100, (current / target * 100) if target > 0 else 0)
            eligible = current >= target
            
            return {
                'type': 'count',
                'target': target,
                'current': current,
                'remaining': remaining,
                'percentage': round(percentage, 1),
                'eligible': eligible,
                'transactions_count': total_count,
                'approved_claims': approved_claims_count,
                'total_deducted': total_deducted
            }
        
        return {
            'type': 'unknown',
            'target': 0,
            'current': 0,
            'remaining': 0,
            'percentage': 0,
            'eligible': False,
            'transactions_count': 0,
            'error': 'نوع هدیه نامشخص است'
        }
    
    def is_customer_eligible(self, customer):
        """
        بررسی اینکه آیا کاربر واجد شرایط دریافت هدیه است
        """
        progress = self.get_customer_progress(customer)
        return progress.get('eligible', False)


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
    description = models.TextField(blank=True, null=True, verbose_name='توضیحات کسب‌وکار')
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
