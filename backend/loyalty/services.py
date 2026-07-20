# -*- coding: utf-8 -*-
"""
سرویس امتیازدهی فایدو
منطق کامل محاسبه و ثبت امتیاز بر اساس مستندات طراحی
"""
from django.utils import timezone
from django.db import transaction as db_transaction
from django.db.models import Sum
from datetime import timedelta, date


# ─── ثابت‌های امتیازی ─────────────────────────────────────────────
class PointsConfig:
    # ثبت‌نام و پروفایل
    REGISTRATION          = 50
    PROFILE_COMPLETE      = 100

    # خرید
    FIRST_PURCHASE        = 30   # اولین خرید از یک کسب‌وکار جدید
    REPEAT_PURCHASE       = 10   # خریدهای بعدی
    PURCHASE_AMOUNT_RATE  = 0.0001  # هر 10,000 تومان = 1 امتیاز (0.01%)

    # تعامل
    RATING                = 30   # امتیازدهی به کسب‌وکار
    COMMENT               = 20   # ثبت نظر
    FAVORITE              = 30   # افزودن به علاقه‌مندی (سقف: 5 کسب‌وکار → 150)
    FAVORITE_MAX          = 150

    # دعوت
    REFERRAL_BONUS        = 100  # پاداش ثابت دعوت موفق
    REFERRAL_PURCHASE_RATE = 0.0001  # 0.01% از خرید معرف‌شونده
    REFERRAL_GIFT         = 50   # هدیه به معرف‌شونده (پس از اولین خرید)

    # رویدادهای ویژه
    BIRTHDAY_MULTIPLIER   = 2.0  # ضریب روز تولد
    STORY_SHARE           = 50   # اشتراک استوری
    STORY_SHARE_MAX_MONTH = 2    # حداکثر 2 بار در ماه

    # Daily Streak
    DAILY_VISIT           = 2
    STREAK_MIN            = 5
    STREAK_MAX            = 20
    WEEKLY_COMPLETION     = 50
    MONTHLY_BADGE         = 150

    # Active Score deltas
    AS_PURCHASE           = +5
    AS_COMMENT            = +2
    AS_REFERRAL           = +10
    AS_VIP_USE            = +3
    AS_FIRST_PURCHASE     = +5
    AS_STORY              = +1
    AS_WEEKLY_DECAY       = -10   # عدم فعالیت هر هفته

    # Tier thresholds (based on last 6 months)
    TIER_BRONZE_MAX       = 499
    TIER_SILVER_MIN       = 500
    TIER_SILVER_MAX       = 1999
    TIER_GOLD_MIN         = 2000
    TIER_GOLD_MAX         = 4999
    TIER_VIP_MIN          = 5000

    # Expiry rules
    EXPIRY_MONTHS         = 6    # عدم فعالیت → انقضا
    EXPIRY_RATE           = 0.20 # 20% از امتیازهای فعال منقضی می‌شود
    EXPIRY_RENEWAL_RATE   = 0.50 # هر تراکنش → 50% تمدید می‌شود
    DECAY_DAYS            = 90   # روز بی‌فعالیت برای کاهش
    DECAY_RATE            = 0.01 # 1% کاهش


def _get_points_6months(customer):
    """محاسبه امتیاز 6 ماه اخیر بر اساس رویدادها"""
    from loyalty.models import PointsEvent
    six_months_ago = timezone.now() - timedelta(days=182)
    result = PointsEvent.objects.filter(
        customer=customer,
        created_at__gte=six_months_ago,
        points_delta__gt=0,
    ).aggregate(total=Sum('points_delta'))
    return result['total'] or 0


def calculate_tier(points_6months: int) -> str:
    """محاسبه سطح (Tier) بر اساس امتیاز 6 ماه اخیر"""
    if points_6months >= PointsConfig.TIER_VIP_MIN:
        return 'vip'
    elif points_6months >= PointsConfig.TIER_GOLD_MIN:
        return 'gold'
    elif points_6months >= PointsConfig.TIER_SILVER_MIN:
        return 'silver'
    return 'bronze'


