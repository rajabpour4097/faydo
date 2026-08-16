import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Cake,
  Clover,
  Coffee,
  Crown,
  Gift,
  Heart,
  Lock,
  Percent,
  RefreshCw,
  Sparkle,
  Star,
  Store,
  Tag,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import {
  ClubItem,
  MembershipLevel,
  Package,
  PointsSummary,
  VipExperienceCategory,
} from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import tasteImage from '../../assets/clubs/taste.png'
import wellnessImage from '../../assets/clubs/wellness.png'
import lifestyleImage from '../../assets/clubs/lifestyle.png'

type ClubThemeKey = 'taste' | 'wellness' | 'lifestyle'
type LevelTab = 'gold' | 'vip'

const TIER_RANK: Record<MembershipLevel, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  vip: 3,
}

const TIER_LABEL: Record<MembershipLevel, string> = {
  bronze: 'برنزی',
  silver: 'نقره‌ای',
  gold: 'Gold',
  vip: 'VIP',
}

const TIER_MIN: Record<MembershipLevel, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  vip: 5000,
}

const GOLD_FALLBACK: { name: string; description: string; Icon: LucideIcon }[] = [
  { name: 'پیشنهاد اختصاصی', description: 'پیشنهادهایی که فقط برای شماست', Icon: Tag },
  { name: 'توجه ویژه', description: 'رزرو بهتر و پذیرایی خاص', Icon: Heart },
  { name: 'هدیه کوچک', description: 'یک یادگاری کوچک از برند', Icon: Gift },
  { name: 'خوشامدگویی', description: 'پذیرایی گرم در لحظه ورود', Icon: Coffee },
  { name: 'امتیاز بازگشت', description: 'دعوت برای دفعه بعد با امتیاز بیشتر', Icon: RefreshCw },
]

const VIP_FALLBACK: { name: string; description: string; Icon: LucideIcon }[] = [
  { name: 'دسترسی زودتر', description: 'اولویت در تجربه‌ها و تایم‌های محدود', Icon: Zap },
  { name: 'روز خاص من', description: 'تجربه ویژه برای تولد و مناسبت‌ها', Icon: Cake },
  { name: 'دعوت از دوست', description: 'تجربه‌های دونفره و دعوت همراه', Icon: Clover },
  { name: 'تجربه ویژه', description: 'تجربه‌های امضای هر کسب‌وکار', Icon: Sparkle },
  { name: 'هدیه برند', description: 'یادگاری اختصاصی برندهای منتخب', Icon: Gift },
]

const CLUB_META: Record<
  ClubThemeKey,
  { title: string; subtitle: string; titleColor: string; headerBg: string; image: string; iconColor: string }
> = {
  taste: {
    title: 'باشگاه طعم‌ها',
    subtitle: 'تجربه‌های خوشمزه‌تر برای اعضای فایدو',
    titleColor: '#B42318',
    headerBg: 'linear-gradient(180deg, #F8D5CE 0%, #FBE7E2 55%, #FFFFFF 100%)',
    image: tasteImage,
    iconColor: '#C4453C',
  },
  wellness: {
    title: 'باشگاه تندرستی',
    subtitle: 'تجربه‌هایی برای سلامت و آرامش شما',
    titleColor: '#2F7A58',
    headerBg: 'linear-gradient(180deg, #CDE8D8 0%, #E5F4EC 55%, #FFFFFF 100%)',
    image: wellnessImage,
    iconColor: '#3B8F66',
  },
  lifestyle: {
    title: 'باشگاه سبک زندگی',
    subtitle: 'تجربه‌هایی متفاوت برای سبک زندگی شما',
    titleColor: '#6B4EA8',
    headerBg: 'linear-gradient(180deg, #E0D0F4 0%, #F0E8FA 55%, #FFFFFF 100%)',
    image: lifestyleImage,
    iconColor: '#7B5CB8',
  },
}

function normalizeName(name: string) {
  return name.replace(/\u200c/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, '')
}

