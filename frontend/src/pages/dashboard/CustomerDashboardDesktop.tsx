import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CustomerPointsCard } from '../../components/dashboard/CustomerPointsCard'
import { QuickAccessMenu } from '../../components/dashboard/QuickAccessMenu'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export const CustomerDashboardDesktop = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()

  // Mock data - will be replaced with real data from API
  const customerPoints = 1250
  // Let the component auto-detect level based on points

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              داشبورد مشتری
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              سلام {user?.first_name || user?.name || 'کاربر'} عزیز! به داشبورد خود خوش آمدید 👋
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Points Card */}
          <div className="lg:col-span-1">
            <CustomerPointsCard 
              points={customerPoints}
            />
          </div>

          {/* Right Column - Quick Access Menu */}
          <div className="lg:col-span-2">
            <QuickAccessMenu />
          </div>
        </div>

        {/* Two Column Section - Offers & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Special Offers */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              پیشنهادهای ویژه برای شما
            </h3>
            <div className="space-y-3">
              {/* Sample Offer 1 */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700' : 'bg-gradient-to-r from-primary-50 to-primary-100'
              } border ${isDark ? 'border-slate-600' : 'border-primary-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      تخفیف ۲۵٪ رستوران
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      برای سفارش بالای ۲۰۰ هزار تومان
                    </p>
                  </div>
                  <div className="text-3xl mr-3">🍽️</div>
                </div>
              </div>

              {/* Sample Offer 2 */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700' : 'bg-gradient-to-r from-success-50 to-success-100'
              } border ${isDark ? 'border-slate-600' : 'border-success-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      امتیاز هدیه
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      با معرفی به دوستان، ۱۰۰ امتیاز بگیرید
                    </p>
                  </div>
                  <div className="text-3xl mr-3">🎁</div>
                </div>
              </div>

              {/* Sample Offer 3 */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700' : 'bg-gradient-to-r from-accent-50 to-accent-100'
              } border ${isDark ? 'border-slate-600' : 'border-accent-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      تجربه VIP
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      دسترسی به تجربیات ویژه اعضای طلایی
                    </p>
                  </div>
                  <div className="text-3xl mr-3">👑</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              فعالیت‌های اخیر
            </h3>
            <div className="space-y-4">
              {/* Sample Activity 1 */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    خرید موفق
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    کافه پاریس - ۵۰ امتیاز دریافت کردید
                  </p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  امروز
                </span>
              </div>

              {/* Sample Activity 2 */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    چالش تکمیل شد
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    چالش هفتگی - ۱۰۰ امتیاز
                  </p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  دیروز
                </span>
              </div>

              {/* Sample Activity 3 */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">⭐</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ارتقای سطح
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    به سطح طلایی ارتقا یافتید - ۲۰۰ امتیاز جایزه
                  </p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  ۲ روز پیش
                </span>
              </div>

              {/* Sample Activity 4 */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-danger-400 to-danger-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    افزودن به علاقه‌مندی‌ها
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    رستوران ایتالیایی رما
                  </p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  ۳ روز پیش
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Visits */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🏪</span>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ۱۵
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              بازدید این ماه
            </p>
          </div>

          {/* Total Savings */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💰</span>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ۲.۵م
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              صرفه‌جویی کل (تومان)
            </p>
          </div>

          {/* Active Clubs */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🎯</span>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ۵
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              باشگاه عضو
            </p>
          </div>

          {/* Completed Challenges */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🏆</span>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ۸
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              چالش تکمیل شده
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
