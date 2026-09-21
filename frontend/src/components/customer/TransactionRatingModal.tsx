import React, { useState } from 'react'
import { getFullImageUrl } from '../../services/api'
import { COMMENT_POINTS, FLOW_PURPLE, RATING_POINTS, formatTomanFa } from '../scanner/purchaseFlowUtils'

interface TransactionRatingModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: number
  businessName: string
  businessLogo?: string | null
  serviceTypes: Array<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'>
  transactionDate?: string
  originalAmount?: string
  finalAmount?: string
  discountAmount?: string
  pointsEarned?: number
  specialDiscountTitle?: string
  onSubmit: (data: {
    transaction_id: number
    text: string
    score: number | null
    service_type: string
  }) => Promise<void>
}

const SERVICE_TYPE_LABELS = {
  discount_all: 'تخفیف روی همه',
  specific_discount: 'تخفیف خاص',
  elite_gift: 'هدیه الیت',
  vip_experience: 'تجربه VIP'
}

export const TransactionRatingModal: React.FC<TransactionRatingModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  businessName,
  businessLogo,
  serviceTypes,
  finalAmount,
  onSubmit
}) => {
  const [selectedService, setSelectedService] = useState<string>(serviceTypes[0] || 'discount_all')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [earned, setEarned] = useState<number | null>(null)

  if (!isOpen) return null

  const logo = getFullImageUrl(businessLogo)
  const previewPoints = (rating ? RATING_POINTS : 0) + (comment.trim() ? COMMENT_POINTS : 0)

  const handleSubmit = async () => {
    if (!comment.trim() && !rating) {
      setError('لطفاً حداقل امتیاز یا نظر خود را وارد کنید')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        transaction_id: transactionId,
        text: comment.trim(),
        score: rating,
        service_type: selectedService || 'discount_all',
      })
      setEarned(previewPoints)
    } catch (err: any) {
      setError(err.message || err.error || 'خطا در ثبت نظر')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (earned !== null) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50" dir="rtl">
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center bg-white px-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <span className="text-3xl">⭐</span>
          </div>
          <h3 className="text-lg font-black text-gray-900">نظر شما ثبت شد</h3>
          <p className="mt-2 text-sm text-gray-500">
            {earned > 0 ? `${formatTomanFa(earned)} امتیاز به حساب شما اضافه شد.` : 'از بازخورد شما سپاسگزاریم.'}
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white"
            style={{ background: FLOW_PURPLE }}
          >
            بازگشت به خانه
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50" dir="rtl">
      <div className="mx-auto flex h-full max-w-md flex-col bg-white">
        <div className="px-5 pt-5">
          <h2 className="text-center text-lg font-black text-gray-900">تجربه‌تان چطور بود؟</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <p className="mt-2 text-sm font-bold text-gray-800">{businessName}</p>
            {finalAmount && (
              <p className="text-[11px] text-gray-400">مبلغ پرداختی {formatTomanFa(finalAmount)} تومان</p>
            )}
          </div>

          {serviceTypes.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {serviceTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedService(type)}
                  className={`rounded-xl px-2 py-2 text-[11px] font-bold ${
                    selectedService === type ? 'bg-[#7C5CFC] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {SERVICE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setRating(star)} className="p-1">
                <svg
                  className={`h-9 w-9 ${rating && star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={event => setComment(event.target.value)}
            placeholder="تجربه خود را بنویسید... (اختیاری)"
            rows={4}
            maxLength={500}
            className="mt-5 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7C5CFC] focus:outline-none"
          />

          <div className="mt-4 rounded-2xl bg-[#F7F4FF] p-4 text-right text-sm">
            <p className="mb-2 font-black text-gray-800">امتیاز دریافتی طبق جدول</p>
            <div className={`flex justify-between py-1 ${rating ? 'font-bold text-[#7C5CFC]' : 'text-gray-500'}`}>
              <span>امتیازدهی به کسب‌وکار</span>
              <span>{formatTomanFa(RATING_POINTS)} امتیاز</span>
            </div>
            <div className={`flex justify-between py-1 ${comment.trim() ? 'font-bold text-[#7C5CFC]' : 'text-gray-500'}`}>
              <span>ثبت نظر متنی</span>
              <span>{formatTomanFa(COMMENT_POINTS)} امتیاز</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-violet-100 pt-2 font-black text-gray-900">
              <span>مجموع این فرم</span>
              <span>{formatTomanFa(previewPoints)} امتیاز</span>
            </div>
          </div>

          {error && <p className="mt-3 text-center text-sm text-rose-500">{error}</p>}

          <button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || (!comment.trim() && !rating)}
            className="mt-5 w-full rounded-2xl py-3.5 text-sm font-black text-white disabled:opacity-40"
            style={{ background: FLOW_PURPLE }}
          >
            {isSubmitting ? 'در حال ارسال...' : 'ثبت نظر'}
          </button>
          <button onClick={onClose} className="mt-3 w-full text-sm font-medium text-gray-400">
            بعدا انجام می‌دهم
          </button>
        </div>
      </div>
    </div>
  )
}
