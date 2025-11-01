import { useTheme } from '../../contexts/ThemeContext'

interface CustomerPointsCardProps {
  points?: number
  membershipLevel?: 'bronze' | 'silver' | 'gold'
}

const MEMBERSHIP_LEVELS = {
  bronze: { name: 'برنزی', minPoints: 0, maxPoints: 999, color: 'from-amber-600 to-amber-800', bgColor: 'bg-amber-50', textColor: 'text-amber-800' },
  silver: { name: 'نقره‌ای', minPoints: 1000, maxPoints: 4999, color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-800' },
  gold: { name: 'طلایی', minPoints: 5000, maxPoints: Infinity, color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800' }
}

export const CustomerPointsCard = ({ 
  points = 1250, 
  membershipLevel = 'gold' 
}: CustomerPointsCardProps) => {
  const { isDark } = useTheme()
  
  const currentLevel = MEMBERSHIP_LEVELS[membershipLevel]
  const nextLevel = membershipLevel === 'bronze' ? MEMBERSHIP_LEVELS.silver : 
                    membershipLevel === 'silver' ? MEMBERSHIP_LEVELS.gold : null
  
  // Calculate progress to next level
  const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0
  const progressPercentage = nextLevel 
    ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 
    : 100

  return (
    <div className={`rounded-2xl p-6 ${
      isDark ? 'bg-slate-800' : 'bg-white'
    } shadow-lg`}>
      {/* Points Display */}
      <div className="text-center mb-6">
        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          امتیاز شما
        </h3>
        <div className={`text-5xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {points.toLocaleString('fa-IR')}
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          امتیاز
        </p>
      </div>

      {/* Membership Level Badge */}
      <div className="flex justify-center mb-4">
        <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${currentLevel.color} text-white font-bold text-sm shadow-md`}>
          {currentLevel.name}
        </div>
      </div>

      {/* Progress Bar */}
      {nextLevel && (
        <div className="mb-3">
          <div className={`w-full h-3 rounded-full overflow-hidden ${
            isDark ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-full bg-gradient-to-r ${currentLevel.color} transition-all duration-500`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Points to Next Level */}
      {nextLevel && pointsToNext > 0 && (
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {pointsToNext.toLocaleString('fa-IR')} امتیاز تا رسیدن به سطح {nextLevel.name}
        </p>
      )}
      
      {nextLevel && pointsToNext <= 0 && (
        <p className={`text-center text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
          🎉 شما به سطح {nextLevel.name} رسیده‌اید!
        </p>
      )}

      {!nextLevel && (
        <p className={`text-center text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
          👑 شما در بالاترین سطح هستید!
        </p>
      )}
    </div>
  )
}
