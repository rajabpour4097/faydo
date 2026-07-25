import React, { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { SpecialOfferCard } from '../../components/explore/ExploreSectionCards'
import { favoriteToPackage, useFavorites } from '../../contexts/FavoritesContext'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { EXPLORE_CATEGORIES } from '../../constants/exploreCategories'

export const CustomerFavoritesPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

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

  return <CustomerFavoritesView />
}

const CustomerFavoritesView: React.FC = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { favorites, loading, isFavorite, toggleFavorite } = useFavorites()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    let items = [...favorites]
    if (search.trim()) {
      const term = search.toLowerCase()
      items = items.filter(
        f =>
          f.businessName.toLowerCase().includes(term) ||
          f.categoryName.toLowerCase().includes(term) ||
          f.giftText.toLowerCase().includes(term),
      )
    }
    if (categoryId) {
      const cat = EXPLORE_CATEGORIES.find(c => c.id === categoryId)
      if (cat) {
        items = items.filter(f =>
          cat.keywords.some(k => f.categoryName.toLowerCase().includes(k.toLowerCase())),
        )
      }
    }
    return items.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
  }, [favorites, search, categoryId])

  const handleClick = (packageId: number, isSample: boolean) => {
    if (isSample) return
    navigate(`/dashboard/business/${packageId}`)
  }

  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'

  const content = (
    <div className="pb-28" style={{ direction: 'rtl' }}>
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/dashboard"
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
            }`}
            style={{ boxShadow: cardShadow }}
            aria-label="بازگشت به خانه"
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
              علاقه‌مندی‌ها
            </h1>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {filtered.length.toLocaleString('fa-IR')} مورد
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
              placeholder="جستجو در علاقه‌مندی‌ها..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none ${
                isDark ? 'text-white placeholder:text-slate-500' : 'text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(v => !v)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
              filterOpen || categoryId
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
            <p
              className={`mb-2 text-[11px] font-semibold ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}
            >
              دسته‌بندی
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId(null)}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                  !categoryId
                    ? 'bg-teal-600 text-white'
                    : isDark
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                همه
              </button>
              {EXPLORE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                    categoryId === cat.id
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

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`rounded-2xl py-16 text-center ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`}
          >
            <p className="text-4xl mb-3">💜</p>
            <p className="text-sm font-semibold">
              {favorites.length === 0
                ? 'هنوز کسب‌وکاری به علاقه‌مندی‌ها اضافه نکرده‌اید'
                : 'موردی با این فیلتر یافت نشد'}
            </p>
            {favorites.length === 0 ? (
              <Link
                to="/dashboard/explore"
                className="inline-block mt-4 text-sm font-semibold text-teal-600"
              >
                رفتن به اکسپلور
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(fav => {
              const pkg = favoriteToPackage(fav)
              return (
                <SpecialOfferCard
                  key={fav.packageId}
                  pkg={pkg}
                  favorited={isFavorite(fav.packageId)}
                  onFavorite={e => toggleFavorite(pkg, e)}
                  onClick={() => handleClick(fav.packageId, fav.isSample)}
                  inGrid
                />
              )
            })}
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
