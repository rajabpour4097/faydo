import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, PointsEvent } from '../../services/api'
import { loyaltyService, Transaction } from '../../services/loyalty'

const DISPLAY_LIMIT = 5

type ActivityKind = 'points' | 'transaction'

interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  subtitle: string
  createdAt: string
  emoji: string
  from: string
  to: string
}

const EVENT_APPEARANCE: Record<string, { emoji: string; from: string; to: string }> = {
  registration: { emoji: '🎉', from: 'from-teal-500', to: 'to-teal-600' },
  profile_complete: { emoji: '✅', from: 'from-purple-500', to: 'to-purple-600' },
  first_purchase: { emoji: '✓', from: 'from-primary-500', to: 'to-primary-600' },
  purchase: { emoji: '✓', from: 'from-primary-500', to: 'to-primary-600' },
  birthday_purchase: { emoji: '🎂', from: 'from-pink-500', to: 'to-pink-600' },
  comment: { emoji: '💬', from: 'from-blue-500', to: 'to-blue-600' },
  rating: { emoji: '⭐', from: 'from-amber-500', to: 'to-amber-600' },
  favorite: { emoji: '❤️', from: 'from-rose-500', to: 'to-rose-600' },
  referral_bonus: { emoji: '👥', from: 'from-emerald-500', to: 'to-emerald-600' },
  referral_purchase: { emoji: '🎁', from: 'from-emerald-500', to: 'to-emerald-600' },
  story_share: { emoji: '📱', from: 'from-indigo-500', to: 'to-indigo-600' },
  daily_streak: { emoji: '🔥', from: 'from-orange-500', to: 'to-orange-600' },
  weekly_streak: { emoji: '🎯', from: 'from-warning-500', to: 'to-warning-600' },
  monthly_badge: { emoji: '🏅', from: 'from-yellow-500', to: 'to-yellow-600' },
  expiry: { emoji: '⏳', from: 'from-red-500', to: 'to-red-600' },
  decay: { emoji: '📉', from: 'from-red-500', to: 'to-red-600' },
  tier_upgrade: { emoji: '⭐', from: 'from-success-500', to: 'to-success-600' },
  manual: { emoji: '⚙️', from: 'from-slate-500', to: 'to-slate-600' },
}

const DEFAULT_APPEARANCE = {
  emoji: '✨',
  from: 'from-teal-500',
  to: 'to-teal-600',
}

const TX_STATUS_TITLE: Record<Transaction['status'], string> = {
  pending: 'خرید در انتظار تایید',
  approved: 'خرید موفق',
  rejected: 'خرید رد شد',
}

