import React from 'react'
import { ChevronLeft, Star } from 'lucide-react'
import { DetailItemGlyph } from './clubExperienceIcons'
import type { ExperienceDetail } from './clubExperienceDetails'
import { faNum } from './clubExperienceUtils'

interface ClubExperienceIntroProps {
  detail: ExperienceDetail
  accent: string
  experienceCount: number
  averageRating: number | null
  reviewCount: number
  isDark: boolean
  onBack: () => void
  onViewExperiences: () => void
}

export const ClubExperienceIntro: React.FC<ClubExperienceIntroProps> = ({
  detail,
  accent,
  experienceCount,
  averageRating,
  reviewCount,
  isDark,
  onBack,
  onViewExperiences,
}) => {
  const ratingLabel = averageRating != null ? averageRating.toFixed(1) : '—'

  return (
    <div
      className={`fixed inset-0 z-[80] ${isDark ? 'bg-slate-950' : 'bg-white'}`}
      style={{ direction: 'rtl' }}
    >
      <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden">
        <div className="relative h-[32%] min-h-[200px] max-h-[280px] shrink-0">
          <img src={detail.hero} alt="" className="h-full w-full object-cover object-center" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900"
            style={{
              top: 'max(16px, env(safe-area-inset-top))',
              boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
            }}
            aria-label="بازگشت"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
          </button>
        </div>

        <div
          className={`relative -mt-10 flex min-h-0 flex-1 flex-col rounded-t-[32px] px-5 pt-6 ${
            isDark ? 'bg-slate-900' : 'bg-white'
          }`}
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <h1 className="text-center text-[24px] font-bold leading-snug" style={{ color: accent }}>
              {detail.name}
            </h1>
            <p
              className={`mx-auto mt-2 max-w-[280px] text-center text-[13.5px] leading-7 ${
                isDark ? 'text-slate-400' : 'text-[#8A8A8A]'
              }`}
            >
              {detail.headline}
            </p>

            <div
              className={`mt-5 shrink-0 overflow-hidden rounded-[22px] border ${
                isDark ? 'border-slate-700' : 'border-[#EFEFEF]'
              }`}
            >
              {detail.items.map((item, index) => (
                <div
                  key={`${item.icon}-${item.label}`}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    index < detail.items.length - 1
                      ? isDark
                        ? 'border-b border-slate-700'
                        : 'border-b border-[#F1F1F1]'
                      : ''
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ color: accent }}>
                    <DetailItemGlyph icon={item.icon} />
                  </span>
                  <span className={`text-[14px] font-medium ${isDark ? 'text-slate-100' : 'text-[#3A3A3A]'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-6 px-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                <span className={`text-[13px] font-semibold ${isDark ? 'text-slate-200' : 'text-[#3A3A3A]'}`}>
                  {ratingLabel}
                </span>
                <span className={`text-[12px] ${isDark ? 'text-slate-500' : 'text-[#9A9A9A]'}`}>
                  ({faNum(reviewCount)})
                </span>
              </div>
              <span
                className={`shrink-0 text-[13px] ${isDark ? 'text-slate-400' : 'text-[#6A6A6A]'}`}
              >
                {faNum(experienceCount)} تجربه فعال
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewExperiences}
            className="mt-6 w-full shrink-0 rounded-2xl py-3.5 text-[15px] font-bold text-white"
            style={{ background: accent }}
          >
            مشاهده تجربه‌ها
          </button>
        </div>
      </div>
    </div>
  )
}
