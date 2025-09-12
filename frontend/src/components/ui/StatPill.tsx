import React from 'react'

type Props = {
  label: string
  value: React.ReactNode
  tone?: 'pink' | 'mint' | 'lilac' | 'lime' | 'blue' | 'purple'
  className?: string
  icon?: React.ReactNode
}

const toneMap: Record<NonNullable<Props['tone']>, string> = {
  pink: 'from-blush/30 to-blush/5 text-white',
  mint: 'from-mint/30 to-mint/5 text-white',
  lilac: 'from-lilac/30 to-lilac/5 text-white',
  lime: 'from-limeSoft/40 to-limeSoft/5 text-night-900',
  blue: 'from-primary-500/30 to-primary-500/5 text-white',
  purple: 'from-accent-500/30 to-accent-500/5 text-white',
}

export const StatPill: React.FC<Props> = ({ label, value, tone = 'blue', icon, className = '' }) => {
  return (
    <div className={[
      'rounded-2xl bg-gradient-to-b',
      'border border-white/10 backdrop-blur-lg shadow-soft',
      'px-4 sm:px-5 py-4 flex items-center justify-between',
      toneMap[tone],
      className,
    ].join(' ')}>
      <div>
        <div className="text-xs text-white/70">{label}</div>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
      </div>
      {icon && <div className="text-2xl opacity-80">{icon}</div>}
    </div>
  )}

export default StatPill
