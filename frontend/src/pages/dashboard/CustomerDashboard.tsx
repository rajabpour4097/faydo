import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Discount } from '../../types/discount'
import { ShoppingBag, Percent, Star, TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StatPill } from '../../components/ui/StatPill'
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
      <div className="min-h-[calc(100vh-4rem)] dashboard-bg p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">داشبورد مشتری</h1>
            <p className="text-white/70 text-sm lg:text-base">خوش آمدید! آمار و فعالیت‌های شما را مشاهده کنید.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatPill tone="blue" label="امتیاز فعلی" value={userStats.points.toLocaleString()} />
            <StatPill tone="purple" label="سطح" value={userStats.level} />
            <StatPill tone="mint" label="مجموع خرید" value={`${(userStats.totalSpent / 1000000).toFixed(1)}M`} />
            <StatPill tone="lilac" label="تخفیف استفاده شده" value={userStats.discountsUsed} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Progress to Next Level */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <SectionHeader title="پیشرفت تا سطح بعدی" className="mb-4" />
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>سطح {userStats.level}</span>
                    <span>سطح {userStats.nextLevel}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary-400 to-accent-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${userStats.levelProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-white/70 mt-2">
                    {userStats.pointsToNext} امتیاز تا سطح {userStats.nextLevel}
                  </p>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card>
                <SectionHeader title="فعالیت‌های اخیر" className="mb-6" />
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{activity.business}</p>
                        <p className="text-sm text-white/70">{activity.date}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-primary-200">+{activity.points} امتیاز</p>
                        <p className="text-sm text-white/70">{activity.amount.toLocaleString()} تومان</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Available Discounts */}
              <Card>
                <SectionHeader title="تخفیف‌های موجود" className="mb-6" />
                <div className="space-y-4">
                  {loadingDiscounts ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-300 mx-auto"></div>
                      <p className="text-sm text-white/60 mt-2">در حال بارگذاری...</p>
                    </div>
                  ) : availableDiscounts.length > 0 ? (
                    availableDiscounts.map((discount) => (
                      <div 
                        key={discount.id} 
                        className="border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => navigate('/dashboard/customer/discounts')}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-white">{discount.business_name || 'کسب‌وکار'}</p>
                          <span className="bg-danger-500/20 text-danger-200 text-sm px-2 py-1 rounded">
                            {discount.percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-white/80 mb-2">{discount.title}</p>
                        <p className="text-xs text-white/60">
                          تا {new Date(discount.end_date).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-white/60 text-sm">تخفیفی موجود نیست</p>
                    </div>
                  )}
                </div>
                {availableDiscounts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => navigate('/dashboard/customer/discounts')}
                      className="w-full text-center text-primary-300 hover:text-primary-200 font-medium text-sm transition-colors"
                    >
                      مشاهده همه تخفیف‌ها ←
                    </button>
                  </div>
                )}
              </Card>

              {/* Badges */}
              <Card>
                <SectionHeader title="مدال‌های کسب شده" className="mb-6" />
                <div className="space-y-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <p className="font-medium text-white">{badge.name}</p>
                        <p className="text-sm text_white/70">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
