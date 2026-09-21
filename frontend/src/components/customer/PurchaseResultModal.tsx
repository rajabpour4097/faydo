import React from 'react'
import { Transaction } from '../../services/loyalty'
import { getFullImageUrl } from '../../services/api'
import { FLOW_PURPLE, formatTomanFa, parseToman } from '../scanner/purchaseFlowUtils'

interface PurchaseResultModalProps {
  isOpen: boolean
  transaction: Transaction
  onClose: () => void
  onReview?: () => void
  onRestart?: () => void
}

export const PurchaseResultModal: React.FC<PurchaseResultModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onReview,
  onRestart,
}) => {
  if (!isOpen) return null

  const approved = transaction.status === 'approved'
  const rejected = transaction.status === 'rejected'
  const logo = getFullImageUrl(transaction.business_logo)
  const original = parseToman(transaction.original_amount)
  const discount = parseToman(transaction.discount_all_amount) + parseToman(transaction.special_discount_amount)
  const cashbackUsed = parseToman(transaction.cashback_used_amount)
  const cashbackEarned = parseToman(transaction.cashback_amount)
  const payable = parseToman(transaction.final_amount)
  const canReview = approved && transaction.can_add_comment && !transaction.has_commented

  return (
    <div className="fixed inset-0 z-[90] bg-black/50" dir="rtl">
      <div className="mx-auto flex h-full max-w-md flex-col bg-white">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-base font-black text-gray-900">
            {approved ? 'تراکنش موفق' : rejected ? 'تراکنش رد شد' : 'وضعیت تراکنش'}
          </h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500" aria-label="بستن">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${approved ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            {approved ? (
              <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h3 className="text-lg font-black text-gray-900">
            {approved ? 'خرید با موفقیت ثبت شد' : 'خرید توسط کسب‌وکار رد شد'}
          </h3>

          <div className="mt-4 flex flex-col items-center">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <p className="mt-2 text-sm font-bold text-gray-700">{transaction.business_name}</p>
          </div>

          <p className="mt-4 text-2xl font-black text-gray-900">{formatTomanFa(payable)} تومان</p>

          <div className="mt-5 rounded-3xl bg-gray-50 p-4 text-right">
            <Row label="مبلغ فاکتور" value={`${formatTomanFa(original)} تومان`} />
            {discount > 0 && <Row label="تخفیف" value={`−${formatTomanFa(discount)} تومان`} valueClass="text-rose-500" />}
            {cashbackUsed > 0 && <Row label="کش‌بک استفاده‌شده" value={`−${formatTomanFa(cashbackUsed)} تومان`} valueClass="text-rose-500" />}
            <Row label="مبلغ پرداختی" value={`${formatTomanFa(payable)} تومان`} bold />
            {approved && cashbackEarned > 0 && (
              <Row label="کش‌بک این خرید" value={`+${formatTomanFa(cashbackEarned)} تومان`} valueClass="text-teal-500" />
            )}
            {approved && transaction.points_earned > 0 && (
              <Row label="امتیاز" value={`+${formatTomanFa(transaction.points_earned)}`} valueClass="text-[#7C5CFC]" />
            )}
          </div>

          {rejected && (
            <div className="mt-4 rounded-3xl bg-rose-50 p-4 text-right">
              <p className="text-xs font-bold text-rose-500">دلیل رد کسب‌وکار</p>
              <p className="mt-1 text-sm leading-6 text-rose-700">
                {transaction.rejection_reason || 'دلیلی ثبت نشده است'}
              </p>
            </div>
          )}

          {canReview ? (
            <button
              onClick={onReview}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white"
              style={{ background: FLOW_PURPLE }}
            >
              ارسال نظر و دریافت امتیاز
            </button>
          ) : rejected ? (
            <button
              onClick={onRestart}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white"
              style={{ background: FLOW_PURPLE }}
            >
              شروع مجدد از اسکن QR
            </button>
          ) : null}

          <button onClick={onClose} className="mt-3 w-full text-sm font-medium text-gray-400">
            بازگشت به خانه
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = 'text-gray-800',
  bold = false,
}: {
  label: string
  value: string
  valueClass?: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? 'font-black' : 'font-bold'} ${valueClass}`}>{value}</span>
    </div>
  )
}
