import type { MembershipLevel } from '../services/api'
import bronzeIcon from '../assets/tiers/bronze.png'
import silverIcon from '../assets/tiers/silver.png'
import goldIcon from '../assets/tiers/gold.png'
import vipIcon from '../assets/tiers/vip.png'

export const TIER_ORDER: MembershipLevel[] = ['bronze', 'silver', 'gold', 'vip']

export const MEMBERSHIP_TIERS: Record<
  MembershipLevel,
  {
    label: string
    icon: string
    badgeBg: string
    badgeText: string
    ring: string
  }
> = {
  bronze: {
    label: 'برنزی',
    icon: bronzeIcon,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600',
    ring: 'ring-rose-200',
  },
  silver: {
    label: 'نقره‌ای',
    icon: silverIcon,
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    ring: 'ring-gray-200',
  },
  gold: {
    label: 'طلایی',
    icon: goldIcon,
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
