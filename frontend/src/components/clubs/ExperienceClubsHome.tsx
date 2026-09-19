import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiService, Package } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { mergeWithExploreSamples } from '../../data/exploreSamplePackages'
import { ExperienceIconBadge } from './clubExperienceIcons'
import {
  ClubHomeExperience,
  ClubLevelTab,
  GOLD_HOME_ITEMS,
  VIP_HOME_ITEMS,
  countBusinessesForExperience,
  faNum,
} from './clubExperienceUtils'

export const ExperienceClubsHome: React.FC = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [params, setSearchParams] = useSearchParams()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  const tab: ClubLevelTab = params.get('tab') === 'vip' ? 'vip' : 'gold'

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const pkgResp = await apiService.getPackages()
      if (cancelled) return
      const list = Array.isArray(pkgResp.data)
        ? pkgResp.data.filter(pkg => pkg.is_active && pkg.status === 'approved')
        : []
      setPackages(mergeWithExploreSamples(list))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const items = tab === 'gold' ? GOLD_HOME_ITEMS : VIP_HOME_ITEMS

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of GOLD_HOME_ITEMS) {
      map[`gold:${item.name}`] = countBusinessesForExperience(packages, 'gold', item.name)
    }
    for (const item of VIP_HOME_ITEMS) {
      map[`vip:${item.name}`] = countBusinessesForExperience(packages, 'vip', item.name)
    }
    return map
  }, [packages])

  const setTab = (next: ClubLevelTab) => {
    if (next === 'gold') {
      setSearchParams({})
    } else {
      setSearchParams({ tab: 'vip' })
    }
  }

  const openExperience = (item: ClubHomeExperience) => {
    navigate(
      `/dashboard/clubs/experiences?tab=${tab}&name=${encodeURIComponent(item.name)}`,
    )
  }

  return (
    <div className="mx-auto w-full max-w-[430px]" style={{ direction: 'rtl' }}>
      <header className="px-1 pt-2 text-center">
        <h1 className={`text-[26px] font-bold leading-snug ${isDark ? 'text-white' : 'text-[#2F2F2F]'}`}>
          باشگاه‌ها
        </h1>
        <p className={`mt-1.5 text-[13px] ${isDark ? 'text-slate-400' : 'text-[#A3A3A3]'}`}>
          {tab === 'gold' ? 'تجربه‌هایی برای اعضای فایدو' : 'تجربه‌هایی برای کاربر فایدو'}
        </p>
      </header>

      <div className="mt-5 mb-4 flex items-center justify-center gap-8" dir="ltr">
        <TabPill
          label="Gold"
          active={tab === 'gold'}
          color="#C9A227"
          onClick={() => setTab('gold')}
          isDark={isDark}
        />
        <TabPill
          label="VIP"
          active={tab === 'vip'}
          color="#7B4DB8"
          onClick={() => setTab('vip')}
          isDark={isDark}
        />
      </div>

      <div className="space-y-2.5">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`h-[76px] animate-pulse rounded-[22px] ${
                  isDark ? 'bg-slate-800' : 'bg-white'
                }`}
              />
            ))
          : items.map(item => {
              const count = counts[`${tab}:${item.name}`] ?? 0
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => openExperience(item)}
                  className={`flex w-full items-center gap-3 rounded-[22px] px-3.5 py-3 text-right shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-transform active:scale-[0.99] ${
                    isDark ? 'bg-slate-800' : 'bg-white'
                  }`}
                >
                  <ExperienceIconBadge icon={item.icon} tone={item.tone} isDark={isDark} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[14.5px] font-bold leading-6 ${
                        isDark ? 'text-white' : 'text-[#2F2F2F]'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[12px] leading-5 ${
                        isDark ? 'text-slate-400' : 'text-[#9A9A9A]'
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[12px] ${isDark ? 'text-slate-400' : 'text-[#A0A0A0]'}`}
                  >
                    {faNum(count)} کسب‌وکار
                  </span>
                </button>
              )
            })}
      </div>
    </div>
  )
}

function TabPill({
  label,
  active,
  color,
  onClick,
  isDark,
}: {
  label: string
  active: boolean
  color: string
  onClick: () => void
  isDark: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-6 py-1.5 text-[15px] font-bold tracking-wide transition-colors ${
        active ? 'text-white' : isDark ? 'text-slate-400' : 'text-[#B8B8B8]'
      }`}
      style={
        active
          ? {
              background: color,
              boxShadow: `0 8px 18px ${color}40`,
            }
          : {
              background: 'transparent',
              boxShadow: 'none',
            }
      }
    >
      {label}
    </button>
  )
}
