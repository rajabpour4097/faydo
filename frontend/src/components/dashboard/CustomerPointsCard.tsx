import { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, PointsSummary, MembershipLevel } from '../../services/api'

// ─── تعریف سطوح ──────────────────────────────────────────────────

const TIERS: Record<MembershipLevel, {
  label: string
  icon: string
  gradient: string
  badgeBg: string
  badgeText: string
  ring: string
}> = {
  bronze: {
    label: 'برنزی',
    icon: '🥉',
    gradient: 'from-amber-600 to-amber-800',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    ring: 'ring-amber-400',
  },
  silver: {
    label: 'نقره‌ای',
    icon: '🥈',
    gradient: 'from-gray-400 to-gray-600',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    ring: 'ring-gray-400',
  },
  gold: {
    label: 'طلایی',
    icon: '🥇',
    gradient: 'from-yellow-400 to-yellow-600',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    ring: 'ring-yellow-400',
  },
  vip: {
    label: 'VIP',
    icon: '👑',
    gradient: 'from-purple-500 to-indigo-700',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    ring: 'ring-purple-500',
  },
}

const TIER_ORDER: MembershipLevel[] = ['bronze', 'silver', 'gold', 'vip']
const NEXT_TIER_LABEL: Record<MembershipLevel, string> = {
  bronze: 'نقره‌ای',
  silver: 'طلایی',
  gold: 'VIP',
  vip: '',
}

// ─── Active Score Bar ─────────────────────────────────────────────

const ActiveScoreBar = ({ score, isDark }: { score: number; isDark: boolean }) => {
  const color =
    score >= 70 ? 'bg-emerald-500' :
    score >= 30 ? 'bg-yellow-500' :
    'bg-red-400'
  const label =
    score >= 70 ? 'فعال' :
    score >= 30 ? 'نیمه‌فعال' :
    'غیرفعال'

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          امتیاز فعالیت
        </span>
        <span className={`text-xs font-bold ${
          score >= 70 ? 'text-emerald-500' : score >= 30 ? 'text-yellow-500' : 'text-red-400'
        }`}>
          {score}/۱۰۰ · {label}
        </span>
      </div>
      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

interface CustomerPointsCardProps {
  /** مقدار ثابت برای حالت fallback */
  points?: number
  membershipLevel?: MembershipLevel
  /** اگر true: داده را از API می‌گیرد */
  fetchFromApi?: boolean
}

export const CustomerPointsCard = ({
  points: propPoints = 0,
  membershipLevel: propLevel,
  fetchFromApi = true,
}: CustomerPointsCardProps) => {
  const { isDark } = useTheme()
  const [summary, setSummary] = useState<PointsSummary | null>(null)
  const [loading, setLoading] = useState(fetchFromApi)

  useEffect(() => {
    if (!fetchFromApi) return
    apiService.getPointsSummary().then(res => {
      if (res.data) setSummary(res.data)
    }).finally(() => setLoading(false))
  }, [fetchFromApi])

  // مقادیر نمایشی
  const totalPoints  = summary?.total_points   ?? propPoints
  const pts6m        = summary?.points_6months  ?? propPoints
  const activeScore  = summary?.active_score    ?? 0
  const expiringPts  = summary?.expiring_points ?? 0
  const tier         = (summary?.membership_level ?? propLevel ?? (
    pts6m >= 5000 ? 'vip' :
    pts6m >= 2000 ? 'gold' :
    pts6m >= 500  ? 'silver' : 'bronze'
  )) as MembershipLevel
  const progress     = summary?.tier_progress

  const tierInfo = TIERS[tier]
  const isVip    = tier === 'vip'

  const progressPct  = progress?.percent        ?? 0
  const pointsToNext = progress?.points_to_next ?? 0
  const nextTierName = tier !== 'vip' ? NEXT_TIER_LABEL[tier] : ''

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg animate-pulse`}>
        <div className="h-8 bg-gray-300 dark:bg-slate-700 rounded mb-4 w-24 mx-auto" />
        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-2 w-32 mx-auto" />
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>

      {/* Header: سطح */}
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ring-2 ${tierInfo.ring} ${tierInfo.badgeBg} ${tierInfo.badgeText}`}>
          <span>{tierInfo.icon}</span>
          <span>سطح {tierInfo.label}</span>
        </div>
        {expiringPts > 0 && (
          <span className="text-xs text-orange-500 font-medium">
            ⏳ {expiringPts.toLocaleString('fa-IR')} در انقضا
          </span>
        )}
      </div>

      {/* امتیاز کل */}
      <div className="text-center mb-2">
        <div className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {totalPoints.toLocaleString('fa-IR')}
        </div>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          مجموع امتیازها
        </p>
      </div>

      {/* امتیاز 6 ماهه */}
      <div className={`text-center mb-4 p-2 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
        <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
          {pts6m.toLocaleString('fa-IR')}
        </span>
        <span className={`text-xs mr-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          امتیاز ۶ ماه اخیر (ملاک سطح)
        </span>
      </div>

      {/* Progress to next tier */}
      <div className="mb-1">
        <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full bg-gradient-to-r ${tierInfo.gradient} transition-all duration-700`}
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
      </div>

      {isVip ? (
        <p className={`text-center text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'} font-bold`}>
          👑 شما در بالاترین سطح VIP هستید
        </p>
      ) : (
        <p className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {pointsToNext > 0
            ? `${pointsToNext.toLocaleString('fa-IR')} امتیاز تا سطح ${nextTierName} ${TIERS[TIER_ORDER[TIER_ORDER.indexOf(tier) + 1] as MembershipLevel]?.icon ?? ''}`
            : `به سطح ${nextTierName} رسیده‌اید 🎉`}
        </p>
      )}

      {/* Active Score */}
      <ActiveScoreBar score={activeScore} isDark={isDark} />

      {/* راهنمای سطوح */}
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
        <p className={`text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          جدول سطوح (بر اساس امتیاز ۶ ماه)
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {TIER_ORDER.map(t => {
            const info = TIERS[t]
            const active = t === tier
            return (
              <div
                key={t}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
                  ${active
                    ? `ring-1 ${info.ring} ${info.badgeBg} ${info.badgeText} font-bold`
                    : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-50 text-gray-500'
                  }`}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
