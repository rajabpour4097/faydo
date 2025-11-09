from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import CustomerProfile, BusinessProfile
from packages.models import Package
from django.contrib.contenttypes.fields import GenericRelation


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CustomerLoyalty(BaseModel):
    """
    مدل برای ردیابی وفاداری و امتیازات مشتری نزد یک کسب‌وکار خاص
    """
    customer = models.ForeignKey(
        CustomerProfile, 
        on_delete=models.CASCADE, 
        related_name='loyalties',
        verbose_name='مشتری'
    )
    business = models.ForeignKey(
        BusinessProfile, 
        on_delete=models.CASCADE, 
        related_name='customer_loyalties',
        verbose_name='کسب‌وکار'
    )
    points = models.IntegerField(
        default=0, 
        validators=[MinValueValidator(0)],
        verbose_name='امتیاز'
    )
    
    # ردیابی استفاده از هدیه الیت
    elite_gift_target_reached = models.BooleanField(
        default=False,
        verbose_name='به تارگت هدیه الیت رسیده'
    )
    elite_gift_used = models.BooleanField(
        default=False,
        verbose_name='هدیه الیت استفاده شده'
    )
    elite_gift_used_date = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name='تاریخ استفاده از هدیه الیت'
    )
    
    # وضعیت VIP
    VIP_STATUS_CHOICES = [
        ('none', 'بدون وضعیت VIP'),
        ('vip', 'VIP'),
        ('vip_plus', 'VIP+'),
    ]
    vip_status = models.CharField(
        max_length=10,
        choices=VIP_STATUS_CHOICES,
        default='none',
        verbose_name='وضعیت VIP'
    )

    class Meta:
        verbose_name = 'وفاداری مشتری'
        verbose_name_plural = 'وفاداری مشتریان'
        unique_together = ['customer', 'business']
        ordering = ['-points']

    def __str__(self):
        return f"{self.customer.user.get_full_name()} - {self.business.name} - {self.points} امتیاز"

    def update_vip_status(self):
        """
        بروزرسانی وضعیت VIP بر اساس امتیاز
        VIP: 3000 امتیاز
        VIP+: 7000 امتیاز
        """
        if self.points >= 7000:
            self.vip_status = 'vip_plus'
        elif self.points >= 3000:
            self.vip_status = 'vip'
        else:
            self.vip_status = 'none'
        self.save(update_fields=['vip_status'])

    def check_elite_gift_target(self, package):
        """
        بررسی اینکه آیا مشتری به تارگت هدیه الیت رسیده است
        """
        if not package or not hasattr(package, 'elite_gift'):
            return False
        
        # فرض می‌کنیم تارگت الیت گیفت مبلغ یا تعداد خاصی است
        # که در EliteGift تعریف شده
        # برای مثال اگر amount یا count تعریف شده باشد
        elite_gift = package.elite_gift
        
        # منطق بررسی تارگت را می‌توان بر اساس تراکنش‌ها پیاده‌سازی کرد
        # فعلاً یک placeholder است
        return self.elite_gift_target_reached

    def add_points(self, points):
        """
        افزودن امتیاز به مشتری
        """
        self.points += points
        self.update_vip_status()
        self.save()

    def use_elite_gift(self):
        """
        استفاده از هدیه الیت
        """
        from django.utils import timezone
        
        if not self.elite_gift_target_reached:
            raise ValueError('مشتری به تارگت هدیه الیت نرسیده است')
        
        if self.elite_gift_used:
            raise ValueError('هدیه الیت قبلاً استفاده شده است')
        
        self.elite_gift_used = True
        self.elite_gift_used_date = timezone.now()
        self.save()


