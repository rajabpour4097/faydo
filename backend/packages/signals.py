from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Package


@receiver(post_save, sender=Package)
def handle_package_activation(sender, instance, created, **kwargs):
    """
    Signal handler for automatic package activation logic
    """
    # فقط برای پکیج‌های تایید شده که کامل هستند
    if instance.status == 'approved' and instance.is_complete:
        # اگر پکیج می‌تواند فوراً فعال شود
        if instance.can_activate_immediately():
            if not instance.is_active:
                instance.activate_package()
        else:
            # اگر پکیج فعالی وجود دارد، اطمینان حاصل کن که پکیج جدید غیرفعال است
            if instance.is_active:
                instance.deactivate_package()
