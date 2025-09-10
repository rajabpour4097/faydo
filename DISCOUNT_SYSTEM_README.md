# سیستم مدیریت تخفیفات - Faydo

سیستم تخفیفات کامل برای اتصال کسب‌وکارها و مشتریان با امکانات امتیازدهی، نظردهی و گزارش تخلف.

## ویژگی‌های پیاده‌سازی شده

### برای کسب‌وکارها (Business)

#### داشبورد تخفیفات
- نمایش خلاصه‌ای از تخفیفات در داشبورد اصلی
- آمار کلی: تعداد کل تخفیفات، تخفیفات فعال، تخفیفات منقضی
- نمایش آخرین تخفیفات با امتیاز و تعداد نظرات

#### مدیریت تخفیفات
- صفحه مدیریت کامل تخفیفات
- نمایش لیست تخفیفات با جزئیات کامل
- فیلتر بر اساس وضعیت (فعال، منقضی، آینده)
- امکان حذف نرم تخفیفات

#### ایجاد تخفیف جدید
- Modal زیبا برای ایجاد تخفیف
- فرم کامل با اعتبارسنجی
- انتخاب تاریخ شروع و پایان
- تعیین درصد تخفیف (1-100)

### برای مشتریان (Customer)

#### لیست تخفیفات
- نمایش تخفیفات فعال به صورت کارت
- Progress bar برای نمایش زمان باقی‌مانده
- نمایش امتیاز و تعداد نظرات
- دکمه جزئیات برای مشاهده کامل

#### صفحه جزئیات تخفیف
- نمایش کامل اطلاعات تخفیف
- امتیازدهی 1 تا 5 ستاره
- نمایش امتیاز فعلی و تعداد رای‌ها
- نمایش نظرات کاربران
- امکان ثبت نظر (بعد از استفاده از تخفیف)
- گزارش تخلف با modal

## API Endpoints

### تخفیفات
- `GET /api/discounts/discounts/` - دریافت لیست تخفیفات
- `POST /api/discounts/discounts/` - ایجاد تخفیف جدید (Business only)
- `GET /api/discounts/discounts/{id}/` - دریافت جزئیات یک تخفیف
- `PATCH /api/discounts/discounts/{id}/` - ویرایش تخفیف (Business only)
- `DELETE /api/discounts/discounts/{id}/` - حذف تخفیف (Business only)

### امتیازدهی و نظرات
- `POST /api/discounts/discounts/{id}/rate/` - امتیازدهی (Customer only)
- `GET /api/discounts/discounts/{id}/comments/` - دریافت نظرات
- `POST /api/discounts/discounts/{id}/comment/` - ثبت نظر (Customer only)
- `POST /api/discounts/discounts/{id}/report/` - گزارش تخلف (Customer only)

### داشبورد
- `GET /api/discounts/discounts/dashboard_summary/` - خلاصه داشبورد (Business only)

## ساختار فایل‌ها

### Backend
```
discounts/
├── models.py          # مدل‌های Discount, DiscountScore, DiscountComment, DiscountReport
├── serializers.py     # Serializer های مختلف برای API
├── views.py           # ViewSet ها و logic های کاربردی
├── urls.py            # URL routing
├── admin.py           # پنل مدیریت Django
├── signals.py         # Signal های مربوط به امتیازدهی
└── apps.py            # تنظیمات app
```

### Frontend
```
src/
├── types/discount.ts                           # Type definitions
├── services/discountService.ts                 # API calls
├── components/
│   ├── ui/
│   │   ├── ProgressBar.tsx                     # Progress bar component
│   │   ├── StarRating.tsx                      # Star rating component
│   │   └── Modal.tsx                           # Modal component
│   └── discounts/
│       ├── DiscountCard.tsx                    # کارت تخفیف
│       ├── CreateDiscountModal.tsx             # Modal ایجاد تخفیف
│       ├── ReportDiscountModal.tsx             # Modal گزارش تخلف
│       └── DiscountDashboard.tsx               # خلاصه داشبورد
└── pages/
    ├── customer/
    │   ├── DiscountList.tsx                    # لیست تخفیفات
    │   └── DiscountDetail.tsx                  # جزئیات تخفیف
    └── business/
        └── DiscountManagement.tsx              # مدیریت تخفیفات
```

## نحوه استفاده

### راه‌اندازی Backend
1. سرور Django را اجرا کنید:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

### راه‌اندازی Frontend
1. سرور Vite را اجرا کنید:
   ```bash
   cd frontend
   npm run dev
   ```

### تست سیستم

#### برای کسب‌وکار:
1. وارد داشبورد کسب‌وکار شوید
2. در داشبورد اصلی، خلاصه تخفیفات را مشاهده کنید
3. به بخش "مدیریت تخفیفات" بروید
4. تخفیف جدید ایجاد کنید
5. تخفیفات موجود را مدیریت کنید

#### برای مشتری:
1. صفحه "تخفیفات" را مشاهده کنید
2. روی یک تخفیف کلیک کنید
3. امتیاز دهید (1-5 ستاره)
4. نظر بگذارید
5. در صورت نیاز، تخلف گزارش کنید

## ویژگی‌های امنیتی

- Authentication برای تمام API ها
- Authorization بر اساس نوع کاربر (Business/Customer)
- Soft delete برای تخفیفات و نظرات
- اعتبارسنجی کامل داده‌ها
- محدودیت امتیازدهی و نظردهی برای هر کاربر

## تکنولوژی‌های استفاده شده

### Backend
- Django + Django REST Framework
- JWT Authentication
- SQLite Database
- Python Signals

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Vite

## نکات مهم

1. **امتیازدهی**: هر کاربر فقط یک بار می‌تواند به هر تخفیف امتیاز دهد
2. **نظردهی**: هر کاربر فقط یک نظر می‌تواند برای هر تخفیف ثبت کند
3. **حذف نرم**: تخفیفات و نظرات به صورت نرم حذف می‌شوند
4. **Progress Bar**: زمان باقی‌مانده تخفیف به صورت بصری نمایش داده می‌شود
5. **Responsive Design**: تمام کامپوننت‌ها برای موبایل بهینه شده‌اند
