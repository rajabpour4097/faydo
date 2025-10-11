import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, Package, VipExperienceCategory } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'

interface PackageManagementProps {}

export const PackageManagement: React.FC<PackageManagementProps> = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [canCreatePackage, setCanCreatePackage] = useState(true)
  const [packageBlockReason, setPackageBlockReason] = useState<string>('')
  const [editingPackageId, setEditingPackageId] = useState<number | undefined>(undefined)
  const [vipExperiences, setVipExperiences] = useState<VipExperienceCategory[]>([])
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null)
  const [showPackageDetails, setShowPackageDetails] = useState(false)

  // Check if user is business
  useEffect(() => {
    if (user && user.type !== 'business') {
      // Redirect non-business users to dashboard
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  useEffect(() => {
    console.log('PackageManagement mounted, user:', user) // Debug log
    console.log('Local storage access token:', localStorage.getItem('access_token') ? 'Exists' : 'Missing')
    console.log('Local storage refresh token:', localStorage.getItem('refresh_token') ? 'Exists' : 'Missing')
    loadPackages()
    loadVipExperiences()
  }, [user])

  const loadPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getPackages()
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setPackages(response.data)
        
        // بررسی شرط ایجاد پکیج جدید
        const hasActivePackage = response.data.some(pkg => pkg.is_active)
        const hasDraftPackage = response.data.some(pkg => pkg.status === 'draft')
        const hasPendingPackage = response.data.some(pkg => pkg.status === 'pending' && pkg.is_complete)
        
        let canCreate = true
        let blockReason = ''
        
        // اگر پکیج draft دارد، نمی‌تواند پکیج جدید بسازد
        if (hasDraftPackage) {
          canCreate = false
          blockReason = 'draft'
        }
        
        // اگر پکیج pending (در حال بررسی) دارد، نمی‌تواند پکیج جدید بسازد
        if (hasPendingPackage) {
          canCreate = false
          blockReason = 'pending'
        }
        
        // اگر پکیج فعال دارد، بررسی کن که آیا کمتر از ۱۰ روز مانده
        if (hasActivePackage && canCreate) {
          const activePackage = response.data.find(pkg => pkg.is_active)
          if (activePackage && activePackage.end_date) {
            const endDate = new Date(activePackage.end_date)
            const today = new Date()
            const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            if (daysLeft > 10) {
              canCreate = false
              blockReason = 'active'
            }
          }
        }
        
        setCanCreatePackage(canCreate)
        
        // ذخیره دلیل عدم امکان ایجاد پکیج
        if (!canCreate) {
          setPackageBlockReason(blockReason)
        }
      }
    } catch (err) {
      setError('خطا در بارگذاری پکیج‌ها')
    } finally {
      setLoading(false)
    }
  }

  const loadVipExperiences = async () => {
    try {
      console.log('Loading VIP experiences...')
      const response = await apiService.getVipExperienceCategories()
      console.log('VIP experiences response:', response)
      
      if (response.error) {
        console.error('Error loading VIP experiences:', response.error)
        setVipExperiences([]) // Set empty array on error
      } else if (response.data) {
        console.log('VIP experiences loaded:', response.data)
        setVipExperiences(response.data)
      } else {
        console.log('No data in VIP experiences response')
        setVipExperiences([])
      }
    } catch (err) {
      console.error('Exception loading VIP experiences:', err)
      setVipExperiences([]) // Set empty array on exception
    }
  }

  const handleCreatePackage = async () => {
    console.log('=== BUTTON CLICKED: handleCreatePackage called ===')
    
    // بررسی شرایط قبل از ایجاد پکیج
    if (!canCreatePackage) {
      console.log('Cannot create package: conditions not met, reason:', packageBlockReason)
      
      let errorMessage = ''
      switch (packageBlockReason) {
        case 'draft':
          errorMessage = 'شما پکیج پیش‌نویس دارید و نمی‌توانید پکیج جدید بسازید. لطفاً ابتدا پکیج موجود را تکمیل کنید.'
          break
        case 'pending':
          errorMessage = 'شما یک پکیج در حال بررسی دارید و نمی‌توانید پکیج جدید بسازید.'
          break
        case 'active':
          errorMessage = 'پکیج فعالی دارید و بیش از ۱۰ روز تا پایان آن مانده است.'
          break
        default:
          errorMessage = 'شما نمی‌توانید پکیج جدید ایجاد کنید. لطفاً ابتدا پکیج موجود را تکمیل کنید.'
      }
      
      setError(errorMessage)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('=== DEBUG: Starting package creation ===')
      console.log('User:', user)
      console.log('User role:', (user as any)?.role)
      console.log('User business profile:', (user as any)?.businessProfile)
      console.log('API service authenticated:', apiService.isAuthenticated())
      
      // Skip user validation for testing
      const packageData = {
        business: 9, // Use known business ID for testing
        is_active: false,
        is_complete: false,
        status: 'draft' as const,
      }
      
      // Check if we have a valid token
      const token = localStorage.getItem('access_token')
      console.log('Local storage token:', token ? token.substring(0, 50) + '...' : 'No token')
      
      if (!token) {
        setError('شما وارد نشده‌اید. لطفاً ابتدا وارد شوید.')
        return
      }

      console.log('Creating package with data:', packageData)
      
      const response = await apiService.createPackage(packageData)
      console.log('API response:', response)
      console.log('Response error:', response.error)
      console.log('Response data:', response.data)
      
      if (response.error) {
        console.error('API Error:', response.error)
        setError(response.error)
      } else if (response.data) {
        console.log('Package created successfully with ID:', response.data.id)
        // پکیج ایجاد شد، حالا modal را با ID پکیج باز کن
        setEditingPackageId(response.data.id)
        setShowCreateModal(true)
        // لیست پکیج‌ها را به‌روزرسانی کن
        loadPackages()
      } else {
        console.error('No data in response')
        setError('پاسخ نامعتبر از سرور')
      }
    } catch (err) {
      console.error('Exception in handleCreatePackage:', err)
      setError('خطا در ایجاد پکیج: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPackage = (packageId: number) => {
    setEditingPackageId(packageId)
    setShowCreateModal(true)
  }

  const handleViewPackage = async (pkg: Package) => {
    try {
      // دریافت جزئیات کامل پکیج از API
      const response = await apiService.getPackage(pkg.id)
      if (response.data) {
        setViewingPackage(response.data)
        setShowPackageDetails(true)
      } else {
        setError(response.error || 'خطا در دریافت جزئیات پکیج')
      }
    } catch (error) {
      console.error('Error fetching package details:', error)
      setError('خطا در دریافت جزئیات پکیج')
    }
  }

  const handlePackageClick = (pkg: Package) => {
    if (pkg.status === 'draft' && !pkg.is_complete) {
      handleEditPackage(pkg.id)
    } else if (['pending', 'approved', 'rejected'].includes(pkg.status)) {
      handleViewPackage(pkg)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-blue-600 bg-blue-100'
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'پیش‌نویس'
      case 'approved':
        return 'تایید شده'
      case 'pending':
        return 'در حال بررسی'
      case 'rejected':
        return 'نیاز به ویرایش'
      default:
        return status
    }
  }

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <>
        {/* Mobile */}
        <div className="md:hidden">
          <MobileDashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </MobileDashboardLayout>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </DashboardLayout>
        </div>
      </>
    )
  }

  // Show access denied if user is not business
  if (user.type !== 'business') {
    return (
      <>
        {/* Mobile */}
        <div className="md:hidden">
          <MobileDashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  دسترسی محدود
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  این صفحه فقط برای کسب‌وکارها قابل دسترسی است
                </p>
              </div>
            </div>
          </MobileDashboardLayout>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  دسترسی محدود
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  این صفحه فقط برای کسب‌وکارها قابل دسترسی است
                </p>
              </div>
            </div>
          </DashboardLayout>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        {/* Mobile */}
        <div className="md:hidden">
          <MobileDashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </MobileDashboardLayout>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </DashboardLayout>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobilePackageManagement
          packages={packages}
          error={error}
          onCreatePackage={handleCreatePackage}
          onPackageClick={handlePackageClick}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DashboardLayout>
          <div className="p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                مدیریت پکیج‌های تبلیغاتی
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                پکیج‌های من
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Bar */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  تعداد کل: {packages.length}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  فعال: {packages.filter(pkg => pkg.is_active).length}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  تایید شده: {packages.filter(pkg => pkg.status === 'approved').length}
                </span>
              </div>
            </div>

            {/* Packages List */}
            {packages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  هنوز پکیجی ایجاد نکرده‌اید
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
                  برای شروع، اولین پکیج تبلیغاتی خود را ایجاد کنید
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  ایجاد اولین پکیج
                </button>
              </div>
            ) : (
              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          وضعیت
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          تاریخ شروع/پایان
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          تخفیف/هدیه
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          تجربیات VIP
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-slate-800' : 'bg-white'} divide-y ${isDark ? 'divide-slate-600' : 'divide-gray-200'}`}>
                      {packages.map((pkg) => (
                        <tr 
                          key={pkg.id} 
                          className={`${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'} ${
                            (pkg.status === 'draft' && !pkg.is_complete) || ['pending', 'approved', 'rejected'].includes(pkg.status) ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => handlePackageClick(pkg)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {pkg.status === 'draft' && (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                                  {getStatusText(pkg.status)}
                                </span>
                              )}
                              {pkg.is_active && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                                  فعال
                                </span>
                              )}
                              {pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  pkg.days_remaining > 7 ? 'text-green-700 bg-green-100' : 
                                  pkg.days_remaining > 0 ? 'text-orange-700 bg-orange-100' : 'text-red-700 bg-red-100'
                                }`}>
                                  {pkg.days_remaining > 0 ? `${pkg.days_remaining} روز` : 'منقضی'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            <div className="space-y-1">
                              {pkg.start_date && (
                                <div className="flex items-center">
                                  <svg className="w-3 h-3 ml-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {new Date(pkg.start_date).toLocaleDateString('fa-IR')}
                                </div>
                              )}
                              {pkg.end_date && (
                                <div className="flex items-center">
                                  <svg className="w-3 h-3 ml-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  {new Date(pkg.end_date).toLocaleDateString('fa-IR')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            <div className="space-y-1">
                              {pkg.discount_percentage && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center ml-1">
                                    <svg className="w-2 h-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                  <span className="text-red-600 font-medium">%{pkg.discount_percentage}</span>
                                </div>
                              )}
                              {pkg.elite_gift_title && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center ml-1">
                                    <svg className="w-2 h-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-purple-600 truncate max-w-20" title={pkg.elite_gift_title}>
                                      {pkg.elite_gift_title}
                                    </span>
                                    {pkg.elite_gift_amount && (
                                      <span className="text-xs text-purple-500">
                                        برای این مبلغ خرید
                                      </span>
                                    )}
                                    {pkg.elite_gift_count && (
                                      <span className="text-xs text-purple-500">
                                        برای این تعداد خرید
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 ml-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span className="font-medium">{pkg.vip_experiences_count}</span>
                              <span className="mr-1">تجربه</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {pkg.status === 'draft' && (
                                <span className="text-blue-600 text-sm">
                                  کلیک کنید تا ویرایش کنید
                                </span>
                              )}
                              {pkg.status === 'pending' && (
                                <span className="text-orange-600 text-sm">
                                  در حال بررسی
                                </span>
                              )}
                              {pkg.status === 'approved' && (
                                <span className="text-green-600 text-sm">
                                  تایید شده
                                </span>
                              )}
                              {pkg.status === 'rejected' && (
                                <span className="text-red-600 text-sm">
                                  نیاز به ویرایش
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>

        {/* Floating Action Button - فقط زمانی که پکیج وجود دارد */}
        {packages.length > 0 && (
          <button
            onClick={handleCreatePackage}
            disabled={!canCreatePackage || loading}
            className={`fixed bottom-8 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 ${
              canCreatePackage && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-110 shadow-blue-500/25'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            title={
              !canCreatePackage 
                ? (packageBlockReason === 'draft' 
                    ? 'شما پکیج پیش‌نویس دارید' 
                    : packageBlockReason === 'pending'
                    ? 'شما پکیج در حال بررسی دارید'
                    : packageBlockReason === 'active'
                    ? 'پکیج فعال شما بیش از ۱۰ روز باقی‌مانده دارد'
                    : 'امکان ایجاد پکیج جدید وجود ندارد')
                : 'ایجاد پکیج جدید'
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Create Package Modal */}
        {showCreateModal && (
          <CreatePackageModal
            onClose={() => {
              setShowCreateModal(false)
              setEditingPackageId(undefined)
            }}
            onSuccess={() => {
              setShowCreateModal(false)
              setEditingPackageId(undefined)
              loadPackages()
            }}
            editingPackageId={editingPackageId}
            vipExperiences={vipExperiences}
          />
        )}

        {showPackageDetails && viewingPackage && (
          <PackageDetailsModal
            package={viewingPackage}
            onClose={() => {
              setShowPackageDetails(false)
              setViewingPackage(null)
            }}
          />
        )}
    </>
  )
}

// Mobile Package Management Component
interface MobilePackageManagementProps {
  packages: Package[]
  error: string | null
  onCreatePackage: () => void
  onPackageClick: (pkg: Package) => void
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
}

const MobilePackageManagement: React.FC<MobilePackageManagementProps> = ({
  packages,
  error,
  onCreatePackage,
  onPackageClick,
  getStatusColor,
  getStatusText
}) => {
  const { isDark } = useTheme()

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                مدیریت پکیج‌ها
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                پکیج‌های تبلیغاتی شما
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-blue-500 mb-1">{packages.length}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>کل پکیج‌ها</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-green-500 mb-1">{packages.filter(pkg => pkg.is_active).length}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>فعال</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-purple-500 mb-1">{packages.filter(pkg => pkg.status === 'approved').length}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>تایید شده</div>
          </div>
        </div>


        {/* Packages List */}
        {packages.length === 0 ? (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 shadow-sm text-center`}>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              هنوز پکیجی ایجاد نکرده‌اید
            </h3>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
              برای شروع، اولین پکیج تبلیغاتی خود را ایجاد کنید
            </p>
            <button
              onClick={onCreatePackage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              ایجاد اولین پکیج
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm ${
                  (pkg.status === 'draft' && !pkg.is_complete) || ['pending', 'approved', 'rejected'].includes(pkg.status) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
                onClick={() => onPackageClick(pkg)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {pkg.status === 'draft' && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                        {getStatusText(pkg.status)}
                      </span>
                    )}
                    {pkg.is_active && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                        فعال
                      </span>
                    )}
                  </div>
                </div>
                
                {/* اطلاعات پکیج */}
                <div className="space-y-3 mb-4">
                  {/* تاریخ‌ها */}
                  {(pkg.start_date || pkg.end_date) && (
                    <div className="flex items-center justify-between text-sm">
                      {pkg.start_date && (
                        <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          شروع: {new Date(pkg.start_date).toLocaleDateString('fa-IR')}
                        </div>
                      )}
                      {pkg.end_date && (
                        <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          پایان: {new Date(pkg.end_date).toLocaleDateString('fa-IR')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* اطلاعات تخفیف و هدیه */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {pkg.discount_percentage && (
                      <div className={`flex items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center ml-2">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">تخفیف</div>
                          <div className="text-red-600 font-bold">%{pkg.discount_percentage}</div>
                        </div>
                      </div>
                    )}

                    {pkg.elite_gift_title && (
                      <div className={`flex items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center ml-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">هدیه</div>
                          <div className="text-purple-600 text-xs truncate">{pkg.elite_gift_title}</div>
                          {pkg.elite_gift_amount && (
                            <div className="text-xs text-purple-500">
                              برای {pkg.elite_gift_amount} مبلغ خرید
                            </div>
                          )}
                          {pkg.elite_gift_count && (
                            <div className="text-xs text-purple-500">
                              برای {pkg.elite_gift_count} خرید
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* تعداد تجربیات VIP و روزهای باقی‌مانده */}
                  <div className="flex items-center justify-between text-sm">
                    <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {pkg.vip_experiences_count} تجربه VIP
                    </div>
                    
                    {pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
                      <div className={`flex items-center ${pkg.days_remaining > 7 ? 'text-green-600' : pkg.days_remaining > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pkg.days_remaining > 0 ? `${pkg.days_remaining} روز باقی‌مانده` : 'منقضی شده'}
                      </div>
                    )}
                  </div>
                </div>

                {/* پیام‌های راهنما */}
                {pkg.status === 'draft' && (
                  <div className="text-center">
                    <span className="text-blue-600 text-sm">
                      کلیک کنید تا ویرایش کنید
                    </span>
                  </div>
                )}
                {pkg.status === 'pending' && (
                  <div className="text-center">
                    <span className="text-orange-600 text-sm">
                      در حال بررسی
                    </span>
                  </div>
                )}
                {pkg.status === 'approved' && (
                  <div className="text-center">
                    <span className="text-green-600 text-sm">
                      تایید شده
                    </span>
                  </div>
                )}
                {pkg.status === 'rejected' && (
                  <div className="text-center">
                    <span className="text-red-600 text-sm">
                      نیاز به ویرایش
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Spacing for Navigation */}
        <div className="h-4"></div>
      </div>

      {/* Floating Action Button - فقط زمانی که پکیج وجود دارد */}
      {packages.length > 0 && (
        <button
          onClick={onCreatePackage}
          className="fixed bottom-24 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 hover:scale-110 shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </MobileDashboardLayout>
  )
}

// Create Package Modal Component
interface CreatePackageModalProps {
  onClose: () => void
  onSuccess: () => void
  editingPackageId?: number
  vipExperiences: VipExperienceCategory[]
}

const CreatePackageModal: React.FC<CreatePackageModalProps> = ({ onClose, onSuccess, editingPackageId, vipExperiences }) => {
  const { isDark } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packageId] = useState<number | null>(editingPackageId || null)
  // const [isEditing] = useState(!!editingPackageId)
  
  const [formData, setFormData] = useState({
    // Step 1: تخفیف
    globalDiscountPercentage: '',
    specificTitle: '',
    specificDescription: '',
    specificPercentage: '',
    showSpecificDiscount: false,
    
    // Step 2: هدیه
    giftType: 'amount', // 'amount' or 'count'
    giftAmount: '',
    giftCount: '',
    giftDescription: '',
    
    // Step 3: VIP
    oneStarFeatures: [] as string[],
    twoStarFeatures: [] as string[],
    
    // Step 4: تایید
    duration: '',
  })

  // بارگذاری داده‌های پکیج موجود
  useEffect(() => {
    if (editingPackageId) {
      loadPackageData(editingPackageId)
    }
  }, [editingPackageId])

  const loadPackageData = async (pkgId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getPackageStatus(pkgId)
      
      if (response.data) {
        const data = response.data
        
        // بارگذاری تخفیفات
        if (data.discount_all) {
          setFormData(prev => ({
            ...prev,
            globalDiscountPercentage: data.discount_all!.toString()
          }))
        }
        
        if (data.specific_discount) {
          setFormData(prev => ({
            ...prev,
            showSpecificDiscount: true,
            specificTitle: data.specific_discount!.title,
            specificDescription: data.specific_discount!.description || '',
            specificPercentage: data.specific_discount!.percentage.toString()
          }))
        }
        
        // بارگذاری هدیه
        if (data.elite_gift) {
          const gift = data.elite_gift!
          setFormData(prev => ({
            ...prev,
            giftDescription: gift.gift,
            giftType: gift.amount ? 'amount' : 'count',
            giftAmount: gift.amount ? gift.amount.toString() : '',
            giftCount: gift.count ? gift.count.toString() : ''
          }))
        }
        
        // بارگذاری VIP
        if (data.vip_experiences && data.vip_experiences.length > 0) {
          const oneStar = data.vip_experiences.filter(v => v.vip_type === 'VIP').map(v => v.id.toString())
          const twoStar = data.vip_experiences.filter(v => v.vip_type === 'VIP+').map(v => v.id.toString())
          
          setFormData(prev => ({
            ...prev,
            oneStarFeatures: oneStar,
            twoStarFeatures: twoStar
          }))
        }
      }
    } catch (err) {
      setError('خطا در بارگذاری داده‌های پکیج')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: 'تخفیف', icon: '💰' },
    { id: 2, title: 'هدیه', icon: '🎁' },
    { id: 3, title: 'VIP', icon: '⭐' },
    { id: 4, title: 'تایید', icon: '✅' },
  ]


  const durationOptions = [
    { value: '3months', label: '3 ماهه' },
    { value: '6months', label: '6 ماهه' },
    { value: '9months', label: '9 ماهه' },
    { value: '12months', label: '12 ماهه' }
  ]

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name as keyof typeof prev] as string[], value]
        : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
    }))
  }

  const nextStep = async () => {
    if (currentStep < 4) {
      // ذخیره مرحله فعلی
      let saved = false
      switch (currentStep) {
        case 1:
          // اعتبارسنجی تخفیف کلی
          if (!formData.globalDiscountPercentage) {
            setError('درصد تخفیف کلی الزامی است.')
            return
          }
          // اعتبارسنجی تخفیف اختصاصی
          if (formData.showSpecificDiscount && formData.specificTitle && !formData.specificPercentage) {
            setError('درصد تخفیف اختصاصی الزامی است.')
            return
          }
          if (formData.showSpecificDiscount && formData.specificTitle && formData.specificPercentage) {
            const globalPercent = parseFloat(formData.globalDiscountPercentage)
            const specificPercent = parseFloat(formData.specificPercentage)
            if (specificPercent <= globalPercent) {
              setError('درصد تخفیف اختصاصی باید از تخفیف کلی بیشتر باشد.')
              return
            }
          }
          saved = await saveDiscounts()
          break
        case 2:
          // اعتبارسنجی هدیه
          if (!formData.giftDescription) {
            setError('فیلد هدیه الزامی است.')
            return
          }
          if (formData.giftType === 'amount' && !formData.giftAmount) {
            setError('مبلغ کل خرید الزامی است.')
            return
          }
          if (formData.giftType === 'count' && !formData.giftCount) {
            setError('تعداد خرید الزامی است.')
            return
          }
          saved = await saveLoyalGift()
          break
        case 3:
          // اعتبارسنجی VIP
          if (formData.oneStarFeatures.length === 0) {
            setError('حداقل یک گزینه از گروه VIP الزامی است.')
            return
          }
          saved = await saveVip()
          break
      }
      
      if (saved) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }


  // حذف تخفیف اختصاصی
  const removeSpecificDiscount = async () => {
    if (!packageId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      const discountAll = { percentage: parseFloat(formData.globalDiscountPercentage) }
      
      const response = await apiService.savePackageDiscounts(
        packageId, 
        discountAll, 
        undefined, 
        true // remove_specific = true
      )
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      // پاک کردن فیلدهای frontend
      handleInputChange('showSpecificDiscount', false)
      handleInputChange('specificTitle', '')
      handleInputChange('specificDescription', '')
      handleInputChange('specificPercentage', '')
      
      return true
    } catch (err) {
      setError('خطا در حذف تخفیف اختصاصی')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ذخیره مرحله تخفیفات
  const saveDiscounts = async () => {
    if (!packageId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      const discountAll = { percentage: parseFloat(formData.globalDiscountPercentage) }
      const specificDiscount = formData.showSpecificDiscount && formData.specificTitle ? {
        title: formData.specificTitle,
        description: formData.specificDescription,
        percentage: parseFloat(formData.specificPercentage)
      } : undefined
      
      const response = await apiService.savePackageDiscounts(
        packageId, 
        discountAll, 
        specificDiscount, 
        !formData.showSpecificDiscount
      )
      
      if (response.error) {
        setError(response.error)
        return false
      }
      return true
    } catch (err) {
      setError('خطا در ذخیره تخفیفات')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ذخیره مرحله هدیه
  const saveLoyalGift = async () => {
    if (!packageId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      const amount = formData.giftType === 'amount' && formData.giftAmount ? parseFloat(formData.giftAmount) : undefined
      const count = formData.giftType === 'count' && formData.giftCount ? parseInt(formData.giftCount) : undefined
      
      const response = await apiService.savePackageLoyalGift(
        packageId,
        formData.giftDescription,
        amount,
        count
      )
      
      if (response.error) {
        setError(response.error)
        return false
      }
      return true
    } catch (err) {
      setError('خطا در ذخیره هدیه')
      return false
    } finally {
      setLoading(false)
    }
  }

  // ذخیره مرحله VIP
  const saveVip = async () => {
    if (!packageId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      const allSelectedIds = [...formData.oneStarFeatures, ...formData.twoStarFeatures]
        .map(id => parseInt(id))
        .filter(id => !isNaN(id))
      
      const response = await apiService.savePackageVip(packageId, allSelectedIds)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      return true
    } catch (err) {
      setError('خطا در ذخیره VIP')
      return false
    } finally {
      setLoading(false)
    }
  }

  // تکمیل پکیج
  const finalizePackage = async () => {
    if (!packageId) return false
    
    try {
      setLoading(true)
      setError(null)
      
      const durationMap: { [key: string]: number } = {
        '3months': 3,
        '6months': 6,
        '9months': 9,
        '12months': 12
      }
      
      const response = await apiService.finalizePackage(
        packageId,
        durationMap[formData.duration],
        true
      )
      
      if (response.error) {
        setError(response.error)
        return false
      } else {
        onSuccess()
        return true
      }
    } catch (err) {
      setError('خطا در تکمیل پکیج')
      return false
    } finally {
      setLoading(false)
    }
  }

  const getStepDescription = (stepId: number) => {
    switch (stepId) {
      case 1:
        return "در این بخش می‌توانید تخفیف کلی یا تخفیف اختصاصی برای کسب‌وکار خود تعیین کنید."
      case 2:
        return "در این بخش می‌توانید هدایای ویژه برای مشتریان خود تعریف کنید."
      case 3:
        return "در این بخش می‌توانید ویژگی‌های VIP و امتیازات ویژه را انتخاب کنید."
      case 4:
        return "در این بخش مدت زمان طرح و خلاصه‌ای از پکیج خود را مشاهده کنید."
      default:
        return ""
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            {/* راهنمایی مرحله */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-3 border border-gray-200`}>
              <p className="text-xs text-gray-600 leading-relaxed">
                {getStepDescription(currentStep)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                تخفیف کلی (%)
              </label>
              <input
                type="number"
                value={formData.globalDiscountPercentage}
                onChange={(e) => handleInputChange('globalDiscountPercentage', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: 20"
              />
            </div>
            
            {!formData.showSpecificDiscount ? (
              <button
                onClick={() => handleInputChange('showSpecificDiscount', true)}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">ایجاد تخفیف اختصاصی</span>
              </button>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">تخفیف اختصاصی</h3>
                  <button
                    onClick={removeSpecificDiscount}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {loading ? 'در حال حذف...' : 'حذف تخفیف اختصاصی ✕'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    عنوان تخفیف اختصاصی
                  </label>
                  <input
                    type="text"
                    value={formData.specificTitle}
                    onChange={(e) => handleInputChange('specificTitle', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: تخفیف ویژه محصولات جدید"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    توضیحات تخفیف
                  </label>
                  <textarea
                    value={formData.specificDescription}
                    onChange={(e) => handleInputChange('specificDescription', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="توضیحات بیشتر در مورد تخفیف..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    درصد تخفیف اختصاصی
                  </label>
                  <input
                    type="number"
                    value={formData.specificPercentage}
                    onChange={(e) => handleInputChange('specificPercentage', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: 30"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-3">
            {/* راهنمایی مرحله */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-3 border border-gray-200`}>
              <p className="text-xs text-gray-600 leading-relaxed">
                {getStepDescription(currentStep)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                شرط دریافت هدیه
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="giftType"
                    value="amount"
                    checked={formData.giftType === 'amount'}
                    onChange={(e) => handleInputChange('giftType', e.target.value)}
                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-700">جمع مبلغ خرید</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="giftType"
                    value="count"
                    checked={formData.giftType === 'count'}
                    onChange={(e) => handleInputChange('giftType', e.target.value)}
                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-700">تعداد مراجعه</span>
                </label>
              </div>
            </div>
            
            {formData.giftType === 'amount' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  مبلغ کل خرید
                </label>
                <input
                  type="number"
                  value={formData.giftAmount}
                  onChange={(e) => handleInputChange('giftAmount', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 1000000"
                />
              </div>
            )}
            
            {formData.giftType === 'count' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  تعداد خرید
                </label>
                <input
                  type="number"
                  value={formData.giftCount}
                  onChange={(e) => handleInputChange('giftCount', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 5"
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                هدیه
              </label>
              <input
                type="text"
                value={formData.giftDescription}
                onChange={(e) => handleInputChange('giftDescription', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: کارت هدیه 100 هزار تومانی"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            {/* راهنمایی مرحله */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-3 border border-gray-200`}>
              <p className="text-xs text-gray-600 leading-relaxed">
                {getStepDescription(currentStep)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">VIP</h3>
              <div className="space-y-2">
                {vipExperiences && vipExperiences.length > 0 ? (
                  vipExperiences.filter(exp => exp.vip_type === 'VIP').map((experience) => (
                    <label key={experience.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.oneStarFeatures.includes(experience.id.toString())}
                        onChange={(e) => handleCheckboxChange('oneStarFeatures', experience.id.toString(), e.target.checked)}
                        className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">{experience.name}</span>
                        {experience.description && (
                          <span className="text-xs text-gray-500">{experience.description}</span>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">در حال بارگذاری...</p>
                )}
                {vipExperiences && vipExperiences.filter(exp => exp.vip_type === 'VIP').length === 0 && (
                  <p className="text-xs text-gray-500">هیچ گزینه VIP برای دسته‌بندی کسب و کار شما تعریف نشده است.</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">VIP+</h3>
              <div className="space-y-2">
                {vipExperiences && vipExperiences.length > 0 ? (
                  vipExperiences.filter(exp => exp.vip_type === 'VIP+').map((experience) => (
                    <label key={experience.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.twoStarFeatures.includes(experience.id.toString())}
                        onChange={(e) => handleCheckboxChange('twoStarFeatures', experience.id.toString(), e.target.checked)}
                        className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">{experience.name}</span>
                        {experience.description && (
                          <span className="text-xs text-gray-500">{experience.description}</span>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">در حال بارگذاری...</p>
                )}
                {vipExperiences && vipExperiences.filter(exp => exp.vip_type === 'VIP+').length === 0 && (
                  <p className="text-xs text-gray-500">هیچ گزینه VIP+ برای دسته‌بندی کسب و کار شما تعریف نشده است.</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-3">
            {/* راهنمایی مرحله */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-3 border border-gray-200`}>
              <p className="text-xs text-gray-600 leading-relaxed">
                {getStepDescription(currentStep)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                مدت زمان طرح
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید...</option>
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">خلاصه پکیج</h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    {formData.globalDiscountPercentage && (
                      <p>تخفیف کلی: {formData.globalDiscountPercentage}%</p>
                    )}
                    {formData.showSpecificDiscount && formData.specificTitle && (
                      <p>تخفیف اختصاصی: {formData.specificTitle} ({formData.specificPercentage}%)</p>
                    )}
                    {formData.giftDescription && (
                      <p>هدیه: {formData.giftDescription} 
                        {formData.giftType === 'amount' && formData.giftAmount && ` (مبلغ: ${formData.giftAmount})`}
                        {formData.giftType === 'count' && formData.giftCount && ` (تعداد: ${formData.giftCount})`}
                      </p>
                    )}
                    {formData.oneStarFeatures.length > 0 && (
                      <p>ویژگی‌های VIP: {formData.oneStarFeatures.map(id => {
                        const exp = vipExperiences?.find(e => e.id.toString() === id)
                        return exp ? exp.name : id
                      }).join(', ')}</p>
                    )}
                    {formData.twoStarFeatures.length > 0 && (
                      <p>ویژگی‌های VIP+: {formData.twoStarFeatures.map(id => {
                        const exp = vipExperiences?.find(e => e.id.toString() === id)
                        return exp ? exp.name : id
                      }).join(', ')}</p>
                    )}
                    {formData.duration && (
                      <p>مدت زمان: {durationOptions.find(opt => opt.value === formData.duration)?.label}</p>
                    )}
                  </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg w-full max-w-lg max-h-[95vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ایجاد پکیج جدید
          </h2>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`text-xs font-medium mb-1 ${
                  currentStep >= step.id 
                    ? isDark ? 'text-white' : 'text-gray-900' 
                    : isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : isDark 
                      ? 'bg-slate-700 text-slate-400' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : currentStep === step.id ? (
                    <span className="text-xs font-bold">{step.id}</span>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-2 mt-3.5 ${
                    currentStep > step.id 
                      ? 'bg-blue-600' 
                      : isDark ? 'bg-slate-600' : 'bg-gray-300'
                  }`} />
                )}
                {index === steps.length - 1 && currentStep >= step.id && (
                  <div className={`w-8 h-0.5 mx-2 mt-3.5 ${
                    currentStep > step.id 
                      ? 'bg-blue-600' 
                      : isDark ? 'bg-slate-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-3 py-2 rounded-lg transition-colors text-sm ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            قبلی
          </button>
          
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={onClose}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                isDark
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              انصراف
            </button>
            
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'در حال ذخیره...' : 'بعدی'}
                  </button>
                ) : (
                  <button
                    onClick={finalizePackage}
                    disabled={loading || !formData.duration}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'در حال تکمیل...' : 'تکمیل پکیج'}
                  </button>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Package Details Modal Component
interface PackageDetailsModalProps {
  package: Package
  onClose: () => void
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({ package: pkg, onClose }) => {
  const { isDark } = useTheme()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-blue-600 bg-blue-100'
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'پیش‌نویس'
      case 'approved':
        return 'تایید شده'
      case 'pending':
        return 'در حال بررسی'
      case 'rejected':
        return 'نیاز به ویرایش'
      default:
        return status
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-b flex items-center justify-between`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            جزئیات پکیج تبلیغاتی
          </h2>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* وضعیت و اطلاعات کلی */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-4`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                اطلاعات کلی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    وضعیت پکیج
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                      {getStatusText(pkg.status)}
                    </span>
                    {pkg.is_active && (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-green-600 bg-green-100 mr-2">
                        فعال
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    وضعیت تکمیل
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      pkg.is_complete ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {pkg.is_complete ? 'کامل' : 'ناقص'}
                    </span>
                  </div>
                </div>
                {pkg.start_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      تاریخ شروع
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {new Date(pkg.start_date).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                )}
                {pkg.end_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      تاریخ پایان
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {new Date(pkg.end_date).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                )}
                {pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      روزهای باقی‌مانده
                    </label>
                    <p className={`mt-1 font-medium ${
                      pkg.days_remaining > 7 ? 'text-green-600' : 
                      pkg.days_remaining > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {pkg.days_remaining > 0 ? `${pkg.days_remaining} روز` : 'منقضی شده'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* تخفیف کلی */}
            {pkg.discount_all && (
              <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-4`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center ml-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  تخفیف روی تمام محصولات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      درصد تخفیف
                    </label>
                    <p className={`mt-1 text-2xl font-bold text-red-600`}>
                      %{pkg.discount_all.percentage}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      امتیاز
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {pkg.discount_all.score} از 5
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* تخفیف ویژه */}
            {pkg.specific_discount && (
              <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-4`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center ml-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  تخفیف ویژه
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      عنوان
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {pkg.specific_discount.title}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      درصد تخفیف
                    </label>
                    <p className={`mt-1 text-xl font-bold text-orange-600`}>
                      %{pkg.specific_discount.percentage}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      توضیحات
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {pkg.specific_discount.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* هدیه ویژه */}
            {pkg.elite_gift && (
              <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-4`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center ml-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  هدیه ویژه
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      عنوان هدیه
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {pkg.elite_gift.gift}
                    </p>
                  </div>
                  {pkg.elite_gift.amount && (
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        مبلغ
                      </label>
                      <p className={`mt-1 text-lg font-bold text-purple-600`}>
                        {pkg.elite_gift.amount.toLocaleString()} تومان
                      </p>
                    </div>
                  )}
                  {pkg.elite_gift.count && (
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        تعداد
                      </label>
                      <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {pkg.elite_gift.count} عدد
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تجربیات VIP */}
            {pkg.experiences && pkg.experiences.length > 0 && (
              <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-4`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center ml-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  تجربیات VIP ({pkg.experiences.length} تجربه)
                </h3>
                <div className="space-y-3">
                  {pkg.experiences.map((experience, index) => (
                    <div key={index} className={`${isDark ? 'bg-slate-600' : 'bg-white'} rounded-lg p-3 border ${isDark ? 'border-slate-500' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {experience.vip_experience_category?.name}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {experience.vip_experience_category?.description}
                          </p>
                        </div>
                        <div className="text-left">
                          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            امتیاز: {experience.score}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* تاریخ‌های ایجاد و ویرایش */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-4`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                اطلاعات زمانی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    تاریخ ایجاد
                  </label>
                  <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {new Date(pkg.created_at).toLocaleDateString('fa-IR')} - {new Date(pkg.created_at).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    آخرین ویرایش
                  </label>
                  <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {new Date(pkg.modified_at).toLocaleDateString('fa-IR')} - {new Date(pkg.modified_at).toLocaleTimeString('fa-IR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-t flex justify-end`}>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  )
}
