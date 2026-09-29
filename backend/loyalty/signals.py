from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import EliteGiftClaim, Notification, Transaction
from packages.models import Comment, DiscountAll, SpecificDiscount, EliteGift
from .transaction_utils import jalali_datetime_label


def _person_name(profile):
    user = profile.user
    return (user.get_full_name() or user.username or user.phone_number).strip()


@receiver(pre_save, sender=Transaction)
def remember_transaction_status(sender, instance, **kwargs):
    if instance.pk:
        instance._previous_status = sender.objects.filter(pk=instance.pk).values_list('status', flat=True).first()


@receiver(post_save, sender=Transaction)
def notify_transaction_event(sender, instance, created, **kwargs):
    # تراکنش هدیه توسط تایید درخواست ساخته می‌شود و اعلان جداگانه دارد.
    if instance.transaction_type == 'elite_gift':
        return
    amount = f'{int(instance.final_amount or 0):,}'
    metadata = {'transaction_id': instance.pk, 'status': instance.status}
    if created and instance.status == 'pending':
        Notification.objects.create(
            recipient=instance.business.user,
            notification_type='transaction_created',
            title='تراکنش جدید در انتظار تایید',
            message=f'{_person_name(instance.customer)} تراکنشی به مبلغ {amount} تومان ثبت کرد.',
            priority='important',
            action_url='/dashboard/transactions',
            metadata=metadata,
        )
        return
    previous = getattr(instance, '_previous_status', None)
    if instance.status == 'approved' and (created or previous == 'pending'):
        Notification.objects.create(
            recipient=instance.customer.user,
            notification_type='transaction_approved',
            title='تراکنش شما تایید شد',
            message=f'تراکنش {amount} تومانی شما در {instance.business.name} تایید شد.',
            priority='important',
            action_url='/dashboard/transactions',
            metadata=metadata,
        )
    elif instance.status == 'rejected' and previous == 'pending':
        reason = f' دلیل: {instance.rejection_reason}' if instance.rejection_reason else ''
        Notification.objects.create(
            recipient=instance.customer.user,
            notification_type='transaction_rejected',
            title='تراکنش شما رد شد',
            message=f'تراکنش شما در {instance.business.name} رد شد.{reason}',
            priority='urgent',
            action_url='/dashboard/transactions',
            metadata=metadata,
        )


@receiver(pre_save, sender=EliteGiftClaim)
def remember_gift_claim_status(sender, instance, **kwargs):
    if instance.pk:
        instance._previous_status = sender.objects.filter(pk=instance.pk).values_list('status', flat=True).first()


@receiver(post_save, sender=EliteGiftClaim)
def notify_gift_claim_event(sender, instance, created, **kwargs):
    metadata = {'claim_id': instance.pk, 'status': instance.status}
    if instance.scheduled_for:
        metadata['scheduled_for'] = instance.scheduled_for.isoformat()
    if instance.expires_at:
        metadata['expires_at'] = instance.expires_at.isoformat()
    if created:
        Notification.objects.create(
            recipient=instance.business.user,
            notification_type='gift_claim_created',
            title='درخواست جدید هدیه ویژه',
            message=f'{_person_name(instance.customer)} درخواست دریافت «{instance.elite_gift.gift}» را ارسال کرد.',
            priority='important',
            action_url='/dashboard/elite-gift-claims',
            metadata=metadata,
        )
        return
    previous = getattr(instance, '_previous_status', None)
    if instance.status == 'approved' and previous == 'pending':
        delivery = jalali_datetime_label(instance.scheduled_for)
        deadline = jalali_datetime_label(instance.expires_at)
        Notification.objects.create(
            recipient=instance.customer.user,
            notification_type='gift_claim_approved',
            title='درخواست هدیه شما تایید شد',
            message=(
                f'درخواست «{instance.elite_gift.gift}» توسط {instance.business.name} تایید شد. '
                f'زمان تحویل: {delivery}. مهلت دریافت تا {deadline} است.'
            ),
            priority='important',
            action_url='/dashboard/notifications',
            metadata=metadata,
        )
    elif instance.status == 'rejected' and previous == 'pending':
        note = f' توضیح: {instance.business_note}' if instance.business_note else ''
        Notification.objects.create(
            recipient=instance.customer.user,
            notification_type='gift_claim_rejected',
            title='درخواست هدیه شما رد شد',
            message=f'درخواست «{instance.elite_gift.gift}» توسط {instance.business.name} رد شد.{note}',
            priority='urgent',
            action_url='/dashboard/transactions',
            metadata=metadata,
        )
    elif instance.status == 'used' and previous == 'approved':
        Notification.objects.create(
            recipient=instance.customer.user,
            notification_type='gift_claim_used',
            title='هدیه ویژه استفاده شد',
            message=f'هدیه «{instance.elite_gift.gift}» در {instance.business.name} استفاده‌شده ثبت شد.',
            action_url='/dashboard/transactions',
            metadata=metadata,
        )


@receiver(pre_delete, sender=Transaction)
def delete_transaction_comments(sender, instance, **kwargs):
    """
    وقتی یک Transaction پاک می‌شود، نظرات مرتبط با آن را هم پاک کن
    
    نظرات روی DiscountAll/SpecificDiscount/EliteGift/VipExperience ذخیره می‌شوند
    پس باید نظرات آن customer برای آن package را پاک کنیم
    """
    tx_ct = ContentType.objects.get_for_model(Transaction)
    Comment.objects.filter(content_type=tx_ct, object_id=instance.pk).delete()

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
