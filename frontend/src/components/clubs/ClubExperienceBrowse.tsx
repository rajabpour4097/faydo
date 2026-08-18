import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cake,
  ChevronDown,
  ChevronLeft,
  Clover,
  Coffee,
  Crown,
  Flame,
  Gift,
  Heart,
  MapPin,
  Percent,
  RefreshCw,
  Sparkle,
  Star,
  Tag,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { ClubItem, Package, PackageExperienceOffer, VipExperienceCategory } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { useFavorites } from '../../contexts/FavoritesContext'
import { buildCoverUrl, formatDistance, haversineKm } from '../../utils/exploreHelpers'
import { mergeWithExploreSamples } from '../../data/exploreSamplePackages'
import tasteImage from '../../assets/clubs/taste.png'
import wellnessImage from '../../assets/clubs/wellness.png'
import lifestyleImage from '../../assets/clubs/lifestyle.png'

type ClubThemeKey = 'taste' | 'wellness' | 'lifestyle'
type LevelTab = 'gold' | 'vip'
type SortFilter = 'suggested' | 'nearest' | 'rating' | 'popular'

const GOLD_FALLBACK: { name: string; description: string; Icon: LucideIcon }[] = [
  { name: 'خوشامدگویی', description: 'پذیرایی گرم در لحظه ورود', Icon: Coffee },
  { name: 'هدیه کوچک', description: 'یک یادگاری کوچک از برند', Icon: Gift },
  { name: 'توجه ویژه', description: 'رزرو بهتر و پذیرایی خاص', Icon: Heart },
  { name: 'پیشنهاد اختصاصی', description: 'پیشنهادهایی که فقط برای شماست', Icon: Tag },
  { name: 'امتیاز بازگشت', description: 'دعوت برای دفعه بعد با امتیاز بیشتر', Icon: RefreshCw },
]

const VIP_FALLBACK: { name: string; description: string; Icon: LucideIcon }[] = [
  { name: 'دسترسی زودتر', description: 'اولویت در تجربه‌ها و تایم‌های محدود', Icon: Zap },
  { name: 'تجربه ویژه', description: 'تجربه‌های امضای هر کسب‌وکار', Icon: Sparkle },
  { name: 'روز خاص من', description: 'تجربه ویژه برای تولد و مناسبت‌ها', Icon: Cake },
  { name: 'دعوت از دوست', description: 'تجربه‌های دونفره و دعوت همراه', Icon: Clover },
  { name: 'هدیه برند', description: 'یادگاری اختصاصی برندهای منتخب', Icon: Gift },
]

const CLUB_META: Record<
  ClubThemeKey,
  { subtitle: string; titleColor: string; iconColor: string; chip: string; image: string; label: string }
> = {
  taste: {
    subtitle: 'تجربه‌های خوشمزه‌تر برای اعضای فایدو',
    titleColor: '#C4453C',
    iconColor: '#C4453C',
    chip: 'bg-[#C4453C] text-white',
    image: tasteImage,
    label: 'طعم‌ها',
  },
  wellness: {
    subtitle: 'تجربه‌هایی برای سلامت و آرامش شما',
    titleColor: '#2F7A58',
    iconColor: '#3B8F66',
    chip: 'bg-[#3B8F66] text-white',
    image: wellnessImage,
    label: 'تندرستی',
  },
  lifestyle: {
    subtitle: 'تجربه‌هایی متفاوت برای سبک زندگی شما',
    titleColor: '#6B4EA8',
    iconColor: '#7B5CB8',
    chip: 'bg-[#7B5CB8] text-white',
    image: lifestyleImage,
    label: 'سبک زندگی',
  },
}

function normalizeName(name: string) {
  return name.replace(/\u200c/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, '')
}

