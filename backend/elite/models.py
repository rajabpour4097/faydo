from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.forms import ValidationError



class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class EliteDiscount(BaseModel):
    business = models.ForeignKey(
        'accounts.BusinessProfile',
        on_delete=models.CASCADE,
        related_name='elite_gifts'
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    purchase_count = models.PositiveIntegerField(
        blank=True, null=True,
        help_text="حداقل تعداد خرید برای فعال شدن هدیه"
    )
    purchase_amount = models.DecimalField(
        max_digits=15, decimal_places=2,
        blank=True, null=True,
        help_text="حداقل مبلغ کل خرید برای فعال شدن هدیه"
    )
    gift_item = models.CharField(
        max_length=255,
        help_text="نام یا توضیح هدیه (مثلا ماگ، تیشرت، شارژ هدیه)"
    )
    gift_count = models.PositiveIntegerField(
        blank=True, null=True,
        help_text="تعداد دفعاتی که کاربر می‌تواند هدیه بگیرد"
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'هدیه ویژه کاربر'
        verbose_name_plural = 'هدایای ویژه کاربران'

    def __str__(self):
        return self.title

    def clean(self):
        # کنترل تاریخ‌ها
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.')

        # الزام حداقل یکی از شرط‌ها
        if not self.purchase_count and not self.purchase_amount:
            raise ValidationError('حداقل یکی از شرط‌های "تعداد خرید" یا "مبلغ کل خرید" باید تعیین شود.')

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.save()



class EliteDiscountScore(BaseModel):
    elite_discount = models.ForeignKey(EliteDiscount, on_delete=models.CASCADE, related_name='elite_scores')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='elite_discount_scores')
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
        )

    class Meta:
        verbose_name = 'امتیاز کاربر برای هدیه ویژه'
        verbose_name_plural = 'امتیازات کاربران برای هدایای ویژه'
        unique_together = ('elite_discount', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.discount.title}: {self.score}"


class EliteDiscountComment(BaseModel):
    elite_discount = models.ForeignKey(EliteDiscount, on_delete=models.CASCADE, related_name='elite_comments')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='elite_discount_comments')
    comment = models.TextField()
    is_deleted = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'نظر کاربر برای هدیه ویژه'
        verbose_name_plural = 'نظرات کاربران برای هدایای ویژه'
        unique_together = ('elite_discount', 'user')

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.save()

    def __str__(self):
        return f"Comment by {self.user.username} on {self.discount.title}"


class EliteDiscountReport(BaseModel):
    elite_discount = models.ForeignKey(EliteDiscount, on_delete=models.CASCADE, related_name='elite_reports')
    user = models.ForeignKey('accounts.CustomerProfile', on_delete=models.CASCADE, related_name='elite_discount_reports')
    reason = models.TextField()

    class Meta:
        verbose_name = 'گزارش تخلف هدیه ویژه'
        verbose_name_plural = 'گزارش‌های تخلفات هدایای ویژه'

    def __str__(self):
        return f"Report by {self.user.username} on {self.discount.title}"