def _log_event(customer, event_type, points_delta, active_score_delta=0,
               description='', metadata=None):
    """ثبت رویداد امتیازی و بروزرسانی CustomerProfile"""
    from loyalty.models import PointsEvent
    from django.db.models import F

    PointsEvent.objects.create(
        customer=customer,
        event_type=event_type,
        points_delta=points_delta,
        active_score_delta=active_score_delta,
        description=description,
        metadata=metadata or {},
    )

    # بروزرسانی اتمیک CustomerProfile
    update_fields = {}
    if points_delta != 0:
        customer.points = max(0, customer.points + points_delta)
        update_fields['points'] = customer.points

    if active_score_delta != 0:
        new_score = max(0, min(100, customer.active_score + active_score_delta))
        customer.active_score = new_score
        update_fields['active_score'] = new_score

    if points_delta > 0 or active_score_delta > 0:
        customer.last_activity_date = timezone.now().date()
        update_fields['last_activity_date'] = customer.last_activity_date

    if update_fields:
        type(customer).objects.filter(pk=customer.pk).update(**update_fields)

    # بروزرسانی سطح
    _recalculate_tier(customer)


def _recalculate_tier(customer):
    """بروزرسانی سطح مشتری بر اساس امتیاز 6 ماه اخیر"""
    pts_6m = _get_points_6months(customer)
    new_tier = calculate_tier(pts_6m)
    if customer.membership_level != new_tier:
        old_tier = customer.membership_level
        type(customer).objects.filter(pk=customer.pk).update(membership_level=new_tier)
        customer.membership_level = new_tier
        # لاگ ارتقای سطح
        from loyalty.models import PointsEvent
        if _tier_rank(new_tier) > _tier_rank(old_tier):
            PointsEvent.objects.create(
                customer=customer,
                event_type='tier_upgrade',
                points_delta=0,
                description=f'ارتقا از {old_tier} به {new_tier}',
                metadata={'old_tier': old_tier, 'new_tier': new_tier},
            )


def _tier_rank(tier: str) -> int:
    return {'bronze': 0, 'silver': 1, 'gold': 2, 'vip': 3}.get(tier, 0)


# ─── متدهای عمومی ─────────────────────────────────────────────────

def award_registration(customer):
    """پاداش ثبت‌نام - فقط یک بار"""
    from loyalty.models import PointsEvent
    already = PointsEvent.objects.filter(
        customer=customer, event_type='registration'
    ).exists()
    if not already:
        _log_event(customer, 'registration', PointsConfig.REGISTRATION,
                   description='پاداش ثبت‌نام')


def award_profile_complete(customer):
    """پاداش تکمیل پروفایل - فقط یک بار"""
    from loyalty.models import PointsEvent
    already = PointsEvent.objects.filter(
        customer=customer, event_type='profile_complete'
    ).exists()
    if not already:
        _log_event(customer, 'profile_complete', PointsConfig.PROFILE_COMPLETE,
                   description='پاداش تکمیل پروفایل')


