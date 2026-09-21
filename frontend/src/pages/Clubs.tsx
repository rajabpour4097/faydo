import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { ExperienceClubsHome } from '../components/clubs/ExperienceClubsHome'
import { useAuth } from '../contexts/AuthContext'

export const Clubs: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard')
    }
  }, [user, navigate])

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

  const content = (
    <div className="px-4 py-5" style={{ direction: 'rtl' }}>
      <ExperienceClubsHome />
    </div>
  )

  return <MobileDashboardLayout>{content}</MobileDashboardLayout>
}
