from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import DiscountScore, Discount


@receiver(post_save, sender=DiscountScore)
@receiver(post_delete, sender=DiscountScore)
def update_discount_rating(sender, instance, **kwargs):
    """
    بعد از اضافه/حذف/تغییر امتیاز، میانگین امتیازات را محاسبه می‌کند
    """
    discount = instance.discount
    scores = discount.scores.all()
    
    if scores.exists():
        average = sum(score.score for score in scores) / len(scores)
        # می‌توانید این مقدار را در فیلد جداگانه ذخیره کنید اگر نیاز باشد
        # discount.average_rating = round(average, 1)
        # discount.save()
    
    # اینجا می‌توانید منطق اضافی اضافه کنید مثل ارسال نوتیفیکیشن