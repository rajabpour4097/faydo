# فهرست کامل فایل‌های ایجاد/تغییر یافته

## فایل‌های جدید Backend

### loyalty App
```
backend/loyalty/
├── __init__.py                              # تعریف app
├── apps.py                                  # پیکربندی app
├── models.py                                # مدل‌های CustomerLoyalty و Transaction
├── serializers.py                           # Serializer ها
├── views.py                                 # ViewSet ها و get_business_by_code
├── urls.py                                  # URL routing
├── admin.py                                 # تنظیمات Django Admin
└── migrations/
    ├── __init__.py
    └── 0001_initial.py                      # Migration اولیه (auto-generated)
```

### تغییرات در فایل‌های موجود Backend

```
backend/core/settings.py                     # افزودن 'loyalty' به INSTALLED_APPS
backend/core/urls.py                         # افزودن path loyalty
```

## فایل‌های جدید/تغییر یافته Frontend

### سرویس‌ها
```
frontend/src/services/loyalty.ts             # [جدید] API service برای loyalty
```

### کامپوننت‌ها
```
frontend/src/components/scanner/
├── QRScannerModal.tsx                       # [تغییر] افزودن ورود دستی کد
├── BusinessOptionsModal.tsx                 # [جدید] Modal با 3 گزینه
└── InvoicePaymentModal.tsx                  # [جدید] Modal پرداخت فاکتور
```

## فایل‌های مستندات

```
QR-PAYMENT-SYSTEM-README.md                  # راهنمای کامل سیستم
CHANGES-SUMMARY.md                           # خلاصه تغییرات
TESTING-GUIDE.md                             # راهنمای تست
FILE-LIST.md                                 # این فایل
```

---

## جزئیات فایل‌ها

### backend/loyalty/models.py
**محتوا:**
- کلاس CustomerLoyalty با فیلدها و متدهای:
  - points, vip_status, elite_gift_*
  - update_vip_status(), add_points(), use_elite_gift()
- کلاس Transaction با فیلدها و متدهای:
  - مبالغ، تخفیف‌ها، status
  - calculate_discount(), calculate_final_amount()
  - calculate_points(), approve(), reject()

**وابستگی‌ها:**
```python
from accounts.models import CustomerProfile, BusinessProfile
from packages.models import Package
```

### backend/loyalty/serializers.py
**محتوا:**
- CustomerLoyaltySerializer
- TransactionSerializer
- TransactionCreateSerializer
- BusinessInfoSerializer

**وابستگی‌ها:**
```python
from rest_framework import serializers
from .models import CustomerLoyalty, Transaction
```

### backend/loyalty/views.py
**محتوا:**
- CustomerLoyaltyViewSet (ReadOnly)
- TransactionViewSet (CRUD + approve/reject)
- get_business_by_code (function view)

**URL ها:**
- GET /api/loyalty/loyalties/
- GET /api/loyalty/transactions/
- POST /api/loyalty/transactions/
- POST /api/loyalty/transactions/{id}/approve/
- POST /api/loyalty/transactions/{id}/reject/
- GET /api/loyalty/business-by-code/?code=111111

### backend/loyalty/urls.py
**محتوا:**
```python
router = DefaultRouter()
router.register(r'loyalties', CustomerLoyaltyViewSet, basename='loyalty')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('business-by-code/', get_business_by_code, name='business-by-code'),
]
```

### backend/loyalty/admin.py
**محتوا:**
- CustomerLoyaltyAdmin: نمایش و فیلتر loyalty ها
- TransactionAdmin: نمایش و مدیریت تراکنش‌ها

---

### frontend/src/services/loyalty.ts
**محتوا:**
- Interface های TypeScript:
  - BusinessInfo
  - TransactionCreate
  - Transaction
- loyaltyService:
  - getBusinessByCode()
  - createTransaction()
  - getCustomerTransactions()
  - getTransaction()

**وابستگی‌ها:**
```typescript
import { API_BASE_URL } from './api'
```

### frontend/src/components/scanner/QRScannerModal.tsx
**تغییرات:**
- افزودن state ها برای manual entry
- افزودن state ها برای business info
- افزودن fetchBusinessInfo()
- افزودن handleManualCodeSubmit()
- افزودن UI برای ورود دستی کد
- اتصال به BusinessOptionsModal

**وابستگی‌های جدید:**
```typescript
import { loyaltyService, BusinessInfo } from '../../services/loyalty'
import { BusinessOptionsModal } from './BusinessOptionsModal'
```

### frontend/src/components/scanner/BusinessOptionsModal.tsx
**محتوا:**
- نمایش اطلاعات کسب‌وکار
- نمایش امتیازات و VIP status مشتری
- 3 دکمه اصلی:
  1. پرداخت فاکتور (همیشه فعال)
  2. استفاده از هدیه الیت (شرطی)
  3. استفاده از خدمات VIP (شرطی)
