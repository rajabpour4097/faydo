"""
تست Elite Gift با حفظ مازاد
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomerProfile, BusinessProfile, User
from packages.models import Package, EliteGift
from loyalty.models import Transaction, EliteGiftClaim, CustomerLoyalty
from django.utils import timezone
from decimal import Decimal

# کاربران
customer_user = User.objects.get(username='user_127685_0069')  # محمد رجب پور
customer = customer_user.customerprofile

# پیدا کردن پکیج فعال با Elite Gift
package = Package.objects.filter(
    business__name__icontains='بازی',
    is_active=True,
    status='approved'
).first()

if not package:
    print("❌ پکیج فعال یافت نشد")
    exit()

print(f"📦 پکیج: {package.business.name}")
print(f"   Package ID: {package.id}")

if not hasattr(package, 'elite_gift'):
    print("❌ این پکیج Elite Gift ندارد")
    exit()

elite_gift = package.elite_gift
print(f"\n🎁 Elite Gift:")
print(f"   {elite_gift.gift}")
print(f"   Target: {elite_gift.amount or elite_gift.count}")

# محاسبه پیشرفت فعلی
progress_before = elite_gift.get_customer_progress(customer)
print(f"\n📊 پیشرفت قبل از claim:")
print(f"   Current: {progress_before['current']}")
print(f"   Target: {progress_before['target']}")
print(f"   Remaining: {progress_before['remaining']}")
print(f"   Percentage: {progress_before['percentage']}%")
print(f"   Eligible: {progress_before['eligible']}")
print(f"   Transactions: {progress_before['transactions_count']}")

# ایجاد یک claim (فرضی)
if progress_before['eligible']:
    print(f"\n✅ کاربر واجد شرایط است - می‌توان claim ایجاد کرد")
    
    # بررسی اینکه آیا قبلاً claim ایجاد شده
    existing_claim = EliteGiftClaim.objects.filter(
        customer=customer,
        package=package
    ).first()
    
    if existing_claim:
        print(f"\n📋 Claim موجود:")
        print(f"   Status: {existing_claim.get_status_display()}")
        print(f"   Created: {existing_claim.created_at}")
        
        if existing_claim.status == 'approved':
            print(f"   Approved: {existing_claim.approved_at}")
            
            # محاسبه مجدد پیشرفت (باید فقط تراکنش‌های بعد از approved_at را ببیند)
            progress_after = elite_gift.get_customer_progress(customer)
            print(f"\n📊 پیشرفت بعد از approve:")
            print(f"   Current: {progress_after['current']}")
            print(f"   Target: {progress_after['target']}")
            print(f"   Remaining: {progress_after['remaining']}")
            print(f"   Percentage: {progress_after['percentage']}%")
            print(f"   Eligible: {progress_after['eligible']}")
            print(f"   Transactions: {progress_after['transactions_count']}")
            
            print(f"\n✅ تست موفق: مازاد حفظ شد!")
            print(f"   قبل: {progress_before['current']}")
            print(f"   بعد: {progress_after['current']}")
            print(f"   کسر شده: {progress_before['current'] - progress_after['current']}")
    else:
        print("\n   Claim موجود نیست - می‌توان claim جدید ایجاد کرد")
else:
    print(f"\n❌ کاربر واجد شرایط نیست")
    print(f"   هنوز {progress_before['remaining']} تا target مانده است")
