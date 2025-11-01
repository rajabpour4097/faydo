import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ExperienceModal } from '../components/clubs/ExperienceModal'
import { BusinessDetailModal } from '../components/clubs/BusinessDetailModal'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { VipExperienceCategory, Package } from '../services/api'

interface Club {
  id: number
  name: string
  icon: string
  gradient: string
  description: string
}

// تعریف 4 باشگاه
const CLUBS: Club[] = [
  { 
    id: 1, 
    name: 'مزه‌ها', 
    icon: '🍽️', 
    gradient: 'from-orange-500 to-red-500',
    description: 'رستوران و کافه'
  },
  { 
    id: 2, 
    name: 'سلامت و زیبایی', 
    icon: '💆', 
    gradient: 'from-green-500 to-teal-500',
    description: 'سالن زیبایی و باشگاه'
  },
  { 
    id: 3, 
    name: 'آرزوها', 
    icon: '✨', 
    gradient: 'from-purple-500 to-pink-500',
    description: 'سفر و تفریح'
  },
  { 
    id: 4, 
    name: 'خانواده', 
    icon: '👨‍👩‍👧‍👦', 
    gradient: 'from-blue-500 to-indigo-500',
    description: 'خرید خانوادگی'
  }
]

// داده‌های Mock برای تجربیات
const MOCK_EXPERIENCES: VipExperienceCategory[] = [
  {
    id: 1,
    vip_type: 'VIP+',
    category: 1,
    category_name: 'مزه‌ها',
    name: 'شام ویژه دو نفره',
    description: 'شام رمانتیک با منوی ویژه',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 2,
    vip_type: 'VIP',
    category: 1,
    category_name: 'مزه‌ها',
    name: 'ناهار ویژه',
    description: 'ناهار با غذاهای محلی',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 3,
    vip_type: 'VIP+',
    category: 1,
    category_name: 'مزه‌ها',
    name: 'کافه تریا ویژه',
    description: 'قهوه و دسر در محیطی دنج',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 4,
    vip_type: 'VIP',
    category: 2,
    category_name: 'سلامت و زیبایی',
    name: 'ماساژ درمانی',
    description: 'ماساژ تخصصی ۶۰ دقیقه‌ای',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 5,
    vip_type: 'VIP+',
    category: 2,
    category_name: 'سلامت و زیبایی',
    name: 'پکیج زیبایی کامل',
    description: 'اصلاح، ماساژ صورت، ماسک',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 6,
    vip_type: 'VIP',
    category: 3,
    category_name: 'آرزوها',
    name: 'تور یک روزه',
    description: 'سفر یک روزه به شمال',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 7,
    vip_type: 'VIP+',
    category: 3,
    category_name: 'آرزوها',
    name: 'تور سه روزه',
    description: 'سفر سه روزه اقامت در هتل',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  },
  {
    id: 8,
    vip_type: 'VIP',
    category: 4,
    category_name: 'خانواده',
    name: 'خرید خانوادگی',
    description: 'بن خرید از فروشگاه‌های منتخب',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  }
]

