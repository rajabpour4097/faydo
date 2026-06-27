# -*- coding: utf-8 -*-
"""
management command: backfill_points
برای کاربران قدیمی که قبل از پیاده‌سازی سیستم امتیاز ثبت‌نام کرده‌اند
امتیازهای ثبت‌نام و تکمیل پروفایل را اعطا می‌کند
"""
from django.core.management.base import BaseCommand
from accounts.models import CustomerProfile


class Command(BaseCommand):
    help = 'امتیازهای پایه (ثبت‌نام + تکمیل پروفایل) را به کاربران موجود اعطا می‌کند'

    def add_arguments(self, parser):
        parser.add_argument(
            '--customer-id',
            type=int,
            default=None,
            help='فقط برای یک مشتری خاص اجرا شود (id)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='فقط پیش‌نمایش بدون اعمال تغییرات'
        )

    def handle(self, *args, **options):
        from loyalty.services import award_registration, award_profile_complete
        from loyalty.models import PointsEvent

        customer_id = options.get('customer_id')
        dry_run = options.get('dry_run')

        qs = CustomerProfile.objects.select_related('user')
        if customer_id:
            qs = qs.filter(pk=customer_id)

        awarded_reg = 0
        awarded_profile = 0
        skipped = 0

        for customer in qs:
            has_reg = PointsEvent.objects.filter(
                customer=customer, event_type='registration'
            ).exists()
            has_profile = PointsEvent.objects.filter(
                customer=customer, event_type='profile_complete'
            ).exists()

            name = f"{customer.user.first_name} {customer.user.last_name}".strip() or customer.user.username

            if not has_reg:
                if not dry_run:
                    award_registration(customer)
                awarded_reg += 1
                self.stdout.write(f'  [REG +50] id={customer.pk}')
            else:
                skipped += 1

            if not has_profile and customer.is_profile_complete():
                if not dry_run:
                    award_profile_complete(customer)
                awarded_profile += 1
                self.stdout.write(f'  [PROFILE +100] id={customer.pk}')

        mode = '(dry-run)' if dry_run else ''
        self.stdout.write(self.style.SUCCESS(
            f'\nBackfill done {mode}:\n'
            f'  Registration +50 :  {awarded_reg}\n'
            f'  Profile +100     :  {awarded_profile}\n'
            f'  Already had pts  :  {skipped}'
        ))
