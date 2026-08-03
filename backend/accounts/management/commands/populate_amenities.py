from django.core.management.base import BaseCommand
from django.utils.text import slugify

from accounts.models import Amenity

GENERAL_AMENITIES = [
    'پارکینگ اختصاصی',
    'امکان پرداخت با کارت',
    'امکان رزرو',
]

BUSINESS_TYPE_AMENITIES = {
    'cafe': [
        'فضای کار (Laptop Friendly)',
        'Wi-Fi رایگان',
        'پریز برق کنار میز',
        'اتاق جلسه',
        'فضای روباز',
        'اتاق VIP',
        'مناسب مطالعه',
        'مناسب قرار کاری',
        'مناسب دورهمی',
        'استعمال دخانیات',
        'بیرون\u200cبر',
        'سفارش آنلاین',
        'موسیقی زنده',
        'قهوه تخصصی',
        'صبحانه سرو می\u200cشود',
    ],
    'restaurant': [
        'فضای خانوادگی',
        'اتاق VIP',
        'سالن مراسم',
        'صندلی کودک',
        'منوی کودک',
        'غذای گیاهی',
        'غذای رژیمی',
        'بیرون\u200cبر',
        'ارسال غذا',
        'رزرو میز',
        'پارکینگ',
        'فضای روباز',
        'موسیقی زنده',
        'ظرفیت سالن',
        'مناسب جشن تولد',
    ],
    'bakery': [
        'کیک سفارشی',
        'سفارش آنلاین',
        'ارسال',
        'شیرینی رژیمی',
        'محصولات بدون قند',
        'محصولات بدون گلوتن',
        'نان تازه روزانه',
        'کیک تولد',
        'کافی\u200cشاپ',
        'پارکینگ',
        'پذیرش سفارش سازمانی',
    ],
    'medical': [
        'پزشک خانم',
        'پزشک آقا',
        'نوبت آنلاین',
        'پذیرش بیمه',
        'اورژانس',
        'آزمایشگاه',
        'داروخانه',
        'پارکینگ',
        'آسانسور',
        'مناسب ویلچر',
        'اتاق مادر و کودک',
        'خدمات در منزل',
        'مشاوره آنلاین',
    ],
    'beauty': [
        'اپراتور خانم',
        'اپراتور آقا',
        'اتاق VIP',
        'مشاوره رایگان',
        'لیزر',
        'پوست',
        'تزریق',
        'پاکسازی',
        'خدمات عروس',
        'پارکینگ',
        'رزرو آنلاین',
        'پرداخت اقساطی',
    ],
    'gym': [
        'مربی خانم',
        'مربی آقا',
        'بدنسازی',
        'کراس\u200cفیت',
        'یوگا',
        'پیلاتس',
        'استخر',
        'سونا',
        'جکوزی',
        'دوش',
        'کمد اختصاصی',
        'فروش مکمل',
        'پارکینگ',
        'کلاس خصوصی',
        'کلاس گروهی',
    ],
    'boutique': [
        'لباس زنانه',
        'لباس مردانه',
        'لباس کودک',
        'لباس مجلسی',
        'لباس عروس',
        'دوخت اختصاصی',
        'پرو حضوری',
        'تغییر سایز',
        'پارکینگ',
        'نوبت قبلی',
        'پرداخت اقساطی',
    ],
    'pets': [
        'دامپزشک',
        'آرایش حیوانات',
        'پانسیون',
        'آموزش حیوانات',
        'فروش غذای خشک',
        'فروش غذای تر',
        'لوازم جانبی',
        'واکسیناسیون',
        'ارسال',
        'پارکینگ',
    ],
    'salon': [
        'آرایشگر خانم',
        'آرایشگر آقا',
        'رنگ مو',
        'کوتاهی',
        'گریم',
        'اصلاح داماد',
        'خدمات کودک',
        'VIP',
        'رزرو آنلاین',
        'پارکینگ',
        'پذیرایی',
    ],
    'playground': [
        'رده سنی',
        'نگهداری کودک',
        'کافی\u200cشاپ والدین',
        'دوربین آنلاین والدین',
        'برگزاری تولد',
        'اتاق بازی',
        'بازی آموزشی',
        'مربی کودک',
        'پارکینگ',
        'سرویس بهداشتی کودک',
    ],
}


def make_slug(name: str, business_type: str) -> str:
    base = slugify(name, allow_unicode=True) or f'item-{hash(name) % 100000}'
    if business_type != 'general':
        return f'{business_type}-{base}'
    return f'general-{base}'


class Command(BaseCommand):
    help = 'Populate amenity catalog for business profiles'

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for order, name in enumerate(GENERAL_AMENITIES, start=1):
            slug = make_slug(name, 'general')
            _, was_created = Amenity.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'business_type': 'general',
                    'order': order,
                    'is_active': True,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        for business_type, names in BUSINESS_TYPE_AMENITIES.items():
            for order, name in enumerate(names, start=1):
                slug = make_slug(name, business_type)
                _, was_created = Amenity.objects.update_or_create(
                    slug=slug,
                    defaults={
                        'name': name,
                        'business_type': business_type,
                        'order': order,
                        'is_active': True,
                    },
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Amenities populated: {created} created, {updated} updated.'
            )
        )
