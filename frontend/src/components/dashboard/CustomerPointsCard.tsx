import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, PointsSummary, MembershipLevel } from '../../services/api'
import {
  MEMBERSHIP_TIERS,
  NEXT_TIER_LABEL,
} from '../../constants/membershipTiers'
import goldMedal from '../../assets/dashboard/gold-medal.png'
import cashbackIcon from '../../assets/dashboard/cashback-wallet.png'
import fireIcon from '../../assets/dashboard/fire.png'
import levelChartIcon from '../../assets/dashboard/level-chart.png'

interface CustomerPointsCardProps {
  points?: number
  membershipLevel?: MembershipLevel
  fetchFromApi?: boolean
  /** کش‌بک نمایشی تا اتصال API اختصاصی */
  cashbackTomans?: number
}

function InfoDot() {
  return (
    <span
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold leading-none border border-current opacity-50"
      aria-hidden
    >
      i
    </span>
  )
}

function TierCoinPedestal({
  icon,
  label,
  hasBuiltInPedestal = false,
}: {
  icon: string
  label: string
  hasBuiltInPedestal?: boolean
}) {
  if (hasBuiltInPedestal) {
    return (
      <div className="relative flex items-center justify-center w-[120px] h-[120px] flex-shrink-0">
        <img
          src={icon}
          alt={label}
          className="w-full h-full object-contain drop-shadow-[0_12px_22px_rgba(15,23,42,0.16)]"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-end w-[108px] h-[108px] flex-shrink-0">
      <div
        className="absolute bottom-1 w-[72px] h-[22px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, #2dd4bf 0%, #14b8a6 55%, #0f766e 100%)',
          boxShadow: '0 8px 16px rgba(20, 184, 166, 0.35)',
        }}
      />
      <div
        className="absolute bottom-[10px] w-[58px] h-3 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #5eead4 0%, #14b8a6 100%)',
          opacity: 0.85,
        }}
      />
      <img
        src={icon}
        alt={label}
        className="relative z-10 w-[78px] h-[78px] object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.18)] -mb-1"
        draggable={false}
      />
    </div>
  )
}