class Transaction(BaseModel):
    """
    مدل برای ثبت تراکنش‌ها و پرداخت‌های فاکتور
    """
    STATUS_CHOICES = [
        ('pending', 'در انتظار تایید'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    ]
    
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name='مشتری'
    )
    business = models.ForeignKey(
        BusinessProfile,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name='کسب‌وکار'
    )
    package = models.ForeignKey(
        Package,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        verbose_name='پکیج'
    )
    loyalty = models.ForeignKey(
        CustomerLoyalty,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name='وفاداری'
    )
    
    # مبالغ
    original_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        verbose_name='مبلغ اصلی'
    )
    discount_all_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='مبلغ تخفیف اصلی'
    )
    
    # تخفیف خاص
    has_special_discount = models.BooleanField(
        default=False,
        verbose_name='دارای تخفیف خاص'
    )
    special_discount_title = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='عنوان تخفیف خاص'
    )
    special_discount_original_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='مبلغ اصلی محصول با تخفیف خاص'
    )
    special_discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='مبلغ تخفیف خاص'
    )
    
    # مبلغ نهایی
    final_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        verbose_name='مبلغ نهایی'
    )
    
    # امتیاز کسب شده
    points_earned = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='امتیاز کسب شده'
    )
    
    # وضعیت
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت'
    )
    
    # یادداشت
    note = models.TextField(
        blank=True,
        null=True,
        verbose_name='یادداشت'
    )
    
    # فیلدهای مربوط به کامنت و امتیاز
    can_comment = models.BooleanField(
        default=False,
        verbose_name='امکان کامنت‌گذاری'
    )
    comment_deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='مهلت کامنت‌گذاری'
    )
    has_commented = models.BooleanField(
        default=False,
        verbose_name='کامنت گذاشته شده'
    )
    
    # Generic Relation برای کامنت‌ها
    comments = GenericRelation('packages.Comment', related_query_name='transaction')

    class Meta:
        verbose_name = 'تراکنش'
        verbose_name_plural = 'تراکنش‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.user.get_full_name()} - {self.business.name} - {self.final_amount:,} تومان"

    def calculate_discount(self):
        """
        محاسبه تخفیف‌ها
        """
        # بررسی وجود پکیج
        if not self.package:
            return 0, 0
        
        # بررسی وجود discount_all
        try:
            discount_all = self.package.discount_all
        except:
            return 0, 0
        
        # محاسبه تخفیف اصلی
        discount_all_amount = (self.original_amount * discount_all.percentage) / 100
        
        # محاسبه تخفیف خاص
        special_discount_amount = 0
        if self.has_special_discount:
            try:
                specific_discount = self.package.specific_discount
                special_discount_amount = (
                    self.special_discount_original_amount * specific_discount.percentage
                ) / 100
            except:
                pass
        
        return float(discount_all_amount), float(special_discount_amount)

    def calculate_final_amount(self):
        """
        محاسبه مبلغ نهایی
        """
        discount_all_amount, special_discount_amount = self.calculate_discount()
        
        # مبلغ نهایی = (مبلغ اصلی - تخفیف اصلی) + (مبلغ خاص - تخفیف خاص)
        final = (
            float(self.original_amount) - discount_all_amount
        )
        
        if self.has_special_discount:
            final += (
                float(self.special_discount_original_amount) - special_discount_amount
            )
        
        return max(0, final)  # حداقل 0

    def calculate_points(self):
        """
        محاسبه امتیاز بر اساس مبلغ نهایی
        هر 10,000 تومان = 1 امتیاز
        """
        return int(self.final_amount / 10000)

    def approve(self):
        """
        تایید تراکنش و افزودن امتیاز به مشتری
        """
        from django.utils import timezone
        from datetime import timedelta
        
        if self.status == 'approved':
            return
        
        self.status = 'approved'
        
        # محاسبه و افزودن امتیاز
        self.points_earned = self.calculate_points()
        self.loyalty.add_points(self.points_earned)
        
        # فعال کردن امکان کامنت‌گذاری برای 12 ساعت
        self.can_comment = True
        self.comment_deadline = timezone.now() + timedelta(hours=12)
        
        self.save()

    def reject(self):
        """
        رد تراکنش
        """
        self.status = 'rejected'
        self.save()
    
    def can_add_comment(self):
        """
        بررسی امکان کامنت‌گذاری
        """
        from django.utils import timezone
        
        # باید تایید شده باشد
        if self.status != 'approved':
            return False
        
        # نباید قبلاً کامنت گذاشته باشد
        if self.has_commented:
            return False
        
        # باید can_comment فعال باشد
        if not self.can_comment:
            return False
        
        # باید در مهلت 12 ساعت باشد
        if not self.comment_deadline:
            return False
        
        return timezone.now() <= self.comment_deadline

    def save(self, *args, **kwargs):
        """
        محاسبه خودکار مبالغ قبل از ذخیره
        """
        if not self.pk:  # فقط برای تراکنش‌های جدید
            discount_all_amount, special_discount_amount = self.calculate_discount()
            self.discount_all_amount = discount_all_amount
            self.special_discount_amount = special_discount_amount
            self.final_amount = self.calculate_final_amount()
        
        super().save(*args, **kwargs)


