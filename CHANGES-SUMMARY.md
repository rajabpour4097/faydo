# خلاصه تغییرات - سیستم QR Code و پرداخت فاکتور

## فایل‌های ایجاد شده

### Backend (Django)

#### loyalty App (جدید)
```
backend/loyalty/
├── __init__.py
├── apps.py
├── models.py              # CustomerLoyalty, Transaction
├── serializers.py         # Serializer های مربوطه
├── views.py              # CustomerLoyaltyViewSet, TransactionViewSet, get_business_by_code
├── urls.py               # URL routing
├── admin.py              # Django admin configuration
└── migrations/
    ├── __init__.py
    └── 0001_initial.py
```

#### تغییرات در فایل‌های موجود:
- `backend/core/settings.py`: افزودن 'loyalty' به INSTALLED_APPS
- `backend/core/urls.py`: افزودن path('api/loyalty/', include('loyalty.urls'))

### Frontend (React + TypeScript)

#### فایل‌های جدید:
```
frontend/src/
├── services/
│   └── loyalty.ts                                    # API service برای loyalty
└── components/scanner/
    ├── BusinessOptionsModal.tsx                      # Modal با 3 گزینه (پرداخت، هدیه، VIP)
    ├── InvoicePaymentModal.tsx                       # Modal پرداخت فاکتور
    └── QRScannerModal.tsx (بروزرسانی شده)          # افزودن ورود دستی کد یکتا
```

## مدل‌های دیتابیس

### CustomerLoyalty
- **customer**: ForeignKey به CustomerProfile
- **business**: ForeignKey به BusinessProfile
- **points**: امتیاز مشتری
- **elite_gift_target_reached**: Boolean
- **elite_gift_used**: Boolean
- **elite_gift_used_date**: DateTime (nullable)
- **vip_status**: 'none' | 'vip' | 'vip_plus'

متدها:
- `update_vip_status()`: بروزرسانی خودکار VIP (3000/7000 امتیاز)
- `add_points(points)`: افزودن امتیاز
- `use_elite_gift()`: ثبت استفاده از هدیه الیت

### Transaction
- **customer**: ForeignKey به CustomerProfile
- **business**: ForeignKey به BusinessProfile
- **package**: ForeignKey به Package (nullable)
- **loyalty**: ForeignKey به CustomerLoyalty
- **original_amount**: Decimal
- **discount_all_amount**: Decimal
- **has_special_discount**: Boolean
- **special_discount_title**: String (nullable)
- **special_discount_original_amount**: Decimal
- **special_discount_amount**: Decimal
- **final_amount**: Decimal
- **points_earned**: Integer
- **status**: 'pending' | 'approved' | 'rejected'
- **note**: Text (nullable)

متدها:
- `calculate_discount()`: محاسبه تخفیف‌ها
- `calculate_final_amount()`: محاسبه مبلغ نهایی
- `calculate_points()`: محاسبه امتیاز (هر 10k = 1 امتیاز)
- `approve()`: تایید و افزودن امتیاز
- `reject()`: رد تراکنش

## API Endpoints

### GET /api/loyalty/business-by-code/?code=111111
**احراز هویت:** مشتری  
**پاسخ:**
```json
{
  "business_id": 1,
  "business_name": "نام کسب‌وکار",
  "business_logo": "url",
  "discount_all_percentage": 10.5,
  "has_specific_discount": true,
  "specific_discount_title": "عنوان",
  "specific_discount_percentage": 20,
  "has_elite_gift": true,
  "elite_gift_title": "هدیه ویژه",
  "customer_points": 1500,
  "customer_vip_status": "none",
  "can_use_elite_gift": false,
  "can_use_vip": false,
  "can_use_vip_plus": false
}
```

### POST /api/loyalty/transactions/
**احراز هویت:** مشتری  
**Body:**
```json
{
  "business": 1,
  "original_amount": 100000,
  "has_special_discount": true,
  "special_discount_title": "محصول خاص",
  "special_discount_original_amount": 50000,
  "note": "یادداشت اختیاری"
}
```

### POST /api/loyalty/transactions/{id}/approve/
**احراز هویت:** کسب‌وکار  
تایید تراکنش و افزودن خودکار امتیاز

### POST /api/loyalty/transactions/{id}/reject/
**احراز هویت:** کسب‌وکار  
رد تراکنش

## فلوی کاربری

### مشتری:
1. کلیک روی دکمه QR Scanner
2. اسکن QR یا ورود دستی کد یکتا (مثلاً 111111)
3. نمایش BusinessOptionsModal با:
   - امتیاز فعلی
   - وضعیت VIP
   - 3 گزینه (پرداخت، هدیه الیت، VIP)
4. انتخاب "پرداخت فاکتور"
5. ورود مبلغ با فرمت ممیز (123,456,789)
6. فعال/غیرفعال کردن تخفیف خاص
7. مشاهده محاسبات لحظه‌ای
8. ارسال و نمایش "در انتظار تایید"

### کسب‌وکار:
1. دریافت نوتیفیکیشن (TODO)
2. مشاهده تراکنش در لیست
3. تایید → امتیاز اضافه می‌شود
4. رد → تراکنش رد می‌شود

## ویژگی‌های کلیدی

✅ فرمت ممیز برای اعداد (123,456,789)  
✅ محاسبه لحظه‌ای تخفیف‌ها  
✅ تخفیف اصلی + تخفیف خاص  
✅ محاسبه خودکار امتیاز (10k = 1 point)  
✅ وضعیت VIP خودکار (3k/7k)  
✅ ورود دستی کد یکتا  
✅ Popup بدون تغییر صفحه  
✅ حالت در انتظار تایید  

## Migration

```bash
cd backend
../venv/bin/python manage.py makemigrations loyalty
../venv/bin/python manage.py migrate loyalty
```

## نکات مهم

- تمام مبالغ به صورت Decimal با 0 رقم اعشار
- امتیاز: هر 10,000 تومان = 1 امتیاز
- VIP: 3,000 امتیاز
- VIP+: 7,000 امتیاز
- تخفیف خاص > تخفیف اصلی
- CustomerLoyalty یکتا برای هر (customer, business)
- Transaction.status = pending → نیاز به تایید کسب‌وکار

## TODO
- پیاده‌سازی استفاده از هدیه الیت
- پیاده‌سازی خدمات VIP/VIP+
- نوتیفیکیشن برای کسب‌وکار
- تاریخچه تراکنش‌ها در داشبورد
- QR Code generator برای کسب‌وکار
