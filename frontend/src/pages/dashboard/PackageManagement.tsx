import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, Package, VipExperienceCategory } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'
import { CreatePackageModal } from '../../components/business/CreatePackageModal'

// ─── Helpers for currency formatting ───────────────────────────────────────
/**
 * فرمت‌بندی عدد با جداسازی سه رقمی برای نمایش
 * مثال: 1000000 → "1,000,000"
 */
const formatAmount = (value: string | number): string => {
  if (value === '' || value === null || value === undefined) return ''
  const num = typeof value === 'string' ? value.replace(/,/g, '') : String(value)
  if (num === '' || isNaN(Number(num))) return typeof value === 'string' ? value : ''
  return Number(num).toLocaleString('en-US')
}

function packageStatusBadge(pkg: { status: string; is_complete?: boolean; is_active?: boolean; days_remaining?: number | null; end_date?: string | null }) {
  if (pkg.is_active) {
    return { text: 'فعال', className: 'text-green-600 bg-green-100' }
  }
  if (pkg.status === 'approved') {
    const isExpired =
      (pkg.days_remaining !== null && pkg.days_remaining !== undefined && pkg.days_remaining <= 0) ||
      (pkg.end_date && new Date(pkg.end_date) < new Date())
    return isExpired
      ? { text: 'منقضی شده', className: 'text-red-600 bg-red-100' }
      : { text: 'در انتظار انتشار', className: 'text-blue-600 bg-blue-100' }
  }
  if (pkg.status === 'pending' && pkg.is_complete) {
    return { text: 'در حال بررسی', className: 'text-orange-600 bg-orange-100' }
  }
  if (pkg.status === 'rejected') {
    return { text: 'نیاز به ویرایش', className: 'text-red-600 bg-red-100' }
  }
  return { text: 'تکمیل نشده', className: 'text-blue-600 bg-blue-100' }
}

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
  const [vipExperiencesLoading, setVipExperiencesLoading] = useState(true)
  const [vipExperiencesError, setVipExperiencesError] = useState<string | null>(null)
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
    setVipExperiencesLoading(true)
    setVipExperiencesError(null)
    try {
      let clubId: number | undefined

      const profileResp = await apiService.getProfile()
      const freshCategory = profileResp.data?.profile && 'category' in profileResp.data.profile
        ? profileResp.data.profile.category
        : null

      if (freshCategory && typeof freshCategory === 'object') {
        clubId = freshCategory.club ?? freshCategory.club_detail?.id
      } else {
        const category = user?.businessProfile?.category
        if (typeof category === 'object' && category !== null) {
          clubId = category.club ?? category.club_detail?.id
        }
      }

      let response = await apiService.getVipExperienceCategories(clubId)

      if ((!response.data || response.data.length === 0) && clubId) {
        response = await apiService.getVipExperienceCategories()
      }

      if (response.error) {
        setVipExperiences([])
        setVipExperiencesError(response.error)
      } else if (response.data && response.data.length > 0) {
        setVipExperiences(response.data)
      } else {
        setVipExperiences([])
        setVipExperiencesError(
          clubId
            ? 'راهنمای VIP این باشگاه هنوز در سرور ثبت نشده. دستور populate_vip_categories را اجرا کنید.'
            : 'باشگاه کسب\u200cوکار مشخص نیست. در پروفایل دسته\u200cبندی (مثلاً کافه) را انتخاب کنید.'
        )
      }
    } catch {
      setVipExperiences([])
      setVipExperiencesError('خطا در بارگذاری گزینه\u200cهای VIP')
    } finally {
      setVipExperiencesLoading(false)
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

  const handleViewPackageById = async (packageId: number) => {
    try {
      const response = await apiService.getPackage(packageId)
      if (response.data) {
        setViewingPackage(response.data)
        setShowPackageDetails(true)
      }
    } catch {
      setError('خطا در دریافت جزئیات پکیج')
    }
  }

  const handlePackageClick = (pkg: Package) => {
    if (pkg.status === 'draft' && !pkg.is_complete) {
      handleEditPackage(pkg.id)
    } else if (pkg.status === 'pending') {
      // فقط پکیج‌های در حال بررسی قابل ویرایش هستند
      handleEditPackage(pkg.id)
    } else if (['approved', 'rejected'].includes(pkg.status)) {
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
        return 'تکمیل نشده'
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
                            (pkg.status === 'draft' && !pkg.is_complete) || pkg.status === 'pending' || ['approved', 'rejected'].includes(pkg.status) ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => handlePackageClick(pkg)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {(() => {
                                const badge = packageStatusBadge(pkg)
                                return (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                                    {badge.text}
                                  </span>
                                )
                              })()}
                              {pkg.is_complete && pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
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
                              {Number(pkg.cashback_percentage) > 0 && (
                                <div className="flex items-center">
                                  <span className="text-teal-600 font-medium">کش‌بک %{pkg.cashback_percentage}</span>
                                </div>
                              )}
                              {pkg.specific_discount_title && pkg.specific_discount_percentage && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center ml-1">
                                    <svg className="w-2 h-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-orange-600 font-medium">%{pkg.specific_discount_percentage}</span>
                                    <span className="text-orange-500 text-xs truncate max-w-20" title={pkg.specific_discount_title}>
                                      {pkg.specific_discount_title}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {/* فضای خالی برای حفظ یکدستی layout */}
                              {!pkg.discount_percentage && !pkg.specific_discount_title && (
                                <div className="h-6"></div>
                              )}
                              {pkg.discount_percentage && !pkg.specific_discount_title && (
                                <div className="h-6"></div>
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
                                        برای {formatAmount(pkg.elite_gift_amount)} تومان خرید
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
                                  کلیک کنید تا ویرایش کنید
                                </span>
                              )}
                              {pkg.status === 'approved' && (
                                <span className="text-green-600 text-sm">
                                  تایید شده - فقط مشاهده
                                </span>
                              )}
                              {pkg.status === 'rejected' && (
                                <span className="text-red-600 text-sm">
                                  نیاز به ویرایش - فقط مشاهده
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
            onViewDetails={(id) => {
              const pkg = packages.find(p => p.id === id)
              if (pkg) {
                handleViewPackage(pkg)
              } else {
                handleViewPackageById(id)
              }
            }}
            editingPackageId={editingPackageId}
            vipExperiences={vipExperiences}
            vipExperiencesLoading={vipExperiencesLoading}
            vipExperiencesError={vipExperiencesError}
            businessName={user?.businessProfile?.name || user?.name || 'کسب‌وکار'}
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
                  (pkg.status === 'draft' && !pkg.is_complete) || pkg.status === 'pending' || ['approved', 'rejected'].includes(pkg.status) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
                onClick={() => onPackageClick(pkg)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {(() => {
                      const badge = packageStatusBadge(pkg)
                      return (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                          {badge.text}
                        </span>
                      )
                    })()}
                  </div>
                </div>
                
                {/* اطلاعات پکیج */}
                <div className="space-y-3 mb-4">
                  {/* تاریخ‌ها */}
                  {(pkg.status !== 'draft' && (pkg.start_date || pkg.end_date)) && (
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
                  <div className="space-y-3 text-sm">
                    {/* تخفیف کلی */}
                    {pkg.discount_percentage && (
                      <div className={`flex items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center ml-2">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">تخفیف فوری</div>
                          <div className="text-red-600 font-bold">%{pkg.discount_percentage}</div>
                        </div>
                      </div>
                    )}
                    {Number(pkg.cashback_percentage) > 0 && (
                      <div className={`flex items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center ml-2">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">کش‌بک</div>
                          <div className="text-teal-600 font-bold">%{pkg.cashback_percentage}</div>
                        </div>
                      </div>
                    )}

                    {/* تخفیف اختصاصی - زیر تخفیف کلی */}
                    {pkg.specific_discount_title && pkg.specific_discount_percentage && (
                      <div className={`flex items-center ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center ml-2">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">تخفیف ویژه</div>
                          <div className="text-orange-600 font-bold">%{pkg.specific_discount_percentage}</div>
                          <div className="text-orange-500 text-xs truncate">{pkg.specific_discount_title}</div>
                        </div>
                      </div>
                    )}

                    {/* فضای خالی برای حفظ یکدستی layout */}
                    {!pkg.discount_percentage && !pkg.specific_discount_title && (
                      <div className="h-16"></div>
                    )}
                    {pkg.discount_percentage && !pkg.specific_discount_title && (
                      <div className="h-8"></div>
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
                              برای {formatAmount(pkg.elite_gift_amount)} تومان خرید
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
                      کلیک کنید تا ویرایش کنید
                    </span>
                  </div>
                )}
                {pkg.status === 'approved' && (
                  <div className="text-center">
                    <span className="text-green-600 text-sm">
                      تایید شده - فقط مشاهده
                    </span>
                  </div>
                )}
                {pkg.status === 'rejected' && (
                  <div className="text-center">
                    <span className="text-red-600 text-sm">
                      نیاز به ویرایش - فقط مشاهده
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
        return 'تکمیل نشده'
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
                    {(() => {
                      const badge = packageStatusBadge(pkg)
                      return (
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badge.className}`}>
                          {badge.text}
                        </span>
                      )
                    })()}
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
                      درصد تخفیف فوری
                    </label>
                    <p className={`mt-1 text-2xl font-bold text-red-600`}>
                      %{pkg.discount_all.percentage}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      درصد کش‌بک
                    </label>
                    <p className={`mt-1 text-2xl font-bold text-teal-600`}>
                      %{pkg.discount_all.cashback_percentage || pkg.cashback_percentage || 0}
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
                  {pkg.elite_gift.description && (
                    <div className="md:col-span-3">
                      <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        توضیحات هدیه
                      </label>
                      <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {pkg.elite_gift.description}
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
