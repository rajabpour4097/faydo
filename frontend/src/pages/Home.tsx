import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const Home = () => {
  const { user } = useAuth()
  const isAuthenticated = !!user

  const features = [
    {
      title: 'تخفیف‌های ویژه',
      description: 'دسترسی به تخفیف‌های منحصر به فرد کسب‌وکارها',
      icon: '🎯'
    },
    {
      title: 'امتیاز جمع‌آوری',
      description: 'با هر خرید امتیاز جمع کنید و پاداش دریافت کنید',
      icon: '⭐'
    },
    {
      title: 'سطح‌بندی کاربران',
      description: 'با ارتقای سطح، تخفیف‌های بیشتری دریافت کنید',
      icon: '🏆'
    },
    {
      title: 'تجربه‌های ویژه',
      description: 'دسترسی به رویدادها و تجربه‌های اختصاصی',
      icon: '🎪'
    }
  ]

  const stats = [
    { label: 'کسب‌وکار فعال', value: '500+' },
    { label: 'کاربر راضی', value: '10K+' },
    { label: 'تخفیف فعال', value: '1K+' },
    { label: 'شهر پوشش', value: '50+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              باشگاه مشتریان 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> فایدو</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              تجربه خرید بهتر با تخفیف‌های ویژه، امتیازجمع‌آوری و دسترسی به تجربه‌های منحصر به فرد
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    شروع کنید - رایگان
                  </Link>
                  <Link
                    to="/businesses"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    کسب‌وکارها
                  </Link>
                </>
              ) : (
                <Link
                  to={user?.type === 'customer' ? '/dashboard/customer' : '/dashboard/business'}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  ورود به پنل کاربری
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              چرا فایدو؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              پلتفرم جامع باشگاه مشتریان که تجربه خرید شما را متحول می‌کند
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-4 text-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              چگونه کار می‌کند؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              سه قدم ساده تا شروع سفر پرفایده شما
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ثبت‌نام کنید
              </h3>
              <p className="text-gray-600">
                در چند ثانیه حساب کاربری خود را ایجاد کنید
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                خرید کنید
              </h3>
              <p className="text-gray-600">
                از کسب‌وکارهای عضو خرید کنید و امتیاز جمع کنید
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                پاداش بگیرید
              </h3>
              <p className="text-gray-600">
                امتیازهای خود را تبدیل به تخفیف و هدایا کنید
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            آماده شروع هستید؟
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            همین الان عضو شوید و از تخفیف‌های ویژه و امتیازات باشگاه مشتریان بهره‌مند شوید
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              عضویت رایگان
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
