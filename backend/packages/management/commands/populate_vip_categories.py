"""
Populate VipExperienceCategory items with club-specific hints from the PDF (pages 2-4).

Each club gets 5 Gold (vip_type='VIP') + 5 VIP (vip_type='VIP+') categories.
The `description` field holds the short hint shown in the package-creation textarea.

Usage:
    python manage.py populate_vip_categories
    python manage.py populate_vip_categories --clear
    python manage.py populate_vip_categories --no-universal
"""

from django.core.management.base import BaseCommand

from accounts.models import Club, ServiceCategory
from packages.club_utils import (
    assign_club_to_service_category,
    ensure_default_clubs,
    find_club_by_name,
)
from packages.models import VipExperienceCategory


GOLD_NAMES = [
    "خوشامدگویی",
    "هدیه کوچک",
    "توجه ویژه",
    "پیشنهاد اختصاصی",
    "امتیاز بازگشت",
]

VIP_NAMES = [
    "دسترسی زودتر",
    "تجربه ویژه",
    "روز خاص من",
    "دعوت از دوست",
    "هدیه برند",
]

# Keys are matched with find_club_by_name (ZWNJ / spelling tolerant)
CLUB_HINTS = {
    "باشگاه طعم\u200cها": {
        "VIP": [
            "نوشیدنی ولکام یا نان تازه کوچک",
            "کوپن دسر بعدی، استیکر یا کارت برند",
            "رزرو میز با ویو بهتر",
            "معرفی غذای روز یا نوشیدنی مخصوص فایدو",
            "کارت دعوت برای دفعه بعد یا QR کد امتیاز بیشتر",
        ],
        "VIP+": [
            "اولویت رزرو در تایم‌های شلوغ",
            "سرو غذای شخصی‌سازی‌شده براساس سلیقه مشتری",
            "دسر یا کیک تولد رایگان با تزئین ویژه",
            "اگر همراه آوردی، یک آیتم اشتراکی رایگان",
            "پک مخصوص کافه شامل قهوه، کارت تخفیف و یادگاری برند",
        ],
    },
    "باشگاه تندرستی": {
        "VIP": [
            "مشاوره اولیه یا ارزیابی بدن رایگان",
            "پک تست محصولات مراقبتی یا حوله کوچک برند",
            "پذیرش سریع‌تر یا جایگاه بهتر در سالن انتظار",
            "معرفی خدمت جدید مثل ماساژ یا تمرین تازه",
            "امتیاز فایدو یا کارت نوبت بعد با تخفیف بیشتر",
        ],
        "VIP+": [
            "رزرو اولویت‌دار در روزهای شلوغ",
            "یک جلسه خدمات خاص (مثلاً بلیچینگ یا ماساژ گردن)",
            "سرویس مخصوص تولد یا روز خاص مشتری",
            "امکان آوردن همراه برای تست رایگان یا تمرین مشترک",
            "پک مراقبت یا ابزار سلامت با برند کلینیک",
        ],
    },
    "باشگاه سبک زندگی": {
        "VIP": [
            "پذیرایی خوش‌آمد با نوشیدنی یا عطر برند",
            "اکسسوری کوچک، کوپن یا نمونه محصول",
            "نوبت‌دهی زودتر یا مشاوره استایل اختصاصی",
            "معرفی محصول یا سبک جدید",
            "کارت دعوت برای خدمات بعدی",
        ],
        "VIP+": [
            "رزرو نوبت خاص یا شرکت در پیش‌نمایش کالکشن",
            "استایل کامل یا خدمات ویژه روز مشتری",
            "استایل یا پک تولد اختصاصی",
            "هدیه دوتایی برای مشتری و همراهش",
            "پک محصولات با برند فروشگاه یا سالن",
        ],
    },
}


class Command(BaseCommand):
    help = "Populate club-specific VipExperienceCategory hints from PDF specification"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing universal/club VIP category items before creating new ones",
        )
        parser.add_argument(
            "--no-universal",
            action="store_true",
            help="Skip creating generic fallback hints (club=null)",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = VipExperienceCategory.objects.filter(
                category__isnull=True
            ).delete()
            print(f"Deleted {deleted} existing VIP category items.")

        clubs, clubs_created = ensure_default_clubs()
        print(f"Ensured {len(clubs)} clubs ({clubs_created} newly created).")

        assigned = self._assign_clubs_to_service_categories()
        print(f"Assigned club to {assigned} service categories.")

        created_count = 0
        updated_count = 0

        for club_name, tiers in CLUB_HINTS.items():
            club = find_club_by_name(club_name)
            if not club:
                print(f"  [SKIP] Club not found: {club_name.encode('unicode_escape').decode()}")
                continue

            for vip_type, names in (("VIP", GOLD_NAMES), ("VIP+", VIP_NAMES)):
                hints = tiers[vip_type]
                for name, hint in zip(names, hints):
                    obj, created = VipExperienceCategory.objects.update_or_create(
                        vip_type=vip_type,
                        name=name,
                        club=club,
                        category=None,
                        defaults={"description": hint},
                    )
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                    tier_label = "Gold" if vip_type == "VIP" else "VIP+"
                    status = "Created" if created else "Updated"
                    print(f"  [{tier_label}] {status} club={club.pk} item={obj.pk}")

        total = VipExperienceCategory.objects.filter(category__isnull=True).count()
        print(
            f"\nDone. Created {created_count}, updated {updated_count}. "
            f"Total club/universal items: {total}"
        )

        if not options["no_universal"]:
            self._ensure_universal_fallbacks()

    def _assign_clubs_to_service_categories(self):
        assigned = 0
        for service_category in ServiceCategory.objects.select_related('parent').all():
            if service_category.club_id:
                continue
            club = assign_club_to_service_category(service_category)
            if club:
                assigned += 1
        return assigned

    def _ensure_universal_fallbacks(self):
        """Generic hints only when club cannot be resolved at all."""
        universal_gold = [
            ("خوشامدگویی", "نوشیدنی ولکام یا پذیرایی کوچک"),
            ("هدیه کوچک", "کوپن یا استیکر برند"),
            ("توجه ویژه", "پذیرش سریع‌تر یا جایگاه بهتر"),
            ("پیشنهاد اختصاصی", "معرفی محصول یا خدمت مخصوص فایدو"),
            ("امتیاز بازگشت", "کارت دعوت یا QR امتیاز بیشتر"),
        ]
        universal_vip = [
            ("دسترسی زودتر", "اولویت رزرو در تایم‌های شلوغ"),
            ("تجربه ویژه", "خدمت یا تجربه شخصی‌سازی‌شده"),
            ("روز خاص من", "هدیه یا سرویس مخصوص تولد"),
            ("دعوت از دوست", "آیتم اشتراکی یا تست رایگان برای همراه"),
            ("هدیه برند", "پک مخصوص با برند کسب‌وکار"),
        ]
        for vip_type, items in (("VIP", universal_gold), ("VIP+", universal_vip)):
            for name, hint in items:
                VipExperienceCategory.objects.update_or_create(
                    vip_type=vip_type,
                    name=name,
                    club=None,
                    category=None,
                    defaults={"description": hint},
                )
