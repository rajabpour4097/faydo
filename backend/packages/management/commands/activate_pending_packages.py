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
        deactivated_count = 0
        activated_count = 0
        
        self.stdout.write(f'Starting package activation check for date: {today}')
        
        # مرحله 1: غیرفعال کردن پکیج‌های منقضی شده
        self.stdout.write('Step 1: Deactivating expired packages...')
        expired_active_packages = Package.objects.filter(
            is_active=True,
            status='approved',
            end_date__lte=today
        )
        
        deactivated_package_ids = []
        for expired_package in expired_active_packages:
            self.stdout.write(
                f'Deactivating expired package {expired_package.id} for business {expired_package.business.name} (expired on {expired_package.end_date})'
            )
            expired_package.deactivate_package()
            deactivated_package_ids.append(expired_package.id)
            deactivated_count += 1
        
        if deactivated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Deactivated {deactivated_count} expired packages')
            )
        else:
            self.stdout.write('No expired packages found')
        
        # مرحله 2: فعال کردن پکیج‌های تایید شده که آماده فعال‌سازی هستند
        self.stdout.write('Step 2: Activating approved packages...')
        
        # پیدا کردن کسب‌وکارهایی که پکیج فعال ندارند (به جز پکیج‌هایی که تازه غیرفعال کردیم)
        businesses_without_active_packages = Package.objects.filter(
            status='approved',
            is_active=False,
            is_complete=True
        ).exclude(id__in=deactivated_package_ids).values_list('business', flat=True).distinct()
        
        self.stdout.write(f'Found {len(businesses_without_active_packages)} businesses with approved packages but no active package')
        
        for business_id in businesses_without_active_packages:
            # بررسی اینکه آیا این کسب‌وکار پکیج فعالی دارد یا نه
            active_packages = Package.objects.filter(
                business_id=business_id,
                is_active=True,
                status='approved'
            )
            
            if not active_packages.exists():
                # پیدا کردن اولین پکیج تایید شده برای فعال‌سازی (به جز پکیج‌هایی که تازه غیرفعال کردیم)
                package_to_activate = Package.objects.filter(
                    business_id=business_id,
                    status='approved',
                    is_active=False,
                    is_complete=True
                ).exclude(id__in=deactivated_package_ids).order_by('created_at').first()
                
                if package_to_activate:
                    # بررسی اینکه آیا تاریخ شروع پکیج رسیده یا نه
                    if package_to_activate.start_date and package_to_activate.start_date <= today:
                        self.stdout.write(
                            f'Activating package {package_to_activate.id} for business {package_to_activate.business.name} (start date: {package_to_activate.start_date})'
                        )
                        package_to_activate.activate_package()
                        activated_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'Package {package_to_activate.id} activated for business {package_to_activate.business.name}'
                            )
                        )
                    else:
                        self.stdout.write(
                            f'Package {package_to_activate.id} for business {package_to_activate.business.name} not ready yet (start date: {package_to_activate.start_date})'
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'No package found to activate for business_id {business_id}')
                    )
            else:
                self.stdout.write(f'Business {business_id} already has active packages, skipping')
        
        # مرحله 3: بررسی پکیج‌هایی که ممکن است با تاخیر اضافه شده باشند
        self.stdout.write('Step 3: Checking for delayed package additions...')
        
        # پیدا کردن پکیج‌های تایید شده که تاریخ شروعشان گذشته اما هنوز فعال نشده‌اند (به جز پکیج‌هایی که تازه غیرفعال کردیم)
        delayed_packages = Package.objects.filter(
            status='approved',
            is_active=False,
            is_complete=True,
            start_date__lte=today
        ).exclude(id__in=deactivated_package_ids)
        
        for delayed_package in delayed_packages:
            # بررسی اینکه آیا کسب‌وکار پکیج فعالی دارد یا نه
            has_active_package = Package.objects.filter(
                business=delayed_package.business,
                is_active=True,
                status='approved'
            ).exists()
            
            if not has_active_package:
                self.stdout.write(
                    f'Found delayed package {delayed_package.id} for business {delayed_package.business.name} (start date: {delayed_package.start_date})'
                )
                delayed_package.activate_package()
                activated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Delayed package {delayed_package.id} activated for business {delayed_package.business.name}'
                    )
                )
        
        # گزارش نهایی
        self.stdout.write('=' * 50)
        if deactivated_count > 0 or activated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Command completed successfully:\n'
                    f'- Deactivated: {deactivated_count} expired packages\n'
                    f'- Activated: {activated_count} pending packages'
                )
            )
        else:
            self.stdout.write('No packages needed activation or deactivation')
        
        self.stdout.write('=' * 50)
