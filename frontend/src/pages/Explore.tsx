import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ExplorePromoSlider } from '../components/dashboard/ExplorePromoSlider'
import { ExploreSearchOverlay } from '../components/explore/ExploreSearchOverlay'
import { ExploreMapView } from '../components/ExploreMapView'
import {
  CompactOfferCard,
  ExploreEmptySection,
  ExploreSectionHeader,
  SpecialOfferCard,
  TrendCard,
} from '../components/explore/ExploreSectionCards'
import { useExplorePackages } from '../hooks/useExplorePackages'
import { useFavorites } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Package } from '../services/api'
import {
  EXPLORE_CATEGORIES,
  matchCategoryIds,
  ExploreCategory,
} from '../constants/exploreCategories'
import { isSamplePackage } from '../data/exploreSamplePackages'
import {
  DEFAULT_EXPLORE_FILTERS,
  EXPLORE_PREVIEW_LIMITS,
  formatDistance,
  hasActiveExploreFilters,
  isExploreCitySelected,
  trendGrowth,
} from '../utils/exploreHelpers'

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

const FALLBACK_POPULAR_CITIES = [
  { id: -1, name: 'تهران' },
  { id: -2, name: 'مشهد' },
  { id: -3, name: 'اصفهان' },
  { id: -4, name: 'شیراز' },
  { id: -5, name: 'رشت' },
  { id: -6, name: 'کرج' },
]

