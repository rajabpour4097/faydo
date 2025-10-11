from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Package


@receiver(post_save, sender=Package)
def handle_package_activation(sender, instance, created, **kwargs):
    """
    Signal handler for automatic package activation logic
    """
    # جلوگیری از recursion با بررسی اینکه آیا در حال پردازش signal هستیم یا نه
    if hasattr(instance, '_signal_processing'):
        return
    
    # اگر تغییر از admin panel آمده، اجازه دستی کنترل را بده
    if hasattr(instance, '_admin_override'):
        return
    
    # فقط برای پکیج‌های تایید شده که کامل هستند
    if instance.status == 'approved' and instance.is_complete:
        # اگر پکیج می‌تواند فوراً فعال شود
        if instance.can_activate_immediately():
            if not instance.is_active:
                # علامت‌گذاری برای جلوگیری از recursion
                instance._signal_processing = True
                try:
                    instance.activate_package()
                finally:
                    if hasattr(instance, '_signal_processing'):
                        delattr(instance, '_signal_processing')
        else:
            # اگر پکیج فعالی وجود دارد، اطمینان حاصل کن که پکیج جدید غیرفعال است
            if instance.is_active:
                # علامت‌گذاری برای جلوگیری از recursion
                instance._signal_processing = True
                try:
                    instance.deactivate_package()
                finally:
                    if hasattr(instance, '_signal_processing'):
                        delattr(instance, '_signal_processing')
