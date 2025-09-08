from django.db import models
from django.contrib.auth.models import AbstractUser



class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


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
        ('supporter', 'پشتیبان'),
        ('financial_manager', 'مدیر مالی'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, unique=True)
    image = models.ImageField(upload_to='user_images/', blank=True, null=True)
    # فیلدهای مشترک مثل email, username, password از AbstractUser می‌آید
    

class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'business'})
    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey('ServiceCategory', on_delete=models.SET_NULL, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    rating_avg = models.FloatField(default=0)
    business_location_latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    business_location_longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = 'پروفایل کسب‌وکار'
        verbose_name_plural = 'پروفایل‌ کسب‌وکارها'
    
    def __str__(self):
        return f"{self.name}"


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'customer'})
    gender = models.CharField(max_length=10, choices=[('male','مرد'),('female','زن')])
    birth_date = models.DateField()
    membership_level = models.CharField(max_length=10, choices=[('bronze','برنزی'),('silver','نقره‌ای'),('vip','ویژه')], default='bronze')
    points = models.IntegerField(default=0)
    address = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = 'پروفایل مشتری'
        verbose_name_plural = 'پروفایل‌ مشتریان'

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


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
