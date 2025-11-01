import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { Package, VipExperience } from '../../services/api'

interface TopClubExperiencesSliderProps {
  packages: Package[]
}

interface ClubExperience {
  experience: VipExperience
  package: Package
  club: Club
}

interface Club {
  id: number
  name: string
  icon: string
  gradient: string
}

// تعریف 4 باشگاه
const CLUBS: Club[] = [
  { id: 1, name: 'مزه‌ها', icon: '🍽️', gradient: 'from-orange-500 to-red-500' },
  { id: 2, name: 'سلامت و زیبایی', icon: '💆', gradient: 'from-green-500 to-teal-500' },
  { id: 3, name: 'آرزوها', icon: '✨', gradient: 'from-purple-500 to-pink-500' },
  { id: 4, name: 'خانواده', icon: '👨‍👩‍👧‍👦', gradient: 'from-blue-500 to-indigo-500' }
]

export const TopClubExperiencesSlider: React.FC<TopClubExperiencesSliderProps> = ({ packages }) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [topExperiences, setTopExperiences] = useState<ClubExperience[]>([])

  // انتخاب یک تجربه VIP/VIP+ از هر باشگاه
  useEffect(() => {
    if (!packages || packages.length === 0) {
      // اگر پکیجی نیست، داده‌های Mock نمایش بده
      createMockExperiences()
      return
    }

    // جمع‌آوری تمام VipExperience ها از پکیج‌های فعال
    const allExperiences: ClubExperience[] = []
    
    packages.forEach(pkg => {
      if (pkg.is_active && pkg.status === 'approved' && pkg.experiences && pkg.experiences.length > 0) {
        pkg.experiences.forEach(exp => {
          // فقط تجربیات با امتیاز بالا (فرضاً 4 و 5)
          if (exp.score >= 4) {
            // تخصیص تصادفی به باشگاه‌ها (فعلاً - بعداً باید بر اساس category باشد)
            const randomClub = CLUBS[Math.floor(Math.random() * CLUBS.length)]
            allExperiences.push({
              experience: exp,
              package: pkg,
              club: randomClub
            })
          }
        })
      }
    })

    // گروه‌بندی بر اساس باشگاه و انتخاب یکی از هر باشگاه
    const experiencesByClub = new Map<number, ClubExperience[]>()
    
    allExperiences.forEach(exp => {
      if (!experiencesByClub.has(exp.club.id)) {
        experiencesByClub.set(exp.club.id, [])
      }
      experiencesByClub.get(exp.club.id)!.push(exp)
    })

    // از هر باشگاه بهترین تجربه را انتخاب کنیم (بر اساس score)
    const selectedExperiences: ClubExperience[] = []
    
    CLUBS.forEach(club => {
      const clubExps = experiencesByClub.get(club.id)
      if (clubExps && clubExps.length > 0) {
        // مرتب‌سازی بر اساس score و انتخاب بهترین
        const bestExp = clubExps.sort((a, b) => b.experience.score - a.experience.score)[0]
        selectedExperiences.push(bestExp)
      }
    })

    // اگر تعداد کم است، تجربیات تکراری اضافه کنیم
    if (selectedExperiences.length === 0 && allExperiences.length > 0) {
      // حداقل 4 تجربه برتر را انتخاب کن
      const topRated = allExperiences
        .sort((a, b) => b.experience.score - a.experience.score)
        .slice(0, 4)
      selectedExperiences.push(...topRated)
    }

    // اگر هنوز خالیه، داده‌های Mock بساز
    if (selectedExperiences.length === 0) {
      createMockExperiences()
    } else {
      setTopExperiences(selectedExperiences)
      setCurrentIndex(0)
    }
  }, [packages])

  // ساخت داده‌های Mock برای نمایش
  const createMockExperiences = () => {
    const now = new Date().toISOString()
    
    const mockExperiences: ClubExperience[] = CLUBS.map((club, index) => ({
      experience: {
        id: index + 1,
        vip_experience_category_id: index + 1,
        vip_experience_category: {
          id: index + 1,
          vip_type: (index % 2 === 0 ? 'VIP+' : 'VIP') as 'VIP' | 'VIP+',
          category: index + 1,
          category_name: club.name,
          name: `تجربه ویژه ${club.name}`,
          description: `بهترین تجربه در ${club.name}`,
          created_at: now,
          modified_at: now
        },
        score: 5,
        comments: [],
        created_at: now,
        modified_at: now
      },
      package: {
        id: index + 1,
        business_name: `کسب‌وکار نمونه ${index + 1}`,
        business_image: '',
        business_logo: '',
        city: { id: 1, name: 'تهران' },
        discount_percentage: 20,
        is_active: true,
        status: 'approved',
        elite_gift_title: 'هدیه ویژه'
      } as Package,
      club: club
    }))
    
    setTopExperiences(mockExperiences)
    setCurrentIndex(0)
  }

  // اسلایدر خودکار هر 4 ثانیه
  useEffect(() => {
    if (topExperiences.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % topExperiences.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [topExperiences])

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % topExperiences.length)
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + topExperiences.length) % topExperiences.length)
  }

  const handleCardClick = (packageId: number) => {
    navigate(`/dashboard/business/${packageId}`)
  }

  if (topExperiences.length === 0) {
    return null
  }

  const currentItem = topExperiences[currentIndex]
  const currentPackage = currentItem.package
  const currentExperience = currentItem.experience
  const currentClub = currentItem.club

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          تجربیات پرطرفدار باشگاه‌ها ⭐
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {currentIndex + 1} / {topExperiences.length}
          </span>
        </div>
      </div>

      {/* Slider Card */}
      <div className="relative">
        <div
          onClick={() => handleCardClick(currentPackage.id)}
          className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Club Badge - Top Center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${currentClub.gradient} flex items-center gap-2 shadow-lg`}>
              <span className="text-xl">{currentClub.icon}</span>
              <span className="text-white font-bold text-sm">باشگاه {currentClub.name}</span>
            </div>
          </div>

          {/* Business Image */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-500 to-purple-600">
            {currentPackage.business_image || currentPackage.business_logo ? (
              <img
                src={currentPackage.business_image || currentPackage.business_logo}
                alt={currentPackage.business_name}
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
                currentPackage.business_image || currentPackage.business_logo ? 'hidden' : 'flex'
              }`}
              style={{ display: currentPackage.business_image || currentPackage.business_logo ? 'none' : 'flex' }}
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
            
            {/* VIP Badge - Top Right */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                currentExperience.vip_experience_category.vip_type === 'VIP+'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {currentExperience.vip_experience_category.vip_type}
              </div>
            </div>

            {/* VIP Experience Name - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="mb-2">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {currentPackage.business_name}
                </span>
              </div>
              <h4 className="text-white text-xl font-bold mb-1">
                {currentExperience.vip_experience_category.name}
              </h4>
              {currentPackage.city && (
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{currentPackage.city.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Package Info */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < currentExperience.score ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                    ({currentExperience.score})
                  </span>
                </div>
                {currentPackage.elite_gift_title && (
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                    🎁 هدیه ویژه
                  </div>
                )}
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">
                مشاهده جزئیات ←
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {topExperiences.length > 1 && (
          <>
            {/* دکمه راست - قبلی */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className={`absolute right-2 top-24 sm:top-28 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
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
              className={`absolute left-2 top-24 sm:top-28 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
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
      {topExperiences.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {topExperiences.map((_, index) => (
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
