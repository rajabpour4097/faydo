import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Flame, Search, Sparkle, Star } from 'lucide-react'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ClubBusinessCard } from '../components/clubs/ClubExperienceBrowse'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { apiService, Package } from '../services/api'
import { mergeWithExploreSamples } from '../data/exploreSamplePackages'
import { formatDistance, haversineKm } from '../utils/exploreHelpers'
import { CLUB_SEARCH_SUGGESTION, searchClubBusinesses } from '../utils/clubSmartSearch'

type SortFilter = 'suggested' | 'nearest' | 'rating' | 'popular'

function faNum(n: number) {
  return n.toLocaleString('fa-IR')
}

export const ClubSearchResults: React.FC = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim()

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortFilter>('suggested')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [draft, setDraft] = useState(query)

  useEffect(() => {
    setDraft(query)
  }, [query])

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

  const search = useMemo(() => searchClubBusinesses(query, packages), [query, packages])

  const ranked = useMemo(() => {
    const withDistance = search.hits.map(hit => {
      let distanceKm: number | null = null
      if (
        userPos &&
        hit.pkg.business_location_latitude != null &&
        hit.pkg.business_location_longitude != null
      ) {
        distanceKm = haversineKm(
          userPos[0],
          userPos[1],
          hit.pkg.business_location_latitude,
          hit.pkg.business_location_longitude,
        )
      }
      return { ...hit, distanceKm }
    })

    withDistance.sort((a, b) => {
      if (sortBy === 'nearest') return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
      if (sortBy === 'rating') return (b.pkg.average_rating ?? 0) - (a.pkg.average_rating ?? 0)
      if (sortBy === 'popular') return (b.pkg.total_comments ?? 0) - (a.pkg.total_comments ?? 0)
      return b.score - a.score
    })
    return withDistance
  }, [search.hits, sortBy, userPos])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const term = draft.trim()
    if (!term) return
    navigate(`/dashboard/clubs/search?q=${encodeURIComponent(term)}`)
  }

  const LoadingView = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
    </div>
  )

  const content = (
    <div className="-mx-1 bg-white dark:bg-slate-900" style={{ direction: 'rtl' }}>
      <header className="px-1 pb-3 pt-1">
        <div className="flex items-center justify-between">
          <p className={`text-[13px] font-semibold ${isDark ? 'text-violet-300' : 'text-[#7B5CB8]'}`}>
            {search.mode === 'smart' ? 'جستجوی هوشمند' : 'جستجوی ساده'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/clubs')}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
            }`}
            aria-label="بازگشت"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <h1 className={`mt-1 text-[20px] font-bold ${isDark ? 'text-white' : 'text-[#363636]'}`}>
          نتایج جستجو
        </h1>
        {query ? (
          <p className={`mt-1 text-[12px] ${isDark ? 'text-slate-400' : 'text-[#8A8A8A]'}`}>
            {query}
          </p>
        ) : null}

        <form onSubmit={submitSearch} className="relative mt-3">
          <Search
            className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDark ? 'text-slate-400' : 'text-[#B0B0B0]'
            }`}
          />
          <input
            type="search"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="کلمه یا توصیف تجربه را بنویسید..."
            className={`w-full rounded-full border-0 py-3 pr-11 pl-12 text-[12px] outline-none ${
              isDark ? 'bg-slate-800 text-white' : 'bg-[#F3F2F7] text-gray-700'
            }`}
          />
          <button
            type="submit"
            className="absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7B5CB8] text-white"
            aria-label="جستجو"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {search.intents.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {search.intents.map(intent => (
              <span
                key={intent.id}
                className="rounded-full bg-[#7B5CB8]/10 px-2.5 py-1 text-[11px] font-semibold text-[#7B5CB8]"
              >
                {intent.label}
              </span>
            ))}
          </div>
        )}
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
        {faNum(ranked.length)} تجربه ویژه پیدا شد
      </p>

      <div className="space-y-3 pb-6">
        {ranked.map(({ pkg, distanceKm, matchedTab, matchedName }) => (
          <ClubBusinessCard
            key={pkg.id}
            pkg={pkg}
            tab={matchedTab}
            selectedName={matchedName}
            distanceLabel={formatDistance(distanceKm)}
            favorited={isFavorite(pkg.id)}
            onFavorite={e => toggleFavorite(pkg, e)}
            onClick={() => navigate(`/dashboard/business/${pkg.id}`)}
            isDark={isDark}
          />
        ))}
        {ranked.length === 0 && !loading && (
          <div className={`rounded-2xl px-4 py-8 text-center ${isDark ? 'bg-slate-800' : 'bg-[#F7F4EF]'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              کسب‌وکاری برای این جستجو پیدا نشد
            </p>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/clubs/search?q=${encodeURIComponent(CLUB_SEARCH_SUGGESTION)}`)}
              className="mt-3 text-[12px] font-semibold text-[#7B5CB8]"
            >
              پیشنهاد: {CLUB_SEARCH_SUGGESTION}
            </button>
          </div>
        )}
      </div>
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
