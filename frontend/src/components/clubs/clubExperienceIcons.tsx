import React from 'react'
import type { ExperienceIconKey, ExperienceTone } from './clubExperienceUtils'

const SVG_PROPS = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IconSvg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      className={className}
      aria-hidden
      {...SVG_PROPS}
    >
      {children}
    </svg>
  )
}

export const WelcomeCupIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <path d="M6 8.2h10.2v6.4A3.6 3.6 0 0 1 12.6 18.2H9.6A3.6 3.6 0 0 1 6 14.6V8.2z" />
    <path d="M16.2 10.1h1.55a2.45 2.45 0 1 1 0 4.9H16.2" />
    <path d="M7.2 20.4h9.2" />
  </IconSvg>
)

export const GiftBoxIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <rect x="4.5" y="10.4" width="15" height="9.2" rx="1.6" />
    <path d="M4.5 13.7h15" />
    <path d="M12 10.4v9.2" />
    <path d="M12 10.4C10.1 7.6 7.8 6.9 6.5 8.1 5.3 9.2 6.6 11.4 12 10.4z" />
    <path d="M12 10.4C13.9 7.6 16.2 6.9 17.5 8.1 18.7 9.2 17.4 11.4 12 10.4z" />
  </IconSvg>
)

export const BrandGiftIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <rect x="5" y="9.6" width="14" height="10.2" rx="1.8" />
    <path d="M5 13.2h14" />
    <path d="M12 9.6v10.2" />
    <path d="M8.2 9.6V8.1a1.6 1.6 0 0 1 3.2 0V9.6" />
    <path d="M12.6 9.6V8.1a1.6 1.6 0 0 1 3.2 0V9.6" />
    <path d="M8.4 6.4c.9-.7 2.1-.4 2.8.6.7-1 1.9-1.3 2.8-.6" />
  </IconSvg>
)

export const StarOutlineIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <path d="M12 3.6l2.15 4.7 5.15.55-3.85 3.5 1.15 5.05L12 15.2l-4.6 2.2 1.15-5.05-3.85-3.5 5.15-.55L12 3.6z" />
  </IconSvg>
)

export const PriceTagIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <path d="M13.6 4.7H6.4A1.9 1.9 0 0 0 4.5 6.6v7.2c0 .5.2 1 .55 1.35l6.05 6.05a1.9 1.9 0 0 0 2.7 0l5.35-5.35a1.9 1.9 0 0 0 0-2.7L13.6 4.7z" />
    <circle cx="8.35" cy="8.35" r="1.15" />
  </IconSvg>
)

export const ReturnArrowIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <path d="M8.4 8.6H6.2A3.2 3.2 0 0 0 3 11.8 3.2 3.2 0 0 0 6.2 15h11.6" />
    <path d="M14.6 11.2L18.4 15l-3.8 3.8" />
  </IconSvg>
)

export const PercentBadgeIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <circle cx="8.4" cy="8.4" r="1.7" />
    <circle cx="15.6" cy="15.6" r="1.7" />
    <path d="M16.4 7.2L7.6 16.8" />
  </IconSvg>
)

export const SparkleBurstIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <path d="M12 3.2l1.55 6.05L19.8 12l-6.25 2.75L12 20.8l-1.55-6.05L4.2 12l6.25-2.75L12 3.2z" />
    <path d="M18.6 4.4l.45 1.7 1.7.45-1.7.45-.45 1.7-.45-1.7-1.7-.45 1.7-.45.45-1.7z" />
  </IconSvg>
)

export const TwoPeopleIcon = ({ className }: { className?: string }) => (
  <IconSvg className={className}>
    <circle cx="9.1" cy="8.1" r="2.55" />
    <path d="M4.2 18.6c.35-3.15 2.35-4.85 4.9-4.85s4.55 1.7 4.9 4.85" />
    <circle cx="16.2" cy="8.7" r="2.15" />
    <path d="M14.15 18.6c.2-2.35 1.55-3.7 3.55-3.7 1.55 0 2.7.8 3.3 2.15" />
  </IconSvg>
)

export const LockOutlineIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    className={className}
    fill="none"
    aria-hidden
  >
    <path
      d="M8.1 11.1V8.35a3.9 3.9 0 0 1 7.8 0V11.1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect
      x="6.2"
      y="11.1"
      width="11.6"
      height="8.4"
      rx="2.1"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M12 14.15v2.15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const ICON_MAP: Record<ExperienceIconKey, React.FC<{ className?: string }>> = {
  welcome: WelcomeCupIcon,
  gift: GiftBoxIcon,
  star: StarOutlineIcon,
  tag: PriceTagIcon,
  return: ReturnArrowIcon,
  percent: PercentBadgeIcon,
  sparkle: SparkleBurstIcon,
  people: TwoPeopleIcon,
  brandGift: BrandGiftIcon,
}

export const EXPERIENCE_TONE: Record<
  ExperienceTone,
  { bg: string; fg: string; darkBg: string; darkFg: string }
> = {
  pink: { bg: '#FCE4EC', fg: '#E07A9C', darkBg: 'rgba(224,122,156,0.18)', darkFg: '#F0A3B8' },
  purple: { bg: '#EDE4F8', fg: '#9B6BC4', darkBg: 'rgba(155,107,196,0.2)', darkFg: '#C4A3EA' },
  yellow: { bg: '#F8EDC4', fg: '#D4A84B', darkBg: 'rgba(212,168,75,0.2)', darkFg: '#E8C878' },
}

export function ExperienceGlyph({
  icon,
  className,
}: {
  icon: ExperienceIconKey
  className?: string
}) {
  const Icon = ICON_MAP[icon]
  return <Icon className={className} />
}

export function ExperienceIconBadge({
  icon,
  tone,
  isDark,
}: {
  icon: ExperienceIconKey
  tone: ExperienceTone
  isDark: boolean
}) {
  const colors = EXPERIENCE_TONE[tone]
  return (
    <span
      className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: isDark ? colors.darkBg : colors.bg,
        color: isDark ? colors.darkFg : colors.fg,
      }}
    >
      <ExperienceGlyph icon={icon} />
    </span>
  )
}
