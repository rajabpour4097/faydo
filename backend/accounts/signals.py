# -*- coding: utf-8 -*-
"""
سیگنال‌های امتیازدهی - ثبت‌نام و تکمیل پروفایل
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomerProfile

logger = logging.getLogger(__name__)


@receiver(post_save, sender=CustomerProfile)
def handle_customer_profile_save(sender, instance, created, **kwargs):
    """
    - ثبت‌نام جدید: +50 امتیاز
    - تکمیل پروفایل: +100 امتیاز (یک بار)
    """
    try:
        from loyalty.services import award_registration, award_profile_complete
        if created:
            award_registration(instance)
        if instance.is_profile_complete():
            award_profile_complete(instance)
    except Exception as e:
        logger.error(f'[points signal] customer_id={instance.pk} error: {e}', exc_info=True)
