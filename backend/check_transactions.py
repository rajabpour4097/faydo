#!/usr/bin/env python
"""
بررسی تراکنش‌های موجود
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomerProfile, BusinessProfile
from packages.models import Package
from loyalty.models import Transaction
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 70)
print("بررسی تراکنش‌های موجود")
print("=" * 70)

# لیست تمام تراکنش‌ها
transactions = Transaction.objects.all()
print(f"\n📊 تعداد کل تراکنش‌ها: {transactions.count()}")

for trans in transactions:
    print(f"\n{'='*70}")
    print(f"Transaction ID: {trans.id}")
    print(f"مشتری: {trans.customer.user.get_full_name()}")
    print(f"کسب‌وکار: {trans.business.name}")
    print(f"پکیج ID: {trans.package.id if trans.package else 'ندارد'}")
    print(f"مبلغ نهایی: {trans.final_amount:,} تومان")
    print(f"وضعیت: {trans.get_status_display()}")
    print(f"تاریخ ایجاد: {trans.created_at}")
    
    # بررسی اینکه آیا در بازه پکیج است
    if trans.package:
        pkg = trans.package
        print(f"\nاطلاعات پکیج:")
        print(f"  - شروع: {pkg.start_date}")
        print(f"  - پایان: {pkg.end_date}")
        print(f"  - فعال: {pkg.is_active}")
        print(f"  - وضعیت: {pkg.get_status_display()}")
        
        if pkg.start_date and pkg.end_date:
            trans_date = trans.created_at.date()
            if pkg.start_date <= trans_date <= pkg.end_date:
                print(f"  ✅ تراکنش در بازه پکیج است")
            else:
                print(f"  ❌ تراکنش خارج از بازه پکیج است")
                print(f"     تاریخ تراکنش: {trans_date}")

print("\n" + "=" * 70)
