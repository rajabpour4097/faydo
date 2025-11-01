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
  membershipLevel 
}: CustomerPointsCardProps) => {
  const { isDark } = useTheme()
  
  // Auto-detect membership level based on points if not provided
  const detectedLevel: 'bronze' | 'silver' | 'gold' = membershipLevel || (
    points >= 5000 ? 'gold' :
    points >= 1000 ? 'silver' : 'bronze'
  )
  
  const currentLevel = MEMBERSHIP_LEVELS[detectedLevel]
  const nextLevel = detectedLevel === 'bronze' ? MEMBERSHIP_LEVELS.silver : 
                    detectedLevel === 'silver' ? MEMBERSHIP_LEVELS.gold : null
  
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
        <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {points.toLocaleString('fa-IR')}
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          امتیاز
        </p>
      </div>

      {/* Membership Level Badge */}
      <div className="flex justify-center mb-3">
        <div className={`px-6 py-2 rounded-full ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        } text-gray-800 font-bold text-xs shadow-sm uppercase tracking-wide`}>
          سطح {detectedLevel === 'bronze' ? 'برنزی' : detectedLevel === 'silver' ? 'نقره‌ای' : 'طلایی'} 
        </div>
      </div>

      {/* Progress Bar - Always show */}
      <div className="mb-2">
        <div className={`w-full h-2 rounded-full overflow-hidden ${
          isDark ? 'bg-slate-700' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-full bg-gradient-to-r ${currentLevel.color} transition-all duration-500`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Points to Next Level - Always show */}
      {nextLevel ? (
        <p className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {pointsToNext > 0 
            ? `${pointsToNext.toLocaleString('fa-IR')} امتیاز مانده تا سطح ${nextLevel.name} ${nextLevel.name === 'طلایی' ? '🏆' : ''}`
            : `شما به سطح ${nextLevel.name} رسیده‌اید! 🎉`
          }
        </p>
      ) : (
        <p className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          شما در بالاترین سطح هستید 👑
        </p>
      )}

      {/* Total Cashback Section */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            مجموع کش‌بک دریافتی:
          </span>
          <span className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            ۲۵۰,۰۰۰ تومان
          </span>
        </div>
      </div>

    </div>
  )
}
