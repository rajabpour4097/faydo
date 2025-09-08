# تست ثبت نام (Registration Test)

## مراحل تست:

### 1. باز کردن برنامه
- برو به: http://localhost:3000/register
- یا از صفحه اصلی روی "ثبت نام" کلیک کن

### 2. پر کردن فرم:
```
نوع حساب: مشتری (یا کسب‌وکار)
نام کاربری: testuser2
نام: تست  
نام خانوادگی: کاربر
ایمیل: test2@example.com
شماره تلفن: 09222222222
رمز عبور: testpass123
تکرار رمز عبور: testpass123
☑️ با قوانین و مقررات موافقم
```

### 3. کلیک روی "ثبت نام"

## مشکلات احتمالی و راه حل:

### اگر خطای "خطا در ارتباط با سرور" می‌بینی:
```bash
# بررسی کن که سرورها در حال اجرا هستند:
ps aux | grep -E "(runserver|vite)" | grep -v grep

# اگر بالا نیست، سرور Django را دوباره راه‌اندازی کن:
cd backend
python manage.py runserver 0.0.0.0:8000 &

# اگر فرانت‌اند بالا نیست:
cd frontend  
npm run dev &
```

### اگر خطای CORS می‌بینی:
- در تنظیمات Django چک کن که CORS درست تنظیم شده
- Backend باید روی 8000 و Frontend روی 3000 باشد

### اگر فرم ارسال نمی‌شه:
- F12 کن و Console رو چک کن
- Network tab رو ببین که آیا درخواست ارسال می‌شه یا نه
- اگر 400 یا 500 خطا می‌بینی، جزئیات Response رو ببین

## Console Logs:
با F12 می‌تونی جزئیات بیشتری ببینی:
- "Form data before validation:" - داده‌های فرم
- "Calling register with:" - داده‌هایی که به API ارسال می‌شه  
- "Register result:" - نتیجه از سرور
- "Registration successful" - موفقیت آمیز
- خطاها در صورت وجود

## تست API مستقیم:
```bash
curl -X POST http://localhost:8000/api/accounts/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "directtest",
    "email": "direct@example.com", 
    "first_name": "Direct",
    "last_name": "Test",
    "phone_number": "09333333333",
    "role": "customer",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

اگر این کار می‌کند ولی فرانت‌اند نه، مشکل در JavaScript/Frontend است.
