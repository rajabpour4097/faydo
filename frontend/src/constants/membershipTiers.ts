import type { MembershipLevel, PointsSummary } from '../services/api'
import bronzeIcon from '../assets/tiers/bronze.png'
import silverIcon from '../assets/tiers/silver.png'
import goldIcon from '../assets/tiers/gold.png'
import vipIcon from '../assets/tiers/vip.png'
import bronzeHero from '../assets/dashboard/tier-bronze-full.png'
import goldHero from '../assets/dashboard/tier-gold-full.png'

export const TIER_ORDER: MembershipLevel[] = ['bronze', 'silver', 'gold', 'vip']

/** حداقل امتیاز ۶ ماه اخیر برای هر سطح — مطابق backend/loyalty/services.py */
export const TIER_MIN_POINTS: Record<MembershipLevel, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  vip: 5000,
}

const TIER_RANK: Record<MembershipLevel, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  vip: 3,
}

/** آیا کاربر به حداقل امتیاز تب Gold / VIP رسیده است؟ */
export function hasReachedClubTab(
  tab: Extract<MembershipLevel, 'gold' | 'vip'>,
  summary: Pick<PointsSummary, 'points_6months' | 'total_points' | 'membership_level'> | null,
): boolean {
  if (!summary) return true
  const current = summary.points_6months ?? summary.total_points ?? 0
  return current >= TIER_MIN_POINTS[tab] || TIER_RANK[summary.membership_level] >= TIER_RANK[tab]
}

export const NEXT_TIER_LABEL: Record<MembershipLevel, string> = {
  bronze: 'نقره‌ای',
  silver: 'طلایی',
  gold: 'VIP',
  vip: '',
}

export const MEMBERSHIP_TIERS: Record<
  MembershipLevel,
  {
    label: string
    icon: string
    /** تصویر بزرگ‌تر کارت امتیاز؛ اگر نباشد از icon استفاده می‌شود */
    heroIcon?: string
    /** اگر تصویر خودش پایه فیروزه‌ای دارد، پایه CSS اضافه نشود */
    hasBuiltInPedestal?: boolean
    badgeBg: string
    badgeText: string
    ring: string
  }
> = {
  bronze: {
    label: 'برنزی',
    icon: bronzeIcon,
    heroIcon: bronzeHero,
    hasBuiltInPedestal: true,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600',
    ring: 'ring-rose-200',
  },
  silver: {
    label: 'نقره‌ای',
    icon: silverIcon,
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-600',
    ring: 'ring-teal-200',
  },
  gold: {
    label: 'طلایی',
    icon: goldIcon,
    heroIcon: goldHero,
    hasBuiltInPedestal: true,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    ring: 'ring-amber-200',
  },
  vip: {
    label: 'VIP',
    icon: vipIcon,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    ring: 'ring-purple-200',
  },
}
