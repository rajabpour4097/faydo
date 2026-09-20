import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BusinessScreen } from '../../components/business/BusinessScreen'
import { apiService, BusinessCustomerRow, BusinessTransaction } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { faNum, formatToman } from '../../components/business/businessHomeUtils'

const SEGMENTS = [
  { id: 'all', label: 'همه' },
  { id: 'new', label: 'جدید' },
  { id: 'returning', label: 'بازگشتی' },
  { id: 'vip', label: 'VIP' },
  { id: 'churn', label: 'ریزش' },
]

export const BusinessCustomersPage = () => {
  const { isDark } = useTheme()
  const [params, setParams] = useSearchParams()
  const segment = params.get('segment') || 'all'
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<BusinessCustomerRow[]>([])
  const [counts, setCounts] = useState({ all: 0, new: 0, returning: 0, vip: 0, churn: 0 })
  const [selected, setSelected] = useState<BusinessCustomerRow | null>(null)
  const [history, setHistory] = useState<BusinessTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiService.getBusinessCustomers({ segment, search }).then(response => {
      if (response.data) {
        setRows(response.data.results)
        setCounts(response.data.counts)
      }
    }).finally(() => setLoading(false))
  }, [segment, search])

  const openCustomer = async (row: BusinessCustomerRow) => {
    setSelected(row)
    const response = await apiService.getBusinessCustomers({ customer_id: row.customer_id })
    setHistory(response.data?.transactions || [])
  }

  const closeCustomer = () => {
    setSelected(null)
    const next = new URLSearchParams(params)
    next.delete('customer_id')
    setParams(next, { replace: true })
  }

  useEffect(() => {
    const customerId = Number(params.get('customer_id') || 0)
    if (!customerId || selected || rows.length === 0) return
    const row = rows.find(item => item.customer_id === customerId)
    if (row) openCustomer(row)
  }, [params, rows, selected])

  const page = isDark ? 'bg-slate-900 text-white' : 'bg-[#F4F6FB] text-gray-900'
  const card = isDark ? 'bg-slate-800' : 'bg-white'

  const countFor = (id: string) => (counts as Record<string, number>)[id] ?? counts.all

  const subtitle = useMemo(() => {
    if (segment === 'new') return 'اولین خریدشان در این ماه بوده است'
    if (segment === 'returning') return 'این ماه دوباره خرید کرده‌اند'
    if (segment === 'vip') return 'وضعیت VIP یا VIP+'
    if (segment === 'churn') return 'بیش از ۳۰ روز از آخرین خریدشان گذشته'
    return 'همه مشتریان ثبت‌شده در کسب‌وکار شما'
  }, [segment])

  return (
    <BusinessScreen>
      <div className={`min-h-full px-4 py-4 ${page}`} dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-black">مشتریان</h1>
          <Link to="/dashboard" className="text-sm text-[#7C5CFC]">بازگشت</Link>
        </div>
        <p className="mb-3 text-[12px] text-gray-400">{subtitle}</p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو با نام یا شماره موبایل"
          className={`mb-3 w-full rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-100 bg-white'}`}
        />
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {SEGMENTS.map(item => (
            <button
              key={item.id}
              onClick={() => setParams(item.id === 'all' ? {} : { segment: item.id })}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-bold ${
                segment === item.id ? 'bg-[#7C5CFC] text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
              }`}
            >
              {item.label} ({faNum(countFor(item.id))})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className={`h-16 animate-pulse rounded-2xl ${card}`} />)}</div>
        ) : rows.length === 0 ? (
          <div className={`rounded-3xl p-8 text-center text-sm text-gray-400 ${card}`}>مشتری در این دسته نیست.</div>
        ) : (
          <div className="space-y-2">
            {rows.map(row => (
              <button
                key={row.id}
                onClick={() => openCustomer(row)}
                className={`flex w-full items-center gap-3 rounded-[22px] p-3 text-right ${card}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7C5CFC] text-sm font-black text-white">
                  {(row.name || 'م').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold">{row.name}</span>
                    {row.vip_status !== 'none' && (
                      <span className="rounded-full bg-[#F3EEFF] px-2 py-0.5 text-[10px] font-bold text-[#7C5CFC]">
                        {row.vip_status === 'vip_plus' ? 'VIP+' : 'VIP'}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-gray-400">
                    {faNum(row.points)} امتیاز · {faNum(row.transaction_count)} خرید · {formatToman(row.total_spent)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:p-4" onClick={closeCustomer}>
            <div className={`max-h-[80vh] w-full overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl ${card}`} dir="rtl" onClick={e => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-black">{selected.name}</h2>
                <button onClick={closeCustomer} className="text-gray-400">بستن</button>
              </div>
              <p className="text-[12px] text-gray-400">{selected.phone}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-[#F3EEFF] p-3">
                  <div className="text-lg font-black text-[#7C5CFC]">{faNum(selected.points)}</div>
                  <div className="text-[10px] text-gray-500">امتیاز</div>
                </div>
                <div className="rounded-2xl bg-[#E8FBF4] p-3">
                  <div className="text-lg font-black text-emerald-500">{faNum(selected.transaction_count)}</div>
                  <div className="text-[10px] text-gray-500">خرید</div>
                </div>
                <div className="rounded-2xl bg-[#FFF4E8] p-3">
                  <div className="text-sm font-black text-orange-500">{formatToman(selected.total_spent)}</div>
                  <div className="text-[10px] text-gray-500">مجموع</div>
                </div>
              </div>
              <h3 className="mt-4 mb-2 text-sm font-black">آخرین تراکنش‌ها</h3>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">تراکنشی نیست.</p>
              ) : (
                <div className="space-y-2">
                  {history.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-[#F4F6FB] px-3 py-2 text-[12px]">
                      <span>{formatToman(Number(tx.final_amount))}</span>
                      <span className="text-gray-400">{new Date(tx.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BusinessScreen>
  )
}