function themeKeyFromName(name: string): ClubThemeKey {
  const n = normalizeName(name)
  if (n.includes('تندرست') || (n.includes('سلامت') && !n.includes('سبک'))) return 'wellness'
  if (n.includes('سبک') && n.includes('زندگی')) return 'lifestyle'
  return 'taste'
}

function faNum(n: number) {
  return Math.max(0, Math.round(n)).toLocaleString('fa-IR')
}

function iconForExperience(name: string, tab: LevelTab): LucideIcon {
  const n = normalizeName(name)
  if (n.includes('پیشنهاد') || n.includes('تخفیف')) return Percent
  if (n.includes('توجه')) return Heart
  if (n.includes('خوشامد')) return Coffee
  if (n.includes('بازگشت') || n.includes('امتیاز')) return RefreshCw
  if (n.includes('دسترسی') || n.includes('زودتر')) return Zap
  if (n.includes('خاص') || n.includes('تولد')) return Cake
  if (n.includes('دوست') || n.includes('دعوت')) return Clover
  if (n.includes('ویژه') && tab === 'vip') return Sparkle
  if (n.includes('برند') || n.includes('هدیه')) return Gift
  return tab === 'gold' ? Gift : Sparkle
}

interface ClubLevelHomeProps {
  club: ClubItem
  experiences: VipExperienceCategory[]
  packages: Package[]
  summary: PointsSummary | null
  onExperienceClick: (experience: VipExperienceCategory) => void
}

