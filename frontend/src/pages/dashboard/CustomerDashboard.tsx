import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Discount } from '../../types/discount'
import { ShoppingBag, Percent, Star, TrendingUp } from 'lucide-react'
import discountService from '../../services/discountService'

export const CustomerDashboard = () => {
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([])
  const [loadingDiscounts, setLoadingDiscounts] = useState(true)
  const navigate = useNavigate()
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

  // Load available discounts from API
  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        setLoadingDiscounts(true)
        const data = await discountService.getDiscounts()
        // Get only first 3 discounts for dashboard preview  
        setAvailableDiscounts(data.slice(0, 3))
      } catch (error) {
        console.error('Error loading discounts:', error)
      } finally {
        setLoadingDiscounts(false)
      }
    }

    loadDiscounts()
  }, [])

  const badges = [
    { name: 'خریدار منظم', icon: '🏅', description: 'خرید در ۵ کسب‌وکار مختلف' },
    { name: 'نظردهنده فعال', icon: '💬', description: 'نوشتن ۱۰ نظر' },
    { name: 'صرفه‌جو', icon: '💰', description: 'استفاده از ۲۰ تخفیف' },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">داشبورد مشتری</h1>
          <p className="text-gray-600 text-sm lg:text-base">خوش آمدید! آمار و فعالیت‌های شما را مشاهده کنید.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600">امتیاز فعلی</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">{userStats.points.toLocaleString()}</p>
              </div>
              <div className="text-2xl lg:text-3xl">⭐</div>
            </div>
          </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">امتیاز</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.points}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">سطح</p>
                <p className="text-lg font-bold text-orange-600">{userStats.level}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مجموع خرید</p>
                <p className="text-2xl font-bold text-green-600">{(userStats.totalSpent / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تخفیف استفاده شده</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.discountsUsed}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
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
                {loadingDiscounts ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">در حال بارگذاری...</p>
                  </div>
                ) : availableDiscounts.length > 0 ? (
                  availableDiscounts.map((discount) => (
                    <div 
                      key={discount.id} 
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => navigate('/dashboard/customer/discounts')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{discount.business_name || 'کسب‌وکار'}</p>
                        <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                          {discount.percentage}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{discount.title}</p>
                      <p className="text-xs text-gray-500">
                        تا {new Date(discount.end_date).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">تخفیفی موجود نیست</p>
                  </div>
                )}
              </div>
              {availableDiscounts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/dashboard/customer/discounts')}
                    className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    مشاهده همه تخفیف‌ها ←
                  </button>
                </div>
              )}
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
    </DashboardLayout>
  )
}