export function clubThemeKey(name?: string | null): ClubThemeKey {
  const n = normalizeName(name || '')
  if (n.includes('طعم') || n.includes('کافه') || n.includes('رستوران') || n.includes('بیکری') || n.includes('شیرینی')) {
    return 'taste'
  }
  if (
    n.includes('تندرست') ||
    n.includes('کلینیک') ||
    n.includes('زیبایی') ||
    n.includes('ورزش') ||
    n.includes('فیت') ||
    (n.includes('سلامت') && !n.includes('سبک'))
  ) {
    return 'wellness'
  }
  if (
    (n.includes('سبک') && n.includes('زندگی')) ||
    n.includes('آرایش') ||
    n.includes('مزون') ||
    n.includes('پت') ||
    n.includes('بازی')
  ) {
    return 'lifestyle'
  }
  return 'taste'
}

function faNum(n: number) {
  return n.toLocaleString('fa-IR')
}

const ClocheIcon: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4.5 18.2h15" />
    <path d="M5.2 18.2c.2-5.4 3.4-9.4 6.8-9.4s6.6 4 6.8 9.4" />
    <path d="M12 8.8V6.6" />
    <circle cx="12" cy="5.4" r="1.05" />
  </svg>
)

function ClubMark({ themeKey, color }: { themeKey: ClubThemeKey; color: string }) {
  if (themeKey === 'wellness') return <Heart className="h-5 w-5" color={color} />
  if (themeKey === 'lifestyle') return <Star className="h-5 w-5" color={color} />
  return <ClocheIcon color={color} />
}

function iconForName(name: string, tab: LevelTab): LucideIcon {
  const n = normalizeName(name)
  if (n.includes('پیشنهاد') || n.includes('تخفیف')) return Percent
  if (n.includes('توجه')) return Heart
  if (n.includes('خوشامد')) return Coffee
  if (n.includes('بازگشت')) return RefreshCw
  if (n.includes('دسترسی') || n.includes('زودتر')) return Zap
  if (n.includes('خاص') || n.includes('تولد')) return Cake
  if (n.includes('دوست') || n.includes('دعوت')) return Clover
  if (n.includes('ویژه') && tab === 'vip') return Sparkle
  if (n.includes('برند') || n.includes('هدیه')) return Gift
  return tab === 'gold' ? Gift : Sparkle
}

interface ClubExperienceBrowseProps {
  club: ClubItem
  experiences: VipExperienceCategory[]
  packages: Package[]
}

