export const CustomerDashboard = () => {
  const userStats = {
    points: 1250,
    level: 'برنزی',
    levelProgress: 62,
    nextLevel: 'نقره‌ای',
    pointsToNext: 750,
    totalSpent: 2500000,
    discountsUsed: 15
  }

  const recentActivity = [
    { date: '۱۴۰۳/۰۶/۱۵', business: 'رستوران گلستان', points: 85, amount: 450000 },
    { date: '۱۴۰۳/۰۶/۱۲', business: 'کافه فن‌جان', points: 45, amount: 230000 },
    { date: '۱۴۰۳/۰۶/۱۰', business: 'مرکز خرید آرمیتا', points: 120, amount: 650000 },
  ]

  const availableDiscounts = [
    { business: 'رستوران سنتی', discount: '15%', validUntil: '۱۴۰۳/۰۷/۰۱', category: 'رستوران' },
    { business: 'کافه نوین', discount: '10%', validUntil: '۱۴۰۳/۰۶/۳۰', category: 'کافه' },
    { business: 'پوشاک مدرن', discount: '20%', validUntil: '۱۴۰۳/۰۷/۱۵', category: 'پوشاک' },
  ]

  const badges = [
    { name: 'خریدار منظم', icon: '🏅', description: 'خرید در ۵ کسب‌وکار مختلف' },
    { name: 'نظردهنده فعال', icon: '💬', description: 'نوشتن ۱۰ نظر' },
    { name: 'صرفه‌جو', icon: '💰', description: 'استفاده از ۲۰ تخفیف' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد مشتری</h1>
          <p className="text-gray-600">خوش آمدید! آمار و فعالیت‌های شما را مشاهده کنید.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">امتیاز فعلی</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.points.toLocaleString()}</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">سطح عضویت</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.level}</p>
              </div>
              <div className="text-3xl">🥉</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مجموع خرید</p>
                <p className="text-2xl font-bold text-green-600">{(userStats.totalSpent / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-3xl">💳</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تخفیف استفاده شده</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.discountsUsed}</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress to Next Level */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">پیشرفت تا سطح بعدی</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>سطح {userStats.level}</span>
                  <span>سطح {userStats.nextLevel}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${userStats.levelProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {userStats.pointsToNext} امتیاز تا سطح {userStats.nextLevel}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">فعالیت‌های اخیر</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.business}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-blue-600">+{activity.points} امتیاز</p>
                      <p className="text-sm text-gray-600">{activity.amount.toLocaleString()} تومان</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Discounts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">تخفیف‌های موجود</h2>
              <div className="space-y-4">
                {availableDiscounts.map((discount, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{discount.business}</p>
                      <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                        {discount.discount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{discount.category}</p>
                    <p className="text-xs text-gray-500">تا {discount.validUntil}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">مدال‌های کسب شده</h2>
              <div className="space-y-4">
                {badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
