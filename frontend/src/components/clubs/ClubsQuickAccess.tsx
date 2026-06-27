import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, ClubItem } from '../../services/api'

// گرادیان‌های پیش‌فرض بر اساس ترتیب باشگاه
const CLUB_GRADIENTS = [
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-yellow-500 to-orange-500',
]

const getGradient = (index: number) => CLUB_GRADIENTS[index % CLUB_GRADIENTS.length]

export const ClubsQuickAccess: React.FC = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClubs = async () => {
      const resp = await apiService.getClubs()
      if (resp.data) setClubs(resp.data)
      setLoading(false)
    }
    fetchClubs()
  }, [])

  const handleClubClick = (clubId: number) => {
    navigate(`/dashboard/clubs/${clubId}`)
  }

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            باشگاه‌های مشتریان 🎯
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`rounded-2xl p-6 animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} style={{ height: 140 }} />
          ))}
        </div>
      </div>
    )
  }

  if (clubs.length === 0) {
    return (
      <div className={`rounded-2xl p-6 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
        <div className="text-3xl mb-2">🏆</div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>هیچ باشگاهی یافت نشد</p>
      </div>
    )
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
      <div className={`grid gap-4 ${clubs.length === 2 ? 'grid-cols-2' : clubs.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {clubs.map((club, index) => {
          const gradient = getGradient(index)
          return (
            <button
              key={club.id}
              onClick={() => handleClubClick(club.id)}
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
              }`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
              
              {/* Content */}
              <div className="relative flex flex-col items-center text-center space-y-3">
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{club.icon || '🏆'}</span>
                </div>
                
                {/* Club Name */}
                <div>
                  <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {club.name}
                  </h4>
                  {club.description && (
                    <p className={`text-xs mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {club.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
