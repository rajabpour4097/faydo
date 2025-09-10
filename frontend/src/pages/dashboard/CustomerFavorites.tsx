import { DashboardLayout } from '../../components/layout/DashboardLayout'

export const CustomerFavorites = () => {
  const favoriteBusinesses = [
    {
      id: 1,
      name: 'رستوران گلستان',
      category: 'رستوران',
      rating: 4.8,
      lastVisit: '۱۴۰۳/۰۶/۱۵',
      totalVisits: 12,
      totalSpent: 850000,
      image: '🍽️'
    },
    {
      id: 2,
      name: 'کافه نوین',
      category: 'کافه',
      rating: 4.6,
      lastVisit: '۱۴۰۳/۰۶/۱۰',
      totalVisits: 8,
      totalSpent: 420000,
      image: '☕'
    },
    {
      id: 3,
      name: 'پوشاک مدرن',
      category: 'پوشاک',
      rating: 4.9,
      lastVisit: '۱۴۰۳/۰۵/۲۵',
      totalVisits: 5,
      totalSpent: 1200000,
      image: '👕'
    }
  ]

  return (
    <DashboardLayout>
      <div className="mr-64 min-h-[calc(100vh-4rem)] bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">علاقه‌مندی‌ها</h1>
            <p className="text-gray-600">کسب‌وکارهای مورد علاقه شما</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">علاقه‌مندی‌ها</p>
                  <p className="text-2xl font-bold text-blue-600">{favoriteBusinesses.length}</p>
                </div>
                <div className="text-3xl">❤️</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل بازدیدها</p>
                  <p className="text-2xl font-bold text-green-600">
                    {favoriteBusinesses.reduce((sum, business) => sum + business.totalVisits, 0)}
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل خریدها</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(favoriteBusinesses.reduce((sum, business) => sum + business.totalSpent, 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
          </div>

          {/* Favorite Businesses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">کسب‌وکارهای مورد علاقه</h2>
            <div className="grid gap-6">
              {favoriteBusinesses.map((business) => (
                <div key={business.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-4xl">{business.image}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{business.category}</p>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="text-yellow-500">⭐</span>
                            <span className="mr-1">{business.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{business.totalVisits} بازدید</span>
                          <span>•</span>
                          <span>آخرین بازدید: {business.lastVisit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-semibold text-green-600 mb-2">
                        {business.totalSpent.toLocaleString()} تومان
                      </p>
                      <div className="flex space-x-2 space-x-reverse">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          مشاهده
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {favoriteBusinesses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز کسب‌وکاری را علاقه‌مند نکرده‌اید</h3>
                <p className="text-gray-600">با جستجو در کسب‌وکارها، آن‌هایی که دوست دارید را علاقه‌مند کنید</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
