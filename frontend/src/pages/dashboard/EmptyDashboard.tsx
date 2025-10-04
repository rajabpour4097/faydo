import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'

export const EmptyDashboard = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()

  const businessName = user?.businessProfile?.name || user?.name || 'کسب‌وکار'

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className={`${
        isDark ? 'bg-slate-800' : 'bg-white'
      } rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              سلام {businessName}! خوش آمدید
            </h2>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">👋</span>
          </div>
        </div>
      </div>

      {/* Package Creation Guidance */}
      <div className={`${
        isDark ? 'bg-slate-800' : 'bg-white'
      } rounded-2xl p-6 shadow-sm`}>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">📦</span>
          </div>
          
          <div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              اولین پکیج خود را ایجاد کنید
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} leading-relaxed`}>
              برای شروع فعالیت در پلتفرم فایدو، ابتدا باید یک پکیج ایجاد کنید. 
              پکیج شما شامل تخفیفات، هدایا و تجربیات ویژه برای مشتریان خواهد بود.
            </p>
          </div>

          {/* Steps Guide */}
          <div className="space-y-3 text-right">
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ۱
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    تعریف تخفیفات
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    تخفیف کلی و تخفیفات خاص برای محصولات یا خدمات
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ۲
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    هدایای ویژه
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    تعریف هدایای ویژه برای مشتریان وفادار
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ۳
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    تجربیات VIP
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    انتخاب تجربیات ویژه برای مشتریان VIP
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ۴
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    تایید و فعال‌سازی
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    ارسال برای تایید و فعال‌سازی پکیج
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Link
              to="/dashboard/packages"
              className="inline-flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>ایجاد اولین پکیج</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className={`${
        isDark ? 'bg-slate-800' : 'bg-white'
      } rounded-2xl p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          مزایای ایجاد پکیج
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                جذب مشتریان بیشتر
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                با تخفیفات و هدایای جذاب
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                افزایش وفاداری مشتریان
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                با تجربیات VIP ویژه
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                مدیریت بهتر فروش
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                با آمار و گزارش‌های دقیق
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                رقابت بهتر در بازار
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                با پکیج‌های متنوع و جذاب
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className={`${
        isDark ? 'bg-slate-800' : 'bg-white'
      } rounded-2xl p-6 shadow-sm`}>
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            نیاز به راهنمایی دارید؟
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-4`}>
            تیم پشتیبانی فایدو آماده کمک به شما است
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } transition-colors`}>
              📞 تماس با پشتیبانی
            </button>
            <button className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } transition-colors`}>
              📖 راهنمای کامل
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
