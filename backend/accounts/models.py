import os
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser



class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# Business categories
class ServiceCategory(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='subcategories')

    def __str__(self):
        return self.name


class Province(BaseModel):
    name = models.CharField(max_length=100, verbose_name='نام استان')
    
    class Meta:
        verbose_name = 'استان'
        verbose_name_plural = 'استان‌ها'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class City(BaseModel):
    name = models.CharField(max_length=100, verbose_name='نام شهر')
    province = models.ForeignKey(
        Province, 
        on_delete=models.CASCADE, 
        related_name='cities',
        verbose_name='استان'
    )
    
    class Meta:
        verbose_name = 'شهر'
        verbose_name_plural = 'شهرها'
        ordering = ['name']
        unique_together = ['name', 'province']  # جلوگیری از تکرار نام شهر در یک استان
    
    def __str__(self):
        return f"{self.name}"


class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'مشتری'),
        ('business', 'کسب‌وکار'),
        ('admin', 'مدیر'),
        ('it_manager', 'مدیر فنی سایت'),
        ('project_manager', 'مدیر پروژه'),
        ('supporter', 'پشتیبان'),        ('customer', 'مشتری'),
        ('financial_manager', 'مدیر مالی'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, unique=True)
    image = models.ImageField(upload_to='user_images/', blank=True, null=True)
    
    # Override AbstractUser fields to make them optional
    email = models.EmailField(blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Make password optional for initial registration
    def set_password(self, raw_password):
        if raw_password:
            super().set_password(raw_password)
        else:
            self.password = ''
    

class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'business'})
    name = models.CharField(max_length=255, blank=True, null=True, verbose_name='نام کسب‌وکار')
    business_phone = models.CharField(max_length=11, blank=True, null=True)
    description = models.TextField(blank=True, null=True, verbose_name='توضیحات')
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='دسته‌بندی')
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name='آدرس')
    rating_avg = models.FloatField(default=0)
    business_location_latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    business_location_longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    instagram_link = models.URLField(blank=True, null=True, verbose_name='لینک صفحه اینستاگرام')
    website_link = models.URLField(blank=True, null=True, verbose_name='لینک سایت')

    class Meta:
        verbose_name = 'پروفایل کسب‌وکار'
        verbose_name_plural = 'پروفایل‌ کسب‌وکارها'
    
    def __str__(self):
        return f"{self.name}"
    
    def get_gallery_count(self):
        """Return number of gallery images"""
        return self.gallery_images.count()

    def get_featured_image(self):
        """Return the featured gallery image or first image"""
        featured = self.gallery_images.filter(is_featured=True).first()
        if featured:
            return featured
        return self.gallery_images.first()
    
    def get_weekly_schedule(self):
        """Get complete weekly schedule"""
        schedule = {}
        for day_num, day_name in BusinessWorkingHours.WEEKDAY_CHOICES:
            hours = self.get_working_hours_for_day(day_num)
            if hours.exists():
                schedule[day_name] = [
                    f"{h.start_time.strftime('%H:%M')} - {h.end_time.strftime('%H:%M')}" 
                    for h in hours
                ]
            else:
                schedule[day_name] = ['تعطیل']
        return schedule

    def get_working_hours_for_day(self, weekday):
        """Get working hours for a specific weekday (0=Saturday, 6=Friday)"""
        return self.working_hours.filter(weekday=weekday, is_closed=False).order_by('start_time')

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'customer'})
    gender = models.CharField(max_length=10, choices=[('male','مرد'),('female','زن')], blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    membership_level = models.CharField(max_length=10, choices=[('bronze','برنزی'),('silver','نقره‌ای'),('vip','ویژه')], default='bronze')
    points = models.IntegerField(default=0)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = 'پروفایل مشتری'
        verbose_name_plural = 'پروفایل‌ مشتریان'

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

    def is_profile_complete(self):
        """Check if required profile fields are completed"""
        user = self.user
        return bool(
            user.first_name and user.first_name.strip() and
            user.last_name and user.last_name.strip() and
            self.gender and
            self.birth_date and
            self.city
        )


class ITManagerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'it_manager'})
    is_staff = models.BooleanField(default=True)
    class Meta:
        verbose_name = 'پروفایل مدیر فنی سایت'
        verbose_name_plural = 'پروفایل‌ مدیران فنی سایت'
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class ProjectManagerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'project_manager'})
    is_manager = models.BooleanField(default=True)
    class Meta:
        verbose_name = 'پروفایل مدیر پروژه'
        verbose_name_plural = 'پروفایل‌ مدیران پروژه'
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class SupporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'supporter'})
    is_supporter = models.BooleanField(default=True)
    class Meta:
        verbose_name = 'پروفایل پشتیبان'
        verbose_name_plural = 'پروفایل‌ پشتیبانان'
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class FinancialManagerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'financial_manager'})
    is_financial_manager = models.BooleanField(default=True)
    class Meta:
        verbose_name = 'پروفایل مدیر مالی'
        verbose_name_plural = 'پروفایل‌ مدیران مالی'
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class BusinessGallery(BaseModel):
    """Gallery images for business profiles"""
    business_profile = models.ForeignKey(
        BusinessProfile, 
        on_delete=models.CASCADE, 
        related_name='gallery_images',
        verbose_name='پروفایل کسب‌وکار'
    )
    image = models.ImageField(
        upload_to='business_gallery_images/',
        verbose_name='تصویر'
    )
    title = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        verbose_name='عنوان تصویر'
    )
    description = models.TextField(
        blank=True, 
        null=True,
        verbose_name='توضیحات تصویر'
    )
    is_featured = models.BooleanField(
        default=False,
        verbose_name='تصویر شاخص'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='ترتیب نمایش'
    )

    class Meta:
        verbose_name = 'تصویر گالری کسب‌وکار'
        verbose_name_plural = 'تصاویر گالری کسب‌وکار'
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"تصویر {self.business_profile.name} - {self.title or 'بدون عنوان'}"

    def delete(self, *args, **kwargs):
        """Delete image file when model instance is deleted"""
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)



