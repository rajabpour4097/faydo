import React, { useState, useEffect } from 'react'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { apiService, Package } from '../services/api'

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

  useEffect(() => {
    loadActivePackages()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [packages, filters])

  const loadActivePackages = async () => {
    try {
      setLoading(true)
      
      // استفاده از authenticated endpoint
      const response = await apiService.getPackages()
      
      if (response.data) {
        // فقط پکیج‌های فعال و تایید شده
        const activePackages = response.data.filter(pkg => 
          pkg.is_active && pkg.status === 'approved' && pkg.is_complete
        )
        setPackages(activePackages)
      } else {
        setError(response.error || 'خطا در دریافت پکیج‌ها')
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      setError('خطا در دریافت پکیج‌ها')
    } finally {
      setLoading(false)
    }
  }

  // const loadCategories = async () => {
  //   // Function temporarily disabled
  // }

  const applyFilters = () => {
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
            اکتشاف
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

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {filteredPackages.length} پکیج یافت شد
          </p>
        </div>

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
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-slate-700"
      onClick={handleCardClick}
    >
      {/* Business Image/Logo */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {/* Placeholder for business image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
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
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
              {pkg.business_name?.charAt(0) || 'B'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {pkg.business_name}
            </h3>
          </div>
          <div className="text-left">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              4.8
            </div>
          </div>
        </div>

        {/* Discount Badge */}
        {pkg.discount_percentage && (
          <div className="mb-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              %{pkg.discount_percentage} تخفیف
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-1 mb-4">
          {pkg.discount_percentage && (
            <div className="flex items-center text-sm">
              <div className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full ml-2"></div>
              <span className="text-gray-700 dark:text-slate-300">
                تخفیف ویژه
              </span>
            </div>
          )}
          
          {pkg.elite_gift_title && (
            <div className="flex items-center text-sm">
              <div className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full ml-2"></div>
              <span className="text-gray-700 dark:text-slate-300">
                {pkg.elite_gift_title}
              </span>
            </div>
          )}

          {pkg.vip_experiences_count && pkg.vip_experiences_count > 0 && (
            <div className="flex items-center text-sm">
              <div className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full ml-2"></div>
              <span className="text-gray-700 dark:text-slate-300">
                دسترسی VIP
              </span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <div className="text-left">
          <button className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
            مشاهده جزئیات
          </button>
        </div>
      </div>
    </div>
  )
}