export const ClubExperienceBrowse: React.FC<ClubExperienceBrowseProps> = ({
  club,
  experiences,
  packages,
}) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [tab, setTab] = useState<LevelTab>('gold')
  const [selectedExp, setSelectedExp] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortFilter>('suggested')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)

  const themeKey = clubThemeKey(club.name)
  const theme = CLUB_META[themeKey]

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [])

  useEffect(() => {
    setSelectedExp('all')
  }, [tab])

  const tabExperiences = useMemo(() => {
    const wanted = tab === 'gold' ? 'VIP' : 'VIP+'
    const fromApi = experiences.filter(exp => exp.vip_type === wanted)
    if (fromApi.length > 0) {
      return fromApi.map(exp => ({
        key: String(exp.id),
        name: exp.name,
        description: exp.description || '',
        Icon: iconForName(exp.name, tab),
      }))
    }
    return (tab === 'gold' ? GOLD_FALLBACK : VIP_FALLBACK).map(item => ({
      key: item.name,
      name: item.name,
      description: item.description,
      Icon: item.Icon,
    }))
  }, [experiences, tab])

  const selectedMeta = tabExperiences.find(item => item.key === selectedExp || item.name === selectedExp)

  const clubPackages = useMemo(() => {
    const merged = mergeWithExploreSamples(packages)
    return merged.filter(pkg => clubThemeKey(pkg.club_name || pkg.business_category?.name) === clubThemeKey(club.name))
  }, [packages, club.name])

  const filtered = useMemo(() => {
    const wantedType = tab === 'gold' ? 'gold_experiences' : 'vip_experiences'
    let list = clubPackages.filter(pkg => {
      const offers = pkg[wantedType] || []
      if (tab === 'gold' && !pkg.has_vip && offers.length === 0) return false
      if (tab === 'vip' && !pkg.has_vip_plus && offers.length === 0) return false
      if (selectedExp === 'all') return offers.length > 0 || (tab === 'gold' ? pkg.has_vip : pkg.has_vip_plus)
      return offers.some(offer => offer.name === selectedMeta?.name || String(offer.id) === selectedExp)
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
      if (sortBy === 'nearest') {
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999)
      }
      if (sortBy === 'rating') {
        return (b.pkg.average_rating ?? 0) - (a.pkg.average_rating ?? 0)
      }
      if (sortBy === 'popular') {
        return (b.pkg.total_comments ?? 0) - (a.pkg.total_comments ?? 0)
      }
      const score = (pkg: Package) =>
        (pkg.average_rating ?? 0) * 10 + (pkg.total_comments ?? 0) / 20 + (pkg.has_vip_plus ? 5 : 0)
      return score(b.pkg) - score(a.pkg)
    })

    return withDistance
  }, [clubPackages, tab, selectedExp, selectedMeta?.name, sortBy, userPos])

  return (
    <div className="-mx-4 -mt-1 bg-white dark:bg-slate-900" style={{ direction: 'rtl' }}>
      <header className="relative px-4 pb-3 pt-2">
        <div className="flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: `inset 0 0 0 1.5px ${theme.iconColor}55` }}
          >
            <ClubMark themeKey={themeKey} color={theme.iconColor} />
          </div>
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
        <div className="mt-1 text-center">
          <h1 className="text-[22px] font-bold" style={{ color: isDark ? '#fff' : theme.titleColor }}>
            {club.name}
          </h1>
          <p className={`mt-1 text-[12px] ${isDark ? 'text-slate-400' : 'text-[#9A9A9A]'}`}>
            {club.description || theme.subtitle}
          </p>
        </div>
      </header>

      <div className="px-4">
        <div className={`mb-3 grid grid-cols-2 rounded-2xl p-1 ${isDark ? 'bg-slate-800' : 'bg-[#F4EFE8]'}`}>
          <TabBtn active={tab === 'gold'} color="#C9A227" onClick={() => setTab('gold')} isDark={isDark}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227]">
              <Star className="h-3 w-3 fill-white text-white" />
            </span>
            Gold
          </TabBtn>
          <TabBtn active={tab === 'vip'} color="#6B4EA8" onClick={() => setTab('vip')} isDark={isDark}>
            <Crown className="h-4 w-4" color="#6B4EA8" />
            VIP
          </TabBtn>
        </div>

        <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip
            active={selectedExp === 'all'}
            onClick={() => setSelectedExp('all')}
            activeClass={theme.chip}
          >
            <ClocheIcon color="currentColor" className="h-3.5 w-3.5" />
            همه
          </Chip>
          {tabExperiences.map(item => (
            <Chip
              key={item.key}
              active={selectedExp === item.key || selectedExp === item.name}
              onClick={() => setSelectedExp(item.key)}
              activeClass={tab === 'gold' ? 'bg-[#C9A227] text-white' : 'bg-[#6B4EA8] text-white'}
            >
              <item.Icon className="h-3.5 w-3.5" />
              {item.name}
            </Chip>
          ))}
        </div>

        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
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
            <BusinessExperienceCard
              key={pkg.id}
              pkg={pkg}
              theme={theme}
              tab={tab}
              selectedName={selectedMeta?.name}
              distanceLabel={formatDistance(distanceKm)}
              favorited={isFavorite(pkg.id)}
              onFavorite={e => toggleFavorite(pkg, e)}
              onClick={() => navigate(`/dashboard/business/${pkg.id}`)}
              isDark={isDark}
            />
          ))}
          {filtered.length === 0 && (
            <p className={`py-10 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              کسب‌وکاری برای این تجربه پیدا نشد
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TabBtn({
  active,
  color,
  onClick,
  isDark,
  children,
}: {
  active: boolean
  color: string
  onClick: () => void
  isDark: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold ${
        active ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-900') : isDark ? 'text-slate-400' : 'text-[#8A7A6A]'
      }`}
    >
      {children}
      {active && <span className="absolute bottom-0 left-5 right-5 h-[3px] rounded-full" style={{ background: color }} />}
    </button>
  )
}

