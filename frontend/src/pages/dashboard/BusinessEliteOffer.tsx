import { DashboardLayout } from '../../components/layout/DashboardLayout'

export const BusinessEliteOffer = () => {
  const activeOffers = [
    {
      id: 1,
      title: 'تخفیف ۲۰٪ غذای اصلی',
      description: 'تخفیف ویژه برای تمام غذاهای اصلی منو',
      discount: '20%',
      validUntil: '۱۴۰۳/۰۷/۱۵',
      usageCount: 45,
      status: 'active',
      category: 'general'
    },
    {
      id: 2,
      title: 'قهوه رایگان با کیک',
      description: 'با خرید هر کیک، یک قهوه رایگان دریافت کنید',
      discount: 'رایگان',
      validUntil: '۱۴۰۳/۰۶/۳۰',
      usageCount: 23,
      status: 'expiring_soon',
      category: 'combo'
    },
    {
      id: 3,
      title: 'تخفیف ویژه VIP',
      description: 'تخفیف ۳۰٪ برای مشتریان VIP',
      discount: '30%',
      validUntil: '۱۴۰۳/۰۸/۰۱',
      usageCount: 12,
      status: 'active',
      category: 'vip'
    }
  ]

  const offerStats = {
    totalOffers: 8,
    activeOffers: 3,
    expiredOffers: 2,
    totalUsage: 156,
    totalRevenue: 12500000
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال'
      case 'expiring_soon':
        return 'به زودی منقضی'
      case 'expired':
        return 'منقضی شده'
      default:
        return 'نامشخص'
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت تخفیف اعضای ویژه</h1>
              <p className="text-gray-600">تخفیف اعضای ویژه خود را ایجاد و مدیریت کنید.</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              + ایجاد تخفیف جدید
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل تخفیف اعضای ویژه</p>
                  <p className="text-2xl font-bold text-blue-600">{offerStats.totalOffers}</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تخفیف فعال اعضای ویژه</p>
                  <p className="text-2xl font-bold text-green-600">{offerStats.activeOffers}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">استفاده شده</p>
                  <p className="text-2xl font-bold text-purple-600">{offerStats.totalUsage}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">درآمد حاصل</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(offerStats.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">منقضی شده</p>
                  <p className="text-2xl font-bold text-red-600">{offerStats.expiredOffers}</p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>
          </div>

          {/* Active Offers */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">تخفیف فعال اعضای ویژه</h2>
              <div className="flex space-x-2 space-x-reverse">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  فیلتر
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  مرتب‌سازی
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {activeOffers.map((offer) => (
                <div key={offer.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>
                          {getStatusText(offer.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{offer.description}</p>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                        <span>اعتبار تا: {offer.validUntil}</span>
                        <span>•</span>
                        <span>استفاده شده: {offer.usageCount} بار</span>
                      </div>
                    </div>
                    <div className="text-left ml-6">
                      <div className="bg-blue-100 text-blue-800 text-xl font-bold px-4 py-2 rounded-lg mb-4">
                        {offer.discount}
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          ویرایش
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          آمار
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>میزان استفاده</span>
                      <span>{offer.usageCount}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(offer.usageCount / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">گزارش عملکرد</h3>
              <p className="text-gray-600 mb-4">آمار و گزارش تخفیف‌هایتان را مشاهده کنید</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                مشاهده گزارش
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">تخفیف هدفمند</h3>
              <p className="text-gray-600 mb-4">تخفیف ویژه برای گروه خاصی از مشتریان</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                ایجاد تخفیف هدفمند
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">تخفیف زمان‌بندی شده</h3>
              <p className="text-gray-600 mb-4">تخفیف‌هایی برای زمان‌های خاص</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                برنامه‌ریزی تخفیف
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
