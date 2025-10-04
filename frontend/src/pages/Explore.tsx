import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { apiService, Package } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface ExploreProps {}

// interface BusinessCategory {
//   id: number
//   name: string
// }

interface FilterState {
  category: string
  sortBy: 'discount_high' | 'discount_low' | 'newest' | ''
  search: string
}

export const Explore: React.FC<ExploreProps> = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  // const [categories] = useState<BusinessCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    sortBy: '',
    search: ''
  })

  // Check if user is customer
  useEffect(() => {
    if (user && user.type !== 'customer') {
      // Redirect non-customer users to dashboard
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  // Show access denied if user is not customer
  if (user.type !== 'customer') {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              دسترسی محدود
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              این صفحه فقط برای مشتریان قابل دسترسی است
            </p>
          </div>
        </div>
      </MobileDashboardLayout>
    )
  }

  useEffect(() => {
    console.log('🔍 Explore component mounted')
    console.log('🔍 User from localStorage:', localStorage.getItem('auth_user'))
    console.log('🔍 Access token:', localStorage.getItem('access_token'))
    loadActivePackages()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [packages, filters])

  const loadActivePackages = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading packages...')
      
      // استفاده از authenticated endpoint
      const response = await apiService.getPackages()
      console.log('📦 API Response:', response)
      
      if (response.data) {
        console.log('📊 Raw packages:', response.data)
        // فقط پکیج‌های فعال و تایید شده
        const activePackages = response.data.filter(pkg => 
          pkg.is_active && pkg.status === 'approved' && pkg.is_complete
        )
        console.log('✅ Active packages:', activePackages)
        setPackages(activePackages)
      } else {
        console.error('❌ No data in response:', response)
        // برای تست، داده‌های نمونه اضافه کن
        console.log('🔧 Adding sample data for testing...')
        const samplePackages: Package[] = [
          {
            id: 1,
            business_name: 'رستوران تست',
            is_active: true,
            status: 'approved',
            status_display: 'تایید شده',
            is_complete: true,
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            discount_percentage: 20,
            elite_gift_title: 'هدیه رایگان',
            vip_experiences_count: 2
          }
        ]
        setPackages(samplePackages)
        setError(null)
      }
    } catch (error) {
      console.error('❌ Error loading packages:', error)
      setError('خطا در دریافت پکیج‌ها')
    } finally {
      setLoading(false)
    }
  }

  // const loadCategories = async () => {
  //   // Function temporarily disabled
  // }

  const applyFilters = () => {
    console.log('🔍 Applying filters...', { packages: packages.length, filters })
    let filtered = [...packages]

    // فیلتر بر اساس جستجو
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(pkg => 
        pkg.business_name?.toLowerCase().includes(searchTerm) ||
        pkg.elite_gift_title?.toLowerCase().includes(searchTerm)
      )
    }

    // فیلتر بر اساس دسته‌بندی
    if (filters.category) {
      // این قسمت نیاز به اطلاعات دسته‌بندی کسب‌وکار در پکیج دارد
      // فعلاً کامنت می‌کنیم
      // filtered = filtered.filter(pkg => pkg.business_category_id === parseInt(filters.category))
    }

    // مرتب‌سازی
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'discount_high':
          filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
          break
        case 'discount_low':
          filtered.sort((a, b) => (a.discount_percentage || 0) - (b.discount_percentage || 0))
          break
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
      }
    }

    console.log('✅ Filtered packages:', filtered.length)
    setFilteredPackages(filtered)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // const clearFilters = () => {
  //   setFilters({
  //     category: '',
  //     sortBy: '',
  //     search: ''
  //   })
  // }

  if (loading) {
    return (
      <MobileDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            اکسپلور
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            بهترین پیشنهادات و تخفیف‌های ویژه را کشف کنید
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="جستجو در کسب‌وکارها و پیشنهادات..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="">مرتب‌سازی</option>
                <option value="newest">جدیدترین</option>
                <option value="discount_high">بیشترین تخفیف</option>
                <option value="discount_low">کمترین تخفیف</option>
              </select>
            </div>
          </div>
        </div>


        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Package Cards Grid */}
        {filteredPackages.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-400 dark:text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                پکیجی یافت نشد
              </h3>
              <p className="text-gray-600 dark:text-slate-400">
                متأسفانه پکیجی با این مشخصات یافت نشد. لطفاً فیلترهای خود را تغییر دهید.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        )}
      </div>
    </MobileDashboardLayout>
  )
}

// Package Card Component
interface PackageCardProps {
  package: Package
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg }) => {
  const handleCardClick = () => {
    // اینجا می‌توانیم به صفحه جزئیات پکیج هدایت کنیم
    console.log('Package clicked:', pkg.id)
  }

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-slate-700 group"
      onClick={handleCardClick}
    >
      {/* Business Image/Logo */}
      <div className="relative h-48 overflow-hidden">
        {pkg.business_logo ? (
          <img 
            src={pkg.business_logo} 
            alt={pkg.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // اگر عکس لود نشد، fallback به gradient
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        
        {/* Fallback gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300 ${pkg.business_image ? 'hidden' : ''}`}>
          {/* Placeholder for business image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* VIP Badge */}
        {pkg.vip_experiences_count && pkg.vip_experiences_count > 0 && (
          <div className="absolute bottom-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium">
              VIP+
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm flex items-center">
            <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            4.8
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Business Logo & Name */}
        <div className="flex items-center mb-3">
  
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {pkg.business_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {pkg.business_category?.name || 'کسب‌وکار'}
            </p>
          </div>
          <div className="text-left">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                4.8
              </span>
            </div>
          </div>
        </div>

        {/* Discount Badge */}
        {pkg.discount_percentage && (
          <div className="mb-4">
            <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              %{pkg.discount_percentage} تخفیف
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-2 mb-6">
          {pkg.elite_gift_title && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-blue-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-gray-700 dark:text-slate-300">
                {pkg.elite_gift_title} {pkg.elite_gift_count ? `با ${pkg.elite_gift_count} خرید` : `با ${pkg.elite_gift_amount} تومان خرید`}
              </span>
            </div>
          )}

          {pkg.vip_experiences_count && pkg.vip_experiences_count > 0 && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-purple-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-gray-700 dark:text-slate-300">
                دسترسی VIP ({pkg.vip_experiences_count} تجربه)
              </span>
            </div>
          )}

          {pkg.days_remaining && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-orange-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-slate-300">
                {pkg.days_remaining} روز باقی‌مانده
              </span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <div className="text-left">
          <button className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 px-3 py-2 rounded-lg">
            مشاهده جزئیات
            <svg className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
