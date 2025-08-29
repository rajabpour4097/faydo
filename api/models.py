from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """پروفایل کاربر فایدو"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=[('customer','Customer'), ('business','Business')], default='customer', verbose_name='نوع کاربر')
    # برای کاربرانی که نوع آنها business است نوع کسب‌وکار (حقیقی/حقوقی) ذخیره می‌شود
    business_type = models.CharField(
        max_length=10,
        choices=[('natural', 'حقیقی'), ('legal', 'حقوقی')],
        blank=True,
        null=True,
        verbose_name='نوع کسب‌وکار'
    )
    # در صورت حقوقی بودن (legal) نام شرکت اینجا ذخیره می‌شود
    company_name = models.CharField(max_length=255, blank=True, verbose_name='نام شرکت')
    points = models.PositiveIntegerField(default=0, verbose_name='امتیاز')
    interests = models.JSONField(default=list, blank=True, verbose_name='علایق')
    achievements = models.JSONField(default=list, blank=True, verbose_name='دستاوردها')
    phone = models.CharField(max_length=15, blank=True, verbose_name='شماره تلفن')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='تصویر پروفایل')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name or self.user.username} - {self.points} امتیاز"
    
    @property
    def level(self):
        """محاسبه سطح کاربر بر اساس امتیاز"""
        if self.points >= 900:
            return {'name': 'VIP', 'threshold': 900}
        elif self.points >= 500:
            return {'name': 'طلایی', 'threshold': 500}
        elif self.points >= 200:
            return {'name': 'نقره‌ای', 'threshold': 200}
        else:
            return {'name': 'برنزی', 'threshold': 0}
    
    class Meta:
        verbose_name = 'پروفایل کاربر'
        verbose_name_plural = 'پروفایل‌های کاربر'


class Category(models.Model):
    """دسته‌بندی کسب‌وکارها"""
    name = models.CharField(max_length=100, verbose_name='نام دسته')
    slug = models.SlugField(unique=True, verbose_name='شناسه URL')
    icon = models.CharField(max_length=10, default='🏪', verbose_name='آیکون')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'دسته‌بندی'
        verbose_name_plural = 'دسته‌بندی‌ها'


class Business(models.Model):
    """کسب‌وکارهای عضو فایدو"""
    name = models.CharField(max_length=200, verbose_name='نام کسب‌وکار')
    slug = models.SlugField(unique=True, verbose_name='شناسه URL')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='businesses', verbose_name='دسته‌بندی')
    logo = models.ImageField(upload_to='business_logos/', blank=True, null=True, verbose_name='لوگو')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    address = models.TextField(blank=True, verbose_name='آدرس')
    phone = models.CharField(max_length=15, blank=True, verbose_name='تلفن')
    email = models.EmailField(blank=True, verbose_name='ایمیل')
    website = models.URLField(blank=True, verbose_name='وبسایت')
    
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'کسب‌وکار'
        verbose_name_plural = 'کسب‌وکارها'


class Offer(models.Model):
    """تخفیف‌ها و پیشنهادات"""
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='offers', verbose_name='کسب‌وکار')
    title = models.CharField(max_length=200, verbose_name='عنوان تخفیف')
    description = models.TextField(verbose_name='توضیحات')
    percent = models.PositiveIntegerField(verbose_name='درصد تخفیف')
    min_points = models.PositiveIntegerField(default=0, verbose_name='حداقل امتیاز مورد نیاز')
    max_usage = models.PositiveIntegerField(null=True, blank=True, verbose_name='حداکثر استفاده')
    usage_count = models.PositiveIntegerField(default=0, verbose_name='تعداد استفاده')
    
    start_date = models.DateTimeField(verbose_name='تاریخ شروع')
    end_date = models.DateTimeField(verbose_name='تاریخ پایان')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.business.name} - {self.percent}% تخفیف"
    
    @property
    def is_available(self):
        """آیا تخفیف در دسترس است؟"""
        if not self.is_active:
            return False
        if self.max_usage and self.usage_count >= self.max_usage:
            return False
        from django.utils import timezone
        now = timezone.now()
        return self.start_date <= now <= self.end_date
    
    class Meta:
        verbose_name = 'تخفیف'
        verbose_name_plural = 'تخفیف‌ها'


class UserOffer(models.Model):
    """تخفیف‌های ذخیره‌شده/استفاده‌شده کاربران"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_offers')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='user_offers')
    is_saved = models.BooleanField(default=False, verbose_name='ذخیره‌شده')
    is_used = models.BooleanField(default=False, verbose_name='استفاده‌شده')
    used_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ استفاده')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'offer']
        verbose_name = 'تخفیف کاربر'
        verbose_name_plural = 'تخفیف‌های کاربران'


class Review(models.Model):
    """نظرات کاربران در مورد کسب‌وکارها"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)], verbose_name='امتیاز')
    text = models.TextField(verbose_name='متن نظر')
    likes = models.PositiveIntegerField(default=0, verbose_name='تعداد لایک')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.business.name} ({self.rating}/5)"
    
    class Meta:
        unique_together = ['user', 'business']
        verbose_name = 'نظر'
        verbose_name_plural = 'نظرات'


class ReviewReply(models.Model):
    """پاسخ‌های نظرات"""
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(verbose_name='متن پاسخ')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"پاسخ {self.user.username} به {self.review}"
    
    class Meta:
        verbose_name = 'پاسخ نظر'
        verbose_name_plural = 'پاسخ‌های نظرات'


class Notification(models.Model):
    """نوتیفیکیشن‌های کاربران"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200, verbose_name='عنوان')
    message = models.TextField(verbose_name='متن پیام')
    is_read = models.BooleanField(default=False, verbose_name='خوانده‌شده')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'نوتیفیکیشن'
        verbose_name_plural = 'نوتیفیکیشن‌ها'
