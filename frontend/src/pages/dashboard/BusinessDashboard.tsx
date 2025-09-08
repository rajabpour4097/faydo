export const BusinessDashboard = () => {
  const businessStats = {
    totalCustomers: 1289,
    monthlyRevenue: 45000000,
    activeDiscounts: 5,
    averageRating: 4.8,
    reviewCount: 156,
    discountUsage: 89,
    monthlyGrowth: 12.5
  }

  const recentCustomers = [
    { name: 'علی احمدی', lastVisit: '۱۴۰۳/۰۶/۱۵', totalSpent: 850000, level: 'نقره‌ای' },
    { name: 'مریم کریمی', lastVisit: '۱۴۰۳/۰۶/۱۴', totalSpent: 650000, level: 'برنزی' },
    { name: 'حسن رضایی', lastVisit: '۱۴۰۳/۰۶/۱۳', totalSpent: 1200000, level: 'VIP' },
  ]

  const discountPerformance = [
    { title: 'تخفیف غذای اصلی', usage: 85, percentage: '15%', category: 'general' },
    { title: 'تخفیف ویژه VIP', usage: 45, percentage: '25%', category: 'vip' },
    { title: 'نمونه رایگان دسر', usage: 120, percentage: 'رایگان', category: 'sample' },
  ]

  const recentReviews = [
    { customer: 'آرش محمدی', rating: 5, comment: 'خدمات عالی و غذای خوشمزه', date: '۱۴۰۳/۰۶/۱۵' },
    { customer: 'نگار حسینی', rating: 4, comment: 'محیط دنج و کیفیت مناسب', date: '۱۴۰۳/۰۶/۱۴' },
    { customer: 'امیر تقوی', rating: 5, comment: 'پیشنهاد می‌کنم حتماً امتحان کنید', date: '۱۴۰۳/۰۶/۱۳' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد کسب‌وکار</h1>
          <p className="text-gray-600">مدیریت باشگاه مشتریان و مشاهده آمار عملکرد</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">کل مشتریان</p>
                <p className="text-2xl font-bold text-blue-600">{businessStats.totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{businessStats.monthlyGrowth}% این ماه</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">درآمد ماهانه</p>
                <p className="text-2xl font-bold text-green-600">{(businessStats.monthlyRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600">تومان</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">امتیاز رضایت</p>
                <p className="text-2xl font-bold text-yellow-600">{businessStats.averageRating}</p>
                <p className="text-xs text-gray-600">{businessStats.reviewCount} نظر</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">استفاده از تخفیف</p>
                <p className="text-2xl font-bold text-purple-600">{businessStats.discountUsage}</p>
                <p className="text-xs text-gray-600">این ماه</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discount Performance */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">عملکرد تخفیف‌ها</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  افزودن تخفیف جدید +
                </button>
              </div>
              <div className="space-y-4">
                {discountPerformance.map((discount, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{discount.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        discount.category === 'vip' ? 'bg-purple-100 text-purple-800' :
                        discount.category === 'sample' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {discount.percentage}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">استفاده شده: {discount.usage} بار</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((discount.usage / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Customers */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">مشتریان اخیر</h2>
              <div className="space-y-4">
                {recentCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{customer.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-600">آخرین بازدید: {customer.lastVisit}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{customer.totalSpent.toLocaleString()} تومان</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        customer.level === 'VIP' ? 'bg-purple-100 text-purple-800' :
                        customer.level === 'نقره‌ای' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {customer.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">اقدامات سریع</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  📊 مشاهده گزارش‌ها
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  🎯 ایجاد تخفیف جدید
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  📢 ارسال اطلاعیه
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  👥 مدیریت مشتریان
                </button>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">نظرات اخیر</h2>
              <div className="space-y-4">
                {recentReviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{review.customer}</p>
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-sm">{'⭐'.repeat(review.rating)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
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
