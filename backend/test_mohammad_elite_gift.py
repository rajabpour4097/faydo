#!/usr/bin/env python
"""
تست سیستم Elite Gift برای محمد رجب پور
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomerProfile, BusinessProfile
from packages.models import Package, EliteGift
from loyalty.models import Transaction, EliteGiftClaim
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 70)
print("تست سیستم Elite Gift برای محمد رجب پور")
print("=" * 70)

# پیدا کردن کاربر محمد رجب پور
try:
    user = User.objects.get(first_name="محمد", last_name="رجب پور")
    customer = user.customerprofile
    print(f"\n✅ کاربر یافت شد: {user.get_full_name()}")
except:
    print("\n❌ کاربر محمد رجب پور یافت نشد")
    exit()

# پیدا کردن پکیج مرکز بازی یک
package = Package.objects.filter(
    business__name="مرکز بازی یک",
    is_active=True,
    status='approved'
).first()

if not package:
    print("\n❌ پکیج مرکز بازی یک یافت نشد")
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

# بررسی تراکنش‌های این کاربر
transactions = Transaction.objects.filter(
    customer=customer,
    business=package.business,
    package=package,
    status='approved',
    created_at__gte=package.start_date,
    created_at__lte=package.end_date
)

print(f"\n📊 تراکنش‌های کاربر در این پکیج:")
print(f"   - تعداد: {transactions.count()}")
if elite_gift.amount:
    total = sum([t.final_amount for t in transactions])
    print(f"   - مجموع مبلغ: {total:,} تومان")
    
    for t in transactions:
        print(f"   - تراکنش {t.id}: {t.final_amount:,} تومان در {t.created_at.date()}")

# محاسبه پیشرفت
print(f"\n🎯 محاسبه پیشرفت:")
progress = elite_gift.get_customer_progress(customer)

print(f"   - نوع: {progress['type']}")
print(f"   - هدف: {progress['target']:,}")
print(f"   - فعلی: {progress['current']:,}")
print(f"   - باقی‌مانده: {progress['remaining']:,}")
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

print("\n" + "=" * 70)
print("تست به پایان رسید")
print("=" * 70)
