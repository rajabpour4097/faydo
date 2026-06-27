import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { TopClubExperiencesSlider } from '../components/clubs/TopClubExperiencesSlider'
import { ClubsQuickAccess } from '../components/clubs/ClubsQuickAccess'
import { apiService, Package, ClubItem } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export const Clubs: React.FC = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<Package[]>([])
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // بررسی اینکه کاربر مشتری باشد
  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  // بارگذاری پکیج‌های فعال و باشگاه‌ها
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [pkgResp, clubsResp] = await Promise.all([
        apiService.getPackages(),
        apiService.getClubs(),
      ])
      if (pkgResp.data) {
        setPackages(pkgResp.data.filter(pkg => pkg.is_active && pkg.status === 'approved'))
      } else if (pkgResp.error) {
        setError(pkgResp.error)
      }
      if (clubsResp.data) {
        setClubs(clubsResp.data)
      }
    } catch (err) {
      console.error('Error loading clubs data:', err)
      setError('خطا در بارگذاری اطلاعات')
    } finally {
      setLoading(false)
    }
  }

  // نمایش loading
  if (!user) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  // بررسی دسترسی
  if (user.type !== 'customer') {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              دسترسی محدود
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              این صفحه فقط برای مشتریان قابل دسترسی است
            </p>
          </div>
        </div>
      </MobileDashboardLayout>
    )
  }

  if (loading) {
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
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            باشگاه‌های مشتریان
          </h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            تجربیات ویژه و جوایز انحصاری در باشگاه‌های مختلف
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Top Experiences Slider */}
        <TopClubExperiencesSlider packages={packages} />

        {/* Clubs Quick Access */}
        <ClubsQuickAccess />

        {/* Info Section */}
        {clubs.length > 0 && (
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              درباره باشگاه‌های مشتریان
            </h3>
            <div className="space-y-3 text-sm">
              {clubs.map(club => (
                <p key={club.id} className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  <span className="ml-1">{club.icon || '🏆'}</span>
                  <strong>{club.name}:</strong>
                  {club.description && <span className="mr-1">{club.description}</span>}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )

  // Mobile Layout
  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4" style={{ direction: 'rtl' }}>
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            باشگاه‌های مشتریان
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            تجربیات ویژه و جوایز انحصاری
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Top Experiences Slider */}
        <TopClubExperiencesSlider packages={packages} />

        {/* Clubs Quick Access */}
        <ClubsQuickAccess />

        {/* Info Section */}
        {clubs.length > 0 && (
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-base font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              درباره باشگاه‌ها
            </h3>
            <div className="space-y-2 text-xs">
              {clubs.map(club => (
                <p key={club.id} className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  <span className="ml-1">{club.icon || '🏆'}</span>
                  <strong>{club.name}:</strong>
                  {club.description && <span className="mr-1">{club.description}</span>}
                </p>
              ))}
            </div>
          </div>
        )}
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
    </>
  )
}
