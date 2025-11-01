import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Package } from '../../services/api'

interface BusinessDetailModalProps {
  business: Package | null
  isOpen: boolean
  onClose: () => void
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  isOpen,
  onClose
}) => {
  const { isDark } = useTheme()

  if (!isOpen || !business) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: 'rtl' }}
      >
        {/* Header با تصویر */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
          {business.business_image || business.business_logo ? (
            <img
              src={business.business_image || business.business_logo}
              alt={business.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* دکمه بستن */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* نام کسب‌وکار */}
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {business.business_name}
            </h2>
            {business.city && (
              <div className="flex items-center gap-2 text-white/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg">{business.city.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Body - جزئیات کسب‌وکار */}
        <div className="p-6 space-y-6">
          {/* مزایا و تخفیف‌ها */}
          <div>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              مزایای پکیج
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* تخفیف */}
              {business.discount_percentage && business.discount_percentage > 0 && (
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-700' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        تخفیف
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {business.discount_percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* هدیه ویژه */}
              {business.elite_gift_title && (
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-slate-700' : 'bg-purple-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        هدیه ویژه
                      </div>
                      <div className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        {business.elite_gift_title}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* امتیاز */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700' : 'bg-blue-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      امتیاز کسب شده
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {100} امتیاز
                    </div>
                  </div>
                </div>
              </div>

              {/* وضعیت */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    business.is_active 
                      ? 'bg-green-500' 
                      : 'bg-gray-400'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      وضعیت پکیج
                    </div>
                    <div className={`text-lg font-bold ${
                      business.is_active 
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {business.is_active ? 'فعال' : 'غیرفعال'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* توضیحات اضافی - فعلاً کامنت شده */}
          {/* {business.description && (
            <div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                درباره پکیج
              </h3>
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {business.description}
              </p>
            </div>
          )} */}

          {/* تاریخ‌ها */}
          <div className="flex items-center gap-6 text-sm">
            {business.start_date && (
              <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                <span className="font-semibold">شروع: </span>
                {new Date(business.start_date).toLocaleDateString('fa-IR')}
              </div>
            )}
            {business.end_date && (
              <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                <span className="font-semibold">پایان: </span>
                {new Date(business.end_date).toLocaleDateString('fa-IR')}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 p-6 border-t backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 ${
          isDark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
            >
              بستن
            </button>
            <button
              onClick={() => {
                // TODO: Navigate to package detail page
                window.location.href = `/dashboard/business/${business.id}`
              }}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              مشاهده صفحه کسب‌وکار
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
