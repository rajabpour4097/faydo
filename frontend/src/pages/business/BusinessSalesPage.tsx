import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BusinessScreen } from '../../components/business/BusinessScreen'
import { apiService, BusinessDashboardData } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { HOME_PURPLE, faNum, faSignedPct, formatCompact, formatToman } from '../../components/business/businessHomeUtils'
import { formatShamsiFromGregorianMonthDay, toFaDigits } from '../../utils/shamsiDate'

function chartTicks(days: number[]) {
  if (days.length <= 5) return days
  const last = days.length - 1
  const indexes = [0, Math.round(last / 4), Math.round(last / 2), Math.round((3 * last) / 4), last]
  return [...new Set(indexes)].map(index => days[index])
}

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
  const peak = Math.max(...series.map(item => item.amount), 0)
  const yMax = peak <= 0 ? 4 : peak
  const xTicks = chartTicks(series.map(item => item.day))

  return (
    <BusinessScreen>
      <div className={`min-h-full px-4 py-4 font-sans ${page}`} dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-black">عملکرد فروش</h1>
          <Link to="/dashboard" className="text-sm text-[#7C5CFC]">بازگشت</Link>
        </div>
        {!data ? (
          <div className={`h-48 animate-pulse rounded-3xl ${card}`} />
        ) : (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className={`min-w-0 rounded-[24px] p-3 ${card}`}>
                <div className="text-[12px] text-gray-400">فروش این ماه</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-1 text-[#7C5CFC]">
                  <span className="text-[17px] font-black leading-6">{faNum(Math.round(data.kpis.sales_this_month))}</span>
                  <span className="text-[10px] font-bold">تومان</span>
                </div>
                <div className={`mt-1 text-[11px] font-bold leading-5 ${data.kpis.sales_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {faSignedPct(data.kpis.sales_change)} نسبت به ماه قبل
                </div>
              </div>
              <div className={`min-w-0 rounded-[24px] p-3 ${card}`}>
                <div className="text-[12px] text-gray-400">تعداد تراکنش‌ها</div>
                <div className="mt-1 text-[18px] font-black leading-6">{faNum(data.kpis.transactions_this_month)}</div>
                <div className="mt-1 text-[10px] leading-5 text-gray-400">
                  بهترین روز: {best.day ? `${formatShamsiFromGregorianMonthDay(best.day)} · ${formatToman(best.amount)}` : '—'}
                </div>
              </div>
            </div>
            <div className={`rounded-[28px] p-3 ${card}`}>
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <h2 className="text-[14px] font-black">نمودار فروش روزانه</h2>
                <span className="text-[10px] text-gray-400">ماه جاری · تومان</span>
              </div>
              <div className="h-60 font-sans" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 4, left: 4, bottom: 2 }}>
                    <defs>
                      <linearGradient id="salesFillPage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={HOME_PURPLE} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={HOME_PURPLE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={isDark ? '#334155' : '#EEF0F5'} strokeDasharray="3 3" />
                    <YAxis
                      orientation="left"
                      tickFormatter={value => formatCompact(Number(value))}
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'IRANYekan' }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      domain={[0, yMax]}
                      allowDecimals={false}
                      tickCount={4}
                    />
                    <XAxis
                      dataKey="day"
                      ticks={xTicks}
                      interval={0}
                      tickFormatter={value => toFaDigits(formatShamsiFromGregorianMonthDay(Number(value)))}
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'IRANYekan' }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      height={32}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatToman(Number(value)), 'فروش']}
                      labelFormatter={label => `تاریخ: ${formatShamsiFromGregorianMonthDay(Number(label))}`}
                      contentStyle={{
                        direction: 'rtl',
                        fontFamily: 'IRANYekan',
                        fontSize: 11,
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                      }}
                      labelStyle={{ color: '#6B7280', marginBottom: 4 }}
                      itemStyle={{ color: HOME_PURPLE, fontWeight: 700 }}
                    />
                    <Area name="فروش" type="monotone" dataKey="amount" stroke={HOME_PURPLE} strokeWidth={2.4} fill="url(#salesFillPage)" dot={false} activeDot={{ r: 4, fill: HOME_PURPLE }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={`mt-3 overflow-hidden rounded-[28px] ${card}`}>
              <div className="border-b border-gray-100 px-4 py-3 text-[14px] font-black">فروش روزانه این ماه</div>
              {series.filter(item => item.amount > 0).length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">هنوز فروش تاییدشده‌ای در این ماه نیست.</p>
              ) : (
                series.filter(item => item.amount > 0).map(item => (
                  <div key={item.day} className="flex items-center justify-between gap-3 border-b border-gray-50 px-4 py-3 text-[12px] last:border-0">
                    <span>{formatShamsiFromGregorianMonthDay(item.day)}</span>
                    <span className="shrink-0 font-bold">{formatToman(item.amount)}</span>
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
