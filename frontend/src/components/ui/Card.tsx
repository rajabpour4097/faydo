import React from 'react'

type CardProps = {
  className?: string
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
  interactive?: boolean
}

const pad = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export const Card: React.FC<CardProps> = ({ className = '', children, padding = 'md', interactive = false }) => {
  return (
    <div
      className={[
        'rounded-2xl bg-night-800/70 backdrop-blur-xl text-white shadow-glass border border-white/5',
        interactive ? 'transition-transform hover:-translate-y-0.5 hover:shadow-soft' : '',
        pad[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export default Card
