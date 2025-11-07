import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { BusinessInfo, loyaltyService, TransactionCreate } from '../../services/loyalty'

interface InvoicePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  businessInfo: BusinessInfo
}

// تابع برای فرمت کردن اعداد با کاما
const formatNumber = (num: number | string): string => {
  const numStr = num.toString().replace(/,/g, '')
  return parseInt(numStr).toLocaleString('fa-IR')
}

// تابع برای پاک کردن فرمت و تبدیل به عدد
const parseNumber = (str: string): number => {
  return parseInt(str.replace(/,/g, '')) || 0
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({
  isOpen,
  onClose,
  businessInfo
}) => {
  const { isDark } = useTheme()
  
  // States
  const [mainAmount, setMainAmount] = useState('')
  const [mainAmountAfterDiscount, setMainAmountAfterDiscount] = useState(0)
  
  const [hasSpecialDiscount, setHasSpecialDiscount] = useState(false)
  const [specialAmount, setSpecialAmount] = useState('')
  const [specialAmountAfterDiscount, setSpecialAmountAfterDiscount] = useState(0)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // محاسبه مبلغ بعد از تخفیف اصلی
  useEffect(() => {
    const amount = parseNumber(mainAmount)
    if (amount > 0 && businessInfo.discount_all_percentage) {
      const discount = (amount * Number(businessInfo.discount_all_percentage)) / 100
      setMainAmountAfterDiscount(amount - discount)
    } else {
      setMainAmountAfterDiscount(amount)
    }
  }, [mainAmount, businessInfo.discount_all_percentage])

  // محاسبه مبلغ بعد از تخفیف خاص
  useEffect(() => {
    const amount = parseNumber(specialAmount)
    if (amount > 0 && businessInfo.specific_discount_percentage) {
      const discount = (amount * Number(businessInfo.specific_discount_percentage)) / 100
      setSpecialAmountAfterDiscount(amount - discount)
    } else {
      setSpecialAmountAfterDiscount(amount)
    }
  }, [specialAmount, businessInfo.specific_discount_percentage])

  // محاسبه جمع کل
  const totalBeforeDiscount = parseNumber(mainAmount) + (hasSpecialDiscount ? parseNumber(specialAmount) : 0)
  const totalAfterDiscount = mainAmountAfterDiscount + (hasSpecialDiscount ? specialAmountAfterDiscount : 0)

  const handleMainAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    if (/^\d*$/.test(value)) {
      setMainAmount(value ? formatNumber(value) : '')
    }
  }

  const handleSpecialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    if (/^\d*$/.test(value)) {
      setSpecialAmount(value ? formatNumber(value) : '')
    }
  }

  const handleSubmit = async () => {
    if (parseNumber(mainAmount) <= 0) {
      setErrorMessage('لطفاً مبلغ فاکتور را وارد کنید')
      return
    }

    if (hasSpecialDiscount && parseNumber(specialAmount) <= 0) {
      setErrorMessage('لطفاً مبلغ تخفیف خاص را وارد کنید')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSubmitStatus('idle')

    try {
      const transactionData: TransactionCreate = {
        business: businessInfo.business_id,
        original_amount: parseNumber(mainAmount),
        has_special_discount: hasSpecialDiscount,
        special_discount_title: hasSpecialDiscount ? businessInfo.specific_discount_title || undefined : undefined,
        special_discount_original_amount: hasSpecialDiscount ? parseNumber(specialAmount) : undefined
      }

      await loyaltyService.createTransaction(transactionData)
      setSubmitStatus('pending')
      
      // نمایش پیام موفقیت
      setTimeout(() => {
        setSubmitStatus('success')
      }, 1000)
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      setErrorMessage(error.response?.data?.error || 'خطا در ارسال تراکنش')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // نمایش حالت در انتظار تایید
  if (submitStatus === 'pending' || submitStatus === 'success') {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className={`relative w-full max-w-md mx-4 rounded-2xl overflow-hidden ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{ direction: 'rtl' }}
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              در انتظار تایید
            </h3>
            <p className={`text-lg mb-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              تراکنش شما با موفقیت ثبت شد و در انتظار تایید کسب‌وکار می‌باشد
            </p>
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>مبلغ نهایی:</span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(totalAfterDiscount)} تومان
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-md mx-4 my-8 rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              پرداخت فاکتور
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700 text-slate-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* تخفیف اصلی */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                تخفیف اصلی:
              </span>
              <span className="text-lg font-bold text-blue-500">
                {businessInfo.discount_all_percentage}%
              </span>
            </div>
          </div>

          {/* مبلغ فاکتور */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              مبلغ فاکتور (تومان)
            </label>
            <input
              type="text"
              value={mainAmount}
              onChange={handleMainAmountChange}
              placeholder="0"
              className={`w-full px-4 py-3 rounded-xl text-lg font-bold text-left border-2 transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none`}
            />
            {parseNumber(mainAmount) > 0 && (
              <div className={`mt-2 text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                مبلغ پس از تخفیف: {formatNumber(mainAmountAfterDiscount)} تومان
              </div>
            )}
          </div>

          {/* تخفیف خاص */}
          {businessInfo.has_specific_discount && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  تخفیف خاص: {businessInfo.specific_discount_title}
                </label>
                <button
                  onClick={() => setHasSpecialDiscount(!hasSpecialDiscount)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasSpecialDiscount
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {hasSpecialDiscount ? 'فعال' : 'غیرفعال'}
                </button>
              </div>

              {hasSpecialDiscount && (
                <>
                  <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        درصد تخفیف خاص:
                      </span>
                      <span className="text-lg font-bold text-green-500">
                        {businessInfo.specific_discount_percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={specialAmount}
                    onChange={handleSpecialAmountChange}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl text-lg font-bold text-left border-2 transition-colors ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-green-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    } focus:outline-none`}
                  />
                  {parseNumber(specialAmount) > 0 && (
                    <div className={`mt-2 text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      مبلغ پس از تخفیف: {formatNumber(specialAmountAfterDiscount)} تومان
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* جمع کل */}
          {parseNumber(mainAmount) > 0 && (
            <div className={`p-4 rounded-xl border-2 ${
              isDark ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    جمع بدون تخفیف:
                  </span>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {formatNumber(totalBeforeDiscount)} تومان
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    جمع با تخفیف:
                  </span>
                  <span className="text-xl font-bold text-green-500">
                    {formatNumber(totalAfterDiscount)} تومان
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                    مقدار تخفیف:
                  </span>
                  <span className="text-red-500 font-medium">
                    {formatNumber(totalBeforeDiscount - totalAfterDiscount)} تومان
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || parseNumber(mainAmount) <= 0}
            className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-colors ${
              isSubmitting || parseNumber(mainAmount) <= 0
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'در حال ارسال...' : 'ارسال برای تایید'}
          </button>
        </div>
      </div>
    </div>
  )
}