def award_purchase(customer, transaction_obj):
    """
    امتیاز خرید:
    - اولین خرید از این کسب‌وکار: +30
    - خریدهای بعدی: +10
    - بر اساس مبلغ: 0.01% (هر 10,000 = 1 امتیاز)
    - روز تولد: ضریب 2
    """
    from loyalty.models import Transaction
    business = transaction_obj.business
    final_amount = float(transaction_obj.final_amount)

    # آیا اولین خرید از این کسب‌وکار است؟
    prev_count = Transaction.objects.filter(
        customer=customer,
        business=business,
        status='approved',
    ).exclude(pk=transaction_obj.pk).count()

    is_first = (prev_count == 0)
    base_pts = PointsConfig.FIRST_PURCHASE if is_first else PointsConfig.REPEAT_PURCHASE
    amount_pts = int(final_amount * PointsConfig.PURCHASE_AMOUNT_RATE)
    total_pts = base_pts + amount_pts

    # روز تولد؟
    is_birthday = False
    today = timezone.now().date()
    if customer.birth_date:
        bd = customer.birth_date
        if bd.month == today.month and bd.day == today.day:
            is_birthday = True
            total_pts = int(total_pts * PointsConfig.BIRTHDAY_MULTIPLIER)

    event_type = 'birthday_purchase' if is_birthday else ('first_purchase' if is_first else 'purchase')
    as_delta = PointsConfig.AS_FIRST_PURCHASE if is_first else PointsConfig.AS_PURCHASE

    desc = f'خرید از {business.name}'
    if is_birthday:
        desc += ' (روز تولد ×۲)'

    _log_event(customer, event_type, total_pts, as_delta,
               description=desc,
               metadata={
                   'transaction_id': transaction_obj.id,
                   'business_id': business.id,
                   'amount': final_amount,
                   'is_first': is_first,
                   'is_birthday': is_birthday,
               })
    return total_pts


def award_comment(customer, transaction_id=None):
    """پاداش ثبت نظر: +20"""
    _log_event(customer, 'comment', PointsConfig.COMMENT, PointsConfig.AS_COMMENT,
               description='ثبت نظر',
               metadata={'transaction_id': transaction_id})


def award_rating(customer, transaction_id=None):
    """پاداش امتیازدهی: +30"""
    _log_event(customer, 'rating', PointsConfig.RATING, 0,
               description='امتیازدهی به کسب‌وکار',
               metadata={'transaction_id': transaction_id})


def award_favorite(customer, business_id):
    """پاداش علاقه‌مندی: +30 (سقف 150 امتیاز از 5 کسب‌وکار)"""
    from loyalty.models import PointsEvent
    total_favorite_pts = PointsEvent.objects.filter(
        customer=customer, event_type='favorite'
    ).aggregate(t=models.Sum('points_delta'))['t'] or 0

    if total_favorite_pts < PointsConfig.FAVORITE_MAX:
        pts = min(PointsConfig.FAVORITE, PointsConfig.FAVORITE_MAX - total_favorite_pts)
        _log_event(customer, 'favorite', pts, 0,
                   description='افزودن به علاقه‌مندی',
                   metadata={'business_id': business_id})


def award_referral(referrer_customer, referred_customer, referred_purchase_amount=0):
    """
    پاداش دعوت:
    - معرف: +100 + 0.01% از خرید
    - معرف‌شونده: +50 (فقط پس از اولین خرید)
    """
    bonus = PointsConfig.REFERRAL_BONUS + int(referred_purchase_amount * PointsConfig.REFERRAL_PURCHASE_RATE)
    _log_event(referrer_customer, 'referral_bonus', bonus, PointsConfig.AS_REFERRAL,
               description=f'پاداش دعوت موفق',
               metadata={'referred_customer_id': referred_customer.pk,
                         'purchase_amount': referred_purchase_amount})

    _log_event(referred_customer, 'referral_purchase', PointsConfig.REFERRAL_GIFT, 0,
               description='هدیه ثبت‌نام از طریق دعوت',
               metadata={'referrer_customer_id': referrer_customer.pk})


def award_story_share(customer):
    """پاداش اشتراک استوری: +50 (حداکثر 2 بار در ماه)"""
    from loyalty.models import PointsEvent
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    count_this_month = PointsEvent.objects.filter(
        customer=customer, event_type='story_share',
        created_at__gte=month_start
    ).count()
    if count_this_month < PointsConfig.STORY_SHARE_MAX_MONTH:
        _log_event(customer, 'story_share', PointsConfig.STORY_SHARE, PointsConfig.AS_STORY,
                   description='اشتراک استوری اینستاگرام')


