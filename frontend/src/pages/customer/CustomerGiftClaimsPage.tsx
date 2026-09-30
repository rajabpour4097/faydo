import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Clock, Gift, X, XCircle } from 'lucide-react'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, EliteGiftClaim } from '../../services/api'
import { formatShamsiDate, formatShamsiDateTime } from '../../utils/shamsiDate'

const statusInfo = {
  pending: { label: 'در انتظار تایید', className: 'bg-amber-50 text-amber-600', icon: Clock },
  approved: { label: 'تایید شده', className: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
  rejected: { label: 'رد شده', className: 'bg-rose-50 text-rose-600', icon: XCircle },
  used: { label: 'استفاده شده', className: 'bg-blue-50 text-blue-600', icon: CheckCircle },
  expired: { label: 'منقضی شده', className: 'bg-gray-100 text-gray-600', icon: Clock },
}

export const CustomerGiftClaimsPage = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [params] = useSearchParams()
  const [claims, setClaims] = useState<EliteGiftClaim[]>([])
  const [loading, setLoading] = useState(true)
  const targetId = Number(params.get('claim') || 0)

  useEffect(() => {
    apiService.getEliteGiftClaims()
      .then(response => {
        const data = (response.data as any)?.results || response.data || []
        setClaims(Array.isArray(data) ? data : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const selected = useMemo(
    () => claims.find(claim => claim.id === targetId) || null,
    [claims, targetId],
  )

  if (user?.type !== 'customer') return <Navigate to="/dashboard" replace />

  return (
    <MobileDashboardLayout>
      <main className={`min-h-[calc(100dvh-8rem)] px-4 py-5 ${isDark ? 'text-white' : 'text-[#0D1B3E]'}`}>
        <h1 className="flex items-center gap-2 text-xl font-black">
          <Gift className="h-6 w-6 text-violet-500" />
          درخواست‌های هدیه ویژه
        </h1>
        <p className="mt-1 text-xs text-gray-500">وضعیت درخواست‌های هدیه شما</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>
        ) : claims.length === 0 ? (
          <div className={`mt-5 rounded-2xl border py-16 text-center ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
            <Gift className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="font-bold">درخواستی ثبت نشده است</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {claims.map(claim => {
              const info = statusInfo[claim.status]
              const Icon = info.icon
              return (
                <article key={claim.id} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-black">{claim.gift_name}</h2>
                      <p className="mt-1 text-xs text-gray-500">{claim.business_name}</p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${info.className}`}>
                      <Icon className="h-3.5 w-3.5" /> {info.label}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-gray-400">{formatShamsiDateTime(claim.created_at)}</p>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/50" dir="rtl">
          <section className={`w-full rounded-t-[28px] p-5 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">جزئیات درخواست هدیه</h2>
              <button onClick={() => history.back()} className="rounded-full bg-gray-100 p-2 text-gray-500" aria-label="بستن">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-gray-500">هدیه:</span> <b>{selected.gift_name}</b></p>
              <p><span className="text-gray-500">کسب‌وکار:</span> <b>{selected.business_name}</b></p>
              <p><span className="text-gray-500">وضعیت:</span> <b>{selected.status_display}</b></p>
              {selected.scheduled_for && <p><span className="text-gray-500">تاریخ تحویل:</span> {formatShamsiDate(selected.scheduled_for)}</p>}
              {selected.expires_at && <p><span className="text-gray-500">مهلت دریافت:</span> {formatShamsiDate(selected.expires_at)}</p>}
              {selected.business_note && <p className="rounded-xl bg-gray-50 p-3 text-gray-700">{selected.business_note}</p>}
            </div>
          </section>
        </div>
      )}
    </MobileDashboardLayout>
  )
}
