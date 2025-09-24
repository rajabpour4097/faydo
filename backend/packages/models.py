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

    class Meta:
        verbose_name = "پکیج"
        verbose_name_plural = "پکیج‌ها"

    def __str__(self):
        return self.business.name

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
        return f"{self.get_star_level_display()} - {self.name}"

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
        return f"{self.package} - {self.vip_level}"
