import { useEffect, useState } from 'react'
import { apiService } from '../../services/api'
import type { MembershipLevel } from '../../services/api'
import { MEMBERSHIP_TIERS } from '../../constants/membershipTiers'

interface MembershipTierBadgeProps {
  className?: string
  compact?: boolean
  level?: MembershipLevel
}

export const MembershipTierBadge = ({
  className = '',
  compact = false,
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

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ring-1 ${info.ring} ${info.badgeBg} ${info.badgeText} ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <img src={info.icon} alt="" className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{info.label}</span>
    </span>
  )
}
