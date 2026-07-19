import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { CustomerHeroSection } from '../../components/dashboard/CustomerHeroSection'
import { CustomerPointsCard } from '../../components/dashboard/CustomerPointsCard'
import { QuickAccessMenu } from '../../components/dashboard/QuickAccessMenu'
import { useTheme } from '../../contexts/ThemeContext'

export const CustomerDashboardMobile = () => {
  const { isDark } = useTheme()

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4">
        <CustomerHeroSection />

        {/* بخش میانی: امتیاز، سطوح، آمار */}
        <CustomerPointsCard fetchFromApi={true} cashbackTomans={245000} />

        <QuickAccessMenu />

        {/* پیشنهادهای ویژه */}
        <div
          className={`rounded-[24px] p-5 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
          style={{
            boxShadow: isDark
              ? '0 10px 30px rgba(0,0,0,0.25)'
              : '0 10px 30px rgba(15, 23, 42, 0.06)',
          }}
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
          </div>
        </div>

        {/* فعالیت‌های اخیر */}
        <div
          className={`rounded-[24px] p-5 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
          style={{
            boxShadow: isDark
              ? '0 10px 30px rgba(0,0,0,0.25)'
              : '0 10px 30px rgba(15, 23, 42, 0.06)',
          }}
        >
          <h3
            className={`text-lg font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            فعالیت‌های اخیر
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">✓</span>
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  خرید موفق
                </p>
                <p
                  className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}
                >
                  کافه پاریس - ۵۰ امتیاز دریافت کردید
                </p>
              </div>
              <span
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                امروز
              </span>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  چالش تکمیل شد
                </p>
                <p
                  className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}
                >
                  چالش هفتگی - ۱۰۰ امتیاز
                </p>
              </div>
              <span
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                دیروز
              </span>
            </div>
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )
}
