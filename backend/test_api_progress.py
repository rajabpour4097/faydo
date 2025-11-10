"""
تست مستقیم API Elite Gift Progress
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from accounts.models import User
from loyalty.views import elite_gift_progress

# کاربر مشتری
user = User.objects.get(username='user_127685_0069')
print(f'👤 کاربر: {user.get_full_name()}')

# ایجاد request
factory = RequestFactory()
request = factory.get('/api/loyalty/elite-gift-progress/11/')
force_authenticate(request, user=user)

# فراخوانی view
response = elite_gift_progress(request, package_id=11)

print(f'\n📡 API Response:')
print(f'   Status: {response.status_code}')

if response.status_code == 200:
    data = response.data
    print(f'\n📊 Elite Gift Progress:')
    print(f'   Type: {data.get("type")}')
    print(f'   Target: {data.get("target"):,.0f}')
    print(f'   Current: {data.get("current"):,.0f}')
    print(f'   Remaining: {data.get("remaining"):,.0f}')
    print(f'   Percentage: {data.get("percentage")}%')
    print(f'   Eligible: {data.get("eligible")}')
    print(f'   Transactions: {data.get("transactions_count")}')
    
    if 'approved_claims' in data:
        print(f'   Approved Claims: {data.get("approved_claims")}')
    if 'total_deducted' in data:
        print(f'   Total Deducted: {data.get("total_deducted"):,.0f}')
    
    print(f'\n✅ این همان داده‌ای است که frontend دریافت می‌کند')
else:
    print(f'   ❌ خطا: {response.data}')
