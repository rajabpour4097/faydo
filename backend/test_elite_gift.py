#!/usr/bin/env python
"""
اسکریپت تست سیستم Elite Gift
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomerProfile, BusinessProfile
from packages.models import Package, EliteGift
from loyalty.models import Transaction, EliteGiftClaim

print("=" * 70)
print("تست سیستم Elite Gift")
print("=" * 70)

# پیدا کردن یک پکیج فعال با elite gift
package = Package.objects.filter(
    is_active=True,
    status='approved'
).first()

if not package:
    print("\n❌ هیچ پکیج فعالی یافت نشد")
    exit()

print(f"\n✅ پکیج یافت شد: {package}")
print(f"   - کسب‌وکار: {package.business.name}")
print(f"   - تاریخ شروع: {package.start_date}")
print(f"   - تاریخ پایان: {package.end_date}")

# بررسی EliteGift
if not hasattr(package, 'elite_gift'):
    print("\n❌ این پکیج Elite Gift ندارد")
    exit()

elite_gift = package.elite_gift
print(f"\n✅ Elite Gift یافت شد: {elite_gift.gift}")
if elite_gift.amount:
    print(f"   - نوع: مبلغی ({elite_gift.amount:,} تومان)")
elif elite_gift.count:
    print(f"   - نوع: تعدادی ({elite_gift.count} عدد)")

# پیدا کردن یک مشتری
customer = CustomerProfile.objects.first()
if not customer:
    print("\n❌ هیچ مشتری‌ای یافت نشد")
    exit()

print(f"\n✅ مشتری یافت شد: {customer.user.get_full_name()}")

# بررسی تراکنش‌های مشتری
transactions = Transaction.objects.filter(
    customer=customer,
    business=package.business,
    package=package,
    status='approved',
    created_at__gte=package.start_date,
    created_at__lte=package.end_date
)

print(f"\n📊 تراکنش‌های مشتری در این پکیج:")
print(f"   - تعداد: {transactions.count()}")
if elite_gift.amount:
    total = sum([t.final_amount for t in transactions])
    print(f"   - مجموع مبلغ: {total:,} تومان")

# محاسبه پیشرفت
print(f"\n🎯 محاسبه پیشرفت:")
progress = elite_gift.get_customer_progress(customer)

print(f"   - نوع: {progress['type']}")
print(f"   - هدف: {progress['target']}")
print(f"   - فعلی: {progress['current']}")
print(f"   - باقی‌مانده: {progress['remaining']}")
print(f"   - درصد پیشرفت: {progress['percentage']}%")
print(f"   - واجد شرایط: {'✅ بله' if progress['eligible'] else '❌ خیر'}")
print(f"   - تعداد تراکنش‌ها: {progress['transactions_count']}")

# بررسی درخواست‌های قبلی
existing_claims = EliteGiftClaim.objects.filter(
    customer=customer,
    package=package
)

if existing_claims.exists():
    print(f"\n📝 درخواست‌های قبلی:")
    for claim in existing_claims:
        print(f"   - وضعیت: {claim.get_status_display()}")
        print(f"   - تاریخ ایجاد: {claim.created_at}")
        if claim.approved_at:
            print(f"   - تاریخ تایید: {claim.approved_at}")
else:
    print(f"\n✅ هیچ درخواست قبلی وجود ندارد")
    
    if progress['eligible']:
        print("\n💡 مشتری واجد شرایط دریافت هدیه است!")
        print("   می‌تواند درخواست دریافت هدیه را ثبت کند.")

print("\n" + "=" * 70)
print("تست به پایان رسید")
print("=" * 70)
