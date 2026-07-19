import type { MembershipLevel } from '../services/api'
import bronzeIcon from '../assets/tiers/bronze.png'
import silverIcon from '../assets/tiers/silver.png'
import goldIcon from '../assets/tiers/gold.png'
import vipIcon from '../assets/tiers/vip.png'
import bronzeHero from '../assets/dashboard/tier-bronze-full.png'
import goldHero from '../assets/dashboard/tier-gold-full.png'

export const TIER_ORDER: MembershipLevel[] = ['bronze', 'silver', 'gold', 'vip']

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
