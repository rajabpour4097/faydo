#!/usr/bin/env python
"""
تست API endpoint برای Elite Gift Progress
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from loyalty.views import elite_gift_progress

User = get_user_model()

print("=" * 70)
print("تست API Elite Gift Progress")
print("=" * 70)

# پیدا کردن کاربر محمد رجب پور
try:
    user = User.objects.get(first_name="محمد", last_name="رجب پور")
    print(f"\n✅ کاربر یافت شد: {user.get_full_name()}")
    print(f"   Role: {user.role}")
except:
    print("\n❌ کاربر محمد رجب پور یافت نشد")
    exit()

# ساخت یک fake request
factory = RequestFactory()
request = factory.get('/api/loyalty/elite-gift-progress/11/')
request.user = user

# فراخوانی view
try:
    response = elite_gift_progress(request, package_id=11)
    response.render()  # Render the response
    print(f"\n✅ API Response Status: {response.status_code}")
    print(f"\nResponse Data:")
    import json
    data = json.loads(response.content)
    print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"\n❌ خطا در فراخوانی API: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
