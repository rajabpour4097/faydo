import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Star, ChevronLeft } from 'lucide-react'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ExplorePromoSlider } from '../components/dashboard/ExplorePromoSlider'
import { apiService, Package, getFullImageUrl } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  EXPLORE_CATEGORIES,
  matchCategoryIds,
  ExploreCategory,
} from '../constants/exploreCategories'
import {
  mergeWithExploreSamples,
  isSamplePackage,
} from '../data/exploreSamplePackages'

interface FilterState {
  categories: number[]
  sortBy: 'discount_high' | 'discount_low' | 'newest' | ''
  search: string
  cities: number[]
  exploreCategoryId: string | null
}

function buildLogoUrl(pkg: Package): string {
  return getFullImageUrl(pkg.business_logo)
}

function buildCoverUrl(pkg: Package): string {
  return getFullImageUrl(pkg.business_image || pkg.gallery_images?.[0] || pkg.business_logo)
}

function extractCategoriesFromPackages(pkgs: Package[]) {
  const categoryMap = new Map<number, { id: number; name: string }>()
  pkgs.forEach(pkg => {
    if (pkg.business_category?.id && pkg.business_category?.name) {
      categoryMap.set(pkg.business_category.id, {
        id: pkg.business_category.id,
        name: pkg.business_category.name,
      })
    }
  })
  return Array.from(categoryMap.values()).sort((a, b) => {
    try { return a.name.localeCompare(b.name, 'fa') } catch { return a.name.localeCompare(b.name) }
  })
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const r = Math.PI / 180
  const dLat = (lat2 - lat1) * r
  const dLng = (lng2 - lng1) * r
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} متر`
  return `${km.toFixed(1)} کیلومتر`
}

function giftLabel(pkg: Package): string {
  if (pkg.elite_gift_gift) return pkg.elite_gift_gift
  if (pkg.elite_gift_title) return pkg.elite_gift_title
  if (pkg.discount_percentage) return `${pkg.discount_percentage}٪ تخفیف`
  if (pkg.specific_discount_title) return pkg.specific_discount_title
  return 'پیشنهاد ویژه'
}

export const Explore: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.type !== 'customer') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  if (!user) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </MobileDashboardLayout>
    )
  }

  if (user.type !== 'customer') {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center px-6">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">دسترسی محدود</h1>
            <p className="text-gray-600 dark:text-slate-400">این صفحه فقط برای مشتریان قابل دسترسی است</p>
          </div>
        </div>
      </MobileDashboardLayout>
    )
  }

  return <ExploreCustomerView />
}

const ExploreCustomerView: React.FC = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sortBy: '',
    search: '',
    cities: [],
    exploreCategoryId: null,
  })

  const availableCategories = useMemo(() => extractCategoriesFromPackages(packages), [packages])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getPackages()
        let dataArray: Package[] = []
        if (Array.isArray(response.data)) {
          dataArray = response.data
        } else if (response.data && Array.isArray((response.data as { results?: Package[] }).results)) {
          dataArray = (response.data as { results: Package[] }).results
        } else if (response.error) {
          if (!cancelled) setError('خطا در دریافت پکیج‌ها')
          return
        }
        if (!cancelled) {
          const real = dataArray.filter(
            pkg => pkg.is_active && pkg.status === 'approved' && pkg.is_complete,
          )
          setPackages(mergeWithExploreSamples(real))
        }
      } catch (err) {
        console.error('Error loading packages:', err)
        if (!cancelled) {
          setPackages(mergeWithExploreSamples([]))
          setError(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [])

  useEffect(() => {
    let filtered = [...packages]

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter(pkg =>
        pkg.business_name?.toLowerCase().includes(term) ||
        pkg.elite_gift_title?.toLowerCase().includes(term) ||
        pkg.elite_gift_gift?.toLowerCase().includes(term) ||
        pkg.business_category?.name?.toLowerCase().includes(term),
      )
    }

    if (filters.exploreCategoryId) {
      const cat = EXPLORE_CATEGORIES.find(c => c.id === filters.exploreCategoryId)
      filtered = filtered.filter(pkg => {
        if (isSamplePackage(pkg)) {
          return pkg.explore_category_id === filters.exploreCategoryId
        }
        if (filters.categories.length > 0) {
          return pkg.business_category && filters.categories.includes(pkg.business_category.id)
        }
        if (cat) {
          const name = (pkg.business_category?.name || '').toLowerCase()
          return cat.keywords.some(k => name.includes(k.toLowerCase()))
        }
        return true
      })
    } else if (filters.categories.length > 0) {
      filtered = filtered.filter(
        pkg =>
          !isSamplePackage(pkg) &&
          pkg.business_category &&
          filters.categories.includes(pkg.business_category.id),
      )
    }

    if (filters.cities.length > 0) {
      filtered = filtered.filter(pkg => pkg.city && filters.cities.includes(pkg.city.id))
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'discount_high':
          filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
          break
        case 'discount_low':
          filtered.sort((a, b) => (a.discount_percentage || 0) - (b.discount_percentage || 0))
          break
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
      }
    }

    setFilteredPackages(filtered)
  }, [packages, filters])

  const packagesWithDistance = useMemo(() => {
    return filteredPackages.map(pkg => {
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
      } else if (isSamplePackage(pkg)) {
        // فاصله تقریبی برای نمایش بهتر نمونه‌ها
        distanceKm = 0.25 + (Math.abs(pkg.id) % 18) * 0.12
      }
      return { pkg, distanceKm }
    })
  }, [filteredPackages, userPos])

  const specialOffers = useMemo(() => {
    const withGift = packagesWithDistance.filter(
      ({ pkg }) =>
        pkg.elite_gift_gift ||
        pkg.elite_gift_title ||
        (pkg.discount_percentage != null && pkg.discount_percentage > 0),
    )
    return (withGift.length > 0 ? withGift : packagesWithDistance).slice(0, 12)
  }, [packagesWithDistance])

  const nearYou = useMemo(() => {
    const located = packagesWithDistance
      .filter(({ distanceKm }) => distanceKm != null)
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
    return located.slice(0, 12)
  }, [packagesWithDistance])

  const weeklyTrends = useMemo(() => {
    return [...packagesWithDistance]
      .sort((a, b) => (b.pkg.average_rating || 0) - (a.pkg.average_rating || 0))
      .slice(0, 10)
  }, [packagesWithDistance])

  const handleCategoryClick = (cat: ExploreCategory) => {
    if (filters.exploreCategoryId === cat.id) {
      setFilters(prev => ({ ...prev, exploreCategoryId: null, categories: [], search: '' }))
      return
    }
    const ids = matchCategoryIds(cat, availableCategories)
    setFilters(prev => ({
      ...prev,
      exploreCategoryId: cat.id,
      categories: ids,
      search: '',
    }))
  }

  const handlePackageClick = (pkg: Package) => {
    if (isSamplePackage(pkg)) return
    navigate(`/dashboard/business/${pkg.id}`)
  }

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </MobileDashboardLayout>
    )
  }

  const SectionHeader = ({ title, onViewAll }: { title: string; onViewAll?: () => void }) => (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <button
        type="button"
        onClick={onViewAll}
        className="flex items-center gap-0.5 text-xs font-medium text-teal-600"
      >
        مشاهده همه
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
    </div>
  )

  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="pb-28" style={{ direction: 'rtl' }}>
        {/* Banner slider */}
        <div className="px-4 pt-3">
          <ExplorePromoSlider packages={packages} />
        </div>

        {/* Search — without filter button */}
        <div className="px-4 pt-4">
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              isDark ? 'bg-slate-800' : 'bg-gray-100'
            }`}
          >
            <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="جستجوی باشگاه، هدیه یا برند..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, exploreCategoryId: null, categories: [] }))}
              className={`flex-1 bg-transparent text-sm focus:outline-none ${
                isDark ? 'text-white placeholder:text-slate-500' : 'text-gray-900 placeholder:text-gray-400'
              }`}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, search: '', exploreCategoryId: null, categories: [] }))}
                className="text-gray-400"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 10 category icons — 2×5 */}
        <div className="px-3 pt-5 pb-2">
          <div className="grid grid-cols-5 gap-y-4 gap-x-1">
            {EXPLORE_CATEGORIES.map(cat => {
              const active = filters.exploreCategoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`flex h-[58px] w-[58px] items-center justify-center rounded-full transition-all ${
                      active
                        ? 'bg-teal-50 ring-2 ring-teal-500 shadow-md'
                        : isDark
                          ? 'bg-slate-800 shadow'
                          : 'bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]'
                    }`}
                  >
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="h-9 w-9 object-contain"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
                    />
                  </div>
                  <span
                    className={`max-w-[72px] text-center text-[10px] leading-tight font-medium ${
                      active
                        ? 'text-teal-700'
                        : isDark
                          ? 'text-slate-300'
                          : 'text-gray-700'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Special offers */}
        <section className="mt-5">
          <SectionHeader title="پیشنهادهای مخصوص شما" />
          <HorizontalRail>
            {specialOffers.length > 0 ? (
              specialOffers.map(({ pkg, distanceKm }) => (
                <SpecialOfferCard
                  key={pkg.id}
                  pkg={pkg}
                  distanceLabel={formatDistance(distanceKm)}
                  favorited={favorites.has(pkg.id)}
                  onFavorite={e => toggleFavorite(pkg.id, e)}
                  onClick={() => handlePackageClick(pkg)}
                />
              ))
            ) : (
              <EmptyRail isDark={isDark} />
            )}
          </HorizontalRail>
        </section>

        {/* Near you */}
        <section className="mt-6">
          <SectionHeader title="نزدیک شما" />
          <HorizontalRail>
            {nearYou.length > 0 ? (
              nearYou.map(({ pkg, distanceKm }) => (
                <CompactOfferCard
                  key={pkg.id}
                  pkg={pkg}
                  distanceLabel={formatDistance(distanceKm)}
                  onClick={() => handlePackageClick(pkg)}
                />
              ))
            ) : (
              <EmptyRail isDark={isDark} />
            )}
          </HorizontalRail>
        </section>

        {/* Weekly trends */}
        <section className="mt-6 mb-4">
          <SectionHeader title="ترندهای هفته" />
          <HorizontalRail>
            {weeklyTrends.length > 0 ? (
              weeklyTrends.map(({ pkg }, index) => (
                <TrendCard
                  key={pkg.id}
                  pkg={pkg}
                  rank={index + 1}
                  growth={12 + ((pkg.id * 7) % 20)}
                  onClick={() => handlePackageClick(pkg)}
                />
              ))
            ) : (
              <EmptyRail isDark={isDark} />
            )}
          </HorizontalRail>
        </section>
      </div>
    </MobileDashboardLayout>
  )

  const DesktopLayout = () => (
    <DashboardLayout>
      <div className="space-y-6" style={{ direction: 'rtl' }}>
        <ExplorePromoSlider packages={packages} />

        <div
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 max-w-xl ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'
          }`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="جستجوی باشگاه، هدیه یا برند..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-5 gap-4 max-w-3xl">
          {EXPLORE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition ${
                filters.exploreCategoryId === cat.id
                  ? 'bg-teal-50 ring-2 ring-teal-500'
                  : isDark
                    ? 'bg-slate-800 hover:bg-slate-750'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
              }`}
            >
              <img src={cat.icon} alt={cat.name} className="h-12 w-12 object-contain" />
              <span className="text-xs font-medium text-center">{cat.name}</span>
            </button>
          ))}
        </div>

        <div>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            پیشنهادهای مخصوص شما
          </h2>
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {specialOffers.map(({ pkg, distanceKm }) => (
              <SpecialOfferCard
                key={pkg.id}
                pkg={pkg}
                distanceLabel={formatDistance(distanceKm)}
                favorited={favorites.has(pkg.id)}
                onFavorite={e => toggleFavorite(pkg.id, e)}
                onClick={() => handlePackageClick(pkg)}
                wide
              />
            ))}
          </div>
          {specialOffers.length === 0 && (
            <p className="text-center text-gray-500 py-12">پکیجی یافت نشد</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <>
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
      <div className="lg:hidden">
        <MobileLayout />
      </div>
    </>
  )
}

// ─── shared UI pieces ─────────────────────────────────────────────────────────

const HorizontalRail: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar"
      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  )
}

const EmptyRail: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className={`shrink-0 w-full rounded-2xl py-10 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
    موردی برای نمایش نیست
  </div>
)

interface CardBaseProps {
  pkg: Package
  distanceLabel?: string
  onClick: () => void
}

const SpecialOfferCard: React.FC<
  CardBaseProps & {
    favorited?: boolean
    onFavorite?: (e: React.MouseEvent) => void
    wide?: boolean
  }
> = ({ pkg, distanceLabel, favorited, onFavorite, onClick, wide }) => {
  const [logoErr, setLogoErr] = useState(false)
  const cover = buildCoverUrl(pkg)
  const logo = buildLogoUrl(pkg)

  return (
    <div
      onClick={onClick}
      className={`shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_6px_20px_rgba(15,23,42,0.08)] dark:bg-slate-800 cursor-pointer active:scale-[0.98] transition-transform ${
        wide ? 'w-full' : 'w-[210px]'
      }`}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative">
        <div className="h-[120px] overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-600">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
        {distanceLabel && (
          <span className="absolute top-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {distanceLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onFavorite}
          className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
        >
          <Heart
            className={`h-3.5 w-3.5 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`}
          />
        </button>
        <div className="absolute -bottom-5 right-3 z-10">
          <div className="h-11 w-11 rounded-full border-[3px] border-white bg-white shadow-md overflow-hidden dark:border-slate-800">
            {logo && !logoErr ? (
              <img src={logo} alt="" className="h-full w-full object-cover" onError={() => setLogoErr(true)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-500 text-sm font-bold text-white">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pt-7 pb-3">
        <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">{pkg.business_name}</h3>
        <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-slate-400">
          {pkg.business_category?.name || 'کسب‌وکار'}
        </p>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-rose-500">
          <span>🎁</span>
          <span className="line-clamp-1 font-medium">{giftLabel(pkg)}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
              {pkg.average_rating?.toFixed?.(1) ?? pkg.average_rating ?? '—'}
            </span>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            مشاهده
          </span>
        </div>
      </div>
    </div>
  )
}

const CompactOfferCard: React.FC<CardBaseProps> = ({ pkg, distanceLabel, onClick }) => {
  const [logoErr, setLogoErr] = useState(false)
  const cover = buildCoverUrl(pkg)
  const logo = buildLogoUrl(pkg)

  return (
    <div
      onClick={onClick}
      className="w-[150px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:bg-slate-800 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative">
        <div className="h-[88px] bg-gradient-to-br from-sky-400 to-indigo-500 overflow-hidden">
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
        </div>
        {distanceLabel && (
          <span className="absolute top-1.5 right-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] text-white">
            {distanceLabel}
          </span>
        )}
        <div className="absolute -bottom-4 right-2.5">
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-white shadow dark:border-slate-800">
            {logo && !logoErr ? (
              <img src={logo} alt="" className="h-full w-full object-cover" onError={() => setLogoErr(true)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-500 text-[10px] font-bold text-white">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-2.5 pt-5 pb-2.5">
        <h3 className="truncate text-xs font-bold text-gray-900 dark:text-white">{pkg.business_name}</h3>
        <p className="mt-1 line-clamp-1 text-[10px] text-rose-500">🎁 {giftLabel(pkg)}</p>
        <div className="mt-1.5 flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold">{pkg.average_rating ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}

const TrendCard: React.FC<CardBaseProps & { rank: number; growth: number }> = ({
  pkg,
  rank,
  growth,
  onClick,
}) => {
  const [logoErr, setLogoErr] = useState(false)
  const cover = buildCoverUrl(pkg)
  const logo = buildLogoUrl(pkg)

  return (
    <div
      onClick={onClick}
      className="w-[150px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:bg-slate-800 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative">
        <div className="h-[88px] bg-gradient-to-br from-violet-400 to-fuchsia-500 overflow-hidden">
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
        </div>
        <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow">
          {rank}
        </span>
        <div className="absolute -bottom-4 right-2.5">
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-white shadow dark:border-slate-800">
            {logo && !logoErr ? (
              <img src={logo} alt="" className="h-full w-full object-cover" onError={() => setLogoErr(true)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-500 text-[10px] font-bold text-white">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-2.5 pt-5 pb-2.5">
        <h3 className="truncate text-xs font-bold text-gray-900 dark:text-white">{pkg.business_name}</h3>
        <p className="mt-0.5 truncate text-[10px] text-gray-500">{pkg.business_category?.name}</p>
        <p className="mt-1.5 text-[10px] font-semibold text-emerald-600">
          ↑ {growth}٪ نسبت به هفته قبل
        </p>
        <div className="mt-1 flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold">{pkg.average_rating ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
