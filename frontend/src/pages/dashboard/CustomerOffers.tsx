import { DashboardLayout } from '../../components/layout/DashboardLayout'

export const CustomerOffers = () => {
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
      <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">تخفیف‌ها و پیشنهادات</h1>
            <p className="text-white/70">از تخفیف‌های ویژه و پیشنهادات محدود استفاده کنید.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">تخفیف‌های موجود</p>
                  <p className="text-2xl font-bold text-lavender">{availableOffers.length}</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">استفاده شده</p>
                  <p className="text-2xl font-bold text-mint">{usedOffers.length}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">مجموع صرفه‌جویی</p>
                  <p className="text-2xl font-bold text-lilac">
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
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">تخفیف‌های موجود</h2>
                <div className="grid gap-6">
                  {availableOffers.map((offer) => (
                    <div key={offer.id} className="border border-white/10 bg-white/5 rounded-xl p-6 hover:shadow-soft transition-shadow text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-4xl">{offer.image}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{offer.title}</h3>
                            <p className="text-sm text-white/70">{offer.business}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="bg-red-500/20 text-red-300 text-lg font-bold px-3 py-2 rounded-lg">
                            {offer.discount}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-white/80 mb-4">{offer.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                        <span>دسته‌بندی: {offer.category}</span>
                        <span>اعتبار تا: {offer.validUntil}</span>
                      </div>
                      
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-300">⚠️ {offer.terms}</p>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-colors border border-white/10 shadow-soft">
                        استفاده از تخفیف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Used Offers History */}
            <div>
              <div className="glass rounded-2xl p-6 text-white">
                <h2 className="text-xl font-bold text-white mb-6">تاریخچه استفاده</h2>
                <div className="space-y-4">
                  {usedOffers.map((offer) => (
                    <div key={offer.id} className="border border-white/10 bg-white/5 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">{offer.title}</h4>
                      <p className="text-sm text-white/70 mb-2">{offer.business}</p>
                      <div className="flex justify-between items-center text-sm text-white/70">
                        <span>{offer.usedDate}</span>
                        <span className="text-mint font-medium">
                          صرفه‌جویی: {offer.savedAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 text-white font-medium py-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
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
