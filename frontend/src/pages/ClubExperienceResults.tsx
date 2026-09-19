import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { ClubExperienceIntro } from '../components/clubs/ClubExperienceIntro'
import { ClubExperienceList } from '../components/clubs/ClubExperienceList'
import { findExperienceDetail } from '../components/clubs/clubExperienceDetails'
import {
  ClubLevelTab,
  offersForTab,
  sameExperience,
} from '../components/clubs/clubExperienceUtils'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { apiService, Package } from '../services/api'
import { mergeWithExploreSamples } from '../data/exploreSamplePackages'

export const ClubExperienceResults: React.FC = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const [params, setSearchParams] = useSearchParams()
  const tab: ClubLevelTab = params.get('tab') === 'vip' ? 'vip' : 'gold'
  const name = (params.get('name') || '').trim()
  const showList = params.get('list') === '1'
  const detail = findExperienceDetail(tab, name)
  const accent = tab === 'vip' ? '#7B4DB8' : '#C9A227'

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (user && user.type !== 'customer') navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const resp = await apiService.getPackages()
      if (cancelled) return
      const list = Array.isArray(resp.data)
        ? resp.data.filter(pkg => pkg.is_active && pkg.status === 'approved')
        : []
      setPackages(mergeWithExploreSamples(list))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [])

  const matched = useMemo(
    () =>
      packages.filter(pkg =>
        offersForTab(pkg, tab).some(offer => sameExperience(offer.name, name)),
      ),
    [packages, tab, name],
  )

  const stats = useMemo(() => {
    const rated = matched.filter(pkg => typeof pkg.average_rating === 'number')
    const averageRating =
      rated.length > 0
        ? rated.reduce((sum, pkg) => sum + (pkg.average_rating || 0), 0) / rated.length
        : null
    const reviewCount = matched.reduce((sum, pkg) => sum + (pkg.total_comments || 0), 0)
    return {
      experienceCount: matched.length,
      averageRating,
      reviewCount,
    }
  }, [matched])

  const goHome = () => navigate(tab === 'vip' ? '/dashboard/clubs?tab=vip' : '/dashboard/clubs')
  const openList = () => {
    const next = new URLSearchParams(params)
    next.set('list', '1')
    setSearchParams(next)
  }
  const closeList = () => {
    const next = new URLSearchParams(params)
    next.delete('list')
    setSearchParams(next)
  }

  if (!user) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
        </div>
      </MobileDashboardLayout>
    )
  }

  if (showList) {
    if (loading) {
      return (
        <div className={`fixed inset-0 z-[80] ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="flex h-full items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-violet-500" />
          </div>
        </div>
      )
    }

    return (
      <ClubExperienceList
        title={detail?.name || name || 'تجربه'}
        packages={matched}
        isDark={isDark}
        accent={accent}
        userPos={userPos}
        isFavorite={isFavorite}
        onFavorite={toggleFavorite}
        onBack={detail ? closeList : goHome}
        onOpenBusiness={pkg => navigate(`/dashboard/business/${pkg.id}`)}
      />
    )
  }

  if (detail) {
    return (
      <ClubExperienceIntro
        detail={detail}
        accent={accent}
        experienceCount={stats.experienceCount}
        averageRating={stats.averageRating}
        reviewCount={stats.reviewCount}
        isDark={isDark}
        onBack={goHome}
        onViewExperiences={openList}
      />
    )
  }

  return <Navigate to={tab === 'vip' ? '/dashboard/clubs?tab=vip' : '/dashboard/clubs'} replace />
}
