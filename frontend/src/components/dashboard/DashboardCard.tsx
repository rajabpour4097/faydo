import { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  children: ReactNode
  className?: string
  gradient?: boolean
  icon?: string
}

export const DashboardCard = ({ 
  title, 
  children, 
  className = '', 
  gradient = false,
  icon 
}: DashboardCardProps) => {
  return (
    <div className={`
      ${gradient 
        ? 'bg-gradient-to-br from-white to-blue-50 border-blue-200' 
        : 'bg-white border-gray-200'
      }
      rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      ${className}
    `}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          {icon && <span className="text-2xl ml-2">{icon}</span>}
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}
