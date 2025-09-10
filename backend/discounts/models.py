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
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        unique=True
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'تخفیف'
        verbose_name_plural = 'تخفیف‌ها'

    def __str__(self):
        return self.title
    
    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.')
    
    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.save()


class DiscountScore(BaseModel):
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name='scores')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='discount_scores')
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
        )

    class Meta:
        verbose_name = 'امتیاز تخفیف'
        verbose_name_plural = 'امتیازات تخفیف'
        unique_together = ('discount', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.discount.title}: {self.score}"


class DiscountComment(BaseModel):
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='discount_comments')
    comment = models.TextField()
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'نظر کاربر برای تخفیف'
        verbose_name_plural = 'نظرات کاربران برای تخفیف'
        unique_together = ('discount', 'user')

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.save()

    def __str__(self):
        return f"Comment by {self.user.username} on {self.discount.title}"
    

class DiscountReport(BaseModel):
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='discount_reports')
    reason = models.TextField()

    class Meta:
        verbose_name = 'گزارش تخلف تخفیف'
        verbose_name_plural = 'گزارش‌های تخلفات تخفیف'

    def __str__(self):
        return f"Report by {self.user.username} on {self.discount.title}"