import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { VipExperienceCategory, Package } from '../../services/api'

interface ExperienceModalProps {
  experience: VipExperienceCategory | null
  isOpen: boolean
  onClose: () => void
  onBusinessClick: (business: Package) => void
}

// داده‌های Mock برای کسب‌وکارها
const MOCK_BUSINESSES: Package[] = [
  {
    id: 1,
    business_id: 1,
    business_name: 'رستوران سنتی گیلان',
    business_logo: '',
    business_image: '',
    is_active: true,
    city: { id: 1, name: 'تهران' },
    discount_percentage: 20,
    status: 'approved',
    status_display: 'تایید شده',
    is_complete: true,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  } as Package,
  {
    id: 2,
    business_id: 2,
    business_name: 'کافه رستوران آرامش',
    business_logo: '',
    business_image: '',
    is_active: true,
    city: { id: 1, name: 'تهران' },
    discount_percentage: 15,
    status: 'approved',
    status_display: 'تایید شده',
    is_complete: true,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  } as Package,
  {
    id: 3,
    business_id: 3,
    business_name: 'رستوران لوکس پارسیان',
    business_logo: '',
    business_image: '',
    is_active: true,
    city: { id: 2, name: 'شیراز' },
    discount_percentage: 25,
    status: 'approved',
    status_display: 'تایید شده',
    is_complete: true,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  } as Package,
  {
    id: 4,
    business_id: 4,
    business_name: 'کافی شاپ مدرن',
    business_logo: '',
    business_image: '',
    is_active: true,
    city: { id: 3, name: 'اصفهان' },
    discount_percentage: 10,
    status: 'approved',
    status_display: 'تایید شده',
    is_complete: true,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  } as Package,
  {
    id: 5,
    business_id: 5,
    business_name: 'رستوران بین‌المللی رویال',
    business_logo: '',
    business_image: '',
    is_active: true,
    city: { id: 1, name: 'تهران' },
    discount_percentage: 30,
    status: 'approved',
    status_display: 'تایید شده',
    is_complete: true,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  } as Package
]

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  experience,
  isOpen,
  onClose,
  onBusinessClick
}) => {
  const { isDark } = useTheme()

  if (!isOpen || !experience) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                experience.vip_type === 'VIP+'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {experience.vip_type}
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {experience.name}
              </h2>
            </div>
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
          {experience.description && (
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {experience.description}
            </p>
          )}
        </div>

        {/* Body - لیست کسب‌وکارها */}
        <div className="p-6">
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            کسب‌وکارهای ارائه‌دهنده ({MOCK_BUSINESSES.length})
          </h3>
          
          <div className="space-y-3">
            {MOCK_BUSINESSES.map((business) => (
              <div
                key={business.id}
                onClick={() => onBusinessClick(business)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 hover:border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* لوگو کسب‌وکار */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {business.business_logo || business.business_image ? (
                        <img 
                          src={business.business_logo || business.business_image} 
                          alt={business.business_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        business.business_name.charAt(0)
                      )}
                    </div>

                    {/* اطلاعات کسب‌وکار */}
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {business.business_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {business.city && (
                          <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{business.city.name}</span>
                          </div>
                        )}
                        {business.discount_percentage && business.discount_percentage > 0 && (
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg text-xs font-semibold">
                            {business.discount_percentage}% تخفیف
                          </div>
                        )}
                      </div>
                    </div>

                    {/* آیکن فلش */}
                    <svg 
                      className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 p-6 border-t backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 ${
          isDark ? 'border-slate-700' : 'border-gray-200'
        }`}>
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
