# QR Scanner Feature

## نمای کلی

این ویژگی امکان اسکن QR Code را برای مشتریان فراهم می‌کند تا به راحتی به صفحه کسب‌وکارها دسترسی پیدا کنند. همچنین کسب‌وکارها می‌توانند QR Code منحصر به فرد خود را دانلود و چاپ کنند.

## اجزای اصلی

### 1. QR Scanner Modal (مشتریان)
- **مسیر**: `frontend/src/components/scanner/QRScannerModal.tsx`
- **کتابخانه**: `html5-qrcode` (v2.3.8)
- **دسترسی**: فقط مشتریان (customer users)

#### ویژگی‌ها:
- دسترسی به دوربین دستگاه
- اسکن خودکار QR Code
- UI زیبا با frame overlay
- مدیریت خطاها (عدم دسترسی به دوربین، QR نامعتبر)
- انیمیشن scanning

#### نحوه استفاده:
```tsx
<QRScannerModal
  isOpen={scannerOpen}
  onClose={() => setScannerOpen(false)}
  onScanSuccess={(code) => handleScanSuccess(code)}
/>
```

### 2. Business QR Code Generator (کسب‌وکارها)
- **مسیر**: `frontend/src/components/business/BusinessQRCode.tsx`
- **کتابخانه**: `qrcode` + `@types/qrcode`
- **دسترسی**: فقط کسب‌وکارها (business users)

#### ویژگی‌ها:
- تولید QR Code از unique_code کسب‌وکار
- دانلود به صورت PNG
- نمایش کد یکتا
- راهنمای استفاده

#### نحوه دسترسی:
- از منوی سایدبار: **QR Code کسب‌وکار**
- یا مستقیماً: `/dashboard/qrcode`

### 3. Backend API
- **Endpoint**: `/api/accounts/qr/verify/`
- **Method**: POST
- **Authentication**: Required (JWT Token)

#### Request Body:
```json
{
  "unique_code": "111111"
}
```

#### Response (Success):
```json
{
  "success": true,
  "business": {
    "id": 1,
    "name": "نام کسب‌وکار",
    "unique_code": "111111",
    ...
  }
}
```

#### Response (Error):
```json
{
  "error": "کد QR معتبر نیست"
}
```

## جریان کار (Workflow)

### برای مشتریان:
1. کلیک روی دکمه اسکن در منوی پایین موبایل (آیکن آبی وسط)
2. اجازه دسترسی به دوربین
3. قرار دادن QR Code در مقابل دوربین
4. اسکن خودکار و هدایت به صفحه کسب‌وکار

### برای کسب‌وکارها:
1. ورود به **QR Code کسب‌وکار** از منوی سایدبار
2. مشاهده QR Code و کد یکتا
3. دانلود QR Code
4. چاپ و نصب در محل کسب‌وکار

## نصب وابستگی‌ها

```bash
# Frontend
cd frontend
npm install html5-qrcode qrcode @types/qrcode
```

## الزامات

### HTTPS Requirement
برای دسترسی به دوربین، برنامه باید روی HTTPS اجرا شود:

```bash
# Start with HTTPS
./start-https.sh

# Stop servers
./stop-https.sh
```

مستندات کامل در: `HTTPS-README.md`

## ساختار Database

### BusinessProfile Model
```python
class BusinessProfile(models.Model):
    unique_code = models.CharField(
        max_length=6,
        unique=True,
        null=True,
        blank=True,
        verbose_name='کد یکتا'
    )
    
    @staticmethod
    def generate_unique_code():
        # Auto-generates unique 6-digit code starting from 111111
        ...
```

کد یکتا به صورت خودکار هنگام ایجاد BusinessProfile تولید می‌شود.

## نکات مهم

### امنیت
- QR verification نیاز به authentication دارد
- فقط کسب‌وکارهای معتبر QR Code دارند
- هر unique_code منحصر به فرد است

### تجربه کاربری
- دکمه اسکن فقط برای مشتریان نمایش داده می‌شود
- QR generator فقط برای کسب‌وکارها قابل دسترسی است
- مدیریت خطاهای دوربین با پیام‌های فارسی

### عملکرد
- اسکن با سرعت 10 FPS
- QR box: 250x250 پیکسل
- ترجیح دوربین عقب (برای موبایل)

## توسعه آینده

### پیشنهادات:
- [ ] ثبت تاریخچه اسکن‌ها (ScanLog model)
- [ ] آمار اسکن برای کسب‌وکارها
- [ ] امتیاز دادن به مشتری پس از اسکن
- [ ] تخفیف خاص پس از اولین اسکن
- [ ] QR Code با برندینگ (لوگو در مرکز)
- [ ] چندین نوع QR (check-in, discount, menu)

## خطایابی

### دوربین کار نمی‌کند:
- مطمئن شوید روی HTTPS هستید
- بررسی دسترسی دوربین در مرورگر
- تست روی دستگاه واقعی (نه emulator)

### QR Code اسکن نمی‌شود:
- کیفیت چاپ را بررسی کنید
- نور کافی داشته باشید
- فاصله مناسب از دوربین

### Unique code نمایش نمی‌شود:
- Migration را اجرا کنید: `python manage.py migrate`
- پروفایل کسب‌وکار را ذخیره کنید تا کد تولید شود

## مستندات مرتبط
- [HTTPS Setup Guide](../HTTPS-README.md)
- [Backend Models](../backend/accounts/models.py)
- [API Documentation](../backend/accounts/urls.py)

## پشتیبانی
برای گزارش باگ یا پیشنهاد ویژگی، لطفاً issue بسازید.
