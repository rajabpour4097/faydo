import React, { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search } from 'lucide-react'
import { ClubItem } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import tasteImage from '../../assets/clubs/taste.png'
import wellnessImage from '../../assets/clubs/wellness.png'
import lifestyleImage from '../../assets/clubs/lifestyle.png'

type ClubThemeKey = 'taste' | 'wellness' | 'lifestyle'

interface ClubTheme {
  key: ClubThemeKey
  fallbackName: string
  fallbackDescription: string
  image: string
  titleColor: string
  iconColor: string
  ringColor: string
  gradient: string
  darkGradient: string
  shadow: string
  Icon: React.FC<{ color: string }>
}

const ClocheIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4.5 18.2h15" />
    <path d="M5.2 18.2c.2-5.4 3.4-9.4 6.8-9.4s6.6 4 6.8 9.4" />
    <path d="M12 8.8V6.6" />
    <circle cx="12" cy="5.4" r="1.05" />
  </svg>
)

const HeartIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19.5 12.6c1.7-1.8 1.7-4.6-.1-6.3-1.8-1.7-4.6-1.6-6.3.2l-.6.7-.6-.7C10.2 4.7 7.4 4.6 5.6 6.3c-1.8 1.7-1.8 4.5-.1 6.3l6.8 6.6 7.2-6.6z" />
  </svg>
)

const StarIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3.4l2.2 5.1 5.5.5-4.2 3.7 1.3 5.4L12 15.6 7.2 18.1l1.3-5.4-4.2-3.7 5.5-.5L12 3.4z" />
  </svg>
)

const SparkleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M12 2.2c.18 0 .33.12.38.3l1.12 4.18c.28 1.04 1.08 1.84 2.12 2.12l4.18 1.12a.4.4 0 0 1 0 .76l-4.18 1.12c-1.04.28-1.84 1.08-2.12 2.12l-1.12 4.18a.4.4 0 0 1-.76 0l-1.12-4.18c-.28-1.04-1.08-1.84-2.12-2.12L3.2 11.8a.4.4 0 0 1 0-.76l4.18-1.12c1.04-.28 1.84-1.08 2.12-2.12L10.62 2.5A.4.4 0 0 1 12 2.2z" />
    <path d="M18.6 3.4c.1 0 .18.07.2.16l.42 1.5c.1.36.38.64.74.74l1.5.42a.2.2 0 0 1 0 .38l-1.5.42c-.36.1-.64.38-.74.74l-.42 1.5a.2.2 0 0 1-.4 0l-.42-1.5a1.1 1.1 0 0 0-.74-.74l-1.5-.42a.2.2 0 0 1 0-.38l1.5-.42c.36-.1.64-.38.74-.74l.42-1.5a.2.2 0 0 1 .2-.16z" />
  </svg>
)

const CLUB_THEMES: ClubTheme[] = [
  {
    key: 'taste',
    fallbackName: 'باشگاه طعم‌ها',
    fallbackDescription: 'تجربه‌های خوشمزه‌تر برای اعضای فایدو',
    image: tasteImage,
    titleColor: '#9A2E32',
    iconColor: '#C4453C',
    ringColor: '#E8A09A',
    gradient: 'linear-gradient(90deg, #F6C4BA 0%, #FCD8D2 42%, #FFF4F1 100%)',
    darkGradient: 'linear-gradient(90deg, #4A221E 0%, #3A1E1C 48%, #2A1818 100%)',
    shadow: '0 10px 28px rgba(196, 90, 80, 0.14)',
    Icon: ClocheIcon,
  },
  {
    key: 'wellness',
    fallbackName: 'باشگاه تندرستی',
    fallbackDescription: 'تجربه‌هایی برای سلامت و آرامش شما',
    image: wellnessImage,
    titleColor: '#2F7A58',
    iconColor: '#3B8F66',
    ringColor: '#A9D4BE',
    gradient: 'linear-gradient(90deg, #C5E6D4 0%, #DDF1E6 42%, #F3FAF6 100%)',
    darkGradient: 'linear-gradient(90deg, #1D3A2C 0%, #1A3228 48%, #15241E 100%)',
    shadow: '0 10px 28px rgba(60, 140, 100, 0.14)',
    Icon: HeartIcon,
  },
  {
    key: 'lifestyle',
    fallbackName: 'باشگاه سبک زندگی',
    fallbackDescription: 'تجربه‌هایی متفاوت برای سبک زندگی شما',
    image: lifestyleImage,
    titleColor: '#6B4EA8',
    iconColor: '#7B5CB8',
    ringColor: '#C9B6E8',
    gradient: 'linear-gradient(90deg, #DCC7F2 0%, #E8DCF6 42%, #F7F2FC 100%)',
    darkGradient: 'linear-gradient(90deg, #322448 0%, #2A1E3C 48%, #20162E 100%)',
    shadow: '0 10px 28px rgba(120, 80, 180, 0.14)',
    Icon: StarIcon,
  },
]

function normalizeClubName(name: string) {
  return name
    .replace(/\u200c/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, '')
}

function themeKeyFromName(name: string): ClubThemeKey | null {
  const n = normalizeClubName(name)
  if (n.includes('طعم')) return 'taste'
  if (n.includes('تندرست') || (n.includes('سلامت') && !n.includes('سبک'))) return 'wellness'
  if (n.includes('سبک') && n.includes('زندگی')) return 'lifestyle'
  return null
}

