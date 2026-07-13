import { useEffect, useState } from 'react'
import { apiService } from '../../services/api'
import type { MembershipLevel } from '../../services/api'
import { MEMBERSHIP_TIERS } from '../../constants/membershipTiers'

interface MembershipTierBadgeProps {
  className?: string
  compact?: boolean
  /** ~30% smaller than compact — for mobile header */
  micro?: boolean
  level?: MembershipLevel
}

export const MembershipTierBadge = ({
  className = '',
  compact = false,
  micro = false,
  level,
}: MembershipTierBadgeProps) => {
  const [tier, setTier] = useState<MembershipLevel>(level ?? 'bronze')

  useEffect(() => {
    if (level) {
      setTier(level)
      return
    }

    apiService.getPointsSummary().then((res) => {
      if (res.data?.membership_level) {
        setTier(res.data.membership_level)
      }
    })
  }, [level])

  const info = MEMBERSHIP_TIERS[tier]

  const sizeClass = micro
    ? 'px-1 py-px text-[7px] gap-0.5'
    : compact
      ? 'px-1.5 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1'

  const iconClass = micro ? 'w-2.5 h-2.5' : compact ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ring-1 ${info.ring} ${info.badgeBg} ${info.badgeText} ${sizeClass} ${className}`}
    >
      <img src={info.icon} alt="" className={iconClass} />
      <span>{info.label}</span>
    </span>
  )
}