function Chip({
  active,
  onClick,
  activeClass,
  children,
}: {
  active: boolean
  onClick: () => void
  activeClass: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
        active ? `${activeClass} border-transparent` : 'border-gray-200 bg-white text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
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

function offerText(
  pkg: Package,
  tab: LevelTab,
  selectedName?: string,
): { gold?: PackageExperienceOffer; vip?: PackageExperienceOffer } {
  const gold = pkg.gold_experiences || []
  const vip = pkg.vip_experiences || []
  const match = (list: PackageExperienceOffer[]) =>
    selectedName ? list.find(item => item.name === selectedName) : list[0]
  return {
    gold: match(gold) || gold[0],
    vip: match(vip) || vip[0],
  }
}

function BusinessExperienceCard({
  pkg,
  theme,
  tab,
  selectedName,
  distanceLabel,
  favorited,
  onFavorite,
  onClick,
  isDark,
}: {
  pkg: Package
  theme: (typeof CLUB_META)[ClubThemeKey]
  tab: LevelTab
  selectedName?: string
  distanceLabel?: string
  favorited: boolean
  onFavorite: (e: React.MouseEvent) => void
  onClick: () => void
  isDark: boolean
}) {
  const cover = buildCoverUrl(pkg)
  const offers = offerText(pkg, tab, selectedName)
  const rating = pkg.average_rating
  const comments = pkg.total_comments ?? 0
  const location = pkg.business_address || pkg.city?.name || pkg.business_category?.name

  return (
    <article
      onClick={onClick}
      className={`cursor-pointer overflow-hidden rounded-[18px] border p-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.06)] ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex gap-2.5">
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className={`min-w-0 truncate text-[14px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {pkg.business_name}
            </h3>
            <span className="shrink-0">
              <ClubMark themeKey={clubThemeKey(pkg.club_name || pkg.business_category?.name)} color={theme.iconColor} />
            </span>
          </div>
          <p className={`mt-0.5 flex items-center gap-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
            <MapPin className="h-3 w-3" />
            <span className="truncate">{location || pkg.business_category?.name}</span>
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className={isDark ? 'text-slate-200' : 'text-gray-800'}>
              {rating?.toFixed?.(1) ?? rating ?? '—'}
            </span>
            <span className="text-gray-400">({faNum(comments)})</span>
          </div>
          <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.chip}`}>
            {theme.label}
          </span>
        </div>

        <div className="relative h-[108px] w-[108px] shrink-0 overflow-hidden rounded-[14px] bg-gray-100">
          {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : null}
          {distanceLabel ? (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-gray-700">
              {distanceLabel}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onFavorite}
            className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
            aria-label="علاقه‌مندی"
          >
            <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="rounded-xl bg-[#EEE6F8] px-2.5 py-1.5">
          <p className="text-[11px] font-bold text-[#6B4EA8]">VIP</p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#6B4EA8]">
            <Crown className="h-3 w-3" />
            <span className="line-clamp-1">{offers.vip?.description || offers.vip?.name || 'پیشنهاد VIP'}</span>
          </p>
        </div>
        <div className="rounded-xl bg-[#F8F1D8] px-2.5 py-1.5">
          <p className="text-[11px] font-bold text-[#C9A227]">Gold</p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#8A7040]">
            <Gift className="h-3 w-3" />
            <span className="line-clamp-1">{offers.gold?.description || offers.gold?.name || 'پیشنهاد طلایی'}</span>
          </p>
        </div>
      </div>
    </article>
  )
}