export const ClubLevelHome: React.FC<ClubLevelHomeProps> = ({
  club,
  experiences,
  packages,
  summary,
  onExperienceClick,
}) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState<LevelTab>('gold')

  const theme = CLUB_META[themeKeyFromName(club.name)]
  const level = summary?.membership_level ?? 'bronze'
  const rank = TIER_RANK[level]
  const hasGold = rank >= TIER_RANK.gold
  const hasVip = rank >= TIER_RANK.vip
  const tabReached = tab === 'gold' ? hasGold : hasVip
  const pointsNow = summary?.points_6months ?? summary?.total_points ?? 0
  const targetLevel: MembershipLevel = tab === 'gold' ? 'gold' : 'vip'
  const targetMin = TIER_MIN[targetLevel]
  const pointsToTab = Math.max(0, targetMin - pointsNow)
  const nextAfterCurrent = summary?.tier_progress?.next_tier ?? null
  const pointsToNext = summary?.tier_progress?.points_to_next ?? 0
  const progressPercent = tabReached
    ? hasVip
      ? 100
      : Math.min(100, summary?.tier_progress?.percent ?? 0)
    : Math.min(100, (pointsNow / targetMin) * 100)

  const clubPackages = useMemo(
    () =>
      packages.filter(pkg => {
        if (pkg.status !== 'approved' || !pkg.is_active) return false
        if (!pkg.club_name) return true
        return themeKeyFromName(pkg.club_name) === themeKeyFromName(club.name)
      }),
    [packages, club.name],
  )

  const businessCount = clubPackages.filter(pkg =>
    tab === 'gold' ? pkg.has_vip : pkg.has_vip_plus,
  ).length

  const items = useMemo(() => {
    const wantedType = tab === 'gold' ? 'VIP' : 'VIP+'
    const fromApi = experiences.filter(exp => exp.vip_type === wantedType)
    const fallback = tab === 'gold' ? GOLD_FALLBACK : VIP_FALLBACK
    if (fromApi.length > 0) {
      return fromApi.map(exp => ({
        key: String(exp.id),
        name: exp.name,
        description: exp.description || '',
        Icon: iconForExperience(exp.name, tab),
        source: exp,
      }))
    }
    return fallback.map((item, index) => ({
      key: `${tab}-${index}`,
      name: item.name,
      description: item.description,
      Icon: item.Icon,
      source: {
        id: -(index + 1),
        vip_type: wantedType,
        category: 0,
        name: item.name,
        description: item.description,
      } as VipExperienceCategory,
    }))
  }, [experiences, tab])

  const distanceLabel =
    tab === 'vip'
      ? `${faNum(hasVip ? 0 : pointsToTab || pointsToNext)} امتیاز تا VIP`
      : hasGold
        ? nextAfterCurrent
          ? `${faNum(pointsToNext)} امتیاز تا سطح ${TIER_LABEL[nextAfterCurrent]}`
          : 'شما در بالاترین سطح هستید'
        : `${faNum(pointsToTab)} امتیاز تا سطح Gold`

  const currentOverTarget = tabReached
    ? `${faNum(pointsNow)} / ${faNum(hasVip ? pointsNow : pointsNow + pointsToNext || TIER_MIN.vip)}`
    : `${faNum(pointsNow)} / ${faNum(targetMin)}`

  const accent = tab === 'gold' ? '#C9A227' : '#6B4EA8'
  const panelBg = isDark
    ? 'bg-slate-900'
    : tab === 'gold'
      ? 'bg-[#FBF7F1]'
      : 'bg-[#F4F0FB]'
  const cardBg = isDark
    ? 'bg-slate-800'
    : tab === 'gold'
      ? 'bg-[#F8F1E6]'
      : 'bg-[#EFE8F8]'
  const cardBorder = tab === 'gold' ? 'border-[#E8D7A8]' : 'border-[#D9C8F0]'

  return (
    <div className="-mx-4 -mt-5" style={{ direction: 'rtl' }}>
      <header
        className="relative overflow-hidden px-4 pb-5 pt-3"
        style={{ background: isDark ? '#1E1520' : theme.headerBg }}
      >
        <img
          src={theme.image}
          alt=""
          className="pointer-events-none absolute -left-4 bottom-0 h-28 w-28 object-contain opacity-80"
        />
        <div className="relative z-10 flex items-center justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: `inset 0 0 0 1.5px ${theme.iconColor}55` }}
          >
            <ThemeMark clubKey={themeKeyFromName(club.name)} color={theme.iconColor} />
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/clubs')}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
            }`}
            style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
            aria-label="بازگشت"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="relative z-10 mt-2 px-10 text-center">
          <h1 className="text-[22px] font-bold" style={{ color: isDark ? '#fff' : theme.titleColor }}>
            {club.name || theme.title}
          </h1>
          <p className={`mt-1 text-[12px] ${isDark ? 'text-slate-300' : 'text-[#8A8A8A]'}`}>
            {theme.subtitle}
          </p>
        </div>
      </header>

      <div className={`rounded-t-[28px] px-4 pb-8 pt-2 ${isDark ? 'bg-slate-900' : 'bg-white'} -mt-2 relative z-10`}>
        <div className={`grid grid-cols-2 rounded-2xl p-1 ${isDark ? 'bg-slate-800' : 'bg-[#F3EEE8]'}`}>
            <LevelTabButton
            active={tab === 'gold'}
            locked={!hasGold}
            label="Gold"
            underline="#C9A227"
            onClick={() => setTab('gold')}
            isDark={isDark}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A227]">
              <Star className="h-3.5 w-3.5 fill-white text-white" />
            </span>
          </LevelTabButton>
          <LevelTabButton
            active={tab === 'vip'}
            locked={!hasVip}
            label="VIP"
            underline="#6B4EA8"
            onClick={() => setTab('vip')}
            isDark={isDark}
          >
            <Crown className="h-5 w-5" color="#6B4EA8" />
          </LevelTabButton>
        </div>

        <div className={`mt-4 rounded-2xl border px-4 py-3.5 ${panelBg} ${isDark ? 'border-slate-700' : cardBorder}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[12px] ${isDark ? 'text-slate-300' : 'text-[#6B5B4A]'}`}>
                سطح فعلی شما:{' '}
                <span className="font-bold" style={{ color: accent }}>
                  {TIER_LABEL[level]}
                </span>
              </p>
              {tabReached ? (
                <p className="mt-1 text-[13px] font-bold" style={{ color: accent }}>
                  شما در سطح {tab === 'gold' ? 'Gold' : 'VIP'} هستید
                </p>
              ) : (
                <p className="mt-1 text-[13px] font-bold" style={{ color: accent }}>
                  {distanceLabel}
                </p>
              )}
            </div>
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: tab === 'gold' ? '#F3E4B8' : '#E4D7F7' }}
            >
              {tab === 'gold' ? (
                <Star className="h-6 w-6 fill-[#C9A227] text-[#C9A227]" />
              ) : (
                <Crown className="h-6 w-6" color="#6B4EA8" />
              )}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className={`h-2 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-slate-700' : 'bg-[#EDE4D4]'}`}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(6, progressPercent)}%`, background: accent }}
              />
            </div>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-[#7A6A58]'}`}>
              {currentOverTarget}
            </span>
          </div>
          {tabReached && nextAfterCurrent && tab === 'gold' && (
            <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#8A7A68]'}`}>
              {faNum(pointsToNext)} امتیاز تا سطح {TIER_LABEL[nextAfterCurrent]}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[15px] font-bold" style={{ color: accent }}>
            تجربه‌های {tab === 'gold' ? 'Gold' : 'VIP'}
          </h2>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#9A8A7A]'}`}>
            {tabReached ? `${faNum(items.length)} تجربه فعال` : 'با رسیدن به این سطح باز می‌شوند'}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {items.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => tabReached && onExperienceClick(item.source)}
              className={`rounded-2xl border p-3 text-right ${cardBg} ${isDark ? 'border-slate-700' : cardBorder} ${
                tabReached ? 'active:scale-[0.98]' : 'opacity-90'
              }`}
            >
              <div
                className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: tab === 'gold' ? '#F3E4B8' : '#E4D7F7' }}
              >
                <item.Icon
                  className="h-5 w-5"
                  color={tab === 'gold' ? '#C9A227' : '#6B4EA8'}
                  strokeWidth={1.8}
                />
              </div>
              <h3 className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#2F2A28]'}`}>
                {item.name}
              </h3>
              <p className={`mt-1 line-clamp-2 min-h-[32px] text-[10.5px] leading-4 ${isDark ? 'text-slate-400' : 'text-[#8A7A6A]'}`}>
                {item.description}
              </p>
              <div className={`mt-2 flex items-center justify-center gap-1 text-[10.5px] ${isDark ? 'text-slate-400' : 'text-[#7A6A58]'}`}>
                {tabReached ? (
                  <>
                    <Store className="h-3 w-3" />
                    <span>{faNum(businessCount)} کسب‌وکار</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" style={{ color: accent }} />
                    <span>{distanceLabel}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function LevelTabButton({
  active,
  locked,
  label,
  underline,
  onClick,
  isDark,
  children,
}: {
  active: boolean
  locked: boolean
  label: string
  underline: string
  onClick: () => void
  isDark: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold ${
        active
          ? isDark
            ? 'bg-slate-700 text-white'
            : 'bg-white text-gray-900'
          : isDark
            ? 'text-slate-400'
            : 'text-[#8A7A6A]'
      }`}
    >
      {locked && <Lock className="h-3.5 w-3.5" />}
      {children}
      <span style={{ color: active ? underline : undefined }}>{label}</span>
      {active && (
        <span
          className="absolute bottom-0 left-4 right-4 h-[3px] rounded-full"
          style={{ background: underline }}
        />
      )}
    </button>
  )
}

function ThemeMark({ clubKey, color }: { clubKey: ClubThemeKey; color: string }) {
  if (clubKey === 'wellness') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19.5 12.6c1.7-1.8 1.7-4.6-.1-6.3-1.8-1.7-4.6-1.6-6.3.2l-.6.7-.6-.7C10.2 4.7 7.4 4.6 5.6 6.3c-1.8 1.7-1.8 4.5-.1 6.3l6.8 6.6 7.2-6.6z" />
      </svg>
    )
  }
  if (clubKey === 'lifestyle') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3.4l2.2 5.1 5.5.5-4.2 3.7 1.3 5.4L12 15.6 7.2 18.1l1.3-5.4-4.2-3.7 5.5-.5L12 3.4z" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 18.2h15" />
      <path d="M5.2 18.2c.2-5.4 3.4-9.4 6.8-9.4s6.6 4 6.8 9.4" />
      <path d="M12 8.8V6.6" />
      <circle cx="12" cy="5.4" r="1.05" />
    </svg>
  )
}
