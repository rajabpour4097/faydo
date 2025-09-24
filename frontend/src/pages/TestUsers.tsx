import { Link } from 'react-router-dom'

export const TestUsers = () => {
  const testUsers = [
    {
      title: 'داشبورد کسب‌وکار',
      username: 'business',
      password: 'test123',
      name: 'رستوران گلستان',
      description: 'مدیریت تخفیف‌ها، مشتریان، فروش و گزارش‌ها',
      color: 'from-blue-500 to-cyan-500',
      icon: '🏢'
    },
    {
      title: 'داشبورد مشتری',
      username: 'customer',
      password: 'test123',
      name: 'احمد محمدی',
      description: 'مشاهده امتیازات، پیشنهادات، تراکنش‌ها و اسکن QR',
      color: 'from-purple-500 to-pink-500',
      icon: '👤'
    },
    {
      title: 'داشبورد مدیر IT',
      username: 'admin',
      password: 'test123',
      name: 'مدیر سیستم',
      description: 'مانیتورینگ سیستم، مدیریت کاربران و گزارش‌های فنی',
      color: 'from-green-500 to-emerald-500',
      icon: '🖥️'
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            کاربران تستی داشبورد فایدو 🧪
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            برای تست داشبوردهای مختلف، از کاربران زیر استفاده کنید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testUsers.map((user, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-r ${user.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                <span className="text-white text-2xl">{user.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                {user.title}
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                {user.description}
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">نام کاربری:</span>
                    <button 
                      onClick={() => copyToClipboard(user.username)}
                      className="text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-2 py-1 rounded"
                    >
                      {user.username}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">رمز عبور:</span>
                    <button 
                      onClick={() => copyToClipboard(user.password)}
                      className="text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-2 py-1 rounded"
                    >
                      {user.password}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">نام نمایشی: <strong>{user.name}</strong></p>
                  <Link
                    to="/login"
                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${user.color} text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                  >
                    ورود به داشبورد
                    <span className="mr-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            راهنمای استفاده 📖
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">مراحل تست:</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3 mt-0.5">1</span>
                  <span>روی دکمه "ورود به داشبورد" کلیک کنید</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3 mt-0.5">2</span>
                  <span>نام کاربری و رمز عبور مربوطه را وارد کنید</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3 mt-0.5">3</span>
                  <span>داشبورد مربوط به نوع کاربر نمایش داده می‌شود</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3 mt-0.5">4</span>
                  <span>برای تست کاربر دیگر، ابتدا خروج کنید</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ویژگی‌های قابل تست:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 ml-2">✓</span>
                  سایدبار راست به چپ (RTL)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 ml-2">✓</span>
                  منوهای متفاوت برای هر نوع کاربر
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 ml-2">✓</span>
                  کارت‌های آماری با انیمیشن
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 ml-2">✓</span>
                  طراحی ایزومتریک مدرن
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 ml-2">✓</span>
                  Responsive Design
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 ml-2">✓</span>
                  فونت فارسی IRANYekan
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 text-xl ml-2">⚠️</span>
              <p className="text-yellow-800">
                <strong>توجه:</strong> این کاربران فقط برای تست محلی هستند و بدون اتصال به backend کار می‌کنند.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  )
}
