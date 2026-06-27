import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, Package, VipExperienceCategory } from '../../services/api'

interface TopClubExperiencesSliderProps {
  packages: Package[]
}

interface SlideItem {
  expCat: VipExperienceCategory
  clubName: string
  clubIcon: string
  clubGradient: string
  packageData?: Package
}

const GRADIENTS = [
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-yellow-500 to-orange-400',
]

export const TopClubExperiencesSlider: React.FC<TopClubExperiencesSliderProps> = ({ packages }) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buildSlides()
  }, [packages])

  const buildSlides = async () => {
    setLoading(true)

    // دریافت باشگاه‌ها و تجربیات VIP از API
    const [clubsResp, expResp] = await Promise.all([
      apiService.getClubs(),
      apiService.getVipExperienceCategories(),
    ])

    const clubs = clubsResp.data || []
    const expCats = expResp.data || []

    const result: SlideItem[] = []

    // ابتدا تلاش کنیم از پکیج‌های واقعی استفاده کنیم
    const packageSlides: SlideItem[] = []
    if (packages && packages.length > 0) {
      packages.forEach(pkg => {
        if (pkg.is_active && pkg.status === 'approved' && pkg.experiences) {
          pkg.experiences.forEach(exp => {
            const catId = exp.vip_experience_category?.id ?? exp.vip_experience_category_id
            const cat = expCats.find(e => e.id === catId) ?? exp.vip_experience_category
            if (!cat) return
            const clubId = cat.club_id
            const clubData = clubs.find(c => c.id === clubId)
            const clubIdx = clubData ? clubs.indexOf(clubData) : 0
            packageSlides.push({
              expCat: cat,
              clubName: clubData?.name ?? cat.club_name ?? 'باشگاه',
              clubIcon: clubData?.icon ?? '🏆',
              clubGradient: GRADIENTS[clubIdx % GRADIENTS.length],
              packageData: pkg,
            })
          })
        }
      })
    }

    if (packageSlides.length > 0) {
      // یک نمونه از هر باشگاه
      const seen = new Set<number | null | undefined>()
      packageSlides.forEach(s => {
        if (!seen.has(s.expCat.club_id)) {
          seen.add(s.expCat.club_id)
          result.push(s)
        }
      })
      if (result.length === 0) result.push(...packageSlides.slice(0, 5))
    } else if (expCats.length > 0) {
      // بدون پکیج - مستقیم از تجربیات VIP نمایش بده
      const seen = new Set<number | null | undefined>()
      expCats.forEach(cat => {
        if (!seen.has(cat.club_id)) {
          seen.add(cat.club_id)
          const clubData = clubs.find(c => c.id === cat.club_id)
          const clubIdx = clubData ? clubs.indexOf(clubData) : 0
          result.push({
            expCat: cat,
            clubName: clubData?.name ?? cat.club_name ?? 'باشگاه',
            clubIcon: clubData?.icon ?? '🏆',
            clubGradient: GRADIENTS[clubIdx % GRADIENTS.length],
          })
        }
      })
    }

    setSlides(result)
    setCurrentIndex(0)
    setLoading(false)
  }

  // اسلایدر خودکار
  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [slides])

  if (loading) {
    return (
      <div className={`rounded-2xl h-48 animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
    )
  }

  if (slides.length === 0) return null

  const current = slides[currentIndex]

  return (
    <div className="mb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          تجربیات ویژه باشگاه‌ها ⭐
        </h3>
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {currentIndex + 1} / {slides.length}
        </span>
      </div>

      {/* Card */}
      <div className="relative">
        <div
          onClick={() => current.packageData && navigate(`/dashboard/business/${current.packageData.id}`)}
          className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
            current.packageData ? 'cursor-pointer' : 'cursor-default'
          } ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
        >
          {/* Club Badge */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${current.clubGradient} flex items-center gap-2 shadow-lg`}>
              <span className="text-xl">{current.clubIcon}</span>
              <span className="text-white font-bold text-sm">{current.clubName}</span>
            </div>
          </div>

          {/* Image/Gradient Background */}
          <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${current.clubGradient}`}>
            {current.packageData?.business_image || current.packageData?.business_logo ? (
              <img
                src={current.packageData.business_image || current.packageData.business_logo}
                alt={current.packageData.business_name}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-6xl opacity-30">{current.clubIcon}</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* VIP Badge */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                current.expCat.vip_type === 'VIP+'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {current.expCat.vip_type}
              </div>
            </div>

            {/* Experience Info - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {current.packageData && (
                <div className="mb-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {current.packageData.business_name}
                  </span>
                </div>
              )}
              <h4 className="text-white text-xl font-bold mb-1">{current.expCat.name}</h4>
              {current.expCat.description && (
                <p className="text-white/80 text-sm line-clamp-1">{current.expCat.description}</p>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`p-4 flex items-center justify-between ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {current.expCat.category_name ?? current.clubName}
              </p>
            </div>
            {current.packageData && (
              <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                <span>مشاهده</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all ${
                  i === currentIndex ? 'w-4 h-2 bg-teal-500' : `w-2 h-2 ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
