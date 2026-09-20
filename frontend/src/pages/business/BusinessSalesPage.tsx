import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BusinessScreen } from '../../components/business/BusinessScreen'
import { apiService, BusinessDashboardData } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { HOME_PURPLE, faNum, faSignedPct, formatCompact, formatToman } from '../../components/business/businessHomeUtils'

export const BusinessSalesPage = () => {
  const { isDark } = useTheme()
  const [data, setData] = useState<BusinessDashboardData | null>(null)

  useEffect(() => {
    apiService.getBusinessDashboard().then(response => {
      if (response.data) setData(response.data)
    })
  }, [])

  const page = isDark ? 'bg-slate-900 text-white' : 'bg-[#F4F6FB] text-gray-900'
  const card = isDark ? 'bg-slate-800' : 'bg-white'
  const series = data?.sales_series || []
  const activeDays = series.filter(item => item.amount > 0)
  const best = activeDays.reduce((acc, item) => (item.amount > acc.amount ? item : acc), { day: 0, amount: 0, label: '0' })

  return (
    <BusinessScreen>
      <div className={`min-h-full px-4 py-4 ${page}`} dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-black">عملکرد فروش</h1>
          <Link to="/dashboard" className="text-sm text-[#7C5CFC]">بازگشت</Link>
        </div>
        {!data ? (
          <div className={`h-48 animate-pulse rounded-3xl ${card}`} />
        ) : (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className={`rounded-[24px] p-4 ${card}`}>
                <div className="text-[11px] text-gray-400">فروش این ماه</div>
                <div className="mt-1 text-xl font-black text-[#7C5CFC]">{formatToman(data.kpis.sales_this_month)}</div>
                <div className={`mt-1 text-[12px] font-bold ${data.kpis.sales_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {faSignedPct(data.kpis.sales_change)} نسبت به ماه قبل
                </div>
              </div>
              <div className={`rounded-[24px] p-4 ${card}`}>
                <div className="text-[11px] text-gray-400">تعداد تراکنش</div>
                <div className="mt-1 text-xl font-black">{faNum(data.kpis.transactions_this_month)}</div>
                <div className="mt-1 text-[12px] text-gray-400">
                  بهترین روز: {best.day ? `${faNum(best.day)} · ${formatToman(best.amount)}` : '—'}
                </div>
              </div>
            </div>
            <div className={`rounded-[28px] p-4 ${card}`}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="salesFillPage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={HOME_PURPLE} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={HOME_PURPLE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis orientation="right" tickFormatter={value => formatCompact(Number(value))} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={32} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatToman(Number(value))} labelFormatter={label => `روز ${faNum(Number(label))}`} />
                    <Area type="monotone" dataKey="amount" stroke={HOME_PURPLE} strokeWidth={2.4} fill="url(#salesFillPage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={`mt-3 overflow-hidden rounded-[28px] ${card}`}>
              <div className="border-b border-gray-100 px-4 py-3 text-sm font-black">فروش روزانه این ماه</div>
              {series.filter(item => item.amount > 0).length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">هنوز فروش تاییدشده‌ای در این ماه نیست.</p>
              ) : (
                series.filter(item => item.amount > 0).map(item => (
                  <div key={item.day} className="flex items-center justify-between border-b border-gray-50 px-4 py-3 text-sm last:border-0">
                    <span>روز {faNum(item.day)}</span>
                    <span className="font-bold">{formatToman(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
            <Link to="/dashboard/transactions" className="mt-4 block rounded-2xl bg-[#7C5CFC] py-3 text-center text-sm font-bold text-white">
              مشاهده تراکنش‌ها
            </Link>
          </>
        )}
      </div>
    </BusinessScreen>
  )
}
