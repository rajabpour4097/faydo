import React from 'react'

type Props = {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export const SectionHeader: React.FC<Props> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={["flex items-center justify-between", className].join(' ')}>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-white/60 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default SectionHeader
