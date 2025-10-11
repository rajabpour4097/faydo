from django.core.management.base import BaseCommand
from django.utils import timezone
from packages.models import Package


class Command(BaseCommand):
    help = 'Activate pending packages when current active packages expire'

    def handle(self, *args, **options):
        """
        فعال‌سازی خودکار پکیج‌های در انتظار پس از انقضای پکیج‌های فعال
        """
        today = timezone.now().date()
        activated_count = 0
        
        # پیدا کردن پکیج‌های فعالی که امروز منقضی شده‌اند
        expired_active_packages = Package.objects.filter(
            is_active=True,
            status='approved',
            end_date__lte=today
        )
        
        for expired_package in expired_active_packages:
            # غیرفعال کردن پکیج منقضی شده
            expired_package.deactivate_package()
            self.stdout.write(
                self.style.WARNING(f'Package {expired_package.id} deactivated (expired)')
            )
            
            # پیدا کردن پکیج بعدی در انتظار برای همان کسب‌وکار
            next_pending_package = Package.objects.filter(
                business=expired_package.business,
                status='approved',
                is_active=False,
                is_complete=True
            ).order_by('created_at').first()
            
            if next_pending_package:
                # فعال کردن پکیج بعدی
                next_pending_package.activate_package()
                activated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Package {next_pending_package.id} activated automatically '
                        f'for business {next_pending_package.business.name}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'No pending package found for business {expired_package.business.name}'
                    )
                )
        
        # همچنین بررسی پکیج‌هایی که باید فعال شوند (پکیج‌های تایید شده که پکیج فعالی ندارند)
        businesses_without_active_packages = Package.objects.filter(
            status='approved',
            is_active=False,
            is_complete=True
        ).values_list('business', flat=True).distinct()
        
        for business_id in businesses_without_active_packages:
            # بررسی اینکه آیا این کسب‌وکار پکیج فعالی دارد یا نه
            active_packages = Package.objects.filter(
                business_id=business_id,
                is_active=True,
                status='approved'
            )
            
            if not active_packages.exists():
                # پیدا کردن اولین پکیج تایید شده برای فعال‌سازی
                package_to_activate = Package.objects.filter(
                    business_id=business_id,
                    status='approved',
                    is_active=False,
                    is_complete=True
                ).order_by('created_at').first()
                
                if package_to_activate:
                    package_to_activate.activate_package()
                    activated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Package {package_to_activate.id} activated for business '
                            f'{package_to_activate.business.name} (no active package)'
                        )
                    )
            else:
                # اگر پکیج فعالی وجود دارد، بررسی کن که آیا باید غیرفعال شود
                for active_package in active_packages:
                    # اگر پکیج فعال منقضی شده، آن را غیرفعال کن
                    if active_package.end_date and active_package.end_date <= today:
                        active_package.deactivate_package()
                        self.stdout.write(
                            self.style.WARNING(
                                f'Package {active_package.id} deactivated (expired) for business '
                                f'{active_package.business.name}'
                            )
                        )
                        
                        # حالا پکیج بعدی را فعال کن
                        next_pending_package = Package.objects.filter(
                            business_id=business_id,
                            status='approved',
                            is_active=False,
                            is_complete=True
                        ).order_by('created_at').first()
                        
                        if next_pending_package:
                            next_pending_package.activate_package()
                            activated_count += 1
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Package {next_pending_package.id} activated for business '
                                    f'{next_pending_package.business.name} (after deactivating expired)'
                                )
                            )
        
        if activated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully activated {activated_count} packages')
            )
        else:
            self.stdout.write('No packages needed activation')
