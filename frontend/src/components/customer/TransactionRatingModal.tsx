import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface TransactionRatingModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: number
  businessName: string
  serviceTypes: Array<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'>
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

const SERVICE_TYPE_COLORS = {
  discount_all: 'bg-blue-500',
  specific_discount: 'bg-purple-500',
  elite_gift: 'bg-yellow-500',
  vip_experience: 'bg-green-500'
}

export const TransactionRatingModal: React.FC<TransactionRatingModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  businessName,
  serviceTypes,
  onSubmit
}) => {
  const { isDark } = useTheme()
  const [selectedService, setSelectedService] = useState<string>(serviceTypes[0] || '')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    // اعتبارسنجی
    if (!comment && !rating) {
      setError('لطفاً حداقل نظر یا امتیاز خود را وارد کنید')
      return
    }

    if (!selectedService) {
      setError('لطفاً نوع خدمت را انتخاب کنید')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        transaction_id: transactionId,
        text: comment,
        score: rating,
        service_type: selectedService
      })
      
      // ریست فرم
      setComment('')
      setRating(null)
      setSelectedService(serviceTypes[0] || '')
      onClose()
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت نظر')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                نظر و امتیاز شما
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {businessName}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700 text-slate-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* اطلاعیه */}
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-500">
              <svg className="w-4 h-4 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              شما ۱۲ ساعت فرصت دارید برای این تراکنش نظر بگذارید
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* انتخاب نوع خدمت */}
          {serviceTypes.length > 1 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                نظر شما برای کدام خدمت است؟
              </label>
              <div className="grid grid-cols-2 gap-2">
                {serviceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedService(type)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedService === type
                        ? `${SERVICE_TYPE_COLORS[type]} text-white border-transparent`
                        : isDark
                          ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm font-medium">{SERVICE_TYPE_LABELS[type]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* امتیازدهی */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              امتیاز شما (اختیاری)
            </label>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <svg 
                    className={`w-10 h-10 ${
                      rating && star <= rating 
                        ? 'text-yellow-400' 
                        : isDark ? 'text-slate-600' : 'text-gray-300'
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-center mt-2 text-sm text-yellow-500 font-medium">
                {rating} از 5 ستاره
              </p>
            )}
          </div>

          {/* نظر */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              نظر شما (اختیاری)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="تجربه خود را با ما به اشتراک بگذارید..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              {comment.length} / 500 کاراکتر
            </p>
          </div>

          {/* خطا */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!comment && !rating)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting || (!comment && !rating)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ارسال...
                </span>
              ) : (
                'ثبت نظر'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
