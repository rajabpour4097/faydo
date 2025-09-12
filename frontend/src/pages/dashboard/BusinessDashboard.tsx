import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { DiscountDashboard } from '../../components/discounts/DiscountDashboard'
import { CreateDiscountModal } from '../../components/discounts/CreateDiscountModal'
import { DiscountCreate } from '../../types/discount'
import discountService from '../../services/discountService'
import { Card } from '../../components/ui/Card'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StatPill } from '../../components/ui/StatPill'

export const BusinessDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentComments = async () => {
      console.log('🔍 Starting to fetch recent comments...')
      try {
        console.log('📞 Calling discountService.getRecentComments()')
        const comments = await discountService.getRecentComments()
        console.log('✅ API Success! Received comments:', comments)
        setRecentReviews(comments)
      } catch (error) {
        console.error('❌ Error fetching recent comments:', error)
        // Fallback to static data if API fails
        setRecentReviews([
          { customer_name: 'آرش محمدی', rating: 5, comment: 'خدمات عالی و غذای خوشمزه', created_at: '۱۴۰۳/۰۶/۱۵' },
          { customer_name: 'نگار حسینی', rating: 4, comment: 'محیط دنج و کیفیت مناسب', created_at: '۱۴۰۳/۰۶/۱۴' },
          { customer_name: 'امیر تقوی', rating: 5, comment: 'پیشنهاد می‌کنم حتماً امتحان کنید', created_at: '۱۴۰۳/۰۶/۱۳' },
        ])
      } finally {
        console.log('🏁 fetchRecentComments completed')
        setLoading(false)
      }
    }

    fetchRecentComments()
  }, [])

  const handleCreateDiscount = async (discountData: DiscountCreate) => {
    try {
      await discountService.createDiscount(discountData)
      setShowCreateModal(false)
      // می‌توانید اینجا notification نمایش دهید یا صفحه را reload کنید
      window.location.reload() // برای نمایش تخفیف جدید
    } catch (error) {
      console.error('Error creating discount:', error)
      // می‌توانید اینجا error notification نمایش دهید
    }
  }
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

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] dashboard-bg p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">داشبورد کسب‌وکار</h1>
            <p className="text-white/70 text-sm lg:text-base">مدیریت باشگاه مشتریان و مشاهده آمار عملکرد</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatPill tone="blue" label="کل مشتریان" value={businessStats.totalCustomers.toLocaleString()} />
            <StatPill tone="mint" label="درآمد ماهانه" value={`${(businessStats.monthlyRevenue / 1000000).toFixed(1)}M`} />
            <StatPill tone="purple" label="امتیاز رضایت" value={`${businessStats.averageRating} (${businessStats.reviewCount})`} />
            <StatPill tone="lilac" label="استفاده از تخفیف" value={`${businessStats.discountUsage}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <DiscountDashboard />

              <Card>
                <SectionHeader
                  title="عملکرد تخفیف‌ها"
                  action={(
                    <button onClick={() => setShowCreateModal(true)} className="text-primary-300 hover:text-primary-200 text-sm font-medium">
                      افزودن تخفیف جدید +
                    </button>
                  )}
                  className="mb-6"
                />
                <div className="space-y-4">
                  {discountPerformance.map((discount, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-white">{discount.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                          discount.category === 'vip' ? 'bg-accent-500/20 text-accent-200' :
                          discount.category === 'sample' ? 'bg-success-500/20 text-success-200' :
                          'bg-primary-500/20 text-primary-200'
                        }`}>
                          {discount.percentage}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-white/70">استفاده شده: {discount.usage} بار</p>
                        <div className="w-28 bg-white/10 rounded-full h-2">
                          <div className="bg-primary-400 h-2 rounded-full" style={{ width: `${Math.min((discount.usage / 150) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionHeader title="مشتریان اخیر" className="mb-6" />
                <div className="space-y-4">
                  {recentCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                          <span className="text-primary-200 font-medium">{customer.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-sm text-white/70">آخرین بازدید: {customer.lastVisit}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">{customer.totalSpent.toLocaleString()} تومان</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          customer.level === 'VIP' ? 'bg-accent-500/20 text-accent-200' :
                          customer.level === 'نقره‌ای' ? 'bg-white/10 text-white' :
                          'bg-warning-500/20 text-warning-200'
                        }`}>
                          {customer.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <SectionHeader title="اقدامات سریع" className="mb-6" />
                <div className="space-y-3">
                  <button className="w-full text-right p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">📊 مشاهده گزارش‌ها</button>
                  <button onClick={() => setShowCreateModal(true)} className="w-full text-right p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">🎯 ایجاد تخفیف جدید</button>
                  <button className="w-full text-right p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">📢 ارسال اطلاعیه</button>
                  <button className="w-full text-right p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">👥 مدیریت مشتریان</button>
                </div>
              </Card>

              <Card>
                <SectionHeader title="نظرات اخیر" className="mb-6" />
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center text-white/70">در حال بارگذاری...</div>
                  ) : recentReviews.length > 0 ? (
                    recentReviews.map((review, index) => (
                      <div key={index} className="border-b border-white/10 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-white">{review.customer_name}</p>
                          <div className="flex items-center">
                            <span className="text-yellow-300 text-sm">{'⭐'.repeat(review.rating)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-white/80 mb-1">{review.comment}</p>
                        <p className="text-xs text-white/60">{review.created_at}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white/70">نظری ثبت نشده است</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateDiscountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDiscount}
        />
      )}
    </DashboardLayout>
  )
}
