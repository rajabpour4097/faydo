# مستندات API سیستم هدیه ویژه (Elite Gift)

## نمای کلی

سیستم Elite Gift به کاربران اجازه می‌دهد بر اساس تراکنش‌های خود در یک کسب‌وکار خاص، هدایای ویژه دریافت کنند. هدایا می‌توانند بر اساس **مبلغ** یا **تعداد** تراکنش‌ها تعریف شوند.

## Endpoints

### 1. دریافت پیشرفت کاربر

**GET** `/api/loyalty/elite-gift-progress/{package_id}/`

دریافت پیشرفت کاربر برای دریافت هدیه ویژه یک پکیج.

**دسترسی:** فقط مشتریان (Customer)

**پاسخ موفق (200):**
```json
{
  "type": "amount",  // یا "count"
  "target": 5000000.0,
  "current": 2500000.0,
  "remaining": 2500000.0,
  "percentage": 50.0,
  "eligible": false,
  "transactions_count": 5,
  "gift_name": "کارت هدیه 200 هزار تومانی",
  "gift_description": "کارت هدیه 200 هزار تومانی",
  "package_id": 11,
  "package_start_date": "2025-10-10",
  "package_end_date": "2026-07-15"
}
```

**توضیحات فیلدها:**
- `type`: نوع هدیه - `amount` (مبلغی) یا `count` (تعدادی)
- `target`: مقدار هدف (مبلغ یا تعداد)
- `current`: مقدار فعلی کاربر
- `remaining`: باقی‌مانده تا رسیدن به هدف
- `percentage`: درصد پیشرفت
- `eligible`: آیا کاربر واجد شرایط دریافت هدیه است
- `transactions_count`: تعداد تراکنش‌های محاسبه شده در بازه پکیج

---

### 2. ثبت درخواست دریافت هدیه

**POST** `/api/loyalty/elite-gift-claims/`

ثبت درخواست دریافت هدیه ویژه توسط مشتری.

**دسترسی:** فقط مشتریان (Customer)

**بدنه درخواست:**
```json
{
  "package_id": 11
}
```

**پاسخ موفق (201):**
```json
{
  "id": 1,
  "customer": 5,
  "customer_name": "محمد رجب پور",
  "elite_gift": 3,
  "gift_name": "کارت هدیه 200 هزار تومانی",
  "package": 11,
  "business": 2,
  "business_name": "مرکز بازی یک",
  "progress_at_claim": {
    "type": "amount",
    "target": 5000000.0,
    "current": 5500000.0,
    "remaining": 0.0,
    "percentage": 110.0,
    "eligible": true,
    "transactions_count": 10
  },
  "status": "pending",
  "status_display": "در انتظار تایید کسب‌وکار",
  "approved_at": null,
  "used_at": null,
  "business_note": null,
  "created_at": "2025-11-10T10:30:00Z",
  "modified_at": "2025-11-10T10:30:00Z"
}
```

**خطاهای ممکن:**
- `400 Bad Request`: اگر پکیج فعال نباشد یا هدیه ویژه نداشته باشد
- `400 Bad Request`: اگر کاربر قبلاً درخواست داده باشد
- `400 Bad Request`: اگر کاربر واجد شرایط نباشد

---

### 3. لیست درخواست‌های هدیه

**GET** `/api/loyalty/elite-gift-claims/`

دریافت لیست درخواست‌های هدیه.

**دسترسی:**
- **مشتریان:** فقط درخواست‌های خودشان
- **کسب‌وکارها:** درخواست‌های مربوط به کسب‌وکار خودشان
- **ادمین‌ها:** همه درخواست‌ها

**پاسخ موفق (200):**
```json
[
  {
    "id": 1,
    "customer": 5,
    "customer_name": "محمد رجب پور",
    "elite_gift": 3,
    "gift_name": "کارت هدیه 200 هزار تومانی",
    "package": 11,
    "business": 2,
    "business_name": "مرکز بازی یک",
    "progress_at_claim": {...},
    "status": "approved",
    "status_display": "تایید و اعطا شده",
    "approved_at": "2025-11-10T11:00:00Z",
    "used_at": null,
    "business_note": "درخواست تایید شد",
    "created_at": "2025-11-10T10:30:00Z",
    "modified_at": "2025-11-10T11:00:00Z"
  }
]
```