const ExploreCustomerView: React.FC = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  const {
    packages,
    loading,
    error,
    userPos,
    filters,
    setFilters,
    availableCategories,
    specialOffers,
    nearYou,
    weeklyTrends,
  } = useExplorePackages()

  const specialOffersPreview = specialOffers.slice(0, EXPLORE_PREVIEW_LIMITS.special)
  const nearYouPreview = nearYou.slice(0, EXPLORE_PREVIEW_LIMITS.nearYou)
  const weeklyTrendsPreview = weeklyTrends.slice(0, EXPLORE_PREVIEW_LIMITS.trends)

  const popularCities = useMemo(() => {
    const counts = new Map<number, { id: number; name: string; count: number }>()
    packages.forEach(pkg => {
      if (pkg.city?.id && pkg.city?.name && !isSamplePackage(pkg)) {
        const existing = counts.get(pkg.city.id) ?? {
          id: pkg.city.id,
          name: pkg.city.name,
          count: 0,
        }
        existing.count += 1
        counts.set(pkg.city.id, existing)
      }
    })
    const fromData = [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(({ id, name }) => ({ id, name }))
    return fromData.length > 0 ? fromData : FALLBACK_POPULAR_CITIES
  }, [packages])

  const handleSelectCity = (cityId: number, cityName: string) => {
    if (isExploreCitySelected(filters, cityId, cityName)) {
      handleClearCity()
      return
    }
    if (cityId < 0) {
      setFilters(prev => ({
        ...prev,
        search: '',
        cities: [],
        selectedCityName: cityName,
        exploreCategoryId: null,
        categories: [],
      }))
      return
    }
    setFilters(prev => ({
      ...prev,
      cities: [cityId],
      selectedCityName: cityName,
      search: '',
      exploreCategoryId: null,
      categories: [],
    }))
  }

  const handleClearCity = () => {
    setFilters(prev => ({
      ...prev,
      cities: [],
      selectedCityName: null,
      search:
        prev.selectedCityName && (!prev.search || prev.search === prev.selectedCityName)
          ? ''
          : prev.search,
    }))
  }

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_EXPLORE_FILTERS })
  }

  const activeFilterParts: string[] = []
  if (filters.selectedCityName) activeFilterParts.push(filters.selectedCityName)
  else if (filters.search) activeFilterParts.push(filters.search)
  if (filters.hasGiftOnly) activeFilterParts.push('با هدیه')
  if (filters.nearMeOnly) activeFilterParts.push('نزدیک من')
  if (filters.highRatedOnly) activeFilterParts.push('امتیاز بالا')
  if (filters.sortBy === 'distance') activeFilterParts.push('نزدیک‌ترین')
  else if (filters.sortBy === 'rating') activeFilterParts.push('بیشترین امتیاز')
  else if (filters.sortBy === 'discount_high') activeFilterParts.push('بیشترین تخفیف')
  else if (filters.sortBy === 'newest') activeFilterParts.push('جدیدترین')

  const searchFieldLabel =
    activeFilterParts.length > 0
      ? activeFilterParts.join(' · ')
      : 'جستجوی باشگاه، هدیه یا برند...'

  const handleCategoryClick = (cat: ExploreCategory) => {
    if (filters.exploreCategoryId === cat.id) {
      setFilters(prev => ({
        ...prev,
        exploreCategoryId: null,
        categories: [],
        search: prev.selectedCityName ? prev.search : '',
      }))
      return
    }
    const ids = matchCategoryIds(cat, availableCategories)
    setFilters(prev => ({
      ...prev,
      exploreCategoryId: cat.id,
      categories: ids,
      search: prev.selectedCityName ? prev.search : '',
    }))
  }

  const handlePackageClick = (pkg: Package) => {
    if (isSamplePackage(pkg)) return
    navigate(`/dashboard/business/${pkg.id}`)
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

  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="pb-28 overflow-x-hidden bg-white dark:bg-slate-900" style={{ direction: 'rtl' }}>
        <div className="px-4 pt-3">
          <ExplorePromoSlider packages={packages} />
        </div>

        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={() => setSearchOverlayOpen(true)}
            className={`flex w-full items-center gap-2.5 rounded-full border px-4 py-3 text-right ${
              isDark
                ? 'border-slate-700 bg-slate-800'
                : 'border-gray-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.05)]'
            }`}
          >
            <svg
              className="h-[18px] w-[18px] shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span
              className={`min-w-0 flex-1 truncate text-[13px] ${
                activeFilterParts.length > 0
                  ? isDark
                    ? 'text-white'
                    : 'text-gray-800'
                  : isDark
                    ? 'text-slate-500'
                    : 'text-gray-400'
              }`}
            >
              {searchFieldLabel}
            </span>
            {hasActiveExploreFilters(filters) ? (
              <button
                type="button"
                aria-label="پاک کردن فیلترها"
                onClick={e => {
                  e.stopPropagation()
                  handleResetFilters()
                }}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : null}
          </button>
        </div>

        <div className="px-3 pt-4 pb-2">
          <div className="grid grid-cols-5 gap-y-4 gap-x-1">
            {[
              ...EXPLORE_CATEGORIES.slice(0, 5).reverse(),
              ...EXPLORE_CATEGORIES.slice(5, 10).reverse(),
            ].map(cat => {
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

        {error ? (
          <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <section className="mt-4 overflow-hidden">
          <ExploreSectionHeader
            title="پیشنهادهای مخصوص شما"
            icon="special"
            isDark={isDark}
            showViewAll={specialOffers.length > EXPLORE_PREVIEW_LIMITS.special}
            onViewAll={() => navigate('/dashboard/explore/special-offers')}
          />
          {specialOffersPreview.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 px-4">
              {specialOffersPreview.map(({ pkg, distanceKm }) => (
                <SpecialOfferCard
                  key={pkg.id}
                  pkg={pkg}
                  distanceLabel={formatDistance(distanceKm)}
                  favorited={isFavorite(pkg.id)}
                  onFavorite={e => toggleFavorite(pkg, e)}
                  onClick={() => handlePackageClick(pkg)}
                  inGrid
                />
              ))}
            </div>
          ) : (
            <div className="px-4">
              <ExploreEmptySection isDark={isDark} />
            </div>
          )}
        </section>

        <section className="mt-5 overflow-hidden">
          <ExploreSectionHeader
            title="نزدیک شما"
            icon="nearby"
            isDark={isDark}
            showViewAll={nearYou.length > EXPLORE_PREVIEW_LIMITS.nearYou}
            onViewAll={() => navigate('/dashboard/explore/near-you')}
          />
          {nearYouPreview.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5 px-4">
              {nearYouPreview.map(({ pkg, distanceKm }) => (
                <CompactOfferCard
                  key={pkg.id}
                  pkg={pkg}
                  distanceLabel={formatDistance(distanceKm)}
                  favorited={isFavorite(pkg.id)}
                  onFavorite={e => toggleFavorite(pkg, e)}
                  onClick={() => handlePackageClick(pkg)}
                  inGrid
                />
              ))}
            </div>
          ) : (
            <div className="px-4">
              <ExploreEmptySection isDark={isDark} />
            </div>
          )}
        </section>

        <section className="mt-5 mb-4 overflow-hidden">
          <ExploreSectionHeader
            title="ترندهای هفته"
            icon="trend"
            isDark={isDark}
            showViewAll={weeklyTrends.length > EXPLORE_PREVIEW_LIMITS.trends}
            onViewAll={() => navigate('/dashboard/explore/trends')}
          />
          {weeklyTrendsPreview.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5 px-4">
              {weeklyTrendsPreview.map(({ pkg }, index) => (
                <TrendCard
                  key={pkg.id}
                  pkg={pkg}
                  rank={index + 1}
                  growth={trendGrowth(pkg)}
                  favorited={isFavorite(pkg.id)}
                  onFavorite={e => toggleFavorite(pkg, e)}
                  onClick={() => handlePackageClick(pkg)}
                  inGrid
                />
              ))}
            </div>
          ) : (
            <div className="px-4">
              <ExploreEmptySection isDark={isDark} />
            </div>
          )}
        </section>
      </div>

      <ExploreSearchOverlay
        open={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        filters={filters}
        onSearchChange={value =>
          setFilters(prev => ({
            ...prev,
            search: value,
            selectedCityName: null,
            cities: [],
            exploreCategoryId: null,
            categories: [],
          }))
        }
        popularCities={popularCities}
        onSelectCity={handleSelectCity}
        onClearCity={handleClearCity}
        onSortChange={sortBy => setFilters(prev => ({ ...prev, sortBy }))}
        onGiftOnlyChange={hasGiftOnly => setFilters(prev => ({ ...prev, hasGiftOnly }))}
        onNearMeOnlyChange={nearMeOnly => setFilters(prev => ({ ...prev, nearMeOnly }))}
        onHighRatedOnlyChange={highRatedOnly =>
          setFilters(prev => ({ ...prev, highRatedOnly }))
        }
        onResetFilters={handleResetFilters}
        onOpenMap={() => setMapOpen(true)}
        isDark={isDark}
      />

      {mapOpen ? (
        <ExploreMapView
          packages={packages}
          onClose={() => setMapOpen(false)}
          initialUserPosition={userPos}
          autoLocateOnOpen={!userPos}
        />
      ) : null}
    </MobileDashboardLayout>
  )

  const DesktopLayout = () => (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden" style={{ direction: 'rtl' }}>
        <ExplorePromoSlider packages={packages} />

        <button
          type="button"
          onClick={() => setSearchOverlayOpen(true)}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 max-w-xl w-full text-right ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'
          }`}
        >
          <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className={`flex-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {searchFieldLabel}
          </span>
          {hasActiveExploreFilters(filters) ? (
            <button
              type="button"
              aria-label="پاک کردن فیلترها"
              onClick={e => {
                e.stopPropagation()
                handleResetFilters()
              }}
              className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : null}
        </button>

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
          <ExploreSectionHeader
            title="پیشنهادهای مخصوص شما"
            icon="special"
            isDark={isDark}
            showViewAll={specialOffers.length > EXPLORE_PREVIEW_LIMITS.special}
            onViewAll={() => navigate('/dashboard/explore/special-offers')}
          />
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
            {specialOffersPreview.map(({ pkg, distanceKm }) => (
              <SpecialOfferCard
                key={pkg.id}
                pkg={pkg}
                distanceLabel={formatDistance(distanceKm)}
                favorited={isFavorite(pkg.id)}
                onFavorite={e => toggleFavorite(pkg, e)}
                onClick={() => handlePackageClick(pkg)}
                wide
              />
            ))}
          </div>
          {specialOffersPreview.length === 0 ? (
            <ExploreEmptySection isDark={isDark} />
          ) : null}
        </div>

        <div>
          <ExploreSectionHeader
            title="نزدیک شما"
            icon="nearby"
            isDark={isDark}
            showViewAll={nearYou.length > EXPLORE_PREVIEW_LIMITS.nearYou}
            onViewAll={() => navigate('/dashboard/explore/near-you')}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            {nearYouPreview.map(({ pkg, distanceKm }) => (
              <CompactOfferCard
                key={pkg.id}
                pkg={pkg}
                distanceLabel={formatDistance(distanceKm)}
                favorited={isFavorite(pkg.id)}
                onFavorite={e => toggleFavorite(pkg, e)}
                onClick={() => handlePackageClick(pkg)}
                inGrid
              />
            ))}
          </div>
        </div>

        <div>
          <ExploreSectionHeader
            title="ترندهای هفته"
            icon="trend"
            isDark={isDark}
            showViewAll={weeklyTrends.length > EXPLORE_PREVIEW_LIMITS.trends}
            onViewAll={() => navigate('/dashboard/explore/trends')}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            {weeklyTrendsPreview.map(({ pkg }, index) => (
              <TrendCard
                key={pkg.id}
                pkg={pkg}
                rank={index + 1}
                growth={trendGrowth(pkg)}
                favorited={isFavorite(pkg.id)}
                onFavorite={e => toggleFavorite(pkg, e)}
                onClick={() => handlePackageClick(pkg)}
                inGrid
              />
            ))}
          </div>
        </div>
      </div>

      <ExploreSearchOverlay
        open={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        filters={filters}
        onSearchChange={value =>
          setFilters(prev => ({
            ...prev,
            search: value,
            selectedCityName: null,
            cities: [],
            exploreCategoryId: null,
            categories: [],
          }))
        }
        popularCities={popularCities}
        onSelectCity={handleSelectCity}
        onClearCity={handleClearCity}
        onSortChange={sortBy => setFilters(prev => ({ ...prev, sortBy }))}
        onGiftOnlyChange={hasGiftOnly => setFilters(prev => ({ ...prev, hasGiftOnly }))}
        onNearMeOnlyChange={nearMeOnly => setFilters(prev => ({ ...prev, nearMeOnly }))}
        onHighRatedOnlyChange={highRatedOnly =>
          setFilters(prev => ({ ...prev, highRatedOnly }))
        }
        onResetFilters={handleResetFilters}
        onOpenMap={() => setMapOpen(true)}
        isDark={isDark}
      />

      {mapOpen ? (
        <ExploreMapView
          packages={packages}
          onClose={() => setMapOpen(false)}
          initialUserPosition={userPos}
          autoLocateOnOpen={!userPos}
        />
      ) : null}
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
