import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import {
  CompactOfferCard,
  ExploreEmptySection,
  SpecialOfferCard,
  TrendCard,
} from '../components/explore/ExploreSectionCards'
import { useExplorePackages } from '../hooks/useExplorePackages'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { EXPLORE_CATEGORIES, ExploreCategory, matchCategoryIds } from '../constants/exploreCategories'
import { isSamplePackage } from '../data/exploreSamplePackages'
import { Package } from '../services/api'
import {
  EXPLORE_SECTION_META,
  ExploreSectionSlug,
  formatDistance,
  isExploreSectionSlug,
  trendGrowth,
} from '../utils/exploreHelpers'

export const ExploreSectionList: React.FC = () => {
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
    return <Navigate to="/dashboard" replace />
  }

  return <ExploreSectionListView />
}

const ExploreSectionListView: React.FC = () => {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)

  if (!isExploreSectionSlug(section)) {
    return <Navigate to="/dashboard/explore" replace />
  }

  const sectionSlug: ExploreSectionSlug = section
  const meta = EXPLORE_SECTION_META[sectionSlug]

  const {
    loading,
    error,
    filters,
    setFilters,
    availableCategories,
    specialOffers,
    nearYou,
    weeklyTrends,
  } = useExplorePackages({ sortBy: meta.defaultSort })

  const items = useMemo(() => {
    if (sectionSlug === 'special-offers') return specialOffers
    if (sectionSlug === 'near-you') return nearYou
    return weeklyTrends
  }, [sectionSlug, specialOffers, nearYou, weeklyTrends])

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

  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'

  const sortOptions =
    sectionSlug === 'near-you'
      ? [
          { value: 'distance', label: 'نزدیک‌ترین' },
          { value: 'rating', label: 'بیشترین امتیاز' },
          { value: 'discount_high', label: 'بیشترین تخفیف' },
          { value: 'newest', label: 'جدیدترین' },
        ]
      : sectionSlug === 'trends'
        ? [
            { value: 'rating', label: 'بیشترین امتیاز' },
            { value: 'discount_high', label: 'بیشترین تخفیف' },
            { value: 'newest', label: 'جدیدترین' },
          ]
        : [
            { value: 'discount_high', label: 'بیشترین تخفیف' },
            { value: 'discount_low', label: 'کمترین تخفیف' },
            { value: 'newest', label: 'جدیدترین' },
            { value: 'rating', label: 'بیشترین امتیاز' },
          ]

  const content = (
    <div className="pb-28" style={{ direction: 'rtl' }}>
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/dashboard/explore"
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
            }`}
            style={{ boxShadow: cardShadow }}
            aria-label="بازگشت به اکسپلور"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 6L8 12L14 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div>
            <h1
              className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {meta.title}
            </h1>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {items.length.toLocaleString('fa-IR')} مورد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex flex-1 items-center gap-2.5 rounded-full border px-4 py-3 ${
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
            <input
              type="search"
              placeholder="جستجوی باشگاه، هدیه یا برند..."
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  search: e.target.value,
                  exploreCategoryId: null,
                  categories: [],
                }))
              }
              className={`min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none ${
                isDark ? 'text-white placeholder:text-slate-500' : 'text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(v => !v)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
              filterOpen || filters.exploreCategoryId || filters.sortBy
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-300'
                  : 'border-gray-200 bg-white text-gray-600'
            }`}
            aria-label="فیلتر"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {filterOpen ? (
          <div
            className={`mt-3 rounded-2xl border p-3 ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
            }`}
          >
            <label
              className={`mb-1.5 block text-[11px] font-semibold ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}
            >
              مرتب‌سازی
            </label>
            <select
              value={filters.sortBy}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  sortBy: e.target.value as typeof filters.sortBy,
                }))
              }
              className={`mb-3 w-full rounded-xl border px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDark
                  ? 'border-slate-600 bg-slate-900 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-900'
              }`}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <p
              className={`mb-2 text-[11px] font-semibold ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}
            >
              دسته‌بندی
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPLORE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                    filters.exploreCategoryId === cat.id
                      ? 'bg-teal-600 text-white'
                      : isDark
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="px-4 pt-4">
        {items.length === 0 ? (
          <ExploreEmptySection isDark={isDark} />
        ) : sectionSlug === 'special-offers' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(({ pkg, distanceKm }) => (
              <SpecialOfferCard
                key={pkg.id}
                pkg={pkg}
                distanceLabel={formatDistance(distanceKm)}
                favorited={favorites.has(pkg.id)}
                onFavorite={e => toggleFavorite(pkg.id, e)}
                onClick={() => handlePackageClick(pkg)}
                inGrid
              />
            ))}
          </div>
        ) : sectionSlug === 'near-you' ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(({ pkg, distanceKm }) => (
              <CompactOfferCard
                key={pkg.id}
                pkg={pkg}
                distanceLabel={formatDistance(distanceKm)}
                onClick={() => handlePackageClick(pkg)}
                inGrid
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(({ pkg }, index) => (
              <TrendCard
                key={pkg.id}
                pkg={pkg}
                rank={index + 1}
                growth={trendGrowth(pkg)}
                onClick={() => handlePackageClick(pkg)}
                inGrid
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">
        <DashboardLayout>
          <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
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
