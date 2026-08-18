import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ClubExperienceBrowse } from '../components/clubs/ClubExperienceBrowse'
import { useAuth } from '../contexts/AuthContext'
import { apiService, ClubItem, VipExperienceCategory, Package } from '../services/api'

export const ClubDetail: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [club, setClub] = useState<ClubItem | null>(null)
  const [experiences, setExperiences] = useState<VipExperienceCategory[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    if (!clubId) return
    const id = parseInt(clubId, 10)
    if (Number.isNaN(id)) {
      navigate('/dashboard/clubs')
      return
    }
    loadClubData(id)
  }, [clubId, navigate])

  const loadClubData = async (id: number) => {
    setLoading(true)
    setError(null)

    const [clubsResp, expResp, pkgResp] = await Promise.all([
      apiService.getClubs(),
      apiService.getVipExperienceCategoriesByClub(id),
      apiService.getPackages(),
    ])

    if (clubsResp.data) {
      const foundClub = clubsResp.data.find(c => c.id === id)
      if (foundClub) {
        setClub(foundClub)
      } else {
        navigate('/dashboard/clubs')
        return
      }
    } else {
      setError('خطا در بارگذاری اطلاعات باشگاه')
    }

    if (expResp.data) setExperiences(expResp.data)

    if (Array.isArray(pkgResp.data)) {
      setPackages(pkgResp.data.filter(pkg => pkg.is_active && pkg.status === 'approved'))
    }

    setLoading(false)
  }

  const LoadingView = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
    </div>
  )

  if (!user || loading) {
    return (
      <>
        <div className="hidden lg:block">
          <DashboardLayout>
            <LoadingView />
          </DashboardLayout>
        </div>
        <div className="lg:hidden">
          <MobileDashboardLayout>
            <LoadingView />
          </MobileDashboardLayout>
        </div>
      </>
    )
  }

  if (user.type !== 'customer') {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="text-gray-600 dark:text-slate-400">این صفحه فقط برای مشتریان است</p>
        </div>
      </MobileDashboardLayout>
    )
  }

  if (error || !club) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-slate-400">{error || 'باشگاه یافت نشد'}</p>
            <button onClick={() => navigate('/dashboard/clubs')} className="mt-4 text-teal-500 text-sm">
              بازگشت به باشگاه‌ها
            </button>
          </div>
        </div>
      </MobileDashboardLayout>
    )
  }

  const content = (
    <div className="px-4 py-3">
      <ClubExperienceBrowse club={club} experiences={experiences} packages={packages} />
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">
        <DashboardLayout>
          <div className="mx-auto max-w-[480px] overflow-hidden rounded-[28px] bg-white dark:bg-slate-900">
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
