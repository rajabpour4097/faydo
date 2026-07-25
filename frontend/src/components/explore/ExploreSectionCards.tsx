import React, { useState } from 'react'
import { Heart, Star, ChevronLeft, Sparkles, MapPin, Flame } from 'lucide-react'
import { Package } from '../../services/api'
import { buildCoverUrl, buildLogoUrl, giftLabel } from '../../utils/exploreHelpers'

interface CardBaseProps {
  pkg: Package
  distanceLabel?: string
  onClick: () => void
  inGrid?: boolean
  favorited?: boolean
  onFavorite?: (e: React.MouseEvent) => void
}

const FavoriteHeartButton: React.FC<{
  favorited?: boolean
  onFavorite?: (e: React.MouseEvent) => void
  size?: 'lg' | 'sm'
}> = ({ favorited, onFavorite, size = 'lg' }) => {
  const btnClass = size === 'lg' ? 'h-6 w-6 top-1.5 left-1.5' : 'h-[18px] w-[18px] top-1 left-1'
  const iconClass = size === 'lg' ? 'h-3.5 w-3.5' : 'h-3 w-3'

  return (
    <button
      type="button"
      onClick={onFavorite}
      aria-label={favorited ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      className={`absolute z-10 flex items-center justify-center rounded-full bg-white/90 shadow ${btnClass}`}
    >
      <Heart
        className={`${iconClass} ${
          favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
        }`}
      />
    </button>
  )
}

export const ExploreSectionHeader: React.FC<{
  title: string
  icon: 'special' | 'nearby' | 'trend'
  isDark: boolean
  onViewAll?: () => void
  showViewAll?: boolean
}> = ({ title, icon, isDark, onViewAll, showViewAll = true }) => {
  const HeaderIcon = icon === 'special' ? Sparkles : icon === 'nearby' ? MapPin : Flame
  const iconClass = icon === 'trend' ? 'text-rose-500' : 'text-teal-500'

  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2
        className={`flex items-center gap-1.5 text-[14px] font-extrabold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
        <HeaderIcon className={`h-4 w-4 ${iconClass}`} strokeWidth={2.2} />
      </h2>
      {showViewAll && onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-[10px] font-semibold text-teal-600"
        >
          مشاهده همه
          <ChevronLeft className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  )
}

export const SpecialOfferCard: React.FC<
  CardBaseProps & {
    favorited?: boolean
    onFavorite?: (e: React.MouseEvent) => void
    wide?: boolean
  }
> = ({ pkg, distanceLabel, favorited, onFavorite, onClick, wide, inGrid }) => {
  const [logoErr, setLogoErr] = useState(false)
  const cover = buildCoverUrl(pkg)
  const logo = buildLogoUrl(pkg)

  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-[13px] border border-gray-100 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-800 cursor-pointer active:scale-[0.98] transition-transform min-w-0 ${
        wide || inGrid ? 'w-full' : 'w-[calc((100vw-48px)/3)] shrink-0'
      }`}
    >
      <div className="relative">
        <div className="h-[82px] overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-600">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
        {distanceLabel ? (
          <span className="absolute top-1.5 right-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">
            {distanceLabel}
          </span>
        ) : null}
        <FavoriteHeartButton favorited={favorited} onFavorite={onFavorite} size="lg" />
        <div className="absolute -bottom-5 left-1/2 z-10 -translate-x-1/2">
          <div className="h-11 w-11 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-md dark:border-slate-800">
            {logo && !logoErr ? (
              <img
                src={logo}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setLogoErr(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-500 text-sm font-bold text-white">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-2 pb-2 pt-6 text-center">
        <h3 className="truncate text-[11px] font-extrabold text-gray-900 dark:text-white">
          {pkg.business_name}
        </h3>
        <p className="mt-0.5 truncate text-[9px] text-gray-500 dark:text-slate-400">
          {pkg.business_category?.name || 'کسب‌وکار'}
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-0.5 text-[9px] text-rose-500">
          <span className="text-[10px]">🎁</span>
          <span className="line-clamp-1 font-semibold">{giftLabel(pkg)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-semibold text-gray-700 dark:text-slate-200">
              {pkg.average_rating?.toFixed?.(1) ?? pkg.average_rating ?? '—'}
            </span>
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          </div>
          <span className="rounded-full bg-teal-50 px-2 py-1 text-[8px] font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            مشاهده
          </span>
        </div>
      </div>
    </div>
  )
}

export const CompactOfferCard: React.FC<CardBaseProps> = ({
  pkg,
  distanceLabel,
  onClick,
  inGrid,
  favorited,
  onFavorite,
}) => {
  const [logoErr, setLogoErr] = useState(false)
  const cover = buildCoverUrl(pkg)
  const logo = buildLogoUrl(pkg)

  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-800 cursor-pointer active:scale-[0.98] transition-transform min-w-0 ${
        inGrid ? 'w-full' : 'w-[calc((100vw-56px)/4)] shrink-0'
      }`}
    >
      <div className="relative">
        <div className="h-[68px] overflow-hidden bg-gradient-to-br from-sky-400 to-indigo-500">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
        {distanceLabel ? (
          <span className="absolute top-1 right-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[7px] font-medium text-white backdrop-blur-sm">
            {distanceLabel}
          </span>
        ) : null}
        <FavoriteHeartButton favorited={favorited} onFavorite={onFavorite} size="sm" />
        <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2">
          <div className="h-9 w-9 overflow-hidden rounded-full border-[2.5px] border-white bg-white shadow dark:border-slate-800">
            {logo && !logoErr ? (
              <img
                src={logo}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setLogoErr(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-500 text-[10px] font-bold text-white">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-1.5 pb-2 pt-[22px] text-center">
        <h3 className="truncate text-[9px] font-extrabold text-gray-900 dark:text-white">
          {pkg.business_name}
        </h3>
        <p className="mt-0.5 truncate text-[7px] text-gray-400">
          {pkg.business_category?.name || 'کسب‌وکار'}
        </p>
        <p className="mt-1 line-clamp-1 text-[8px] font-semibold text-rose-500">
          🎁 {giftLabel(pkg)}
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-0.5">
          <span className="text-[8px] font-semibold text-gray-600 dark:text-slate-300">
            {pkg.average_rating ?? '—'}
          </span>
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
        </div>
      </div>
    </div>
  )
}

export const TrendCard: React.FC<CardBaseProps & { rank: number; growth: number }> = ({
  pkg,
  rank,
  growth,
  onClick,
  inGrid,
  favorited,
  onFavorite,
}) => {
  const [logoErr, setLogoErr] = useState(false)
  const cover = buildCoverUrl(pkg)
  const logo = buildLogoUrl(pkg)

  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-800 cursor-pointer active:scale-[0.98] transition-transform min-w-0 ${
        inGrid ? 'w-full' : 'w-[calc((100vw-56px)/4)] shrink-0'
      }`}
    >
      <div className="relative">
        <div className="h-[68px] overflow-hidden bg-gradient-to-br from-violet-400 to-fuchsia-500">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
        <span className="absolute top-1 right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-teal-600 text-[8px] font-bold text-white shadow">
          {rank}
        </span>
        <FavoriteHeartButton favorited={favorited} onFavorite={onFavorite} size="sm" />
        <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2">
          <div className="h-9 w-9 overflow-hidden rounded-full border-[2.5px] border-white bg-white shadow dark:border-slate-800">
            {logo && !logoErr ? (
              <img
                src={logo}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setLogoErr(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-teal-500 text-[10px] font-bold text-white">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-1.5 pb-2 pt-[22px] text-center">
        <h3 className="truncate text-[9px] font-extrabold text-gray-900 dark:text-white">
          {pkg.business_name}
        </h3>
        <p className="mt-0.5 truncate text-[7px] text-gray-400">{pkg.business_category?.name}</p>
        <p className="mt-1.5 truncate text-[8px] font-semibold text-emerald-600">
          ↑ {growth}٪ نسبت به هفته قبل
        </p>
        <div className="mt-1 flex items-center justify-center gap-0.5">
          <span className="text-[8px] font-semibold text-gray-600 dark:text-slate-300">
            {pkg.average_rating ?? '—'}
          </span>
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
        </div>
      </div>
    </div>
  )
}

export const ExploreEmptySection: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div
    className={`rounded-2xl py-10 text-center text-sm ${
      isDark ? 'text-slate-400' : 'text-gray-400'
    }`}
  >
    موردی برای نمایش نیست
  </div>
)
