import React, { useMemo, useState } from 'react'
import { ChevronLeft, Heart, Search, SlidersHorizontal, Star } from 'lucide-react'
import moment from 'moment-jalaali'
import { Package } from '../../services/api'
import { clubThemeKey, faNum } from './clubExperienceUtils'
import { buildCoverUrl, haversineKm } from '../../utils/exploreHelpers'

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

type ClubFilter = 'all' | 'taste' | 'wellness' | 'lifestyle'
export type ExperienceSort = 'popular' | 'rating' | 'nearest'

const CLUB_FILTERS: { id: ClubFilter; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'taste', label: 'طعم‌ها' },
  { id: 'wellness', label: 'تندرستی' },
  { id: 'lifestyle', label: 'سبک زندگی' },
]

const SORT_OPTIONS: { id: ExperienceSort; label: string }[] = [
  { id: 'popular', label: 'محبوب‌ترین' },
  { id: 'rating', label: 'بالاترین امتیاز' },
  { id: 'nearest', label: 'نزدیک‌ترین' },
]

interface ClubExperienceListProps {
  title: string
  packages: Package[]
  isDark: boolean
  accent: string
  userPos: [number, number] | null
  isFavorite: (packageId: number) => boolean
  onFavorite: (pkg: Package, e: React.MouseEvent) => void
  onBack: () => void
  onOpenBusiness: (pkg: Package) => void
}

