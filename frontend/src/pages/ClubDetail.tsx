import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ExperienceModal } from '../components/clubs/ExperienceModal'
import { BusinessDetailModal } from '../components/clubs/BusinessDetailModal'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { apiService, ClubItem, VipExperienceCategory, Package } from '../services/api'

// گرادیان‌های پیش‌فرض
const CLUB_GRADIENTS = [
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-yellow-500 to-orange-500',
]

export const ClubDetail: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [club, setClub] = useState<ClubItem | null>(null)
  const [clubGradient, setClubGradient] = useState('from-orange-500 to-red-500')
  const [experiences, setExperiences] = useState<VipExperienceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [vipFilter, setVipFilter] = useState<'all' | 'VIP' | 'VIP+'>('all')

  const [selectedExperience, setSelectedExperience] = useState<VipExperienceCategory | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Package | null>(null)
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)

  // بررسی دسترسی
  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // بارگذاری داده‌های باشگاه و تجربیات از API
  useEffect(() => {
    if (!clubId) return
    const id = parseInt(clubId)
    if (isNaN(id)) {
      navigate('/dashboard/clubs')
      return
    }
    loadClubData(id)
  }, [clubId, navigate])

  const loadClubData = async (id: number) => {
    setLoading(true)
    setError(null)

    // دریافت لیست باشگاه‌ها برای پیدا کردن این باشگاه
    const [clubsResp, expResp] = await Promise.all([
      apiService.getClubs(),
      apiService.getVipExperienceCategoriesByClub(id),
    ])

    if (clubsResp.data) {
      const foundClub = clubsResp.data.find(c => c.id === id)
      if (foundClub) {
        setClub(foundClub)
        const gradientIndex = clubsResp.data.indexOf(foundClub)
        setClubGradient(CLUB_GRADIENTS[gradientIndex % CLUB_GRADIENTS.length])
      } else {
        navigate('/dashboard/clubs')
        return
      }
    } else {
      setError('خطا در بارگذاری اطلاعات باشگاه')
    }

    if (expResp.data) {
      setExperiences(expResp.data)
    }

    setLoading(false)
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

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesVip = vipFilter === 'all' || exp.vip_type === vipFilter
    return matchesSearch && matchesVip
  })

  if (!user || loading) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </MobileDashboardLayout>
    )
  }

  if (error || !club) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>{error || 'باشگاه یافت نشد'}</p>
            <button onClick={() => navigate('/dashboard/clubs')} className="mt-4 text-teal-500 hover:underline text-sm">
              بازگشت به باشگاه‌ها
            </button>
          </div>
        </div>
      </MobileDashboardLayout>
    )
  }

  // بخش مشترک Header
  const ClubHeader = ({ compact = false }: { compact?: boolean }) => (
    <div className={`rounded-2xl ${compact ? 'p-4' : 'p-6'} bg-gradient-to-r ${clubGradient}`}>
      <div className={`flex items-center ${compact ? 'gap-3 mb-3' : 'gap-4 justify-between'}`}>
        <div className="flex items-center gap-3 flex-1">
          <div className={`${compact ? 'text-4xl' : 'text-6xl'}`}>{club.icon || '🏆'}</div>
          <div>
            <h1 className={`${compact ? 'text-xl' : 'text-3xl'} font-bold text-white`}>
              {club.name}
            </h1>
            {club.description && (
              <p className={`text-white/90 ${compact ? 'text-sm' : 'text-lg'} mt-1`}>
                {club.description}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* تعداد تجربیات */}
      <div className={`flex gap-3 ${compact ? '' : 'mt-4'}`}>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
          {experiences.length} تجربه VIP
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
          {experiences.filter(e => e.vip_type === 'VIP+').length} تجربه VIP+
        </div>
      </div>
    </div>
  )

  // بخش جستجو و فیلتر
  const FilterBar = ({ small = false }: { small?: boolean }) => (
    <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl ${small ? 'p-3' : 'p-6'}`}>
      <div className={`${small ? 'space-y-2' : 'space-y-4'}`}>
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی تجربیات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border-2 focus:outline-none focus:border-teal-500 transition-colors text-sm ${
              isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <svg className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2">
          {(['all', 'VIP', 'VIP+'] as const).map(v => (
            <button key={v} onClick={() => setVipFilter(v)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                vipFilter === v
                  ? v === 'all' ? 'bg-teal-500 text-white' : v === 'VIP' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
              }`}>
              {v === 'all' ? 'همه' : v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // کارت تجربه
  const ExperienceCard = ({ exp, compact = false }: { exp: VipExperienceCategory; compact?: boolean }) => (
    <div
      onClick={() => handleExperienceClick(exp)}
      className={`${compact ? 'p-3' : 'p-4'} rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
        isDark ? 'bg-slate-700 border-slate-600 hover:border-teal-500' : 'bg-gray-50 border-gray-200 hover:border-teal-500'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`px-2 py-1 rounded-full text-xs font-bold text-white shrink-0 ${
          exp.vip_type === 'VIP+' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
        }`}>
          {exp.vip_type}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${compact ? 'text-sm' : 'text-base'} truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {exp.name}
          </h4>
          {exp.description && (
            <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {exp.description}
            </p>
          )}
          {exp.category_name && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
              {exp.category_name}
            </p>
          )}
        </div>
        <svg className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </div>
  )

  // Desktop Layout
  const DesktopLayout = () => (
    <DashboardLayout>
      <div className="space-y-6" style={{ direction: 'rtl' }}>
        <ClubHeader />
        <FilterBar />
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            تجربیات موجود ({filteredExperiences.length})
          </h3>
          {filteredExperiences.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🔍</div>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>تجربه‌ای یافت نشد</p>
              {experiences.length === 0 && (
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  هنوز هیچ تجربه VIP برای این باشگاه تعریف نشده است
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExperiences.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )

  // Mobile Layout
  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4" style={{ direction: 'rtl' }}>
        <ClubHeader compact />
        <FilterBar small />
        <div>
          <h3 className={`text-base font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            تجربیات موجود ({filteredExperiences.length})
          </h3>
          {filteredExperiences.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>تجربه‌ای یافت نشد</p>
              {experiences.length === 0 && (
                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  هنوز هیچ تجربه VIP برای این باشگاه تعریف نشده
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExperiences.map(exp => <ExperienceCard key={exp.id} exp={exp} compact />)}
            </div>
          )}
        </div>
      </div>
    </MobileDashboardLayout>
  )

  return (
    <>
      <div className="hidden lg:block"><DesktopLayout /></div>
      <div className="lg:hidden"><MobileLayout /></div>

      <ExperienceModal
        experience={selectedExperience}
        isOpen={isExperienceModalOpen}
        onClose={() => { setIsExperienceModalOpen(false); setSelectedExperience(null) }}
        onBusinessClick={handleBusinessClick}
      />
      <BusinessDetailModal
        business={selectedBusiness}
        isOpen={isBusinessModalOpen}
        onClose={() => { setIsBusinessModalOpen(false); setSelectedBusiness(null) }}
      />
    </>
  )
}
