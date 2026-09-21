import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CustomerHeroSection } from '../../components/dashboard/CustomerHeroSection'
import { CustomerPointsCard } from '../../components/dashboard/CustomerPointsCard'
import { QuickAccessMenu } from '../../components/dashboard/QuickAccessMenu'
import { CustomerRecentActivities } from '../../components/dashboard/CustomerRecentActivities'
import { useTheme } from '../../contexts/ThemeContext'

export const CustomerDashboardDesktop = () => {
  const { isDark } = useTheme()

  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CustomerHeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CustomerPointsCard fetchFromApi={true} />
          </div>

          <div className="lg:col-span-2">
            <QuickAccessMenu />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`rounded-[24px] p-6 ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}
            style={{ boxShadow: cardShadow }}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              پیشنهادهای ویژه برای شما
            </h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-xl ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-r from-primary-50 to-primary-100'
                } border ${isDark ? 'border-slate-600' : 'border-primary-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4
                      className={`font-bold text-sm mb-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      تخفیف ۲۵٪ رستوران
                    </h4>
                    <p
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      برای سفارش بالای ۲۰۰ هزار تومان
                    </p>
                  </div>
                  <div className="text-3xl mr-3">🍽️</div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-r from-success-50 to-success-100'
                } border ${isDark ? 'border-slate-600' : 'border-success-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4
                      className={`font-bold text-sm mb-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      امتیاز هدیه
                    </h4>
                    <p
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      با معرفی به دوستان، ۱۰۰ امتیاز بگیرید
                    </p>
                  </div>
                  <div className="text-3xl mr-3">🎁</div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-r from-accent-50 to-accent-100'
                } border ${isDark ? 'border-slate-600' : 'border-accent-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4
                      className={`font-bold text-sm mb-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      تجربه VIP
                    </h4>
                    <p
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      دسترسی به تجربیات ویژه اعضای طلایی
                    </p>
                  </div>
                  <div className="text-3xl mr-3">👑</div>
                </div>
              </div>
            </div>
          </div>

          <CustomerRecentActivities compact={false} />
        </div>
      </div>
    </DashboardLayout>
  )
}