- اتصال به InvoicePaymentModal

**وابستگی‌ها:**
```typescript
import { BusinessInfo } from '../../services/loyalty'
import { InvoicePaymentModal } from './InvoicePaymentModal'
```

### frontend/src/components/scanner/InvoicePaymentModal.tsx
**محتوا:**
- فرم پرداخت فاکتور
- فیلدهای مبلغ با فرمت ممیز
- محاسبه لحظه‌ای تخفیف‌ها
- گزینه تخفیف خاص
- نمایش جمع کل
- ارسال تراکنش
- نمایش حالت "در انتظار تایید"

**توابع helper:**
- formatNumber(): فرمت اعداد با ممیز
- parseNumber(): تبدیل متن به عدد

**وابستگی‌ها:**
```typescript
import { BusinessInfo, loyaltyService, TransactionCreate } from '../../services/loyalty'
```

---

## مسیرهای مهم

### Django Admin
```
http://localhost:8000/admin/loyalty/customerloyalty/
http://localhost:8000/admin/loyalty/transaction/
```

### Frontend Routes
```
http://localhost:5173/                       # Dashboard
[QR Scanner Button] → QRScannerModal
```

### API Endpoints
```
GET  /api/loyalty/business-by-code/?code={code}
POST /api/loyalty/transactions/
POST /api/loyalty/transactions/{id}/approve/
POST /api/loyalty/transactions/{id}/reject/
GET  /api/loyalty/transactions/
GET  /api/loyalty/loyalties/
```

---

## دستورات Migration

```bash
# ایجاد migration
cd backend
../venv/bin/python manage.py makemigrations loyalty

# اجرای migration
../venv/bin/python manage.py migrate loyalty

# بازنشانی migrations (در صورت نیاز)
../venv/bin/python manage.py migrate loyalty zero
rm -rf loyalty/migrations/0001_initial.py
../venv/bin/python manage.py makemigrations loyalty
../venv/bin/python manage.py migrate loyalty
```

---

## دستورات اجرا

### Backend
```bash
cd backend
../venv/bin/python manage.py runserver
```

### Frontend
```bash
cd frontend
npm run dev
```

---

## Imports مهم در Backend

### models.py
```python
from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import CustomerProfile, BusinessProfile
from packages.models import Package
```

### serializers.py
```python
from rest_framework import serializers
from .models import CustomerLoyalty, Transaction
from accounts.serializers import CustomerProfileSerializer, BusinessProfileSerializer
from packages.serializers import PackageDetailSerializer
```

### views.py
```python
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CustomerLoyalty, Transaction
from .serializers import (...)
from accounts.models import BusinessProfile
```

---

## Component Structure

```
QRScannerModal (اسکن یا ورود دستی کد)
    ↓
BusinessOptionsModal (3 گزینه)
    ↓
InvoicePaymentModal (پرداخت فاکتور)
    ↓
"در انتظار تایید" (success state)
```

---

## Database Schema

```sql
-- CustomerLoyalty
CREATE TABLE loyalty_customerloyalty (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES accounts_customerprofile(id),
    business_id INTEGER REFERENCES accounts_businessprofile(id),
    points INTEGER DEFAULT 0,
    elite_gift_target_reached BOOLEAN DEFAULT FALSE,
    elite_gift_used BOOLEAN DEFAULT FALSE,
    elite_gift_used_date TIMESTAMP NULL,
    vip_status VARCHAR(10) DEFAULT 'none',
    created_at TIMESTAMP,
    modified_at TIMESTAMP,
    UNIQUE (customer_id, business_id)
);

-- Transaction
CREATE TABLE loyalty_transaction (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES accounts_customerprofile(id),
    business_id INTEGER REFERENCES accounts_businessprofile(id),
    package_id INTEGER REFERENCES packages_package(id) NULL,
    loyalty_id INTEGER REFERENCES loyalty_customerloyalty(id),
    original_amount DECIMAL(12, 0),
    discount_all_amount DECIMAL(12, 0) DEFAULT 0,
    has_special_discount BOOLEAN DEFAULT FALSE,
    special_discount_title VARCHAR(255) NULL,
    special_discount_original_amount DECIMAL(12, 0) DEFAULT 0,
    special_discount_amount DECIMAL(12, 0) DEFAULT 0,
    final_amount DECIMAL(12, 0),
    points_earned INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    note TEXT NULL,
    created_at TIMESTAMP,
    modified_at TIMESTAMP
);
```

---

این فایل فهرستی کامل از تمام فایل‌ها، مسیرها، وابستگی‌ها و ساختارهای مهم است.
