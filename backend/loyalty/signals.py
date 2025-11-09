from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Transaction
from packages.models import Comment, DiscountAll, SpecificDiscount, EliteGift


@receiver(pre_delete, sender=Transaction)
def delete_transaction_comments(sender, instance, **kwargs):
    """
    وقتی یک Transaction پاک می‌شود، نظرات مرتبط با آن را هم پاک کن
    
    نظرات روی DiscountAll/SpecificDiscount/EliteGift/VipExperience ذخیره می‌شوند
    پس باید نظرات آن customer برای آن package را پاک کنیم
    """
    if not instance.package:
        return
    
    customer = instance.customer
    package = instance.package
    
    # حذف نظرات customer روی DiscountAll این package
    if hasattr(package, 'discount_all'):
        discount_all_ct = ContentType.objects.get_for_model(DiscountAll)
        Comment.objects.filter(
            content_type=discount_all_ct,
            object_id=package.discount_all.id,
            user=customer
        ).delete()
    
    # حذف نظرات customer روی SpecificDiscount این package
    if hasattr(package, 'specific_discount'):
        specific_discount_ct = ContentType.objects.get_for_model(SpecificDiscount)
        Comment.objects.filter(
            content_type=specific_discount_ct,
            object_id=package.specific_discount.id,
            user=customer
        ).delete()
    
    # حذف نظرات customer روی EliteGift این package
    if hasattr(package, 'elite_gift'):
        elite_gift_ct = ContentType.objects.get_for_model(EliteGift)
        Comment.objects.filter(
            content_type=elite_gift_ct,
            object_id=package.elite_gift.id,
            user=customer
        ).delete()
    
    # حذف نظرات customer روی VipExperience های این package
    for vip_exp in package.experiences.all():
        from packages.models import VipExperience
        vip_experience_ct = ContentType.objects.get_for_model(VipExperience)
        Comment.objects.filter(
            content_type=vip_experience_ct,
            object_id=vip_exp.id,
            user=customer
        ).delete()
