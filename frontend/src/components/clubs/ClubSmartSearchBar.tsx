import React, { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, Sparkles } from 'lucide-react'
import { ExperienceIconBadge } from './clubExperienceIcons'
import { findHomeExperience, type ClubLevelTab } from './clubExperienceUtils'
import {
  CLUB_SEARCH_HINT,
  CLUB_SEARCH_SUGGESTION,
  suggestClubExperiences,
} from '../../utils/clubSmartSearch'

interface ClubSmartSearchBarProps {
  isDark: boolean
}

export const ClubSmartSearchBar: React.FC<ClubSmartSearchBarProps> = ({ isDark }) => {
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)

  const suggestions = useMemo(() => {
    return suggestClubExperiences(draft)
      .map(row => {
        const item = findHomeExperience(row.tab, row.name)
        return item ? { ...row, item } : null
      })
      .filter((row): row is { tab: ClubLevelTab; name: string; item: NonNullable<ReturnType<typeof findHomeExperience>> } =>
        Boolean(row),
      )
  }, [draft])

  const showPanel =
    (focused && draft.trim().length === 0) ||
    (draft.trim().length >= 2 && suggestions.length > 0)

  const goSearch = (term: string) => {
    const query = term.trim()
    if (!query) return
    navigate(`/dashboard/clubs/search?q=${encodeURIComponent(query)}`)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    goSearch(draft)
  }

  return (
    <div className="relative mt-7 pb-2">
      <div className="relative space-y-2.5">
      {showPanel && (
        <div
          className={`overflow-hidden rounded-[24px] border shadow-[0_18px_40px_rgba(88,28,135,0.12)] ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-white/90 bg-white/95 backdrop-blur-md'
          }`}
        >
          {draft.trim().length === 0 ? (
            <button
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                setDraft(CLUB_SEARCH_SUGGESTION)
                goSearch(CLUB_SEARCH_SUGGESTION)
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-right ${
                isDark ? 'text-slate-200' : 'text-[#4A4A4A]'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7B4DB8] to-[#C9A227] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold">یک نمونه بپرس</span>
                <span className={`mt-0.5 block text-[12px] ${isDark ? 'text-slate-400' : 'text-[#8A8A8A]'}`}>
                  {CLUB_SEARCH_SUGGESTION}
                </span>
              </span>
            </button>
          ) : (
            suggestions.map(row => (
              <button
                key={`${row.tab}:${row.name}`}
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() =>
                  navigate(
                    `/dashboard/clubs/experiences?tab=${row.tab}&name=${encodeURIComponent(row.name)}`,
                  )
                }
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-right ${
                  isDark ? 'hover:bg-slate-700/80' : 'hover:bg-[#F7F4FF]'
                }`}
              >
                <ExperienceIconBadge icon={row.item.icon} tone={row.item.tone} isDark={isDark} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13.5px] font-bold ${isDark ? 'text-white' : 'text-[#2F2F2F]'}`}>
                    {row.item.name}
                  </span>
                  <span className={`block text-[11.5px] ${isDark ? 'text-slate-400' : 'text-[#9A9A9A]'}`}>
                    {row.item.description}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.tab === 'vip' ? 'bg-[#F3E8FF] text-[#7B4DB8]' : 'bg-[#F8EDC4] text-[#9A7418]'
                  }`}
                >
                  {row.tab === 'vip' ? 'VIP' : 'Gold'}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      <form onSubmit={submit} className="relative">
        <div
          className={`rounded-[28px] p-[1.5px] transition-shadow duration-300 ${
            focused
              ? 'shadow-[0_14px_36px_rgba(123,77,184,0.28)]'
              : 'shadow-[0_10px_28px_rgba(123,77,184,0.14)]'
          }`}
          style={{
            background: 'linear-gradient(120deg, #7B4DB8 0%, #C084FC 48%, #C9A227 100%)',
          }}
        >
          <div
            className={`flex items-center gap-2 rounded-[26.5px] px-2 py-1.5 ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                focused ? 'scale-105' : ''
              }`}
              style={{
                background: 'linear-gradient(145deg, #8B5CF6 0%, #7B4DB8 55%, #C9A227 130%)',
                boxShadow: focused ? '0 8px 18px rgba(123,77,184,0.35)' : '0 6px 14px rgba(123,77,184,0.22)',
              }}
            >
              <Sparkles className="h-[18px] w-[18px] animate-pulse text-white" />
            </span>
            <input
              type="search"
              value={draft}
              onChange={event => {
                setDraft(event.target.value)
                setFocused(true)
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              placeholder={CLUB_SEARCH_HINT}
              className={`w-full bg-transparent py-2.5 text-[13.5px] outline-none [&::-webkit-search-cancel-button]:hidden ${
                isDark
                  ? 'text-white placeholder:text-slate-500'
                  : 'text-[#2F2F2F] placeholder:text-[#A8A0B8]'
              }`}
              aria-label={CLUB_SEARCH_HINT}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95 disabled:opacity-40"
              style={{
                background: draft.trim()
                  ? 'linear-gradient(145deg, #7B4DB8, #5B3A96)'
                  : isDark
                    ? '#334155'
                    : '#E7E2F0',
                color: draft.trim() || isDark ? '#fff' : '#9A92B0',
              }}
              aria-label="جستجو"
            >
              <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  )
}
