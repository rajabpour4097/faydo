# 🚀 Faydo - پلتفرم باشگاه مشتریان

## 📖 درباره پروژه

فایدو یک پلتفرم کامل باشگاه مشتریان است که شامل فرانت‌اند React و بک‌اند Django REST API می‌باشد.

## 🏗️ ساختار پروژه

```
├── frontend/          # React + Tailwind Frontend
│   ├── src/
│   │   ├── components/  # کامپوننت‌ها
│   │   ├── pages/       # صفحات
│   │   ├── services/    # API Services
│   │   ├── context/     # React Context
│   │   └── utils/       # ابزارها
│   └── package.json
├── backend/           # Django Settings
├── api/              # Django REST API
├── manage.py
└── requirements.txt  # (در محیط مجازی)
```

## 🚀 راه‌اندازی پروژه

### پیش‌نیازها
- Python 3.12+
- Node.js 16+
- npm یا yarn

### 1️⃣ راه‌اندازی بک‌اند (Django)

```bash
# فعال‌سازی محیط مجازی
source .venv/bin/activate  # یا venv/bin/activate

# نصب پکیج‌ها (در صورت نیاز)
pip install django djangorestframework django-cors-headers pillow

# اجرای migrations
python manage.py migrate

# بارگذاری داده‌های نمونه
python load_sample_data.py

# اجرای سرور
python manage.py runserver
```

سرور Django در آدرس http://127.0.0.1:8000 اجرا می‌شود.

### 2️⃣ راه‌اندازی فرانت‌اند (React)

```bash
# رفتن به پوشه فرانت‌اند
cd frontend

# نصب پکیج‌ها
npm install

# اجرای سرور توسعه
npm run dev
```

سرور React در آدرس http://localhost:5173 اجرا می‌شود.

## 👤 حساب‌های آماده

### Admin Panel
- **URL**: http://127.0.0.1:8000/admin/
- **Username**: admin
- **Password**: admin123

### Test User
- **Username**: testuser
- **Password**: testpass123

## 🔗 API Endpoints

### کاربران و پروفایل
- `GET /api/profiles/dashboard/` - داده‌های داشبورد
- `PATCH /api/profiles/1/` - بروزرسانی پروفایل

### تخفیف‌ها
- `GET /api/offers/` - لیست تخفیف‌ها
- `POST /api/offers/{id}/save/` - ذخیره تخفیف
- `POST /api/offers/{id}/use/` - استفاده از تخفیف

### کسب‌وکارها
- `GET /api/businesses/` - لیست کسب‌وکارها
- `GET /api/categories/` - دسته‌بندی‌ها

### نظرات
- `GET /api/reviews/` - لیست نظرات
- `POST /api/reviews/` - ثبت نظر جدید

## ✨ ویژگی‌های پیاده‌شده

### فرانت‌اند
- ✅ صفحه اصلی (Landing Page)
- ✅ داشبورد کاربر با امتیازات و سطح
- ✅ پروفایل کاربر و ویرایش اطلاعات
- ✅ لیست تخفیف‌ها با فیلتر
- ✅ نظام نوتیفیکیشن
- ✅ نظرات و ریویوها
- ✅ صفحه پشتیبانی
- ✅ طراحی Responsive با Tailwind

### بک‌اند
- ✅ Django REST API کامل
- ✅ مدل‌های User, Business, Offer, Review
- ✅ نظام امتیازدهی و سطح‌بندی
- ✅ CORS برای اتصال فرانت‌اند
- ✅ Admin Panel
- ✅ داده‌های نمونه

## 🔄 فلوی کاری

1. **صفحه اصلی**: نمایش کلی سرویس‌ها
2. **ورود**: http://localhost:5173/login
3. **داشبورد**: مشاهده امتیاز، تخفیف‌ها و نوتیفیکیشن‌ها
4. **پروفایل**: مدیریت اطلاعات و علایق
5. **تخفیف‌ها**: ذخیره و استفاده از تخفیف‌ها

## 🛠️ توسعه بیشتر

### ویژگی‌های آینده
- 🔐 احراز هویت JWT
- 📱 اپلیکیشن موبایل
- 🔔 نوتیفیکیشن Real-time
- 📊 داشبورد تجاری
- 🎯 سیستم پیشنهاد هوشمند
- 💳 درگاه پرداخت

### تست

```bash
# تست فرانت‌اند
cd frontend
npm test

# تست بک‌اند
python manage.py test
```

## 📝 یادداشت‌ها

- فعلاً احراز هویت ساده است (localStorage)
- داده‌های API در صورت عدم دسترسی به mock data تبدیل می‌شوند
- CORS برای localhost:5173 تنظیم شده
- برای production نیاز به تنظیمات امنیتی بیشتر

## 🤝 مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید

---

**🎉 پروژه آماده استفاده است!**
