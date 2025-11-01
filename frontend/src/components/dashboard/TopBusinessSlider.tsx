import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { Package } from '../../services/api'

interface TopBusinessSliderProps {
  packages: Package[]
}

export const TopBusinessSlider: React.FC<TopBusinessSliderProps> = ({ packages }) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [topBusinessesByCategory, setTopBusinessesByCategory] = useState<Package[]>([])

  // Group packages by category and get top rated business from each category
  useEffect(() => {
    if (!packages || packages.length === 0) return

    // Group by category
    const categoriesMap = new Map<number, Package[]>()
    
    packages.forEach(pkg => {
      if (pkg.business_category && pkg.is_active && pkg.status === 'approved') {
        const categoryId = pkg.business_category.id
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, [])
        }
        categoriesMap.get(categoryId)?.push(pkg)
      }
    })

    // Get top rated business from each category
    const topBusinesses: Package[] = []
    categoriesMap.forEach((pkgs) => {
      // Sort by rating (assuming business has rating in future, for now random selection)
      // In future, when backend provides rating_avg, sort by: pkg.business_rating_avg
      const sortedPkgs = [...pkgs].sort((a, b) => {
        // For now, sort by created_at (newest first) or just take first
        try {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        } catch {
          return 0
        }
      })
      
      if (sortedPkgs[0]) {
        topBusinesses.push(sortedPkgs[0])
      }
    })

    setTopBusinessesByCategory(topBusinesses)
    setCurrentIndex(0)
  }, [packages])

  // Auto slide every 3 seconds
  useEffect(() => {
    if (topBusinessesByCategory.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % topBusinessesByCategory.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [topBusinessesByCategory])

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % topBusinessesByCategory.length)
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + topBusinessesByCategory.length) % topBusinessesByCategory.length)
  }

  const handleCardClick = (packageId: number) => {
    navigate(`/dashboard/business/${packageId}`)
  }

  if (topBusinessesByCategory.length === 0) {
    return null
  }

  const currentBusiness = topBusinessesByCategory[currentIndex]
  
  if (!currentBusiness) {
    return null
  }

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          برترین‌های هر دسته 🌟
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {currentIndex + 1} / {topBusinessesByCategory.length}
          </span>
        </div>
      </div>

      {/* Slider Card */}
      <div className="relative">
        <div
          onClick={() => handleCardClick(currentBusiness.id)}
          className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Business Image */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-500 to-purple-600">
            {currentBusiness.business_image || currentBusiness.business_logo ? (
              <img
                src={currentBusiness.business_image || currentBusiness.business_logo}
                alt={currentBusiness.business_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                  if (placeholder) placeholder.style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full flex flex-col items-center justify-center ${
                currentBusiness.business_image || currentBusiness.business_logo ? 'hidden' : 'flex'
              }`}
              style={{ display: currentBusiness.business_image || currentBusiness.business_logo ? 'none' : 'flex' }}
            >
              <div className="w-20 h-20 mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">بدون تصویر</p>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Category Badge - Top Left */}
            {currentBusiness.business_category && (
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentBusiness.business_category.name}
                  </span>
                </div>
              </div>
            )}

            {/* VIP Badge - Top Right */}
            {(currentBusiness.has_vip || currentBusiness.has_vip_plus) && (
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                  currentBusiness.has_vip_plus
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {currentBusiness.has_vip_plus ? 'VIP+' : 'VIP'}
                </div>
              </div>
            )}

            {/* Business Info - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h4 className="text-white text-xl font-bold mb-1">
                {currentBusiness.business_name}
              </h4>
              {currentBusiness.city && (
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{currentBusiness.city.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Package Info */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentBusiness.discount_percentage && currentBusiness.discount_percentage > 0 && (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    {currentBusiness.discount_percentage}% تخفیف
                  </div>
                )}
              </div>
              <button
                className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
              >
                مشاهده جزئیات ←
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {topBusinessesByCategory.length > 1 && (
          <>
            {/* دکمه راست - قبلی */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className={`absolute right-2 top-20 sm:top-24 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? 'bg-slate-900/40 hover:bg-slate-900/60 text-white' 
                  : 'bg-white/40 hover:bg-white/60 text-gray-900'
              } backdrop-blur-sm hover:scale-110`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* دکمه چپ - بعدی */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className={`absolute left-2 top-20 sm:top-24 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? 'bg-slate-900/40 hover:bg-slate-900/60 text-white' 
                  : 'bg-white/40 hover:bg-white/60 text-gray-900'
              } backdrop-blur-sm hover:scale-110`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {topBusinessesByCategory.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {topBusinessesByCategory.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-blue-600' 
                  : 'w-2 bg-gray-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
