# سیستم QR Code و پرداخت فاکتور

این سیستم امکان اسکن QR Code کسب‌وکارها و پرداخت فاکتور با تخفیف را فراهم می‌کند.

## ویژگی‌های پیاده‌سازی شده

### Backend

#### مدل‌های جدید (loyalty app)

1. **CustomerLoyalty**
   - ردیابی امتیازات مشتری نزد هر کسب‌وکار
   - وضعیت VIP (none, vip, vip_plus)
   - ردیابی هدیه الیت (target reached, used)
   - محاسبه خودکار وضعیت VIP بر اساس امتیاز:
     - VIP: 3000+ امتیاز
     - VIP+: 7000+ امتیاز

2. **Transaction**
   - ثبت تراکنش‌های پرداخت فاکتور
   - محاسبه خودکار تخفیف‌ها (اصلی و خاص)
   - محاسبه امتیاز بر اساس مبلغ نهایی (هر 10,000 تومان = 1 امتیاز)
   - وضعیت‌ها: pending, approved, rejected

#### API Endpoints

```
GET  /api/loyalty/business-by-code/?code=111111
     - دریافت اطلاعات کسب‌وکار با کد یکتا
     - نیازمند احراز هویت (مشتری)
     - پاسخ شامل: اطلاعات کسب‌وکار، تخفیف‌ها، امتیازات، وضعیت VIP

POST /api/loyalty/transactions/
     - ایجاد تراکنش جدید
     - نیازمند احراز هویت (مشتری)
     - Body: business_id, original_amount, has_special_discount, ...

POST /api/loyalty/transactions/{id}/approve/
     - تایید تراکنش توسط کسب‌وکار
     - افزودن خودکار امتیاز به مشتری

POST /api/loyalty/transactions/{id}/reject/
     - رد تراکنش توسط کسب‌وکار

GET  /api/loyalty/transactions/
     - لیست تراکنش‌ها (بر اساس نقش کاربر)

GET  /api/loyalty/loyalties/
     - لیست وفاداری‌ها (بر اساس نقش کاربر)
```

### Frontend

#### کامپوننت‌های جدید

1. **BusinessOptionsModal**
   - نمایش سه گزینه اصلی:
     - پرداخت فاکتور
     - استفاده از هدیه الیت (فعال در صورت رسیدن به تارگت)
     - استفاده از خدمات VIP/VIP+ (فعال با 3000/7000 امتیاز)
   - نمایش امتیازات و وضعیت VIP مشتری

2. **InvoicePaymentModal**
   - ورود مبلغ فاکتور با فرمت ممیز (123,456,789)
   - محاسبه و نمایش لحظه‌ای مبلغ پس از تخفیف اصلی
   - قابلیت افزودن تخفیف خاص (در صورت وجود)
   - نمایش جمع کل قبل و بعد از تخفیف
   - ارسال تراکنش و نمایش وضعیت "در انتظار تایید"

3. **QRScannerModal (بروزرسانی شده)**
   - اسکن QR Code
   - ورود دستی کد یکتا (برای کاربرانی که امکان اسکن ندارند)
   - اتصال به BusinessOptionsModal پس از اسکن موفق

#### سرویس loyalty.ts
```typescript
loyaltyService.getBusinessByCode(code: string)
loyaltyService.createTransaction(data: TransactionCreate)
loyaltyService.getCustomerTransactions()
loyaltyService.getTransaction(id: number)
```

## نحوه استفاده

### برای مشتری

1. کلیک روی دکمه QR Scanner در داشبورد
2. اسکن QR Code کسب‌وکار یا وارد کردن کد یکتا
3. انتخاب یکی از گزینه‌ها:
   - **پرداخت فاکتور**: ورود مبلغ و دریافت تخفیف
   - **هدیه الیت**: استفاده از هدیه (در صورت فعال بودن)
   - **خدمات VIP**: استفاده از خدمات ویژه (با 3000+ امتیاز)
4. در صورت پرداخت فاکتور:
   - ورود مبلغ اصلی
   - فعال/غیرفعال کردن تخفیف خاص (اختیاری)
   - مشاهده محاسبات تخفیف
   - ارسال برای تایید کسب‌وکار

### برای کسب‌وکار

1. مشاهده تراکنش‌های دریافتی در پنل
2. تایید یا رد تراکنش
3. در صورت تایید، امتیاز به صورت خودکار به مشتری اضافه می‌شود

## نصب و راه‌اندازی

### Backend

```bash
cd backend

# ایجاد migration ها
../venv/bin/python manage.py makemigrations loyalty

# اجرای migration ها
../venv/bin/python manage.py migrate loyalty

# اجرای سرور
../venv/bin/python manage.py runserver
```

### Frontend

فایل‌های زیر ایجاد شده‌اند:
- `src/services/loyalty.ts`
- `src/components/scanner/BusinessOptionsModal.tsx`
- `src/components/scanner/InvoicePaymentModal.tsx`
- `src/components/scanner/QRScannerModal.tsx` (بروزرسانی شده)

## توجهات مهم

1. **فرمت مبلغ**: تمام مبالغ با فرمت ممیز (1,234,567) نمایش داده می‌شوند
2. **محاسبه امتیاز**: هر 10,000 تومان = 1 امتیاز
3. **وضعیت VIP**: 
   - VIP: 3000+ امتیاز
   - VIP+: 7000+ امتیاز
4. **تخفیف خاص**: تخفیف بیشتری نسبت به تخفیف اصلی
5. **هدیه الیت**: باید به تارگت رسیده باشد و قبلاً استفاده نشده باشد

## تست

برای تست سیستم:

1. یک کسب‌وکار با پکیج فعال ایجاد کنید
2. کد یکتای کسب‌وکار را یادداشت کنید
3. با حساب مشتری وارد شوید
4. QR Scanner را باز کنید
5. کد یکتا را وارد کنید
6. فاکتوری ایجاد کنید
7. با حساب کسب‌وکار تایید کنید
8. امتیازات مشتری را بررسی کنید

## ساختار فایل‌ها

```
backend/
├── loyalty/
│   ├── models.py          # CustomerLoyalty, Transaction
│   ├── serializers.py     # Serializer های مربوطه
│   ├── views.py          # API views
│   ├── urls.py           # URL routing
│   └── admin.py          # Django admin

frontend/
├── src/
│   ├── services/
│   │   └── loyalty.ts    # API service
│   └── components/
│       └── scanner/
│           ├── QRScannerModal.tsx           # اسکنر اصلی
│           ├── BusinessOptionsModal.tsx     # صفحه گزینه‌ها
│           └── InvoicePaymentModal.tsx      # صفحه پرداخت
```

## TODO

- [ ] پیاده‌سازی استفاده از هدیه الیت
- [ ] پیاده‌سازی خدمات VIP/VIP+
- [ ] اضافه کردن نوتیفیکیشن برای کسب‌وکار
- [ ] اضافه کردن تاریخچه تراکنش‌ها در داشبورد مشتری
- [ ] تست کامل و رفع باگ‌ها
