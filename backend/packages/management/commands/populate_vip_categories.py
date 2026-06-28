"""
Management command to populate the 10 universal VipExperienceCategory items
based on the PDF specification (pages 2-4).

Gold level (vip_type='VIP') - 5 categories
VIP  level (vip_type='VIP+') - 5 categories

These are UNIVERSAL entries (category=NULL), visible to all businesses.
Run once on a fresh database or after clearing existing universal entries.

Usage:
    python manage.py populate_vip_categories
    python manage.py populate_vip_categories --clear   # delete existing universals first
"""

from django.core.management.base import BaseCommand
from packages.models import VipExperienceCategory


GOLD_CATEGORIES = [
    {
        "name": "خوشامدگویی",
        "description": (
            "یک تجربه خوشامدگویی گرم و به‌یادماندنی برای مشتریان طلایی تعریف کنید. "
            "مثال: نوشیدنی ولکام، پیام شخصی، مشاوره اولیه رایگان یا پذیرایی ویژه."
        ),
    },
    {
        "name": "هدیه کوچک",
        "description": (
            "یک هدیه کوچک اما ارزشمند برای مشتریان طلایی تعریف کنید. "
            "مثال: کوپن دسر بعدی، اکسسوری کوچک، نمونه محصول یا استیکر برند."
        ),
    },
    {
        "name": "توجه ویژه",
        "description": (
            "نشان دهید مشتری طلایی برای شما خاص است. "
            "مثال: رزرو جایگاه بهتر، پذیرش سریع‌تر، نوبت‌دهی زودتر یا استایل‌مشاوره اختصاصی."
        ),
    },
    {
        "name": "پیشنهاد اختصاصی",
        "description": (
            "یک پیشنهاد ویژه فقط برای مشتریان طلایی ارائه دهید. "
            "مثال: معرفی محصول جدید، خدمت تازه یا منو مخصوص فایدو."
        ),
    },
    {
        "name": "امتیاز بازگشت",
        "description": (
            "مشتری را تشویق به بازگشت کنید. "
            "مثال: کارت دعوت برای دفعه بعد، QR کد امتیاز بیشتر یا تخفیف مراجعه بعدی."
        ),
    },
]

VIP_CATEGORIES = [
    {
        "name": "دسترسی زودتر",
        "description": (
            "به مشتریان VIP اولویت دسترسی بدهید. "
            "مثال: اولویت رزرو در تایم‌های شلوغ، شرکت در پیش‌نمایش کالکشن یا ورود ویژه."
        ),
    },
    {
        "name": "تجربه ویژه",
        "description": (
            "یک تجربه منحصر‌به‌فرد و شخصی‌سازی‌شده برای مشتری VIP. "
            "مثال: خدمت خاص (بلیچینگ، ماساژ گردن)، سرو غذای شخصی‌سازی‌شده یا استایل کامل."
        ),
    },
    {
        "name": "روز خاص من",
        "description": (
            "روز تولد یا مناسبت خاص مشتری VIP را جشن بگیرید. "
            "مثال: دسر تولد رایگان با تزئین ویژه، سرویس مخصوص تولد یا پک تولد اختصاصی."
        ),
    },
    {
        "name": "دعوت از دوست",
        "description": (
            "مشتری VIP را تشویق کنید دوستش را بیاورد. "
            "مثال: یک آیتم اشتراکی رایگان، تست رایگان برای همراه یا هدیه دوتایی."
        ),
    },
    {
        "name": "هدیه برند",
        "description": (
            "یک هدیه با هویت برند کسب‌وکار شما برای مشتری VIP. "
            "مثال: پک مخصوص (قهوه + کارت تخفیف + یادگاری)، پک مراقبت یا محصولات برنددار."
        ),
    },
]


class Command(BaseCommand):
    help = "Populate universal VipExperienceCategory items from PDF specification"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing universal (category=NULL) items before creating new ones",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = VipExperienceCategory.objects.filter(category__isnull=True).delete()
            self.stdout.write(f"Deleted {deleted} existing universal VIP categories.")

        created_count = 0

        for idx, item in enumerate(GOLD_CATEGORIES, 1):
            obj, created = VipExperienceCategory.objects.get_or_create(
                vip_type="VIP",
                name=item["name"],
                category=None,
                defaults={"description": item["description"]},
            )
            if created:
                created_count += 1
            status = "Created" if created else "Exists"
            print(f"  [Gold #{idx}] {status} (id={obj.pk})")

        for idx, item in enumerate(VIP_CATEGORIES, 1):
            obj, created = VipExperienceCategory.objects.get_or_create(
                vip_type="VIP+",
                name=item["name"],
                category=None,
                defaults={"description": item["description"]},
            )
            if created:
                created_count += 1
            status = "Created" if created else "Exists"
            print(f"  [VIP+ #{idx}] {status} (id={obj.pk})")

        total = VipExperienceCategory.objects.filter(category__isnull=True).count()
        print(f"\nDone. Created {created_count} new items. Total universal items: {total}")
