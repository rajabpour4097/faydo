import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ExperienceClubsHome } from '../components/clubs/ExperienceClubsHome'
import { apiService, ClubItem } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export const Clubs: React.FC = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      setLoading(true)
      setError(null)
      const clubsResp = await apiService.getClubs()
      if (clubsResp.data) {
        setClubs(clubsResp.data)
      } else if (clubsResp.error) {
        setError(clubsResp.error)
      }
    } catch (err) {
      console.error('Error loading clubs data:', err)
      setError('خطا در بارگذاری اطلاعات')
    } finally {
      setLoading(false)
    }
  }

  const LoadingView = ({ Layout }: { Layout: React.FC<{ children: React.ReactNode }> }) => (
    <Layout>
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    </Layout>
  )

  if (!user) {
    return <LoadingView Layout={MobileDashboardLayout} />
  }

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
      <>
        <div className="hidden lg:block">
          <LoadingView Layout={DashboardLayout} />
        </div>
        <div className="lg:hidden">
          <LoadingView Layout={MobileDashboardLayout} />
        </div>
      </>
    )
  }

  const content = (
    <div className="px-4 py-5" style={{ direction: 'rtl' }}>
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <ExperienceClubsHome clubs={clubs} />
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">
        <DashboardLayout>
          <div className={`rounded-[28px] ${isDark ? 'bg-slate-900' : 'bg-white'} py-4`}>
            {content}
          </div>
        </DashboardLayout>
      </div>
      <div className="lg:hidden">
        <MobileDashboardLayout>{content}</MobileDashboardLayout>
      </div>
    </>
  )
}