function MetricRow({
  icon,
  label,
  value,
  barColor,
  progress,
  isDark,
  href,
}: {
  icon: string
  label: string
  value: string
  barColor: string
  progress: number
  isDark: boolean
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-2.5 py-3.5 first:pt-1 last:pb-1">
      <img
        src={icon}
        alt=""
        className="w-9 h-9 object-contain flex-shrink-0"
        draggable={false}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1.5">
          <span
            className={`text-[12px] font-bold ${
              isDark ? 'text-slate-200' : 'text-gray-700'
            }`}
          >
            {label}
          </span>
          <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>
            <InfoDot />
          </span>
        </div>
        <div
          className={`h-[5px] rounded-full overflow-hidden ${
            isDark ? 'bg-slate-700' : 'bg-gray-100'
          }`}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: barColor,
            }}
          />
        </div>
      </div>
      <span
        className={`text-[12px] font-bold whitespace-nowrap ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}
      >
        {value}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className={`flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-300'}`}
        aria-hidden
      >
        <path
          d="M14 6L8 12L14 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

export const CustomerPointsCard = ({
  points: propPoints = 0,
  membershipLevel: propLevel,
  fetchFromApi = true,
  cashbackTomans = 0,
}: CustomerPointsCardProps) => {
  const { isDark } = useTheme()
  const [summary, setSummary] = useState<PointsSummary | null>(null)
  const [loading, setLoading] = useState(fetchFromApi)

  useEffect(() => {
    if (!fetchFromApi) return
    apiService
      .getPointsSummary()
      .then((res) => {
        if (res.data) setSummary(res.data)
      })
      .finally(() => setLoading(false))
  }, [fetchFromApi])

  const totalPoints = summary?.total_points ?? propPoints
  const pts6m = summary?.points_6months ?? propPoints
  const activeScore = summary?.active_score ?? 0
  const tier = (summary?.membership_level ??
    propLevel ??
    (pts6m >= 5000
      ? 'vip'
      : pts6m >= 2000
        ? 'gold'
        : pts6m >= 500
          ? 'silver'
          : 'bronze')) as MembershipLevel
  const progress = summary?.tier_progress
  const tierInfo = MEMBERSHIP_TIERS[tier]
  const isVip = tier === 'vip'
  const progressPct = progress?.percent ?? 0
  const pointsToNext = progress?.points_to_next ?? 0
  const nextTierName = !isVip ? NEXT_TIER_LABEL[tier] : ''

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div
          className={`rounded-[24px] h-44 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
        />
        <div
          className={`rounded-[24px] h-40 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
        />
      </div>
    )
  }

  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'

  return (
    <div className="space-y-3">
      {/* کارت سطح و امتیاز */}
      <div
        className={`relative rounded-[24px] p-4 overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{ boxShadow: cardShadow }}
      >
        <div
          className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isDark
              ? 'bg-slate-700 text-slate-200'
              : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100'
          }`}
        >
          <img
            src={tierInfo.icon}
            alt=""
            className="w-3.5 h-3.5 object-contain"
            draggable={false}
          />
          سطح فعلی شما
        </div>

        <div className="flex items-center gap-2 pt-5">
          <div className="flex-1 min-w-0 text-right">
            <p
              className={`text-[12px] font-medium ${
                isDark ? 'text-slate-400' : 'text-gray-400'
              }`}
            >
              امتیاز کل شما
            </p>
            <div
              className="text-[42px] font-black leading-none tracking-tight mt-0.5"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {totalPoints.toLocaleString('fa-IR')}
            </div>
            <p
              className={`text-[12px] font-bold mt-0.5 ${
                isDark ? 'text-slate-300' : 'text-gray-500'
              }`}
            >
              امتیاز
            </p>

            <div className="mt-3">
              {isVip ? (
                <p className="text-[11px] font-bold text-purple-500 mb-1.5">
                  شما در بالاترین سطح VIP هستید
                </p>
              ) : (
                <p
                  className={`text-[11px] font-medium mb-1.5 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  تا سطح {nextTierName}{' '}
                  <span className="font-bold text-teal-500">
                    {pointsToNext.toLocaleString('fa-IR')}
                  </span>{' '}
                  امتیاز دیگر
                </p>
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`flex-1 h-2.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(0, progressPct))}%`,
                      background:
                        'linear-gradient(90deg, #2dd4bf 0%, #14b8a6 100%)',
                    }}
                  />
                </div>
                <img
                  src={goldMedal}
                  alt=""
                  className="w-6 h-6 object-contain flex-shrink-0"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          <TierCoinPedestal
            icon={tierInfo.heroIcon ?? tierInfo.icon}
            label={tierInfo.label}
            hasBuiltInPedestal={tierInfo.hasBuiltInPedestal}
          />
        </div>
      </div>

      {/* آمار تفصیلی */}
      <div
        className={`rounded-[24px] px-4 py-2 divide-y ${
          isDark
            ? 'bg-slate-800 divide-slate-700'
            : 'bg-white divide-gray-100'
        }`}
        style={{ boxShadow: cardShadow }}
      >
        <MetricRow
          icon={cashbackIcon}
          label="کش بک شما"
          value={`${cashbackTomans.toLocaleString('fa-IR')} تومان`}
          barColor="linear-gradient(90deg, #2dd4bf, #14b8a6)"
          progress={cashbackTomans > 0 ? 72 : 8}
          isDark={isDark}
          href="/wallet"
        />
        <MetricRow
          icon={fireIcon}
          label="امتیاز فعالیت"
          value={`${activeScore.toLocaleString('fa-IR')} / ۱۰۰ امتیاز`}
          barColor="linear-gradient(90deg, #f97316, #ef4444)"
          progress={activeScore}
          isDark={isDark}
          href="/dashboard/transactions"
        />
        <MetricRow
          icon={levelChartIcon}
          label="مانده تا سطح بعدی"
          value={
            isVip
              ? 'سطح نهایی'
              : `${pointsToNext.toLocaleString('fa-IR')} امتیاز`
          }
          barColor="linear-gradient(90deg, #60a5fa, #3b82f6)"
          progress={isVip ? 100 : progressPct}
          isDark={isDark}
        />
      </div>
    </div>
  )
}