const TX_APPEARANCE: Record<Transaction['status'], { emoji: string; from: string; to: string }> = {
  pending: { emoji: '⏳', from: 'from-warning-500', to: 'to-warning-600' },
  approved: { emoji: '✓', from: 'from-primary-500', to: 'to-primary-600' },
  rejected: { emoji: '✕', from: 'from-red-500', to: 'to-red-600' },
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (days <= 0) return 'امروز'
  if (days === 1) return 'دیروز'
  if (days < 7) return `${days.toLocaleString('fa-IR')} روز پیش`

  return new Intl.DateTimeFormat('fa-IR', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const TIER_LABELS: Record<string, string> = {
  bronze: 'برنز',
  silver: 'نقره‌ای',
  gold: 'طلایی',
  vip: 'VIP',
}

function formatPointsDelta(delta: number): string | null {
  if (delta === 0) return null
  const abs = Math.abs(delta).toLocaleString('fa-IR')
  return delta > 0 ? `${abs} امتیاز دریافت کردید` : `${abs} امتیاز کسر شد`
}

function getEventSubtitle(event: PointsEvent): string {
  if (event.event_type === 'tier_upgrade') {
    const meta = event.metadata ?? {}
    const oldTier = TIER_LABELS[String(meta.old_tier ?? '')] ?? meta.old_tier
    const newTier = TIER_LABELS[String(meta.new_tier ?? '')] ?? meta.new_tier
    if (oldTier && newTier) {
      const desc = `ارتقا از ${oldTier} به ${newTier}`
      const pointsText = formatPointsDelta(event.points_delta)
      return pointsText ? `${desc} - ${pointsText}` : desc
    }
  }

  const pointsText = formatPointsDelta(event.points_delta)
  if (event.description && pointsText) {
    if (event.description === event.event_label) return pointsText
    return `${event.description} - ${pointsText}`
  }
  if (event.description && event.description !== event.event_label) {
    return event.description
  }
  if (pointsText) return pointsText

  const meta = event.metadata ?? {}
  const businessName = typeof meta.business_name === 'string' ? meta.business_name : undefined
  if (businessName) return businessName

  return ''
}

function mapPointsEvent(event: PointsEvent): ActivityItem {
  const appearance = EVENT_APPEARANCE[event.event_type] ?? DEFAULT_APPEARANCE
  return {
    id: `pe-${event.id}`,
    kind: 'points',
    title: event.event_label,
    subtitle: getEventSubtitle(event),
    createdAt: event.created_at,
    ...appearance,
  }
}

function formatToman(value: string | number | undefined): string | null {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return `${amount.toLocaleString('fa-IR')} تومان`
}

function mapTransaction(tx: Transaction): ActivityItem {
  const appearance = TX_APPEARANCE[tx.status] ?? TX_APPEARANCE.pending
  const amountText = formatToman(tx.final_amount)
  const pointsText =
    tx.status === 'approved' ? formatPointsDelta(tx.points_earned || 0) : null

  const details = [tx.business_name, amountText, pointsText].filter(Boolean).join(' - ')

  return {
    id: `tx-${tx.id}`,
    kind: 'transaction',
    title: TX_STATUS_TITLE[tx.status],
    subtitle: details,
    createdAt: tx.created_at,
    ...appearance,
  }
}

function getEventTransactionId(event: PointsEvent): number | null {
  const raw = event.metadata?.transaction_id
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

function mergeActivities(
  events: PointsEvent[],
  transactions: Transaction[]
): ActivityItem[] {
  const coveredTxIds = new Set(
    events.map(getEventTransactionId).filter((id): id is number => id != null)
  )

  const fromEvents = events.map(mapPointsEvent)
  const fromTransactions = transactions
    .filter((tx) => !coveredTxIds.has(tx.id))
    .map(mapTransaction)

  return [...fromEvents, ...fromTransactions]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, DISPLAY_LIMIT)
}

interface CustomerRecentActivitiesProps {
  compact?: boolean
}

export function CustomerRecentActivities({
  compact = true,
}: CustomerRecentActivitiesProps) {
  const { isDark } = useTheme()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadActivities = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [pointsRes, transactions] = await Promise.all([
        apiService.getPointsHistory(1, 10),
        loyaltyService.getCustomerTransactions().catch(() => [] as Transaction[]),
      ])

      if (pointsRes.error && (!Array.isArray(transactions) || transactions.length === 0)) {
        setError(pointsRes.error)
        setActivities([])
        return
      }

      const events = pointsRes.data?.results ?? []
      setActivities(mergeActivities(events, Array.isArray(transactions) ? transactions : []))
    } catch {
      setError('خطا در بارگذاری فعالیت‌ها')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'
  const iconSize = compact ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'
  const listGap = compact ? 'space-y-3' : 'space-y-4'
  const padding = compact ? 'p-5' : 'p-6'

  return (
    <div
      className={`rounded-[24px] ${padding} ${isDark ? 'bg-slate-800' : 'bg-white'}`}
      style={{ boxShadow: cardShadow }}
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3
          className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          فعالیت‌های اخیر
        </h3>
        <Link
          to="/dashboard/points"
          className={`text-xs font-medium ${
            isDark ? 'text-teal-400' : 'text-teal-600'
          }`}
        >
          مشاهده همه
        </Link>
      </div>

      {loading ? (
        <div className={`${listGap} animate-pulse`}>
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`${iconSize} rounded-full flex-shrink-0 ${
                  isDark ? 'bg-slate-700' : 'bg-gray-100'
                }`}
              />
              <div className="flex-1 space-y-2">
                <div
                  className={`h-3 w-24 rounded ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}
                />
                <div
                  className={`h-2.5 w-40 rounded ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            type="button"
            onClick={loadActivities}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 text-white"
          >
            تلاش مجدد
          </button>
        </div>
      ) : activities.length === 0 ? (
        <p
          className={`text-sm text-center py-4 ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}
        >
          هنوز فعالیتی ثبت نشده است
        </p>
      ) : (
        <div className={listGap}>
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-3 space-x-reverse"
            >
              <div
                className={`${iconSize} rounded-full bg-gradient-to-br ${item.from} ${item.to} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white">{item.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </p>
                {item.subtitle && (
                  <p
                    className={`text-xs truncate ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {formatRelativeDate(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
