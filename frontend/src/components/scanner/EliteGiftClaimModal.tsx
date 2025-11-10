import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { BusinessInfo } from '../../services/loyalty'
import { apiService } from '../../services/api'

interface EliteGiftClaimModalProps {
  isOpen: boolean
  onClose: () => void
  businessInfo: BusinessInfo
}

export const EliteGiftClaimModal: React.FC<EliteGiftClaimModalProps> = ({
  isOpen,
  onClose,
  businessInfo
}) => {
  const { isDark } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmitClaim = async () => {
    if (!businessInfo.package_id) {
      setError('پکیج فعال یافت نشد')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // ارسال درخواست به API
      const response = await apiService.createEliteGiftClaim(businessInfo.package_id)
      
      if (response.error) {
        // اگر خطا یک object است (مثل validation error)
        const errorObj = response.error as any
        if (typeof errorObj === 'object' && errorObj.detail) {
          setError(errorObj.detail + (errorObj.message ? '\n' + errorObj.message : ''))
        } else {
          setError(String(response.error))
        }
        return
      }
      
      // نمایش پیغام موفقیت
      alert('درخواست شما با موفقیت ثبت شد و در انتظار تایید کسب‌وکار است')
      
      // بستن modal
      onClose()
    } catch (err: any) {
      // بررسی اگر خطا از validation error است
      const errorData = err.response?.data
      if (errorData && typeof errorData === 'object') {
        if (errorData.detail) {
          setError(errorData.detail + (errorData.message ? '\n' + errorData.message : ''))
        } else if (errorData.message) {
          setError(errorData.message)
        } else {
          setError('خطا در ثبت درخواست')
        }
      } else {
        setError(err.response?.data?.detail || 'خطا در ثبت درخواست')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              درخواست هدیه ویژه
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
          {/* Business Info */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              {businessInfo.business_logo && (
                <img 
                  src={businessInfo.business_logo} 
                  alt={businessInfo.business_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {businessInfo.business_name}
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {businessInfo.service_category}
                </p>
              </div>
            </div>
          </div>

          {/* Elite Gift Info */}
          <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-purple-500/30 bg-purple-500/10' : 'border-purple-200 bg-purple-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  {businessInfo.elite_gift_description || 'هدیه ویژه'}
                </h4>
                <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  شما واجد شرایط دریافت هدیه هستید
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              ℹ️ با کلیک روی دکمه تایید، درخواست شما برای کسب‌وکار ارسال می‌شود. پس از تایید کسب‌وکار، 
              از شما خواسته می‌شود امتیاز و نظر خود را ثبت کنید.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              انصراف
            </button>
            <button
              onClick={handleSubmitClaim}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                isSubmitting
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } text-white shadow-lg`}
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
                'تایید و ارسال درخواست'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
