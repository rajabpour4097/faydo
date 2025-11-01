import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

interface Club {
  id: string
  name: string
  icon: string
  gradient: string
  description: string
}

const CLUBS: Club[] = [
  {
    id: 'taste',
    name: 'مزه‌ها',
    icon: '🍽️',
    gradient: 'from-orange-500 to-red-500',
    description: 'رستوران و کافه'
  },
  {
    id: 'health',
    name: 'سلامت و زیبایی',
    icon: '💆',
    gradient: 'from-green-500 to-teal-500',
    description: 'سالن زیبایی و باشگاه'
  },
  {
    id: 'dreams',
    name: 'آرزوها',
    icon: '✨',
    gradient: 'from-purple-500 to-pink-500',
    description: 'سفر و تفریح'
  },
  {
    id: 'family',
    name: 'خانواده',
    icon: '👨‍👩‍👧‍👦',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'خرید و خانواده'
  }
]

export const ClubsQuickAccess: React.FC = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleClubClick = (clubId: string) => {
    // فعلاً به explore می‌رود، بعداً می‌توان به صفحه مخصوص هر باشگاه هدایت کرد
    navigate(`/dashboard/clubs/${clubId}`)
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          باشگاه‌های مشتریان 🎯
        </h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          انتخاب باشگاه مورد علاقه خود
        </p>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-2 gap-4">
        {CLUBS.map((club) => (
          <button
            key={club.id}
            onClick={() => handleClubClick(club.id)}
            className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${club.gradient} opacity-10`} />
            
            {/* Content */}
            <div className="relative flex flex-col items-center text-center space-y-3">
              {/* Icon Circle */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${club.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-3xl">{club.icon}</span>
              </div>
              
              {/* Club Name */}
              <div>
                <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {club.name}
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {club.description}
                </p>
              </div>

            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
