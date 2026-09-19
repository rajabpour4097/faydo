import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Flame, Sparkle, Star } from 'lucide-react'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ClubBusinessCard } from '../components/clubs/ClubExperienceBrowse'
import { ClubExperienceIntro } from '../components/clubs/ClubExperienceIntro'
import { findExperienceDetail } from '../components/clubs/clubExperienceDetails'
import {
  ClubLevelTab,
  faNum,
  offersForTab,
  sameExperience,
} from '../components/clubs/clubExperienceUtils'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { apiService, Package, PointsSummary } from '../services/api'
import { mergeWithExploreSamples } from '../data/exploreSamplePackages'
import { formatDistance, haversineKm } from '../utils/exploreHelpers'
import { hasReachedClubTab } from '../constants/membershipTiers'

type SortFilter = 'suggested' | 'nearest' | 'rating' | 'popular'

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
  const [sortBy, setSortBy] = useState<SortFilter>('suggested')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [points, setPoints] = useState<PointsSummary | null>(null)

  useEffect(() => {
    if (user && user.type !== 'customer') navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    apiService.getPointsSummary().then(res => {
      if (res.data) setPoints(res.data)
    })
  }, [])

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

  const filtered = useMemo(() => {
    const matched = packages.filter(pkg =>
      offersForTab(pkg, tab).some(offer => sameExperience(offer.name, name)),
    )

    const withDistance = matched.map(pkg => {
      let distanceKm: number | null = null
      if (
        userPos &&
        pkg.business_location_latitude != null &&
        pkg.business_location_longitude != null
      ) {
        distanceKm = haversineKm(
          userPos[0],
          userPos[1],
          pkg.business_location_latitude,
          pkg.business_location_longitude,
        )
      }
      return { pkg, distanceKm }
    })

    withDistance.sort((a, b) => {
      if (sortBy === 'nearest') return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
      if (sortBy === 'rating') return (b.pkg.average_rating ?? 0) - (a.pkg.average_rating ?? 0)
      if (sortBy === 'popular') return (b.pkg.total_comments ?? 0) - (a.pkg.total_comments ?? 0)
      const score = (pkg: Package) =>
        (pkg.average_rating ?? 0) * 10 + (pkg.total_comments ?? 0) / 20 + (pkg.has_vip_plus ? 5 : 0)
      return score(b.pkg) - score(a.pkg)
    })

    return withDistance
  }, [packages, tab, name, sortBy, userPos])

  const stats = useMemo(() => {
    const rated = filtered.filter(item => typeof item.pkg.average_rating === 'number')
    const averageRating =
      rated.length > 0
        ? rated.reduce((sum, item) => sum + (item.pkg.average_rating || 0), 0) / rated.length
        : null
    const reviewCount = filtered.reduce((sum, item) => sum + (item.pkg.total_comments || 0), 0)
    return {
      experienceCount: filtered.length,
      averageRating,
      reviewCount,
    }
  }, [filtered])

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

  if (!showList && detail) {
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

  const LoadingView = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
    </div>
  )

  const content = (
    <div className="-mx-1 bg-white dark:bg-slate-900" style={{ direction: 'rtl' }}>
      <header className="px-1 pb-3 pt-1">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={detail ? closeList : goHome}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
            }`}
            aria-label="بازگشت"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <h1 className={`mt-1 text-center text-[22px] font-bold ${isDark ? 'text-white' : 'text-[#2F2F2F]'}`}>
          {detail?.name || name || 'تجربه'}
        </h1>
        {detail ? (
          <p className={`mt-1 text-center text-[12px] ${isDark ? 'text-slate-400' : 'text-[#9A9A9A]'}`}>
            {detail.headline}
          </p>
        ) : null}
      </header>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={sortBy === 'suggested'} onClick={() => setSortBy('suggested')}>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          پیشنهاد فایدو
        </FilterChip>
        <FilterChip active={sortBy === 'nearest'} onClick={() => setSortBy('nearest')}>
          نزدیک‌ترین
          <ChevronDown className="h-3 w-3" />
        </FilterChip>
        <FilterChip active={sortBy === 'rating'} onClick={() => setSortBy('rating')}>
          بالاترین امتیاز
        </FilterChip>
        <FilterChip active={sortBy === 'popular'} onClick={() => setSortBy('popular')}>
          محبوب‌ترین
          <Flame className="h-3 w-3 text-orange-500" />
        </FilterChip>
      </div>

      <p className={`mb-3 flex items-center gap-1 text-[12px] ${isDark ? 'text-slate-400' : 'text-[#7A7A7A]'}`}>
        <Sparkle className="h-3.5 w-3.5 text-orange-400" />
        {faNum(filtered.length)} تجربه ویژه پیدا شد
      </p>

      <div className="space-y-3 pb-6">
        {filtered.map(({ pkg, distanceKm }) => (
          <ClubBusinessCard
            key={pkg.id}
            pkg={pkg}
            tab={tab}
            selectedName={name}
            distanceLabel={formatDistance(distanceKm)}
            favorited={isFavorite(pkg.id)}
            onFavorite={e => toggleFavorite(pkg, e)}
            onClick={() => navigate(`/dashboard/business/${pkg.id}`)}
            isDark={isDark}
            locked={tab === 'vip' && !hasReachedClubTab('vip', points)}
          />
        ))}
        {filtered.length === 0 && !loading && (
          <div className={`rounded-2xl px-4 py-8 text-center ${isDark ? 'bg-slate-800' : 'bg-[#F7F4EF]'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              کسب‌وکاری برای این تجربه پیدا نشد
            </p>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
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

  return (
    <>
      <div className="hidden lg:block">
        <DashboardLayout>
          <div className="mx-auto max-w-[480px] overflow-hidden rounded-[28px] bg-white px-4 py-3 dark:bg-slate-900">
            {content}
          </div>
        </DashboardLayout>
      </div>
      <div className="lg:hidden">
        <MobileDashboardLayout>
          <div className="px-4 py-3">{content}</div>
        </MobileDashboardLayout>
      </div>
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
        active
          ? 'border-gray-800 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
          : 'border-gray-200 bg-white text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