interface ExperienceClubsHomeProps {
  clubs: ClubItem[]
}

export const ExperienceClubsHome: React.FC<ExperienceClubsHomeProps> = ({ clubs }) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const cards = useMemo(() => {
    const used = new Set<number>()
    return CLUB_THEMES.map((theme, index) => {
      const matched =
        clubs.find(club => {
          if (used.has(club.id)) return false
          return themeKeyFromName(club.name) === theme.key
        }) ||
        clubs.find(club => !used.has(club.id) && clubs.indexOf(club) === index)

      if (matched) used.add(matched.id)

      return {
        theme,
        club: matched,
        name: matched?.name || theme.fallbackName,
        description: theme.fallbackDescription,
      }
    })
  }, [clubs])

  const handleOpenClub = (clubId?: number) => {
    if (!clubId) return
    navigate(`/dashboard/clubs/${clubId}`)
  }

  const handleSmartSearch = (event: FormEvent) => {
    event.preventDefault()
    const term = query.trim()
    if (!term) {
      navigate('/dashboard/explore')
      return
    }
    navigate(`/dashboard/explore?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="mx-auto w-full max-w-[430px] space-y-3.5" style={{ direction: 'rtl' }}>
      <header className="px-1 pt-1 text-center">
        <h1
          className={`text-[21px] font-bold leading-snug ${
            isDark ? 'text-white' : 'text-[#363636]'
          }`}
        >
          به باشگاه تجربه‌های فایدو خوش آمدید
        </h1>
        <p className={`mt-1.5 text-[13px] ${isDark ? 'text-slate-400' : 'text-[#A3A3A3]'}`}>
          تجربه‌هایی ویژه برای حال خوب شما
        </p>
      </header>

      <div className="mx-auto w-[99%] space-y-3">
        {cards.map(({ theme, club, name, description }) => (
          <ClubExperienceCard
            key={theme.key}
            theme={theme}
            name={name}
            description={description}
            isDark={isDark}
            onOpen={() => handleOpenClub(club?.id)}
          />
        ))}
      </div>

      <section
        className={`rounded-[22px] px-4 pb-4 pt-3.5 ${
          isDark ? 'bg-slate-800/80 border border-slate-700' : 'bg-[#F3F2F7]'
        }`}
      >
        <div className="mb-3 flex items-center justify-start gap-1.5">
          <SparkleIcon color={isDark ? '#C4B5FD' : '#7B5CB8'} />
          <h2 className={`text-[15px] font-bold ${isDark ? 'text-violet-300' : 'text-[#7B5CB8]'}`}>
            جستجوی هوشمند
          </h2>
        </div>
        <form onSubmit={handleSmartSearch}>
          <label className="relative block">
            <Search
              className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-[#B0B0B0]'
              }`}
              strokeWidth={2}
            />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="مثلاً: برای تولدم کجاها می‌تونم برم که موسیقی زنده داشته باشه؟"
              className={`w-full rounded-full border-0 py-3 pr-11 pl-4 text-[12px] leading-6 outline-none placeholder:text-[11.5px] ${
                isDark
                  ? 'bg-slate-700 text-white placeholder:text-slate-400'
                  : 'bg-white text-gray-700 placeholder:text-[#C0C0C0]'
              }`}
              style={{
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            />
          </label>
        </form>
      </section>
    </div>
  )
}

interface ClubExperienceCardProps {
  theme: ClubTheme
  name: string
  description: string
  isDark: boolean
  onOpen: () => void
}

const ClubExperienceCard: React.FC<ClubExperienceCardProps> = ({
  theme,
  name,
  description,
  isDark,
  onOpen,
}) => {
  const titleColor = isDark ? '#F4EDED' : theme.titleColor
  const Icon = theme.Icon

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      className="relative cursor-pointer overflow-hidden rounded-[22px] transition-transform duration-200 active:scale-[0.99]"
      style={{
        background: isDark ? theme.darkGradient : theme.gradient,
        boxShadow: isDark ? '0 10px 24px rgba(0,0,0,0.28)' : theme.shadow,
        minHeight: 128,
        height: 128,
      }}
    >
      <div className="relative flex h-full min-h-[128px] items-center pt-2.5 pb-2.5">
        <div
          className="relative z-20 mr-3 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: `inset 0 0 0 1.5px ${theme.ringColor}` }}
        >
          <Icon color={theme.iconColor} />
        </div>

        <div className="relative z-20 min-w-0 flex-1 pl-[44%] pr-2.5">
          <h3 className="text-[14px] font-bold leading-6" style={{ color: titleColor }}>
            {name}
          </h3>
          <p className={`mt-0.5 text-[11px] leading-4 ${isDark ? 'text-slate-300' : 'text-[#7A7A7A]'}`}>
            {description}
          </p>
          <span
            className="mt-1.5 inline-flex items-center gap-1 rounded-xl bg-white px-2 py-0.5 text-[10.5px] font-semibold"
            style={{
              color: theme.iconColor,
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.06)',
            }}
          >
            مشاهده باشگاه
            <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </div>

        <div className="pointer-events-none absolute left-0 bottom-0 top-0 flex w-[46%] items-end justify-start pb-1 pr-1">
          <img
            src={theme.image}
            alt=""
            className="max-h-[92%] max-w-[92%] object-contain object-left drop-shadow-sm"
          />
        </div>
      </div>
    </article>
  )
}
