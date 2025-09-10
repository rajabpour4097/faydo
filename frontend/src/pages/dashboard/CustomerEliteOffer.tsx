import { DashboardLayout } from '../../components/layout/DashboardLayout'

export const CustomerEliteOffer = () => {
  const availableOffers = [
    {
      id: 1,
      business: 'رستوران گلستان',
      title: 'تخفیف ۲۰٪ غذای اصلی',
      description: 'تخفیف ویژه برای تمام غذاهای اصلی منو',
      discount: '20%',
      validUntil: '۱۴۰۳/۰۷/۱۵',
      category: 'رستوران',
      image: '🍽️',
      terms: 'حداقل سفارش ۲۰۰,۰۰۰ تومان'
    },
    {
      id: 2,
      business: 'کافه نوین',
      title: 'قهوه رایگان',
      description: 'با خرید هر کیک، یک قهوه رایگان دریافت کنید',
      discount: 'رایگان',
      validUntil: '۱۴۰۳/۰۶/۳۰',
      category: 'کافه',
      image: '☕',
      terms: 'فقط برای اعضای برنزی و بالاتر'
    },
    {
      id: 3,
      business: 'پوشاک مدرن',
      title: 'تخفیف ۳۰٪ پوشاک پاییزه',
      description: 'تخفیف ویژه روی تمام لباس‌های پاییزه',
      discount: '30%',
      validUntil: '۱۴۰۳/۰۷/۳۰',
      category: 'پوشاک',
      image: '👕',
      terms: 'قابل تجمیع با سایر تخفیف‌ها نمی‌باشد'
    },
    {
      id: 4,
      business: 'سوپرمارکت آسان',
      title: 'کش‌بک ۱۵٪',
      description: 'بازگشت ۱۵٪ از مبلغ خرید به صورت امتیاز',
      discount: '15%',
      validUntil: '۱۴۰۳/۰۷/۰۱',
      category: 'سوپرمارکت',
      image: '🛒',
      terms: 'حداکثر ۵۰,۰۰۰ تومان کش‌بک'
    }
  ]

  const usedOffers = [
    {
      id: 1,
      business: 'کتابخانه نشر علم',
      title: 'تخفیف ۱۰٪ کتاب‌های علمی',
      usedDate: '۱۴۰۳/۰۶/۱۰',
      savedAmount: 45000
    },
    {
      id: 2,
      business: 'پیتزا لذیذ',
      title: 'پیتزا رایگان',
      usedDate: '۱۴۰۳/۰۶/۰۵',
      savedAmount: 180000
    }
  ]

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تخفیف اعضای ویژه</h1>
            <p className="text-gray-600">از تخفیف‌های ویژه اعضای پلاتینیوم و الماس استفاده کنید.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تخفیف ویژه موجود</p>
                  <p className="text-2xl font-bold text-blue-600">{availableOffers.length}</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">استفاده شده</p>
                  <p className="text-2xl font-bold text-green-600">{usedOffers.length}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مجموع صرفه‌جویی</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(usedOffers.reduce((sum, offer) => sum + offer.savedAmount, 0) / 1000).toLocaleString()}K
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Offers */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">تخفیف اعضای ویژه موجود</h2>
                <div className="grid gap-6">
                  {availableOffers.map((offer) => (
                    <div key={offer.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-4xl">{offer.image}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                            <p className="text-sm text-gray-600">{offer.business}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="bg-red-100 text-red-800 text-lg font-bold px-3 py-2 rounded-lg">
                            {offer.discount}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{offer.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>دسته‌بندی: {offer.category}</span>
                        <span>اعتبار تا: {offer.validUntil}</span>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">⚠️ {offer.terms}</p>
                      </div>
                      
                      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        استفاده از تخفیف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Used Offers History */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">تاریخچه استفاده</h2>
                <div className="space-y-4">
                  {usedOffers.map((offer) => (
                    <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{offer.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{offer.business}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{offer.usedDate}</span>
                        <span className="text-green-600 font-medium">
                          صرفه‌جویی: {offer.savedAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 text-blue-600 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors">
                  مشاهده همه
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