export const ClubExperienceList: React.FC<ClubExperienceListProps> = ({
  title,
  packages,
  isDark,
  accent,
  userPos,
  isFavorite,
  onFavorite,
  onBack,
  onOpenBusiness,
}) => {
  const [clubFilter, setClubFilter] = useState<ClubFilter>('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<ExperienceSort>('popular')
  const [sortOpen, setSortOpen] = useState(false)

  const rows = useMemo(() => {
    const term = query.trim()
    const list = packages.filter(pkg => {
      if (clubFilter !== 'all' && clubThemeKey(pkg.club_name || pkg.business_category?.name) !== clubFilter) {
        return false
      }
      if (!term) return true
      const haystack = `${pkg.business_name} ${pkg.business_category?.name || ''} ${pkg.club_name || ''}`
      return haystack.includes(term)
    })

    const withDistance = list.map(pkg => {
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
      return (b.pkg.total_comments ?? 0) - (a.pkg.total_comments ?? 0)
    })

    return withDistance
  }, [packages, clubFilter, query, sortBy, userPos])

  const currentSortLabel = SORT_OPTIONS.find(option => option.id === sortBy)?.label || 'محبوب‌ترین'

  return (
    <div
      className={`fixed inset-0 z-[80] ${isDark ? 'bg-slate-950' : 'bg-white'}`}
      style={{ direction: 'rtl' }}
    >
      <div
        className="mx-auto flex h-full w-full max-w-[430px] flex-col px-4"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
      >
        <header className="relative shrink-0 pb-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            className={`absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
            aria-label="بازگشت"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
          <h1 className={`text-center text-[20px] font-bold ${isDark ? 'text-white' : 'text-[#2F2F2F]'}`}>
            {title}
          </h1>
          <p className={`mt-0.5 text-center text-[12px] ${isDark ? 'text-slate-400' : 'text-[#9A9A9A]'}`}>
            {faNum(packages.length)} تجربه فعال
          </p>
        </header>

        <div className="no-scrollbar mb-3 flex shrink-0 gap-2 overflow-x-auto pb-0.5">
          {CLUB_FILTERS.map(filter => {
            const active = clubFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setClubFilter(filter.id)}
                className={`min-w-[76px] shrink-0 rounded-[16px] px-5 py-2.5 text-center text-[13px] font-bold ${
                  active
                    ? 'text-white'
                    : isDark
                      ? 'border border-slate-600 text-slate-300'
                      : 'border border-[#E6E6E6] bg-white text-[#6A6A6A]'
                }`}
                style={active ? { background: accent } : undefined}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <label
          className={`mb-3 flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 ${
            isDark ? 'bg-slate-800' : 'bg-[#F6F6F8]'
          }`}
        >
          <Search className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-[#B0B0B0]'}`} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="جستجوی کسب‌وکار"
            className={`w-full bg-transparent text-[13px] outline-none ${
              isDark ? 'text-white placeholder:text-slate-500' : 'text-gray-700 placeholder:text-[#B8B8B8]'
            }`}
          />
        </label>

        <div className="relative mb-3 shrink-0">
          <button
            type="button"
            onClick={() => setSortOpen(open => !open)}
            className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-[#EFEFEF] bg-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-[#7B4DB8]" />
              <span className={`text-[13px] ${isDark ? 'text-slate-200' : 'text-[#4A4A4A]'}`}>
                مرتب‌سازی : {currentSortLabel}
              </span>
            </span>
            <SlidersHorizontal className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-[#7A7A7A]'}`} />
          </button>
          {sortOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 bg-transparent"
                aria-label="بستن مرتب‌سازی"
                onClick={() => setSortOpen(false)}
              />
            <div
              className={`absolute left-0 right-0 top-[110%] z-20 overflow-hidden rounded-2xl border shadow-[0_12px_32px_rgba(15,23,42,0.12)] ${
                isDark ? 'divide-y divide-slate-700 border-slate-700 bg-slate-800' : 'divide-y divide-[#F1F1F1] border-[#EFEFEF] bg-white'
              }`}
            >
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSortBy(option.id)
                    setSortOpen(false)
                  }}
                  className={`block w-full px-4 py-3 text-right text-[13px] ${
                    sortBy === option.id
                      ? 'font-bold text-[#7B4DB8]'
                      : isDark
                        ? 'text-slate-200'
                        : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-8">
          {rows.map(({ pkg }) => (
            <BusinessRow
              key={pkg.id}
              pkg={pkg}
              isDark={isDark}
              favorited={isFavorite(pkg.id)}
              onFavorite={e => onFavorite(pkg, e)}
              onClick={() => onOpenBusiness(pkg)}
            />
          ))}
          {rows.length === 0 && (
            <p className={`py-10 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              کسب‌وکاری برای این تجربه پیدا نشد
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function BusinessRow({
  pkg,
  isDark,
  favorited,
  onFavorite,
  onClick,
}: {
  pkg: Package
  isDark: boolean
  favorited: boolean
  onFavorite: (e: React.MouseEvent) => void
  onClick: () => void
}) {
  const cover = buildCoverUrl(pkg)
  const rating = pkg.average_rating
  const comments = pkg.total_comments ?? 0
  const until = formatUntilDate(pkg)

  return (
    <article
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-[22px] p-2.5 ${
        isDark ? 'bg-slate-800' : 'bg-[#F7F6F8]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-[15px] font-bold ${isDark ? 'text-white' : 'text-[#2F2F2F]'}`}>
          {pkg.business_name}
        </h3>
        <p className={`mt-0.5 text-[12px] ${isDark ? 'text-slate-400' : 'text-[#A0A0A0]'}`}>
          {pkg.business_category?.name || pkg.club_name || 'کسب‌وکار'}
        </p>
        {until ? (
          <span className="mt-2 inline-flex rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#7B4DB8]">
            {until}
          </span>
        ) : null}
      </div>

      <div className="shrink-0 text-center">
        <div className="flex items-center justify-center gap-0.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className={`text-[12px] font-semibold ${isDark ? 'text-slate-100' : 'text-[#3A3A3A]'}`}>
            {typeof rating === 'number' ? rating.toFixed(1) : '—'}
          </span>
        </div>
        <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-[#A8A8A8]'}`}>
          ({faNum(comments)})
        </p>
      </div>

      <div className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-[18px] bg-gray-100">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : null}
        <button
          type="button"
          onClick={onFavorite}
          className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/92 shadow"
          aria-label="علاقه‌مندی"
        >
          <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
        </button>
      </div>
    </article>
  )
}

function formatUntilDate(pkg: Package): string | null {
  const source = pkg.end_date
    ? moment(pkg.end_date)
    : pkg.days_remaining && pkg.days_remaining > 0
      ? moment().add(pkg.days_remaining, 'days')
      : null
  if (!source || !source.isValid()) return null
  const month = PERSIAN_MONTHS[source.jMonth()] || ''
  return `فقط تا ${source.jDate()} ${month}`
}