---

### 4. جزئیات یک درخواست

**GET** `/api/loyalty/elite-gift-claims/{id}/`

دریافت جزئیات یک درخواست خاص.

---

### 5. تایید درخواست (کسب‌وکار)

**POST** `/api/loyalty/elite-gift-claims/{id}/approve/`

تایید درخواست توسط کسب‌وکار.

**دسترسی:** فقط کسب‌وکار مربوطه

**بدنه درخواست (اختیاری):**
```json
{
  "note": "درخواست شما تایید شد. لطفاً برای دریافت هدیه به شعبه مراجعه کنید."
}
```

**پاسخ موفق (200):**
```json
{
  "id": 1,
  "status": "approved",
  "status_display": "تایید و اعطا شده",
  "approved_at": "2025-11-10T11:00:00Z",
  ...
}
```

---

### 6. رد درخواست (کسب‌وکار)

**POST** `/api/loyalty/elite-gift-claims/{id}/reject/`

رد درخواست توسط کسب‌وکار.

**دسترسی:** فقط کسب‌وکار مربوطه

**بدنه درخواست (اختیاری):**
```json
{
  "note": "متأسفانه شرایط دریافت هدیه را ندارید."
}
```

---

### 7. علامت‌گذاری به عنوان استفاده شده

**POST** `/api/loyalty/elite-gift-claims/{id}/mark_used/`

علامت‌گذاری هدیه به عنوان استفاده شده توسط کسب‌وکار.

**دسترسی:** فقط کسب‌وکار مربوطه

**پاسخ موفق (200):**
```json
{
  "id": 1,
  "status": "used",
  "status_display": "استفاده شده",
  "used_at": "2025-11-10T12:00:00Z",
  ...
}
```

---

## وضعیت‌های درخواست

| وضعیت | توضیح |
|-------|-------|
| `pending` | در انتظار تایید کسب‌وکار |
| `approved` | تایید و اعطا شده |
| `rejected` | رد شده |
| `used` | استفاده شده |

---

## نکات مهم

1. **محاسبه پیشرفت:** فقط تراکنش‌های تایید شده (`status='approved'`) در بازه زمانی پکیج محاسبه می‌شوند.

2. **یکتایی درخواست:** هر مشتری فقط یک بار می‌تواند برای یک پکیج درخواست هدیه ثبت کند.

3. **نوع هدیه:**
   - **مبلغی (`amount`):** مجموع مبلغ نهایی تراکنش‌ها باید به حد نصاب برسد
   - **تعدادی (`count`):** تعداد تراکنش‌ها باید به حد نصاب برسد

4. **بازه زمانی:** فقط تراکنش‌هایی که در بازه `start_date` تا `end_date` پکیج ثبت شده‌اند، محاسبه می‌شوند.

5. **دسترسی‌ها:**
   - مشتری: می‌تواند پیشرفت خود را ببیند و درخواست ثبت کند
   - کسب‌وکار: می‌تواند درخواست‌ها را تایید/رد کند و به عنوان استفاده شده علامت بزند
   - ادمین: دسترسی کامل به همه عملیات

---

## مثال‌های کاربردی

### سناریو 1: بررسی پیشرفت و ثبت درخواست

```bash
# 1. بررسی پیشرفت
curl -X GET "http://localhost:8000/api/loyalty/elite-gift-progress/11/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. اگر eligible=true بود، ثبت درخواست
curl -X POST "http://localhost:8000/api/loyalty/elite-gift-claims/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"package_id": 11}'
```

### سناریو 2: تایید درخواست توسط کسب‌وکار

```bash
curl -X POST "http://localhost:8000/api/loyalty/elite-gift-claims/1/approve/" \
  -H "Authorization: Bearer BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "درخواست شما تایید شد"}'
```
