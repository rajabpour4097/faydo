import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { apiService, Package } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface ExploreProps {}

// interface BusinessCategory {
//   id: number
//   name: string
// }

interface FilterState {
  categories: number[]
  sortBy: 'discount_high' | 'discount_low' | 'newest' | ''
  search: string
  cities: number[]
}

export const Explore: React.FC<ExploreProps> = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [availableCities, setAvailableCities] = useState<{id: number, name: string}[]>([])
  const [availableCategories, setAvailableCategories] = useState<{id: number, name: string}[]>([])
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  // const [categories] = useState<BusinessCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sortBy: '',
    search: '',
    cities: []
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.city-dropdown')) {
        setIsCityDropdownOpen(false)
      }
      if (!target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false)
      }
    }

    if (isCityDropdownOpen || isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCityDropdownOpen, isCategoryDropdownOpen])

  // Extract unique cities from packages
  const extractCitiesFromPackages = (packages: Package[]) => {
    const cityMap = new Map<number, {id: number, name: string}>()
    
    packages.forEach(pkg => {
      if (pkg.city && pkg.city.id && pkg.city.name) {
        cityMap.set(pkg.city.id, {
          id: pkg.city.id,
          name: pkg.city.name
        })
      }
    })
    
    return Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fa'))
  }

  // Extract unique categories from packages
  const extractCategoriesFromPackages = (packages: Package[]) => {
    const categoryMap = new Map<number, {id: number, name: string}>()
    
    packages.forEach(pkg => {
      if (pkg.business_category && pkg.business_category.id && pkg.business_category.name) {
        categoryMap.set(pkg.business_category.id, {
          id: pkg.business_category.id,
          name: pkg.business_category.name
        })
      }
    })
    
    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fa'))
  }

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
        
        // Extract available cities from packages
        const cities = extractCitiesFromPackages(activePackages)
        console.log('🏙️ Available cities:', cities)
        setAvailableCities(cities)
        
        // Extract available categories from packages
        const categories = extractCategoriesFromPackages(activePackages)
        console.log('📂 Available categories:', categories)
        setAvailableCategories(categories)
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
    if (filters.categories.length > 0) {
      filtered = filtered.filter(pkg => 
        pkg.business_category && filters.categories.includes(pkg.business_category.id)
      )
    }

    // فیلتر بر اساس شهر
    if (filters.cities.length > 0) {
      filtered = filtered.filter(pkg => 
        pkg.city && filters.cities.includes(pkg.city.id)
      )
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

  const handleCityToggle = (cityId: number) => {
    setFilters(prev => ({
      ...prev,
      cities: prev.cities.includes(cityId)
        ? prev.cities.filter(id => id !== cityId)
        : [...prev.cities, cityId]
    }))
  }

  const handleSelectAllCities = () => {
    setFilters(prev => ({
      ...prev,
      cities: availableCities.map(city => city.id)
    }))
  }

  const handleClearAllCities = () => {
    setFilters(prev => ({
      ...prev,
      cities: []
    }))
  }

  const handleCategoryToggle = (categoryId: number) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const handleSelectAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: availableCategories.map(category => category.id)
    }))
  }

  const handleClearAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: []
    }))
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

  // Desktop Layout Component
  const DesktopLayout = () => (
    <DashboardLayout>
      <div className="space-y-6" style={{ direction: 'rtl' }}>
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              اکتشاف پکیج‌ها
            </h1>
            <p className={`mt-2 text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              پکیج‌های فعال کسب‌وکارها را کشف کنید
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filteredPackages.length} پکیج فعال
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                از {packages.length} پکیج کل
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-3`}>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="جستجو در پکیج‌ها..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              {filters.search && (
                <button onClick={() => handleFilterChange('search', '')} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* City Filter */}
          <div className="relative">
            {availableCities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className={`w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 flex items-center justify-between text-right`}
                >
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {filters.cities.length > 0 ? `${filters.cities.length} شهر انتخاب شده` : 'همه شهرها'}
                  </span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isCityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {availableCities.map((city) => (
                      <label key={city.id} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.cities.includes(city.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, cities: [...prev.cities, city.id] }))
                            } else {
                              setFilters(prev => ({ ...prev, cities: prev.cities.filter(id => id !== city.id) }))
                            }
                          }}
                          className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{city.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className={`w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 appearance-none cursor-pointer text-right ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <option value="">مرتب‌سازی</option>
              <option value="discount_high">بیشترین تخفیف</option>
              <option value="discount_low">کمترین تخفیف</option>
              <option value="newest">جدیدترین</option>
            </select>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Package Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <DesktopPackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-300"></div>
            </div>
            <div className="text-center max-w-md">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                هیچ پکیج فعالی یافت نشد
              </h3>
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-8 leading-relaxed`}>
                در حال حاضر هیچ پکیج فعالی از کسب‌وکارها موجود نیست. 
                لطفاً بعداً دوباره بررسی کنید یا فیلترهای جستجو را تغییر دهید.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  تلاش مجدد
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      sortBy: '',
                      search: '',
                      cities: []
                    })
                  }}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )

  // Mobile Layout Component
  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4" style={{ direction: 'rtl' }}>
        {/* Search Header like mock */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-3 py-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="جستجو..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            {filters.search && (
              <button onClick={() => handleFilterChange('search', '')} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* City Filter Dropdown */}
        {availableCities.length > 0 && (
          <div className="relative city-dropdown">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-3 py-2 flex items-center justify-between text-gray-900 dark:text-white"
            >
              <span className="text-sm">
                {filters.cities.length === 0 
                  ? 'همه شهرها' 
                  : filters.cities.length === availableCities.length 
                    ? 'همه شهرها' 
                    : `${filters.cities.length} شهر انتخاب شده`
                }
              </span>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-700 mb-2">
                    <button
                      onClick={handleSelectAllCities}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      انتخاب همه
                    </button>
                    <button
                      onClick={handleClearAllCities}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      پاک کردن همه
                    </button>
                  </div>
                  
                  {availableCities.map((city) => (
                    <label
                      key={city.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={filters.cities.includes(city.id)}
                        onChange={() => handleCityToggle(city.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="mr-3 text-sm text-gray-900 dark:text-white">
                        {city.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Filter Dropdown */}
        {availableCategories.length > 0 && (
          <div className="relative category-dropdown">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-3 py-2 flex items-center justify-between text-gray-900 dark:text-white"
            >
              <span className="text-sm">
                {filters.categories.length === 0 
                  ? 'همه دسته‌بندی‌ها' 
                  : filters.categories.length === availableCategories.length 
                    ? 'همه دسته‌بندی‌ها' 
                    : `${filters.categories.length} دسته انتخاب شده`
                }
              </span>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-700 mb-2">
                    <button
                      onClick={handleSelectAllCategories}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      انتخاب همه
                    </button>
                    <button
                      onClick={handleClearAllCategories}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      پاک کردن همه
                    </button>
                  </div>
                  
                  {availableCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="mr-3 text-sm text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* List of packages or empty state */}
        {filteredPackages.length > 0 ? (
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />)
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Empty state illustration */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-300"></div>
            </div>
            
            {/* Empty state content */}
            <div className="text-center max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                هیچ پکیج فعالی یافت نشد
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                در حال حاضر هیچ پکیج فعالی از کسب‌وکارها موجود نیست. 
                لطفاً بعداً دوباره بررسی کنید یا فیلترهای جستجو را تغییر دهید.
              </p>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  تلاش مجدد
                </button>
                
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      sortBy: '',
                      search: '',
                      cities: []
                    })
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileDashboardLayout>
  )

  // Main return with responsive layout
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout />
      </div>
    </>
  )
}

// Desktop Package Card Component
interface DesktopPackageCardProps {
  package: Package
}

const DesktopPackageCard: React.FC<DesktopPackageCardProps> = ({ package: pkg }) => {
  const [imageErrored, setImageErrored] = useState(false)
  const { isDark } = useTheme()
  
  const handleCardClick = () => {
    console.log('Desktop Package clicked:', pkg.id)
  }

  // Determine VIP badge type
  const getVipBadgeType = () => {
    const hasVip = pkg.has_vip || false
    const hasVipPlus = pkg.has_vip_plus || false
    
    if (hasVip && hasVipPlus) {
      return '+VIP'
    }
    else if (hasVip && !hasVipPlus) {
      return 'VIP'
    }
    else if (!hasVip && hasVipPlus) {
      return '+VIP'
    }
    
    return 'VIP'
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105`}
      onClick={handleCardClick}
    >
      {/* Business Image and VIP Badge */}
      <div className="relative mb-4">
        <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
          {!imageErrored && (pkg.business_image || pkg.business_logo) ? (
            <img
              src={pkg.business_image || pkg.business_logo || ''}
              alt={pkg.business_name}
              loading="lazy"
              onError={() => setImageErrored(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-4xl">🏢</span>
            </div>
          )}
        </div>
        
        {/* VIP Badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
            getVipBadgeType() === '+VIP' 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            {getVipBadgeType()}
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="mb-4">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          {pkg.business_name}
        </h3>
        {pkg.business_category && (
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {pkg.business_category.name}
          </p>
        )}
      </div>

      {/* Discount Info */}
      <div className="space-y-3 mb-4">
        {pkg.discount_percentage && (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>تخفیف کلی</span>
            <span className="text-lg font-bold text-green-600">{pkg.discount_percentage}%</span>
          </div>
        )}
        
        {pkg.specific_discount_title && pkg.specific_discount_percentage && (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>تخفیف خاص</span>
            <span className="text-lg font-bold text-blue-600">{pkg.specific_discount_percentage}%</span>
          </div>
        )}
      </div>

      {/* Elite Gift */}
      {pkg.elite_gift_title && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {pkg.elite_gift_title}
            </span>
          </div>
          {pkg.elite_gift_amount && (
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              برای {pkg.elite_gift_amount} مبلغ خرید
            </p>
          )}
          {pkg.elite_gift_count && (
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              برای {pkg.elite_gift_count} خرید
            </p>
          )}
        </div>
      )}

      {/* Days Remaining */}
      {pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {pkg.days_remaining > 0 ? `${pkg.days_remaining} روز باقی‌مانده` : 'منقضی شده'}
          </span>
        </div>
      )}
    </div>
  )
}

// Package Card Component
interface PackageCardProps {
  package: Package
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg }) => {
  const [imageErrored, setImageErrored] = useState(false)
  const handleCardClick = () => {
    // اینجا می‌توانیم به صفحه جزئیات پکیج هدایت کنیم
    console.log('Package clicked:', pkg.id)
  }

  // Determine VIP badge type
  const getVipBadgeType = () => {
    // استفاده از فیلدهای جدید از backend
    const hasVip = pkg.has_vip || false
    const hasVipPlus = pkg.has_vip_plus || false
    
    // اگر هم VIP و هم VIP+ دارد، VIP+ نمایش بده
    if (hasVip && hasVipPlus) {
      return '+VIP'
    }
    // اگر فقط VIP دارد، VIP نمایش بده
    else if (hasVip && !hasVipPlus) {
      return 'VIP'
    }
    // اگر فقط VIP+ دارد، VIP+ نمایش بده
    else if (!hasVip && hasVipPlus) {
      return '+VIP'
    }
    
    return 'VIP' // Default to VIP if no VIP experiences
  }

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-3 flex gap-3 items-start cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Left image: prefer business_image then logo */}
      <div className="relative w-22 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
        {!imageErrored && (pkg.business_image || pkg.business_logo) ? (
          <img
            src={pkg.business_image || pkg.business_logo || ''}
            alt={pkg.business_name}
            loading="lazy"
            onError={() => setImageErrored(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600" />
        )}
        
        {/* VIP Badge */}
        <div className="absolute top-1 right-1">
          <div className={`px-2 py-1 rounded-full text-[8px] font-bold text-white shadow-lg ${
            getVipBadgeType() === '+VIP' 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            {getVipBadgeType()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {pkg.business_category?.name && (
              <div className="inline-block px-2 py-0.5 rounded-md text-[8px] bg-blue-100 text-blue-700 mb-1">
                {pkg.business_category.name}
              </div>
            )}
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{pkg.business_name}</h3>
            {(((pkg as any)?.city?.name) || pkg.status_display) && (
              <div className="flex items-center text-gray-500 dark:text-slate-400 text-sm mt-1 text-[10px]">
                  <svg className="w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                {(pkg as any)?.city?.name || pkg.status_display}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-700 dark:text-slate-200">
            <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span className="font-semibold">4.8</span>
          </div>
        </div>
        <div className="mt-2">
          {typeof pkg.discount_percentage === 'number' ? (
            <>
              <span className="text-blue-600 font-extrabold text-[12px]">%{pkg.discount_percentage}</span>
              <span className="text-gray-500 text-sm mr-1" style={{fontSize: '12px'}}>تخفیف</span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">بدون تخفیف</span>
          )}
        </div>
        {/* Elite gift info */}
        {pkg.elite_gift_gift && (
          <div className="mt-1 flex items-center text-[13px] text-gray-700 dark:text-slate-300">
            <svg className="w-4 h-4 ml-1 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13M12 8V6a2 2 0 112 2h-2zM5 12h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
            </svg>
            <span className="truncate" style={{ fontSize: '10px' }}>
              {pkg.elite_gift_gift}
              {typeof pkg.elite_gift_count === 'number' && (
                <> با {pkg.elite_gift_count} بار خرید</>
              )}
              {typeof pkg.elite_gift_amount === 'number' && !pkg.elite_gift_count && (
                <> با {Number(pkg.elite_gift_amount).toLocaleString('fa-IR')} تومان خرید</>
              )}
            </span>
          </div>
        )}

  
      </div>
    </div>
  )
}
