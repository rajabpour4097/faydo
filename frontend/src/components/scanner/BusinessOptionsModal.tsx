import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { BusinessInfo } from '../../services/loyalty'
import { InvoicePaymentModal } from './InvoicePaymentModal'

interface BusinessOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  businessInfo: BusinessInfo
}

export const BusinessOptionsModal: React.FC<BusinessOptionsModalProps> = ({
  isOpen,
  onClose,
  businessInfo
}) => {
  const { isDark } = useTheme()
  const [showInvoicePayment, setShowInvoicePayment] = useState(false)

  if (!isOpen) return null

  const handleInvoicePayment = () => {
    setShowInvoicePayment(true)
  }

  const handleEliteGift = () => {
    // TODO: Implement elite gift usage
    alert('استفاده از هدیه الیت - قابلیت در حال توسعه')
  }

  const handleVIPServices = () => {
    // TODO: Implement VIP services usage
    alert('استفاده از خدمات VIP - قابلیت در حال توسعه')
  }

  if (showInvoicePayment) {
    return (
      <InvoicePaymentModal
        isOpen={true}
        onClose={() => {
          setShowInvoicePayment(false)
          onClose()
        }}
        businessInfo={businessInfo}
      />
    )
  }

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
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {businessInfo.business_name}
            </h2>
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
          
          {/* Customer Info */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            isDark ? 'bg-slate-700/50' : 'bg-blue-50'
          }`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  امتیاز شما:
                </span>
                <span className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {businessInfo.customer_points.toLocaleString('fa-IR')}
                </span>
              </div>
              {businessInfo.customer_vip_status !== 'none' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold">
                    {businessInfo.customer_vip_status === 'vip_plus' ? 'VIP+' : 'VIP'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Invoice Payment Option */}
          <button
            onClick={handleInvoicePayment}
            className={`w-full p-6 rounded-xl border-2 transition-all text-right ${
              isDark
                ? 'border-slate-600 hover:border-blue-500 bg-slate-700/50 hover:bg-slate-700'
                : 'border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  پرداخت فاکتور
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  پرداخت و استفاده از تخفیف
                </p>
              </div>
              <svg className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>

          {/* Elite Gift Option */}
          <button
            onClick={handleEliteGift}
            disabled={!businessInfo.can_use_elite_gift}
            className={`w-full p-6 rounded-xl border-2 transition-all text-right ${
              businessInfo.can_use_elite_gift
                ? isDark
                  ? 'border-slate-600 hover:border-green-500 bg-slate-700/50 hover:bg-slate-700'
                  : 'border-gray-200 hover:border-green-500 bg-white hover:bg-green-50'
                : 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                businessInfo.can_use_elite_gift
                  ? isDark ? 'bg-green-500/20' : 'bg-green-100'
                  : 'bg-gray-200'
              }`}>
                <svg className={`w-6 h-6 ${businessInfo.can_use_elite_gift ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${
                  businessInfo.can_use_elite_gift
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : 'text-gray-500'
                }`}>
                  استفاده از هدیه الیت
                </h3>
                <p className={`text-sm ${
                  businessInfo.can_use_elite_gift
                    ? isDark ? 'text-slate-400' : 'text-gray-600'
                    : 'text-gray-400'
                }`}>
                  {businessInfo.can_use_elite_gift
                    ? businessInfo.elite_gift_description || 'هدیه ویژه شما'
                    : businessInfo.elite_gift_used
                      ? 'هدیه قبلاً استفاده شده'
                      : 'به تارگت نرسیده‌اید'
                  }
                </p>
              </div>
              <svg className={`w-6 h-6 ${businessInfo.can_use_elite_gift ? isDark ? 'text-slate-400' : 'text-gray-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>

          {/* VIP Services Option */}
          <button
            onClick={handleVIPServices}
            disabled={!businessInfo.can_use_vip && !businessInfo.can_use_vip_plus}
            className={`w-full p-6 rounded-xl border-2 transition-all text-right ${
              businessInfo.can_use_vip || businessInfo.can_use_vip_plus
                ? isDark
                  ? 'border-slate-600 hover:border-yellow-500 bg-slate-700/50 hover:bg-slate-700'
                  : 'border-gray-200 hover:border-yellow-500 bg-white hover:bg-yellow-50'
                : 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                businessInfo.can_use_vip || businessInfo.can_use_vip_plus
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gray-200'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${
                  businessInfo.can_use_vip || businessInfo.can_use_vip_plus
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : 'text-gray-500'
                }`}>
                  استفاده از خدمات VIP
                  {businessInfo.can_use_vip_plus && <span className="text-orange-500">+</span>}
                </h3>
                <p className={`text-sm ${
                  businessInfo.can_use_vip || businessInfo.can_use_vip_plus
                    ? isDark ? 'text-slate-400' : 'text-gray-600'
                    : 'text-gray-400'
                }`}>
                  {businessInfo.can_use_vip_plus
                    ? 'دسترسی به VIP و VIP+'
                    : businessInfo.can_use_vip
                      ? 'دسترسی به VIP (3000+ امتیاز)'
                      : 'نیاز به 3000 امتیاز برای VIP'
                  }
                </p>
              </div>
              <svg className={`w-6 h-6 ${(businessInfo.can_use_vip || businessInfo.can_use_vip_plus) ? isDark ? 'text-slate-400' : 'text-gray-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  )
}
