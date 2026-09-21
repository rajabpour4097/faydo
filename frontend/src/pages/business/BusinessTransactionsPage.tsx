import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BusinessScreen } from '../../components/business/BusinessScreen'
import { BusinessTransactionDetail } from '../../components/business/BusinessTransactionDetail'
import { TransactionExportModal } from '../../components/business/TransactionExportModal'
import { apiService, BusinessTransaction, BusinessTransactionQuery, BusinessTransactionSummary, getFullImageUrl } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { faNum } from '../../components/business/businessHomeUtils'
import {
  PERIOD_OPTIONS,
  STATUS_TABS,
  TxPeriod,
  TxStatus,
  customerInitial,
  formatListTime,
  money,
  percentLabel,
  statusStyle,
} from '../../components/business/businessTransactionUtils'
import { PersianDateTimePicker, nowDateTimeValue, startOfTodayValue } from '../../components/PersianDateTimePicker'

const emptySummary: BusinessTransactionSummary = {
  period: 'today',
  period_label: 'خلاصه امروز',
  date_from: null,
  date_to: null,
  sales: 0,
  cashback: 0,
  discount: 0,
  success_count: 0,
  total_count: 0,
}

export const BusinessTransactionsPage = () => {
  const { isDark } = useTheme()
  const [params] = useSearchParams()
  const [status, setStatus] = useState<TxStatus>('all')
  const [period, setPeriod] = useState<TxPeriod>('today')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [periodOpen, setPeriodOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const [selected, setSelected] = useState<BusinessTransaction | null>(null)
  const [rows, setRows] = useState<BusinessTransaction[]>([])
  const [summary, setSummary] = useState<BusinessTransactionSummary>(emptySummary)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fromUrl = params.get('status')
    if (fromUrl === 'pending' || fromUrl === 'approved' || fromUrl === 'rejected') {
      setStatus(fromUrl)
    }
  }, [params])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const query = useMemo<BusinessTransactionQuery>(() => ({
    status,
    period,
    date_from: period === 'custom' ? dateFrom : undefined,
    date_to: period === 'custom' ? dateTo : undefined,
    search: debouncedSearch || undefined,
    page_size: 50,
  }), [status, period, dateFrom, dateTo, debouncedSearch])

  const load = async (nextPage = 1, append = false) => {
    if (period === 'custom' && (!dateFrom || !dateTo)) return
    setLoading(true)
    setError(null)
    const [listRes, summaryRes] = await Promise.all([
      apiService.getTransactions({ ...query, page: nextPage }),
      apiService.getBusinessTransactionsSummary(query),
    ])
    if (listRes.error) setError(listRes.error)
    const incoming = listRes.data?.results || []
    setRows(append ? prev => [...prev, ...incoming] : incoming)
    setCount(listRes.data?.count || 0)
    if (summaryRes.data) setSummary(summaryRes.data)
    setPage(nextPage)
    setLoading(false)
  }

  useEffect(() => {
    load(1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.status, query.period, query.date_from, query.date_to, query.search])

  const pageBg = isDark ? 'bg-slate-900 text-white' : 'bg-[#F4F6FB] text-gray-900'
  const card = isDark ? 'bg-slate-800' : 'bg-white'
  const periodLabel = PERIOD_OPTIONS.find(item => item.id === period)?.label || 'امروز'
  const canLoadMore = rows.length < count

  return (
    <BusinessScreen>
      <div className={`relative min-h-full overflow-x-hidden ${pageBg}`} dir="rtl">
        <div className="mx-auto w-full min-w-0 max-w-2xl px-3 pb-8 pt-4 sm:px-4">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-l from-[#8B74FF] to-[#7C5CFC] px-4 py-5 text-white shadow-[0_12px_30px_rgba(124,92,252,0.28)] sm:px-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-[22px] font-black leading-none">تراکنش‌ها</h1>
                <p className="mt-2 text-[11px] leading-5 text-white/80">
                  همه تراکنش‌های انجام شده از طریق فایدو
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15 sm:h-14 sm:w-14">
                  <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
                    <rect x="10" y="8" width="22" height="30" rx="4" fill="white" fillOpacity="0.95" />
                    <rect x="16" y="14" width="18" height="26" rx="4" fill="#EDE7FF" />
                    <rect x="20" y="18" width="16" height="22" rx="4" fill="white" />
                    <rect x="24" y="24" width="8" height="6" rx="1" fill="#7C5CFC" />
                  </svg>
                </div>
                <Link to="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15" aria-label="بازگشت">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className={`mt-3 min-w-0 rounded-[28px] p-3 sm:p-4 ${card}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="min-w-0 truncate text-sm font-black">{summary.period_label}</div>
              <div className="relative shrink-0">
                <button
                  onClick={() => setPeriodOpen(value => !value)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold ${isDark ? 'bg-slate-700' : 'bg-[#F4F6FB]'}`}
                >
                  <svg className="h-4 w-4 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-9 4h10M6 21h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {periodLabel}
                  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {periodOpen && (
                  <div className={`absolute left-0 top-10 z-20 w-40 overflow-hidden rounded-2xl py-1 shadow-lg ${card}`}>
                    {PERIOD_OPTIONS.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setPeriod(item.id)
                          setPeriodOpen(false)
                          if (item.id === 'custom') {
                            setDateFrom(current => current || startOfTodayValue())
                            setDateTo(current => current || nowDateTimeValue())
                          }
                        }}
                        className="block w-full px-3 py-2 text-right text-[12px] hover:bg-[#F3EEFF]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {period === 'custom' && (
              <div className="mb-3 space-y-2">
                <PersianDateTimePicker
                  label="از تاریخ و ساعت"
                  value={dateFrom}
                  onChange={setDateFrom}
                  isDark={isDark}
                  fallback="start"
                  placeholder="شروع بازه"
                />
                <PersianDateTimePicker
                  label="تا تاریخ و ساعت"
                  value={dateTo}
                  onChange={setDateTo}
                  isDark={isDark}
                  fallback="now"
                  placeholder="پایان بازه"
                />
              </div>
            )}

            {summaryOpen && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Kpi icon="chart" label="فروش از طریق فایدو" value={faNum(Math.round(summary.sales))} isDark={isDark} />
                <Kpi icon="wallet" label="کش‌بک پرداختی" value={faNum(Math.round(summary.cashback))} isDark={isDark} />
                <Kpi icon="percent" label="تخفیف ارائه شده" value={faNum(Math.round(summary.discount))} isDark={isDark} />
                <Kpi icon="check" label="تراکنش تایید شده" value={faNum(summary.success_count)} unit="تراکنش" isDark={isDark} />
              </div>
            )}
            <button onClick={() => setSummaryOpen(value => !value)} className="mx-auto mt-3 flex text-gray-300" aria-label="جمع‌شدن خلاصه">
              <svg className={`h-5 w-5 transition ${summaryOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className={`mt-3 min-w-0 rounded-[28px] p-3 ${card}`}>
            <div className="mb-3 grid grid-cols-4 gap-1">
              {STATUS_TABS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setStatus(item.id)}
                  className={`min-w-0 truncate rounded-full px-1 py-1.5 text-[11px] font-bold sm:px-3 sm:text-[12px] ${
                    status === item.id ? 'bg-[#7C5CFC] text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#F4F6FB] text-gray-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className={`mb-3 flex items-center rounded-2xl px-3 py-2 ${isDark ? 'bg-slate-700' : 'bg-[#F4F6FB]'}`}>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو بر اساس نام مشتری، شماره تراکنش..."
                className="w-full bg-transparent px-2 py-1 text-[12px] outline-none"
              />
            </div>

            {error ? (
              <div className="py-10 text-center">
                <p className="mb-3 text-sm text-rose-500">{error}</p>
                <button onClick={() => load(1)} className="rounded-xl bg-[#7C5CFC] px-4 py-2 text-sm text-white">تلاش مجدد</button>
              </div>
            ) : loading && rows.length === 0 ? (
              <div className="space-y-2">{[1, 2, 3, 4].map(item => <div key={item} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)}</div>
            ) : rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">هیچ تراکنشی یافت نشد</p>
            ) : (
              <div className="space-y-2">
                {rows.map(tx => (
                  <TransactionRow key={tx.id} transaction={tx} onClick={() => setSelected(tx)} isDark={isDark} />
                ))}
                {canLoadMore && (
                  <button
                    onClick={() => load(page + 1, true)}
                    className="mt-2 w-full py-2 text-sm font-bold text-[#7C5CFC]"
                  >
                    {loading ? 'در حال بارگذاری...' : 'مشاهده بیشتر'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setExportOpen(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-[#7C5CFC] shadow-[0_10px_30px_rgba(124,92,252,0.18)] ${card}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              خروجی گزارش
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <BusinessTransactionDetail
          transaction={selected}
          onClose={() => setSelected(null)}
          onChanged={() => load(1)}
        />
      )}
      <TransactionExportModal open={exportOpen} onClose={() => setExportOpen(false)} initial={query} />
    </BusinessScreen>
  )
}

function Kpi({
  icon,
  label,
  value,
  unit = 'تومان',
  isDark,
}: {
  icon: 'chart' | 'wallet' | 'percent' | 'check'
  label: string
  value: string
  unit?: string
  isDark: boolean
}) {
  const colors = {
    chart: 'text-sky-400',
    wallet: 'text-amber-400',
    percent: 'text-[#7C5CFC]',
    check: 'text-emerald-400',
  }
  return (
    <div className={`min-w-0 rounded-2xl px-2 py-2.5 text-center ${isDark ? 'bg-slate-700' : 'bg-[#F4F6FB]'}`}>
      <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center ${colors[icon]}`}>
        {icon === 'chart' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 17l6-6 4 4 8-8" />
          </svg>
        )}
        {icon === 'wallet' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h18v12H3zM3 7a2 2 0 012-2h8l2 2h4a2 2 0 012 2" />
          </svg>
        )}
        {icon === 'percent' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 5L5 19M8 7a1 1 0 110 2 1 1 0 010-2zm8 8a1 1 0 110 2 1 1 0 010-2z" />
          </svg>
        )}
        {icon === 'check' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="min-h-[32px] text-[10px] leading-4 text-gray-400">{label}</div>
      <div className="mt-1 truncate text-[13px] font-black leading-5 tabular-nums">{value}</div>
      <div className="text-[9px] text-gray-400">{unit}</div>
    </div>
  )
}

function TransactionRow({
  transaction,
  onClick,
  isDark,
}: {
  transaction: BusinessTransaction
  onClick: () => void
  isDark: boolean
}) {
  const style = statusStyle[transaction.status]
  const photo = getFullImageUrl(transaction.customer_image)
  const amount = Number(transaction.original_amount) > 0 ? transaction.original_amount : transaction.final_amount

  return (
    <button
      onClick={onClick}
      className={`flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-[22px] p-3 text-right ${isDark ? 'bg-slate-700' : 'bg-[#F8F9FD]'}`}
    >
      {photo ? (
        <img src={photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7C5CFC] text-sm font-black text-white">
          {customerInitial(transaction.customer_name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-black">{transaction.customer_name}</div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] text-gray-400">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">{formatListTime(transaction.created_at)}</span>
            </div>
          </div>
          <div className="shrink-0 text-left">
            <div className="text-[13px] font-black tabular-nums">{money(amount)}</div>
            <div className="text-[9px] text-gray-400">تومان</div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold">
            <span className="text-teal-500">{percentLabel(transaction.discount_percentage)} تخفیف</span>
            <span className="text-sky-500">{percentLabel(transaction.cashback_percentage)} کش‌بک</span>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.wrap}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
        </div>
      </div>
      <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
