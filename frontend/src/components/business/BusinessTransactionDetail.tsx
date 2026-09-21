import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BusinessTransaction } from '../../services/api'
import { loyaltyService } from '../../services/loyalty'
import { useTheme } from '../../contexts/ThemeContext'
import { faNum } from './businessHomeUtils'
import {
  TX_NAVY,
  benefitTitle,
  formatDetailDate,
  maskPhone,
  membershipInfo,
  money,
  percentLabel,
  statusStyle,
} from './businessTransactionUtils'

interface Props {
  transaction: BusinessTransaction
  onClose: () => void
  onChanged: () => void
}

function StatusStep({
  done,
  failed,
  title,
  subtitle,
}: {
  done: boolean
  failed?: boolean
  title: string
  subtitle?: string
}) {
  const tone = failed ? 'text-rose-500' : done ? 'text-emerald-500' : 'text-gray-300'
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${done && !failed ? 'bg-emerald-50' : failed ? 'bg-rose-50' : 'bg-gray-100'}`}>
        {failed ? (
          <svg className={`h-4 w-4 ${tone}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className={`h-4 w-4 ${tone}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className={`text-[11px] font-bold ${done || failed ? 'text-gray-800' : 'text-gray-400'}`}>{title}</div>
      {subtitle && <div className="mt-0.5 text-[10px] text-gray-400">{subtitle}</div>}
    </div>
  )
}

export function BusinessTransactionDetail({ transaction, onClose, onChanged }: Props) {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const card = isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
  const page = isDark ? 'bg-slate-900' : 'bg-[#F3F5FA]'
  const status = statusStyle[transaction.status]
  const membership = membershipInfo(transaction.customer_membership_level)
  const approved = transaction.status === 'approved'
  const rejected = transaction.status === 'rejected'
  const pending = transaction.status === 'pending'
  const discountPct = percentLabel(transaction.discount_percentage)
  const reference = transaction.reference_code || `FD-${transaction.id}`

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  const decide = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectReason.trim()) {
      setError('دلیل رد تراکنش الزامی است')
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (action === 'approve') await loyaltyService.approveTransaction(transaction.id)
      else await loyaltyService.rejectTransaction(transaction.id, rejectReason.trim())
      onChanged()
      onClose()
    } catch (err: any) {
      setError(err?.error || 'خطا در به‌روزرسانی تراکنش')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-[70] overflow-y-auto ${page}`} dir="rtl">
      <div className="mx-auto min-h-full w-full max-w-lg pb-8">
        <div className="px-4 pb-6 pt-4 text-white" style={{ background: `linear-gradient(180deg, ${TX_NAVY} 0%, #2A215C 100%)` }}>
          <div className="grid grid-cols-3 items-center" dir="ltr">
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10" aria-label="بازگشت">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-center text-base font-black">جزئیات تراکنش</h1>
            <div className="flex justify-end">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-9 4h10M6 21h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-3 space-y-3 px-4">
          <div className={`rounded-[28px] p-4 shadow-sm ${card}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] text-gray-400">شماره تراکنش</div>
                <button onClick={copyRef} className="mt-1 flex items-center gap-2 text-right">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-black tracking-wide">{reference}</span>
                </button>
                <div className="mt-2 text-[12px] text-gray-400">{formatDetailDate(transaction.created_at)}</div>
                {copied && <div className="mt-1 text-[11px] text-[#7C5CFC]">کپی شد</div>}
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold ${status.wrap}`}>
                {transaction.status === 'approved' && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status.label}
              </span>
            </div>
          </div>

          <div className={`rounded-[28px] p-4 shadow-sm ${card}`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black">
                اطلاعات مشتری
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-base font-black">{transaction.customer_name}</div>
                <div className="mt-1 flex items-center gap-1 text-[12px] text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.3a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.5 1.21l-1.7.85a11 11 0 005.4 5.4l.85-1.7a1 1 0 011.21-.5l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C8.82 21 3 15.18 3 8V7z" />
                  </svg>
                  {maskPhone(transaction.customer_phone)}
                </div>
                <div className="mt-2 text-[12px] text-gray-500">
                  تعداد مراجعه به این کسب‌وکار {faNum(transaction.visit_count || 0)} بار
                </div>
              </div>
              <div className="flex w-[88px] flex-col items-center">
                <img src={membership.icon} alt="" className="h-16 w-16 object-contain" />
                <div className="mt-1 text-[11px] font-bold text-amber-600">{membership.label}</div>
                <div className="text-[10px] text-gray-400">سطح عضویت</div>
              </div>
            </div>
          </div>

          <div className={`rounded-[28px] p-4 shadow-sm ${card}`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              جزئیات مبلغ
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10M4 17h7" />
              </svg>
            </div>
            <Row label="مبلغ فاکتور" value={`${money(transaction.original_amount)} تومان`} />
            <Row label={`تخفیف فایدو (${discountPct})`} value={`−${money(transaction.discount_all_amount)} تومان`} valueClass="text-rose-500" />
            {transaction.has_special_discount && (
              <Row
                label={transaction.special_discount_title || 'تخفیف اختصاصی'}
                value={`−${money(transaction.special_discount_amount)} تومان`}
                valueClass="text-rose-500"
              />
            )}
            {Number(transaction.cashback_amount) > 0 && (
              <Row label="کش‌بک این خرید" value={`${money(transaction.cashback_amount)} تومان`} valueClass="text-teal-500" />
            )}
            {Number(transaction.cashback_used_amount) > 0 && (
              <Row label="کش‌بک استفاده‌شده" value={`−${money(transaction.cashback_used_amount)} تومان`} valueClass="text-rose-500" />
            )}
            <Row label="مبلغ پرداختی" value={`${money(transaction.final_amount)} تومان`} bold />
            <Row
              label="امتیاز کسب‌شده"
              value={`+${faNum(transaction.points_earned)} امتیاز`}
              valueClass="text-[#7C5CFC]"
              icon
            />
          </div>

          <div className={`rounded-[28px] p-4 shadow-sm ${card}`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              مزیت استفاده‌شده
              <svg className="h-4 w-4 text-[#7C5CFC]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.8 5.7 20.8 8 13.6 2 9.2h7.6z" />
              </svg>
            </div>
            <div className="rounded-2xl bg-[#F3EEFF] px-3 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#7C5CFC]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <img src={membership.icon} alt="" className="h-6 w-6 object-contain" />
                </span>
                {benefitTitle(transaction)}
              </div>
              {transaction.service_category && (
                <div className="mt-1 pr-10 text-[12px] text-gray-400">سرویس: {transaction.service_category}</div>
              )}
            </div>
          </div>

          <div className={`rounded-[28px] p-4 shadow-sm ${card}`}>
            <div className="mb-4 flex items-center gap-2 text-sm font-black">
              وضعیت تراکنش
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex items-start justify-between gap-2">
              <StatusStep done title="پرداخت ثبت شده" />
              <StatusStep done={approved} failed={rejected} title="تایید کسب‌وکار" subtitle={pending ? 'در انتظار' : rejected ? 'رد شده' : 'تایید شده'} />
              <StatusStep
                done={approved}
                failed={rejected}
                title="زمان و تاریخ تایید"
                subtitle={approved ? formatDetailDate(transaction.approved_at || transaction.modified_at) : rejected ? formatDetailDate(transaction.modified_at) : '—'}
              />
            </div>
          </div>

          {transaction.note && (
            <div className={`rounded-[28px] p-4 text-[12px] text-gray-500 shadow-sm ${card}`}>
              <span className="font-bold">یادداشت: </span>{transaction.note}
            </div>
          )}

          {rejected && transaction.rejection_reason && (
            <div className={`rounded-[28px] p-4 text-[12px] text-rose-600 shadow-sm ${card}`}>
              <span className="font-bold">دلیل رد: </span>{transaction.rejection_reason}
            </div>
          )}

          {error && <p className="text-center text-sm text-rose-500">{error}</p>}

          {pending ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button disabled={busy} onClick={() => decide('approve')} className="rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white disabled:opacity-50">
                تایید تراکنش
              </button>
              <button disabled={busy} onClick={() => { setRejectOpen(true); setError(null) }} className="rounded-2xl bg-rose-50 py-3 text-sm font-black text-rose-500 disabled:opacity-50">
                رد تراکنش
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => navigate(`/dashboard/customers?customer_id=${transaction.customer}`)}
                className="rounded-2xl bg-[#7C5CFC] py-3 text-sm font-black text-white"
              >
                مشاهده جزئیات مشتری
              </button>
              <button
                onClick={() => setReportOpen(true)}
                className={`rounded-2xl border py-3 text-sm font-black ${isDark ? 'border-slate-600' : 'border-gray-200'} text-gray-600`}
              >
                گزارش مشکل
              </button>
            </div>
          )}
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/40 sm:items-center sm:p-4" onClick={() => !busy && setRejectOpen(false)}>
          <div className={`w-full rounded-t-3xl p-5 sm:mx-auto sm:max-w-md sm:rounded-3xl ${card}`} onClick={event => event.stopPropagation()}>
            <h3 className="mb-2 text-base font-black">رد تراکنش</h3>
            <p className="mb-3 text-[13px] leading-6 text-gray-500">
              دلیل رد برای مشتری ارسال می‌شود و در بررسی مدیر باقی می‌ماند.
            </p>
            <textarea
              value={rejectReason}
              onChange={event => setRejectReason(event.target.value)}
              rows={4}
              placeholder="مثلاً مبلغ فاکتور با فروش مغایرت دارد"
              className={`w-full resize-none rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-900' : 'border-gray-200'}`}
            />
            {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button disabled={busy} onClick={() => decide('reject')} className="rounded-2xl bg-rose-500 py-3 text-sm font-black text-white disabled:opacity-50">
                {busy ? 'در حال ارسال...' : 'ثبت رد'}
              </button>
              <button disabled={busy} onClick={() => setRejectOpen(false)} className="rounded-2xl bg-gray-100 py-3 text-sm font-black text-gray-600">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
      {reportOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/40 sm:items-center sm:p-4" onClick={() => setReportOpen(false)}>
          <div className={`w-full rounded-t-3xl p-5 sm:mx-auto sm:max-w-md sm:rounded-3xl ${card}`} onClick={event => event.stopPropagation()}>
            <h3 className="mb-2 text-base font-black">گزارش مشکل</h3>
            <p className="text-[13px] leading-6 text-gray-500">
              برای پیگیری، شماره تراکنش <span className="font-bold text-gray-800">{reference}</span> را برای پشتیبانی فایدو ارسال کنید.
            </p>
            <button onClick={copyRef} className="mt-4 w-full rounded-2xl bg-[#7C5CFC] py-3 text-sm font-black text-white">
              {copied ? 'کپی شد' : 'کپی شماره تراکنش'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = '',
  bold = false,
  icon = false,
}: {
  label: string
  value: string
  valueClass?: string
  bold?: boolean
  icon?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? 'font-black' : 'font-bold'} ${valueClass}`}>
        {icon ? <span className="inline-flex items-center gap-1">{value}</span> : value}
      </span>
    </div>
  )
}