def award_daily_streak(customer, streak_days: int):
    """
    پاداش streak روزانه:
    - ورود روزانه: +2
    - streak: +5 تا +20 بسته به streak_days
    - تکمیل 7 روز: +50
    - تکمیل 30 روز: +150
    """
    pts = PointsConfig.DAILY_VISIT
    streak_bonus = min(PointsConfig.STREAK_MIN + (streak_days // 3), PointsConfig.STREAK_MAX)
    pts += streak_bonus

    if streak_days % 7 == 0:
        pts += PointsConfig.WEEKLY_COMPLETION
        _log_event(customer, 'weekly_streak', PointsConfig.WEEKLY_COMPLETION, 0,
                   description=f'تکمیل {streak_days // 7} هفته')
    if streak_days % 30 == 0:
        pts += PointsConfig.MONTHLY_BADGE
        _log_event(customer, 'monthly_badge', PointsConfig.MONTHLY_BADGE, 0,
                   description=f'نشان ماهانه')

    _log_event(customer, 'daily_streak', pts, 0,
               description=f'ورود روزانه (روز {streak_days})',
               metadata={'streak_days': streak_days})


# ─── Batch Jobs ──────────────────────────────────────────────────

def run_expiry_check():
    """
    کار دوره‌ای:
    - عدم فعالیت 6 ماهه → 20% انقضا
    - عدم فعالیت 90 روزه → کاهش 1%
    باید یک بار در روز اجرا شود
    """
    from accounts.models import CustomerProfile
    from loyalty.models import PointsEvent
    today = timezone.now().date()
    six_months_ago = today - timedelta(days=182)
    ninety_days_ago = today - timedelta(days=90)

    for customer in CustomerProfile.objects.all():
        last = customer.last_activity_date

        # عدم فعالیت 90 روزه: کاهش 1%
        if last and last <= ninety_days_ago and customer.points > 0:
            decay_pts = max(1, int(customer.points * PointsConfig.DECAY_RATE))
            _log_event(customer, 'decay', -decay_pts, PointsConfig.AS_WEEKLY_DECAY,
                       description='کاهش امتیاز عدم فعالیت ۹۰ روزه')

        # عدم فعالیت 6 ماهه: 20% انقضا
        elif last and last <= six_months_ago and customer.points > 0:
            expiry_pts = max(1, int(customer.points * PointsConfig.EXPIRY_RATE))
            _log_event(customer, 'expiry', -expiry_pts, 0,
                       description='انقضای امتیاز عدم فعالیت ۶ ماهه')


def run_active_score_weekly_decay():
    """
    کار هفتگی: کسر Active Score برای کاربران بی‌فعال
    """
    from accounts.models import CustomerProfile
    one_week_ago = timezone.now().date() - timedelta(days=7)
    inactive = CustomerProfile.objects.filter(
        active_score__gt=0
    ).filter(
        models.Q(last_activity_date__lt=one_week_ago) |
        models.Q(last_activity_date__isnull=True)
    )
    for customer in inactive:
        new_score = max(0, customer.active_score + PointsConfig.AS_WEEKLY_DECAY)
        CustomerProfile.objects.filter(pk=customer.pk).update(active_score=new_score)


def get_event_breakdown(event):
    """
    جزئیات امتیاز ترکیبی برای نمایش در تاریخچه.
    برای رویدادهای تک‌بخشی لیست خالی برمی‌گردد.
    """
    meta = event.metadata or {}
    breakdown = []
    et = event.event_type

    if et in ('first_purchase', 'purchase', 'birthday_purchase'):
        amount = float(meta.get('amount') or 0)
        is_first = meta.get('is_first', et == 'first_purchase')
        is_birthday = meta.get('is_birthday', et == 'birthday_purchase')
        base = PointsConfig.FIRST_PURCHASE if is_first else PointsConfig.REPEAT_PURCHASE
        amount_pts = int(amount * PointsConfig.PURCHASE_AMOUNT_RATE)
        subtotal = base + amount_pts

        base_label = 'امتیاز پایه (اولین خرید)' if is_first else 'امتیاز پایه (خرید مجدد)'
        breakdown.append({'label': base_label, 'points': base})
        if amount_pts > 0:
            breakdown.append({
                'label': f'امتیاز بر اساس مبلغ ({int(amount):,} تومان)',
                'points': amount_pts,
            })
        if is_birthday and subtotal > 0:
            breakdown.append({
                'label': 'پاداش روز تولد (×۲)',
                'points': subtotal,
            })

    elif et == 'referral_bonus':
        purchase_amount = float(meta.get('purchase_amount') or 0)
        breakdown.append({'label': 'پاداش ثابت دعوت موفق', 'points': PointsConfig.REFERRAL_BONUS})
        amount_pts = int(purchase_amount * PointsConfig.REFERRAL_PURCHASE_RATE)
        if amount_pts > 0:
            breakdown.append({
                'label': f'درصد از خرید معرف‌شونده ({int(purchase_amount):,} تومان)',
                'points': amount_pts,
            })

    elif et == 'referral_purchase':
        breakdown.append({'label': 'هدیه ثبت‌نام از طریق دعوت', 'points': PointsConfig.REFERRAL_GIFT})

    elif et == 'expiry':
        breakdown.append({'label': 'انقضای امتیاز به‌دلیل عدم فعالیت', 'points': event.points_delta})

    elif et == 'decay':
        breakdown.append({'label': 'کاهش امتیاز عدم فعالیت', 'points': event.points_delta})

    return breakdown


def get_points_summary(customer):
    """
    خلاصه امتیازات برای dashboard
    """
    from loyalty.models import PointsEvent

    now = timezone.now()
    six_months_ago = now - timedelta(days=182)
    ninety_days_ago = now - timedelta(days=90)

    # امتیاز 6 ماه اخیر (برای Tier)
    pts_6m = PointsEvent.objects.filter(
        customer=customer,
        created_at__gte=six_months_ago,
        points_delta__gt=0,
    ).aggregate(t=Sum('points_delta'))['t'] or 0

    # امتیازات در حال انقضا (6-ماهه)
    expiring_pts = 0
    last = customer.last_activity_date
    if last and last <= (now - timedelta(days=182)).date():
        expiring_pts = max(0, int(customer.points * PointsConfig.EXPIRY_RATE))

    # سطح فعلی و بعدی
    current_tier = calculate_tier(pts_6m)

    tier_progress = _calc_tier_progress(current_tier, pts_6m)

    # Active Score وضعیت
    active_status = (
        'active' if customer.active_score >= 70 else
        'semi_active' if customer.active_score >= 30 else
        'inactive'
    )

    return {
        'total_points':     customer.points,
        'points_6months':   pts_6m,
        'active_score':     customer.active_score,
        'active_status':    active_status,
        'membership_level': current_tier,
        'expiring_points':  expiring_pts,
        'tier_progress':    tier_progress,
        'last_activity':    str(customer.last_activity_date) if customer.last_activity_date else None,
    }


def _calc_tier_progress(current_tier, pts_6m):
    """محاسبه پیشرفت درصدی به سطح بعدی"""
    tiers = [
        ('bronze',  0,    499),
        ('silver',  500,  1999),
        ('gold',    2000, 4999),
        ('vip',     5000, None),
    ]
    for i, (name, mn, mx) in enumerate(tiers):
        if name == current_tier:
            if mx is None:
                return {'percent': 100, 'points_to_next': 0, 'next_tier': None,
                        'current_min': mn, 'current_max': None}
            next_name = tiers[i + 1][0] if i + 1 < len(tiers) else None
            progress = ((pts_6m - mn) / (mx - mn + 1)) * 100
            return {
                'percent':       round(min(100, max(0, progress)), 1),
                'points_to_next': max(0, mx + 1 - pts_6m),
                'next_tier':     next_name,
                'current_min':   mn,
                'current_max':   mx,
            }
    return {'percent': 0, 'points_to_next': 0, 'next_tier': 'silver',
            'current_min': 0, 'current_max': 499}