class EliteGiftClaim(BaseModel):
    """
    مدل برای ثبت دریافت هدایای ویژه توسط مشتریان
    """
    STATUS_CHOICES = [
        ('pending', 'در انتظار تایید کسب‌وکار'),
        ('approved', 'تایید و اعطا شده'),
        ('rejected', 'رد شده'),
        ('used', 'استفاده شده'),
    ]
    
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='elite_gift_claims',
        verbose_name='مشتری'
    )
    elite_gift = models.ForeignKey(
        'packages.EliteGift',
        on_delete=models.CASCADE,
        related_name='claims',
        verbose_name='هدیه ویژه'
    )
    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
        related_name='gift_claims',
        verbose_name='پکیج'
    )
    business = models.ForeignKey(
        BusinessProfile,
        on_delete=models.CASCADE,
        related_name='gift_claims',
        verbose_name='کسب‌وکار'
    )
    
    # اطلاعات هنگام درخواست
    progress_at_claim = models.JSONField(
        default=dict,
        verbose_name='پیشرفت هنگام درخواست'
    )
    
    # وضعیت
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت'
    )
    
    # تاریخ‌ها
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='تاریخ تایید'
    )
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='تاریخ استفاده'
    )
    
    # یادداشت کسب‌وکار
    business_note = models.TextField(
        blank=True,
        null=True,
        verbose_name='یادداشت کسب‌وکار'
    )
    
    class Meta:
        verbose_name = 'درخواست هدیه ویژه'
        verbose_name_plural = 'درخواست‌های هدیه ویژه'
        ordering = ['-created_at']
        # هر کاربر فقط یک بار می‌تواند هدیه یک پکیج را درخواست کند
        unique_together = ['customer', 'package']
    
    def __str__(self):
        return f"{self.customer.user.get_full_name()} - {self.elite_gift.gift} - {self.get_status_display()}"
    
    def approve(self, note=None):
        """
        تایید و اعطای هدیه
        """
        from django.utils import timezone
        
        if self.status != 'pending':
            raise ValueError('فقط درخواست‌های در انتظار قابل تایید هستند')
        
        self.status = 'approved'
        self.approved_at = timezone.now()
        if note:
            self.business_note = note
        self.save()
    
    def reject(self, note=None):
        """
        رد درخواست
        """
        if self.status != 'pending':
            raise ValueError('فقط درخواست‌های در انتظار قابل رد هستند')
        
        self.status = 'rejected'
        if note:
            self.business_note = note
        self.save()
    
    def mark_as_used(self):
        """
        علامت‌گذاری به عنوان استفاده شده
        """
        from django.utils import timezone
        
        if self.status != 'approved':
            raise ValueError('فقط هدایای تایید شده قابل استفاده هستند')
        
        self.status = 'used'
        self.used_at = timezone.now()
        self.save()
