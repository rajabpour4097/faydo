import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { apiService, CashbackEntry } from '../../services/api'

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function CashbackDetailsContent({
  total,
  entries,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  isDark,
}: {
  total: number
  entries: CashbackEntry[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onRetry: () => void
  isDark: boolean
}) {
  const cardShadow = isDark
    ? '0 8px 24px rgba(0,0,0,0.2)'
    : '0 8px 24px rgba(15, 23, 42, 0.05)'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-700'
          }`}
          aria-label="بازگشت"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
        <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
          کش‌بک شما
        </h1>
      </div>

      <div
        className={`rounded-[24px] p-5 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
        style={{ boxShadow: cardShadow }}
      >
        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          مجموع کش‌بک دریافتی
        </p>
        <p className="mt-1 text-3xl font-black text-teal-500">
          {total.toLocaleString('fa-IR')} تومان
        </p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className={`h-20 rounded-[20px] ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
          <div className={`h-20 rounded-[20px] ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button type="button" onClick={onRetry} className="mr-2 font-bold">
            تلاش مجدد
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className={`rounded-[20px] p-8 text-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-500'}`}>
          <p className="text-sm font-medium">هنوز کش‌بکی دریافت نکرده‌اید.</p>
          <p className="mt-1 text-[12px]">پس از خرید و تایید تراکنش، مبلغ کش‌بک اینجا نمایش داده می‌شود.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {entries.map(entry => (
              <div
                key={entry.id}
                className={`rounded-[20px] p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                style={{ boxShadow: cardShadow }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {entry.business_name}
                    </p>
                    <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatDate(entry.created_at)}
                    </p>
                    <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      خرید {Number(entry.original_amount).toLocaleString('fa-IR')} تومان
                      {entry.cashback_percentage ? ` · ${entry.cashback_percentage}٪` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-black text-teal-500 whitespace-nowrap">
                    +{Number(entry.amount).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="pt-2 pb-4 text-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="rounded-xl bg-teal-500 px-8 py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
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

export function CustomerCashbackDetailsPage() {
  const { isDark } = useTheme()
  const [total, setTotal] = useState(0)
  const [entries, setEntries] = useState<CashbackEntry[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await apiService.getCashbackSummary(pageNum, 20)
      if (res.error) {
        setError(res.error)
        return
      }
      if (res.data) {
        setTotal(res.data.total_tomans)
        setEntries(prev => (append ? [...prev, ...res.data!.results] : res.data!.results))
        setTotalPages(res.data.total_pages)
        setPage(pageNum)
      }
    } catch {
      setError('خطا در بارگذاری کش‌بک‌ها')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    load(1)
  }, [load])

  const contentProps = {
    total,
    entries,
    loading,
    loadingMore,
    error,
    hasMore: page < totalPages,
    onLoadMore: () => {
      if (page < totalPages && !loadingMore) load(page + 1, true)
    },
    onRetry: () => load(1),
    isDark,
  }

  return (
    <>
      <div className="md:hidden">
        <MobileDashboardLayout>
          <CashbackDetailsContent {...contentProps} />
        </MobileDashboardLayout>
      </div>
      <div className="hidden md:block">
        <DashboardLayout>
          <CashbackDetailsContent {...contentProps} />
        </DashboardLayout>
      </div>
    </>
  )
}