export const ClubDetail: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  
  const [club, setClub] = useState<Club | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [vipFilter, setVipFilter] = useState<'all' | 'VIP' | 'VIP+'>('all')
  const [experiences, setExperiences] = useState<VipExperienceCategory[]>([])
  const [selectedExperience, setSelectedExperience] = useState<VipExperienceCategory | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Package | null>(null)
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)

  // بارگذاری اطلاعات باشگاه
  useEffect(() => {
    if (clubId) {
      const foundClub = CLUBS.find(c => c.id === parseInt(clubId))
      if (foundClub) {
        setClub(foundClub)
        // فیلتر تجربیات بر اساس category باشگاه
        const clubExperiences = MOCK_EXPERIENCES.filter(
          exp => exp.category === foundClub.id
        )
        setExperiences(clubExperiences)
      } else {
        navigate('/dashboard/clubs')
      }
    }
  }, [clubId, navigate])

  // بررسی دسترسی کاربر
  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)
    // TODO: API call برای دنبال کردن/لغو دنبال کردن
  }

  const handleExperienceClick = (experience: VipExperienceCategory) => {
    setSelectedExperience(experience)
    setIsExperienceModalOpen(true)
  }

  const handleBusinessClick = (business: Package) => {
    setIsExperienceModalOpen(false)
    setSelectedBusiness(business)
    setIsBusinessModalOpen(true)
  }

  const handleCloseExperienceModal = () => {
    setIsExperienceModalOpen(false)
    setSelectedExperience(null)
  }

  const handleCloseBusinessModal = () => {
    setIsBusinessModalOpen(false)
    setSelectedBusiness(null)
  }

  // فیلتر کردن تجربیات
  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVipFilter = vipFilter === 'all' || exp.vip_type === vipFilter
    return matchesSearch && matchesVipFilter
  })

  // تعداد موجودی تصادفی برای هر تجربه (Mock)
  const getAvailableCount = () => {
    return Math.floor(Math.random() * 15) + 5 // بین 5 تا 20
  }

  if (!user || !club) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  // Desktop Layout
  const DesktopLayout = () => (
    <DashboardLayout>
      <div className="space-y-6" style={{ direction: 'rtl' }}>
        {/* Header با دکمه دنبال کردن */}
        <div className={`rounded-2xl p-6 bg-gradient-to-r ${club.gradient}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{club.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  باشگاه {club.name}
                </h1>
                <p className="text-white/90 text-lg">
                  {club.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                isFollowing
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-gray-900'
              }`}
            >
              {isFollowing ? (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>در حال دنبال کردن</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>دنبال کردن</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* جستجو و فیلتر */}
        <div className={`rounded-2xl p-6 ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="space-y-4">
            {/* جستجو */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی تجربیات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
              <svg 
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* فیلتر VIP */}
            <div className="flex gap-3">
              <button
                onClick={() => setVipFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  vipFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setVipFilter('VIP')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  vipFilter === 'VIP'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                VIP
              </button>
              <button
                onClick={() => setVipFilter('VIP+')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  vipFilter === 'VIP+'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                VIP+
              </button>
            </div>
          </div>
        </div>

        {/* لیست تجربیات */}
        <div className={`rounded-2xl p-6 ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            تجربیات موجود ({filteredExperiences.length})
          </h3>
          
          <div className="space-y-3">
            {filteredExperiences.map((experience) => (
              <div
                key={experience.id}
                onClick={() => handleExperienceClick(experience)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 hover:border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Badge VIP */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      experience.vip_type === 'VIP+'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {experience.vip_type}
                    </div>
                    
                    {/* اطلاعات تجربه */}
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {experience.name}
                      </h4>
                      {experience.description && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {experience.description}
                        </p>
                      )}
                    </div>

                    {/* تعداد موجودی */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getAvailableCount()}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        کسب‌وکار
                      </div>
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
            ))}

            {filteredExperiences.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  تجربه‌ای یافت نشد
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )

  // Mobile Layout
  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4" style={{ direction: 'rtl' }}>
        {/* Header با دکمه دنبال کردن */}
        <div className={`rounded-2xl p-4 bg-gradient-to-r ${club.gradient}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{club.icon}</div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  باشگاه {club.name}
                </h1>
                <p className="text-white/90 text-sm">
                  {club.description}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleFollowToggle}
            className={`w-full px-4 py-2 rounded-lg font-bold transition-all ${
              isFollowing
                ? 'bg-white text-gray-900'
                : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
            }`}
          >
            {isFollowing ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>در حال دنبال کردن</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>دنبال کردن</span>
              </div>
            )}
          </button>
        </div>

        {/* جستجو */}
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی تجربیات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 pr-10 rounded-xl border-2 focus:outline-none focus:border-blue-500 text-sm ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <svg 
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* فیلتر VIP */}
        <div className="flex gap-2">
          <button
            onClick={() => setVipFilter('all')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              vipFilter === 'all'
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setVipFilter('VIP')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              vipFilter === 'VIP'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            VIP
          </button>
          <button
            onClick={() => setVipFilter('VIP+')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              vipFilter === 'VIP+'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            VIP+
          </button>
        </div>

        {/* لیست تجربیات */}
        <div>
          <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            تجربیات موجود ({filteredExperiences.length})
          </h3>
          
          <div className="space-y-2">
            {filteredExperiences.map((experience) => (
              <div
                key={experience.id}
                onClick={() => handleExperienceClick(experience)}
                className={`p-3 rounded-xl border-2 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Badge VIP */}
                  <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                    experience.vip_type === 'VIP+'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {experience.vip_type}
                  </div>
                  
                  {/* اطلاعات */}
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {experience.name}
                    </h4>
                    {experience.description && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {experience.description}
                      </p>
                    )}
                  </div>

                  {/* تعداد */}
                  <div className="text-center">
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getAvailableCount()}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      کسب‌وکار
                    </div>
                  </div>

                  {/* آیکن فلش */}
                  <svg 
                    className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            ))}

            {filteredExperiences.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  تجربه‌ای یافت نشد
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout />
      </div>

      {/* Modals */}
      <ExperienceModal
        experience={selectedExperience}
        isOpen={isExperienceModalOpen}
        onClose={handleCloseExperienceModal}
        onBusinessClick={handleBusinessClick}
      />
      <BusinessDetailModal
        business={selectedBusiness}
        isOpen={isBusinessModalOpen}
        onClose={handleCloseBusinessModal}
      />
    </>
  )
}
