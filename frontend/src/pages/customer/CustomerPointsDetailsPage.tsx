import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment-jalaali'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import {
  apiService,
  PointsEvent,
  PointsSummary,
} from '../../services/api'

type FilterType = 'all' | 'earned' | 'spent'

const EVENT_STYLES: Record<
  string,
  { emoji: string; bg: string; ring: string }
> = {
  registration: { emoji: '🎉', bg: 'bg-teal-500/10', ring: 'ring-teal-500/20' },
  profile_complete: { emoji: '✅', bg: 'bg-purple-500/10', ring: 'ring-purple-500/20' },
  first_purchase: { emoji: '🛒', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  purchase: { emoji: '🛒', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  birthday_purchase: { emoji: '🎂', bg: 'bg-pink-500/10', ring: 'ring-pink-500/20' },
  comment: { emoji: '💬', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20' },
  rating: { emoji: '⭐', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
  favorite: { emoji: '❤️', bg: 'bg-rose-500/10', ring: 'ring-rose-500/20' },
  referral_bonus: { emoji: '👥', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  referral_purchase: { emoji: '🎁', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  story_share: { emoji: '📱', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/20' },
  daily_streak: { emoji: '🔥', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  weekly_streak: { emoji: '📅', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  monthly_badge: { emoji: '🏅', bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/20' },
  expiry: { emoji: '⏳', bg: 'bg-red-500/10', ring: 'ring-red-500/20' },
  decay: { emoji: '📉', bg: 'bg-red-500/10', ring: 'ring-red-500/20' },
  tier_upgrade: { emoji: '👑', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
  manual: { emoji: '⚙️', bg: 'bg-slate-500/10', ring: 'ring-slate-500/20' },
}

const DEFAULT_STYLE = { emoji: '✨', bg: 'bg-teal-500/10', ring: 'ring-teal-500/20' }

function formatEventDate(iso: string) {
  return moment(iso).format('jD jMMMM jYYYY · HH:mm')
}

function formatPoints(value: number) {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toLocaleString('fa-IR')}`
}

function getEventStyle(eventType: string) {
  return EVENT_STYLES[eventType] ?? DEFAULT_STYLE
}

function getEventSubtitle(event: PointsEvent): string | null {
  if (event.description) return event.description

  const meta = event.metadata ?? {}
  const businessName = meta.business_name as string | undefined
  const amount = meta.amount as number | undefined

  if (businessName && amount) {
    return `${businessName} · ${Number(amount).toLocaleString('fa-IR')} تومان`
  }
  if (businessName) return businessName
  if (amount) return `${Number(amount).toLocaleString('fa-IR')} تومان`

  return null
}

interface PointsEventCardProps {
  event: PointsEvent
  isDark: boolean
}

function PointsEventCard({ event, isDark }: PointsEventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const style = getEventStyle(event.event_type)
  const subtitle = getEventSubtitle(event)
  const breakdown = event.breakdown ?? []
  const hasBreakdown = breakdown.length > 0
  const isComposite = event.is_composite ?? breakdown.length > 1
  const isPositive = event.points_delta > 0

  const cardShadow = isDark
    ? '0 8px 24px rgba(0,0,0,0.2)'
    : '0 8px 24px rgba(15, 23, 42, 0.05)'

  return (
    <div
      className={`rounded-[20px] overflow-hidden ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}
      style={{ boxShadow: cardShadow }}
    >
      <button
        type="button"
        onClick={() => hasBreakdown && setExpanded((v) => !v)}
        className={`w-full text-right p-4 flex items-start gap-3 ${
          hasBreakdown ? 'cursor-pointer hover:opacity-95' : 'cursor-default'
        } transition-opacity`}
        aria-expanded={hasBreakdown ? expanded : undefined}
      >
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ring-1 ${style.bg} ${style.ring}`}
        >
          {style.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-[13px] font-bold leading-snug ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {event.event_label}
              </p>
              {isComposite && (
                <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
                  امتیاز ترکیبی
                </span>
              )}
            </div>
            <span
              className={`text-[15px] font-black whitespace-nowrap ${
                isPositive ? 'text-teal-500' : 'text-red-500'
              }`}
            >
              {formatPoints(event.points_delta)}
            </span>
          </div>

          {subtitle && (
            <p
              className={`text-[11px] mt-1 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-gray-500'
              }`}
            >
              {subtitle}
            </p>
          )}

          <p
            className={`text-[10px] mt-1.5 ${
              isDark ? 'text-slate-500' : 'text-gray-400'
            }`}
          >
            {formatEventDate(event.created_at)}
          </p>

          {event.active_score_delta !== 0 && (
            <p className="text-[10px] mt-1 text-orange-500 font-medium">
              امتیاز فعالیت: {formatPoints(event.active_score_delta)}
            </p>
          )}

          {hasBreakdown && (
            <p
              className={`text-[10px] mt-2 font-medium ${
                isDark ? 'text-teal-400' : 'text-teal-600'
              }`}
            >
              {expanded ? 'بستن جزئیات ▲' : 'مشاهده جزئیات ▼'}
            </p>
          )}
        </div>
      </button>

      {expanded && hasBreakdown && (
        <div
          className={`px-4 pb-4 pt-0 border-t ${
            isDark ? 'border-slate-700' : 'border-gray-100'
          }`}
        >
          <p
            className={`text-[11px] font-bold mb-2 pt-3 ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}
          >
            جزئیات امتیاز
          </p>
          <div className="space-y-2">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                  isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}
              >
                <span
                  className={`text-[11px] leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`text-[12px] font-bold whitespace-nowrap ${
                    item.points >= 0 ? 'text-teal-500' : 'text-red-500'
                  }`}
                >
                  {formatPoints(item.points)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface PointsDetailsContentProps {
  summary: PointsSummary | null
  events: PointsEvent[]
  filter: FilterType
  onFilterChange: (f: FilterType) => void
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onRetry: () => void
  isDark: boolean
}

function PointsDetailsContent({
  summary,
  events,
  filter,
  onFilterChange,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  isDark,
}: PointsDetailsContentProps) {
  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'همه' },
    { key: 'earned', label: 'کسب‌شده' },
    { key: 'spent', label: 'کسر شده' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <Link
          to="/dashboard"
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
          }`}
          style={{ boxShadow: cardShadow }}
          aria-label="بازگشت به داشبورد"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M14 6L8 12L14 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div>
          <h1
            className={`text-xl md:text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            جزئیات امتیازات
          </h1>
          <p className={`text-[12px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            منبع و جزئیات هر امتیاز کسب‌شده
          </p>
        </div>
      </div>

      {/* خلاصه */}
      <div
        className={`rounded-[24px] p-5 text-center ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{ boxShadow: cardShadow }}
      >
        <p className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          امتیاز کل شما
        </p>
        <div
          className="text-[48px] font-black leading-none mt-1"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {(summary?.total_points ?? 0).toLocaleString('fa-IR')}
        </div>
        <p className={`text-[12px] font-bold mt-1 ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>
          امتیاز
        </p>

        {summary && (
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-dashed border-gray-200/60">
            <div className="text-center">
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                ۶ ماه اخیر
              </p>
              <p className={`text-[14px] font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                {summary.points_6months.toLocaleString('fa-IR')}
              </p>
            </div>
            {summary.expiring_points > 0 && (
              <div className="text-center">
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  در حال انقضا
                </p>
                <p className="text-[14px] font-bold text-red-500">
                  {summary.expiring_points.toLocaleString('fa-IR')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* فیلتر */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25'
                : isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-white text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* لیست رویدادها */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-[20px] h-24 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      ) : events.length === 0 ? (
        <div
          className={`rounded-[20px] py-12 text-center ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
          style={{ boxShadow: cardShadow }}
        >
          <p className={`text-3xl mb-3`}>✨</p>
          <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            هنوز رویداد امتیازی ثبت نشده
          </p>
          <p className={`text-[12px] mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            با خرید، نظردهی و فعالیت در فایدو امتیاز کسب کنید
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {events.map((event) => (
              <PointsEventCard key={event.id} event={event} isDark={isDark} />
            ))}
          </div>

          {hasMore && (
            <div className="pt-2 pb-4 text-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className={`px-8 py-2.5 rounded-xl text-[12px] font-bold transition-colors ${
                  loadingMore
                    ? 'opacity-60 cursor-wait'
                    : 'hover:bg-teal-600'
                } bg-teal-500 text-white`}
              >
                {loadingMore ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function CustomerPointsDetailsPage() {
  const { isDark } = useTheme()
  const [summary, setSummary] = useState<PointsSummary | null>(null)
  const [events, setEvents] = useState<PointsEvent[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    const res = await apiService.getPointsSummary()
    if (res.data) setSummary(res.data)
  }, [])

  const loadEvents = useCallback(async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await apiService.getPointsHistory(pageNum, 20)
      if (res.error) {
        setError(res.error)
        return
      }
      if (res.data) {
        setEvents((prev) =>
          append ? [...prev, ...res.data!.results] : res.data!.results
        )
        setTotalPages(res.data.total_pages)
        setPage(pageNum)
      }
    } catch {
      setError('خطا در بارگذاری تاریخچه امتیازات')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
    loadEvents(1)
  }, [loadSummary, loadEvents])

  const filteredEvents = useMemo(() => {
    if (filter === 'earned') return events.filter((e) => e.points_delta > 0)
    if (filter === 'spent') return events.filter((e) => e.points_delta < 0)
    return events
  }, [events, filter])

  const handleRetry = () => {
    loadSummary()
    loadEvents(1)
  }

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadEvents(page + 1, true)
    }
  }

  const contentProps: PointsDetailsContentProps = {
    summary,
    events: filteredEvents,
    filter,
    onFilterChange: setFilter,
    loading,
    loadingMore,
    error,
    hasMore: page < totalPages,
    onLoadMore: handleLoadMore,
    onRetry: handleRetry,
    isDark,
  }

  return (
    <>
      <div className="md:hidden">
        <MobileDashboardLayout>
          <PointsDetailsContent {...contentProps} />
        </MobileDashboardLayout>
      </div>
      <div className="hidden md:block">
        <DashboardLayout>
          <PointsDetailsContent {...contentProps} />
        </DashboardLayout>
      </div>
    </>
  )
}
