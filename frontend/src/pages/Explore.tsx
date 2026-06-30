import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { TopBusinessSlider } from '../components/dashboard/TopBusinessSlider'
import { apiService, Package } from '../services/api'
import { getFullImageUrl } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { ExploreMapView } from '../components/ExploreMapView'
import { Map } from 'lucide-react'

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
  const [showMap, setShowMap] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
    
    return Array.from(cityMap.values()).sort((a, b) => {
      try { return a.name.localeCompare(b.name, 'fa') } catch { return a.name.localeCompare(b.name) }
    })
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
    
    return Array.from(categoryMap.values()).sort((a, b) => {
      try { return a.name.localeCompare(b.name, 'fa') } catch { return a.name.localeCompare(b.name) }
    })
  }

  const loadActivePackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getPackages()

      // handle both array and paginated response
      let dataArray: Package[] = []
      if (Array.isArray(response.data)) {
        dataArray = response.data
      } else if (response.data && Array.isArray((response.data as any).results)) {
        dataArray = (response.data as any).results
      } else if (response.error) {
        setError('خطا در دریافت پکیج‌ها')
        return
      }

      const activePackages = dataArray.filter(pkg =>
        pkg.is_active && pkg.status === 'approved' && pkg.is_complete
      )
      setPackages(activePackages)
      setAvailableCities(extractCitiesFromPackages(activePackages))
      setAvailableCategories(extractCategoriesFromPackages(activePackages))
    } catch (err) {
      console.error('Error loading packages:', err)
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
        {/* Top Business Slider - Desktop */}
        <TopBusinessSlider packages={packages} />

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
  const MobileLayout = () => {
    const activeFilterCount =
      filters.cities.length + filters.categories.length + (filters.sortBy ? 1 : 0)

    return (
      <MobileDashboardLayout>
        <div style={{ direction: 'rtl' }}>
          {/* Top Business Slider */}
          <div className="px-4 pt-4">
            <TopBusinessSlider packages={packages} />
          </div>

          {/* ── Filter chip bar ── */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-2">
            {/* Search input (collapsible) */}
            {searchOpen && (
              <div className="mb-2 flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  placeholder="نام کسب‌وکار..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white"
                />
                <button onClick={() => { handleFilterChange('search', ''); setSearchOpen(false) }}
                  className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Chips row */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {/* Search chip */}
              <button
                onClick={() => setSearchOpen(v => !v)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filters.search
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {filters.search ? filters.search.slice(0, 10) + (filters.search.length > 10 ? '…' : '') : 'جستجو'}
              </button>

              {/* City chip */}
              {availableCities.length > 0 && (
                <button
                  onClick={() => setShowFilterSheet(true)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    filters.cities.length > 0
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {filters.cities.length > 0 ? `${filters.cities.length} شهر` : 'شهر'}
                </button>
              )}

              {/* Category chip */}
              {availableCategories.length > 0 && (
                <button
                  onClick={() => setShowFilterSheet(true)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    filters.categories.length > 0
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {filters.categories.length > 0 ? `${filters.categories.length} دسته` : 'دسته‌بندی'}
                </button>
              )}

              {/* All filters chip */}
              <button
                onClick={() => setShowFilterSheet(true)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeFilterCount > 0
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                سایر فیلترها
                {activeFilterCount > 0 && (
                  <span className="bg-white text-gray-900 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* result count */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {filteredPackages.length} کسب‌وکار
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ categories: [], sortBy: '', search: '', cities: [] })}
                className="text-xs text-blue-600 font-medium"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Package list */}
          <div className="px-4 pb-32 pt-2 space-y-4">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => <PackageCard key={pkg.id} package={pkg} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">پکیجی یافت نشد</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">فیلترها را تغییر دهید یا دوباره تلاش کنید.</p>
                <button onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">
                  تلاش مجدد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Filter Bottom Sheet ── */}
        {showFilterSheet && (
          <div className="fixed inset-0 z-[1800] flex flex-col justify-end" style={{ direction: 'rtl' }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowFilterSheet(false)} />
            <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto">
              {/* handle */}
              <div className="w-12 h-1 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">فیلترها</h3>

              {/* Sort */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">مرتب‌سازی</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '', label: 'پیش‌فرض' },
                    { value: 'discount_high', label: '🏷 بیشترین تخفیف' },
                    { value: 'discount_low', label: 'کمترین تخفیف' },
                    { value: 'newest', label: '🆕 جدیدترین' },
                  ].map(opt => (
                    <button key={opt.value}
                      onClick={() => setFilters(p => ({ ...p, sortBy: opt.value as any }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        filters.sortBy === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cities */}
              {availableCities.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">شهر</p>
                    <button onClick={filters.cities.length > 0 ? handleClearAllCities : handleSelectAllCities}
                      className="text-xs text-blue-600 font-medium">
                      {filters.cities.length > 0 ? 'پاک کردن' : 'همه'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableCities.map(city => (
                      <button key={city.id}
                        onClick={() => handleCityToggle(city.id)}
                        className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                          filters.cities.includes(city.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {availableCategories.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">دسته‌بندی</p>
                    <button onClick={filters.categories.length > 0 ? handleClearAllCategories : handleSelectAllCategories}
                      className="text-xs text-blue-600 font-medium">
                      {filters.categories.length > 0 ? 'پاک کردن' : 'همه'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(cat => (
                      <button key={cat.id}
                        onClick={() => handleCategoryToggle(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                          filters.categories.includes(cat.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setFilters({ categories: [], sortBy: '', search: '', cities: [] }); setShowFilterSheet(false) }}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium"
                >
                  🗑 پاک کردن
                </button>
                <button
                  onClick={() => setShowFilterSheet(false)}
                  className="flex-2 flex-grow-[2] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  اعمال فیلترها ({filteredPackages.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </MobileDashboardLayout>
    )
  }

  // Main return with responsive layout
  return (
    <>
      {/* Map overlay */}
      {showMap && (
        <ExploreMapView packages={filteredPackages} onClose={() => setShowMap(false)} />
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout />
      </div>

      {/* Floating map button — both layouts */}
      {!showMap && (
        <button
          onClick={() => setShowMap(true)}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1500]
                     flex items-center gap-2 px-5 py-2.5
                     bg-gray-900 hover:bg-gray-800 active:scale-95
                     text-white text-sm font-semibold rounded-full shadow-xl transition-all"
          style={{ direction: 'rtl' }}
        >
          <Map size={16} strokeWidth={2} />
          نقشه
          {filteredPackages.filter(p => p.business_location_latitude != null).length > 0 && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {filteredPackages.filter(p => p.business_location_latitude != null).length}
            </span>
          )}
        </button>
      )}
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
  const navigate = useNavigate()
  
  const handleCardClick = () => {
    navigate(`/dashboard/business/${pkg.id}`)
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
        <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
          {!imageErrored && (pkg.business_image || pkg.business_logo) ? (
            <img
              src={getFullImageUrl(pkg.business_image || pkg.business_logo)}
              alt={pkg.business_name}
              loading="lazy"
              onError={() => setImageErrored(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">بدون تصویر</p>
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

// ─── Mobile Package Card ──────────────────────────────────────────────────────
interface PackageCardProps { package: Package }

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg }) => {
  const [activeImg, setActiveImg] = useState(0)
  const navigate = useNavigate()

  // Build image list: gallery first, fall back to business_image / business_logo
  const images: string[] = (() => {
    const gallery = (pkg.gallery_images || []).filter(Boolean)
    if (gallery.length > 0) return gallery
    const single = getFullImageUrl(pkg.business_image || pkg.business_logo)
    return single ? [single] : []
  })()

  // Logo/avatar: only the business_logo field (no gallery fallback)
  const logoSrc = getFullImageUrl(pkg.business_logo)

  const vipLabel = (pkg.has_vip_plus || (!pkg.has_vip && !pkg.has_vip_plus)) ? 'VIP+' : 'طلایی'
  const vipGold = vipLabel === 'VIP+'

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => navigate(`/dashboard/business/${pkg.id}`)}
    >
      {/* ── Scrollable image strip ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 210 }}>
        {images.length > 0 ? (
          <>
            {/* Images rail */}
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${activeImg * 100}%)`, direction: 'ltr' }}
            >
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={pkg.business_name}
                  loading="lazy"
                  className="w-full h-full object-cover shrink-0"
                  style={{ minWidth: '100%' }}
                />
              ))}
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
                   onClick={(e) => e.stopPropagation()}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveImg(i) }}
                    className={`rounded-full transition-all ${
                      i === activeImg
                        ? 'w-4 h-2 bg-white'
                        : 'w-2 h-2 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Swipe areas */}
            {images.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 w-1/3 z-10"
                  onClick={(e) => { e.stopPropagation(); setActiveImg(p => Math.max(0, p - 1)) }} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-10"
                  onClick={(e) => { e.stopPropagation(); setActiveImg(p => Math.min(images.length - 1, p + 1)) }} />
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}

        {/* VIP badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow ${
            vipGold ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600'
          }`}>{vipLabel}</span>
        </div>

        {/* Discount badge — top right */}
        {typeof pkg.discount_percentage === 'number' && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow">
              {pkg.discount_percentage}٪ تخفیف
            </span>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Business logo avatar — bottom right, overlapping card */}
        <div className="absolute -bottom-5 right-4 z-10">
          <div className="w-12 h-12 rounded-full border-[3px] border-white dark:border-slate-800
                          overflow-hidden shadow-lg bg-gradient-to-br from-blue-400 to-indigo-500">
            {logoSrc ? (
              <img src={logoSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                {pkg.business_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="pt-7 px-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
            {pkg.business_name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
              {pkg.average_rating ?? '—'}
            </span>
            {!!pkg.total_comments && (
              <span className="text-xs text-gray-400">({pkg.total_comments} نظر)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {pkg.business_category?.name && (
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg">
              {pkg.business_category.name}
            </span>
          )}
          {(pkg as any)?.city?.name && (
            <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
              {(pkg as any).city.name}
            </span>
          )}
        </div>

        {pkg.elite_gift_gift && (
          <div className="mt-2.5 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20
                          rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <span>🎁</span>
            <span className="line-clamp-1">
              {pkg.elite_gift_gift}
              {typeof pkg.elite_gift_count === 'number' && ` • ${pkg.elite_gift_count} خرید`}
              {typeof pkg.elite_gift_amount === 'number' && !pkg.elite_gift_count &&
                ` • ${Number(pkg.elite_gift_amount).toLocaleString('fa-IR')} تومان`}
            </span>
          </div>
        )}

        {pkg.days_remaining != null && pkg.days_remaining > 0 && (
          <div className="mt-2 text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.days_remaining} روز باقی‌مانده
          </div>
        )}
      </div>
    </div>
  )
}
