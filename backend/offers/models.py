from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.forms import ValidationError



class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Discount(BaseModel):
    business = models.ForeignKey('accounts.BusinessProfile', on_delete=models.CASCADE, related_name='discounts')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    percentage = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'تخفیف'
        verbose_name_plural = 'تخفیف‌ها'

    def __str__(self):
        return self.title
    
    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.')


class Gift(BaseModel):
    business = models.ForeignKey('accounts.BusinessProfile', on_delete=models.CASCADE, related_name='gifts')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    gift_type = models.CharField(max_length=10, choices=[('quantity', 'تعدادی'), ('amount', 'مبلغی')])
    gift_quantity = models.PositiveIntegerField()
    gift_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    gift_count = models.PositiveIntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'هدیه'
        verbose_name_plural = 'هدیه‌ها'

    def __str__(self):
        return self.title
    
    def clean(self):
        # کنترل تاریخ‌ها
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.')

        # شرط برای نوع مبلغی
        if self.gift_type == 'amount':
            if not self.gift_amount:
                raise ValidationError('برای هدیه مبلغی، فیلد gift_amount الزامی است.')
            self.gift_quantity = None  # اختیاری کردن و پاک کردن مقدار قبلی

        # شرط برای نوع تعدادی
        elif self.gift_type == 'quantity':
            if not self.gift_quantity:
                raise ValidationError('برای هدیه تعدادی، فیلد gift_quantity الزامی است.')
            self.gift_amount = None  # اختیاری کردن و پاک کردن مقدار قبلی