"""
تست API Elite Gift Claim
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from accounts.models import User
from loyalty.views import EliteGiftClaimViewSet
import json

# کاربر
user = User.objects.get(username='user_127685_0069')
print(f'👤 کاربر: {user.get_full_name()}')
print(f'   Role: {user.role}')

# ایجاد request
factory = RequestFactory()
request = factory.post(
    '/api/loyalty/elite-gift-claims/',
    data=json.dumps({'package_id': 11}),
    content_type='application/json'
)
force_authenticate(request, user=user)

# فراخوانی view
view = EliteGiftClaimViewSet.as_view({'post': 'create'})
response = view(request)

print(f'\n📡 API Response:')
print(f'   Status: {response.status_code}')

if response.status_code == 201:
    print(f'   ✅ موفق!')
    data = response.data
    print(f'\n📋 Claim ایجاد شد:')
    print(f'   ID: {data.get("id")}')
    print(f'   Status: {data.get("status")}')
    print(f'   Customer: {data.get("customer_name")}')
    print(f'   Business: {data.get("business_name")}')
    print(f'   Elite Gift: {data.get("elite_gift_title")}')
else:
    print(f'   ❌ خطا!')
    print(f'   Response: {response.data}')