class BusinessWorkingHours(BaseModel):
    """Working hours for business profiles - supports multiple time slots per day"""
    
    WEEKDAY_CHOICES = [
        (0, 'شنبه'),      # Saturday
        (1, 'یکشنبه'),     # Sunday  
        (2, 'دوشنبه'),     # Monday
        (3, 'سه‌شنبه'),    # Tuesday
        (4, 'چهارشنبه'),   # Wednesday
        (5, 'پنج‌شنبه'),   # Thursday
        (6, 'جمعه'),      # Friday
    ]
    
    business_profile = models.ForeignKey(
        BusinessProfile,
        on_delete=models.CASCADE,
        related_name='working_hours',
        verbose_name='پروفایل کسب‌وکار'
    )
    
    weekday = models.IntegerField(
        choices=WEEKDAY_CHOICES,
        verbose_name='روز هفته'
    )
    
    start_time = models.TimeField(verbose_name='ساعت شروع')
    end_time = models.TimeField(verbose_name='ساعت پایان')
    
    is_closed = models.BooleanField(
        default=False,
        verbose_name='تعطیل'
    )
    
    # For break times or lunch breaks
    is_break = models.BooleanField(
        default=False,
        verbose_name='استراحت/تعطیلی میانی'
    )
    
    class Meta:
        verbose_name = 'ساعت کاری کسب‌وکار'
        verbose_name_plural = 'ساعات کاری کسب‌وکار'
        ordering = ['weekday', 'start_time']
        # Allow multiple time slots per day
        unique_together = ['business_profile', 'weekday', 'start_time']

    def __str__(self):
        weekday_name = dict(self.WEEKDAY_CHOICES)[self.weekday]
        if self.is_closed:
            return f"{self.business_profile.name} - {weekday_name}: تعطیل"
        return f"{self.business_profile.name} - {weekday_name}: {self.start_time} - {self.end_time}"

    def clean(self):
        """Validate working hours"""
        if not self.is_closed and self.start_time >= self.end_time:
            raise ValidationError('ساعت شروع باید کمتر از ساعت پایان باشد')
        
        # Check for overlapping times on the same day
        if not self.is_closed:
            overlapping = BusinessWorkingHours.objects.filter(
                business_profile=self.business_profile,
                weekday=self.weekday,
                is_closed=False
            ).exclude(id=self.id)
            
            for other in overlapping:
                if (self.start_time < other.end_time and self.end_time > other.start_time):
                    raise ValidationError(f'ساعات کاری با بازه {other.start_time}-{other.end_time} تداخل دارد')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)