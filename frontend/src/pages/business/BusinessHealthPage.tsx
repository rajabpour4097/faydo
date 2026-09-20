import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BusinessScreen } from '../../components/business/BusinessScreen'
import { apiService, BusinessDashboardData } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { faNum, faSignedPct, todayLabel } from '../../components/business/businessHomeUtils'

export const BusinessHealthPage = () => {
  const { isDark } = useTheme()
  const [data, setData] = useState<BusinessDashboardData | null>(null)

  useEffect(() => {
    apiService.getBusinessDashboard().then(response => {
      if (response.data) setData(response.data)
    })
  }, [])

  const page = isDark ? 'bg-slate-900 text-white' : 'bg-[#F4F6FB] text-gray-900'
  const card = isDark ? 'bg-slate-800' : 'bg-white'
  const health = data?.health

  return (
    <BusinessScreen>
      <div className={`min-h-full px-4 py-4 ${page}`} dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-black">جزئیات سلامت کسب‌وکار</h1>
          <Link to="/dashboard" className="text-sm text-[#7C5CFC]">بازگشت</Link>
        </div>
        <p className="mb-4 text-[11px] text-gray-400">{todayLabel()}</p>

        {!health ? (
          <div className={`h-40 animate-pulse rounded-3xl ${card}`} />
        ) : (
          <>
            <div className={`mb-4 rounded-[28px] p-5 text-center ${card}`}>
              <div className="text-5xl font-black text-[#7C5CFC]">{faNum(health.score)}</div>
              <div className="mt-1 text-sm text-gray-400">از ۱۰۰</div>
              <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-500">
                {health.label}
              </div>
              <p className="mt-3 text-[12px] leading-6 text-gray-500">
                این امتیاز از ترکیب سابقه فعالیت، تعامل با فایدو، بازگشت مشتری و عملکرد فروش محاسبه می‌شود.
              </p>
            </div>
            <div className="space-y-3">
              {health.metrics.map(metric => (
                <div key={metric.key} className={`rounded-[24px] p-4 ${card}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-black">{metric.title}</h2>
                    <span className={`text-sm font-bold ${metric.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {faSignedPct(metric.change)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[#7C5CFC]" style={{ width: `${metric.score}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500">
                    <span>امتیاز {faNum(metric.score)} از ۱۰۰</span>
                  </div>
                  <p className="mt-2 text-[12px] leading-6 text-gray-500">{metric.detail}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </BusinessScreen>
  )
}
