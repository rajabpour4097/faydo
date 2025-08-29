"""
اسکریپت برای بارگذاری داده‌های نمونه فایدو
"""
import os
import django
from datetime import datetime, timedelta

# تنظیم Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from api.models import Category, Business, Offer, UserProfile, Notification


def load_sample_data():
    print("بارگذاری داده‌های نمونه...")
    
    # ایجاد دسته‌بندی‌ها
    categories = [
        {'name': 'سلامت و فیتنس', 'slug': 'fitness', 'icon': '🏋️‍♀️', 'description': 'باشگاه‌ها و استودیوهای ورزشی'},
        {'name': 'کافه و رستوران', 'slug': 'food', 'icon': '☕', 'description': 'تجربه طعم‌های متفاوت'},
        {'name': 'فروشگاهی', 'slug': 'shopping', 'icon': '🛍️', 'description': 'برندهای محبوب خرید'},
        {'name': 'سرگرمی', 'slug': 'entertainment', 'icon': '🎮', 'description': 'تفریح و گیم'},
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"دسته‌بندی {category.name} ایجاد شد")
    
    # ایجاد کسب‌وکارها
    businesses = [
        {'name': 'FitGym', 'category_slug': 'fitness', 'description': 'باشگاه مدرن با امکانات کامل'},
        {'name': 'Cafe Rio', 'category_slug': 'food', 'description': 'کافه‌ای با محیطی دنج و قهوه‌های خوشمزه'},
        {'name': 'MegaShop', 'category_slug': 'shopping', 'description': 'فروشگاه بزرگ با تنوع بالا'},
        {'name': 'GameZone', 'category_slug': 'entertainment', 'description': 'مرکز بازی‌های کامپیوتری'},
    ]
    
    for bus_data in businesses:
        category = Category.objects.get(slug=bus_data['category_slug'])
        business, created = Business.objects.get_or_create(
            name=bus_data['name'],
            defaults={
                'slug': bus_data['name'].lower().replace(' ', '-'),
                'category': category,
                'description': bus_data['description'],
                'address': 'تهران، ایران',
                'phone': '021-12345678',
                'is_active': True
            }
        )
        if created:
            print(f"کسب‌وکار {business.name} ایجاد شد")
    
    # ایجاد تخفیف‌ها
    offers = [
        {'business': 'FitGym', 'title': 'تخفیف ویژه باشگاه', 'percent': 40, 'min_points': 100},
        {'business': 'Cafe Rio', 'title': 'تخفیف منوی کافه', 'percent': 25, 'min_points': 50},
        {'business': 'MegaShop', 'title': 'تخفیف خرید', 'percent': 15, 'min_points': 75},
        {'business': 'GameZone', 'title': 'تخفیف بازی', 'percent': 30, 'min_points': 80},
    ]
    
    for offer_data in offers:
        business = Business.objects.get(name=offer_data['business'])
        start_date = timezone.now()
        end_date = start_date + timedelta(days=30)
        
        offer, created = Offer.objects.get_or_create(
            business=business,
            title=offer_data['title'],
            defaults={
                'description': f"تخفیف {offer_data['percent']} درصدی ویژه اعضای فایدو",
                'percent': offer_data['percent'],
                'min_points': offer_data['min_points'],
                'start_date': start_date,
                'end_date': end_date,
                'is_active': True
            }
        )
        if created:
            print(f"تخفیف {offer.title} ایجاد شد")
    
    # ایجاد کاربر نمونه
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'first_name': 'کاربر',
            'last_name': 'نمونه',
            'email': 'test@example.com'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print("کاربر نمونه ایجاد شد")
    
    # ایجاد پروفایل کاربر
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'points': 265,
            'interests': ['fitness', 'food'],
            'achievements': ['starter']
        }
    )
    if created:
        print("پروفایل کاربر ایجاد شد")
    
    # ایجاد نوتیفیکیشن‌ها
    notifications = [
        {'title': 'خوش آمدید!', 'message': 'به فایدو خوش آمدید. امتیازهای خود را جمع کنید!'},
        {'title': 'سطح جدید', 'message': 'فقط ۳۵ امتیاز تا سطح نقره‌ای!'},
        {'title': 'تخفیف ویژه', 'message': 'تخفیف ویژه ۴۰٪ FitGym منتظر شماست!'},
    ]
    
    for notif_data in notifications:
        notification, created = Notification.objects.get_or_create(
            user=user,
            title=notif_data['title'],
            defaults={
                'message': notif_data['message'],
                'is_read': False
            }
        )
        if created:
            print(f"نوتیفیکیشن '{notification.title}' ایجاد شد")
    
    print("✅ بارگذاری داده‌های نمونه با موفقیت انجام شد!")
    print("\n📋 اطلاعات حساب‌ها:")
    print("Admin: admin / admin123")
    print("Test User: testuser / testpass123")


if __name__ == '__main__':
    load_sample_data()
