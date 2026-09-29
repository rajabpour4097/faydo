import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, Package, VipExperienceCategory } from '../../services/api'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'
import { CreatePackageModal } from '../../components/business/CreatePackageModal'
import { formatShamsiDate, formatShamsiDateTime } from '../../utils/shamsiDate'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gift,
  Layers,
  PackageOpen,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  WalletCards,
} from 'lucide-react'

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
    return { text: 'فعال', className: 'text-emerald-700 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:ring-emerald-500/20', dot: 'bg-emerald-500' }
  }
  if (pkg.status === 'approved') {
    const isExpired =
      (pkg.days_remaining !== null && pkg.days_remaining !== undefined && pkg.days_remaining <= 0) ||
      (pkg.end_date && new Date(pkg.end_date) < new Date())
    return isExpired
      ? { text: 'منقضی شده', className: 'text-rose-700 bg-rose-50 ring-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:ring-rose-500/20', dot: 'bg-rose-500' }
      : { text: 'در انتظار انتشار', className: 'text-sky-700 bg-sky-50 ring-sky-200 dark:text-sky-300 dark:bg-sky-500/10 dark:ring-sky-500/20', dot: 'bg-sky-500' }
  }
  if (pkg.status === 'pending' && pkg.is_complete) {
    return { text: 'در حال بررسی', className: 'text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:ring-amber-500/20', dot: 'bg-amber-500' }
  }
  if (pkg.status === 'rejected') {
    return { text: 'نیاز به ویرایش', className: 'text-rose-700 bg-rose-50 ring-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:ring-rose-500/20', dot: 'bg-rose-500' }
  }
  return { text: 'تکمیل نشده', className: 'text-violet-700 bg-violet-50 ring-violet-200 dark:text-violet-300 dark:bg-violet-500/10 dark:ring-violet-500/20', dot: 'bg-violet-500' }
}

interface PackageManagementProps {}

export const PackageManagement: React.FC<PackageManagementProps> = () => {
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

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <MobileDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  // Show access denied if user is not business
  if (user.type !== 'business') {
    return (
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
    )
  }

  if (loading) {
    return (
      <MobileDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  return (
    <>
      <MobilePackageManagement
        packages={packages}
        error={error}
        onCreatePackage={handleCreatePackage}
        onPackageClick={handlePackageClick}
      />

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
}

const MobilePackageManagement: React.FC<MobilePackageManagementProps> = ({
  packages,
  error,
  onCreatePackage,
  onPackageClick,
}) => {
  const { isDark } = useTheme()

  return (
    <MobileDashboardLayout>
      <div dir="rtl" className="min-h-full space-y-5 bg-[#F7F7FB] p-4 pb-28 dark:bg-slate-950">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#6D5DFB] via-[#7C5CFC] to-[#9B7BFF] p-5 text-white shadow-[0_18px_40px_rgba(109,93,251,0.22)]">
          <div className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-16 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                باشگاه مشتریان
              </div>
              <h2 className="text-xl font-black">مدیریت پکیج‌ها</h2>
              <p className="mt-1.5 max-w-[230px] text-xs leading-6 text-white/80">
                مزیت‌ها، تخفیف‌ها و تجربه‌های مشتریان خود را یک‌جا مدیریت کنید.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur-sm">
              <Layers className="h-7 w-7" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-xs font-medium leading-6">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className={`${isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-100'} rounded-[20px] p-3.5 text-center shadow-sm ring-1`}>
            <div className="mb-1 text-xl font-black text-[#7C5CFC]">{packages.length.toLocaleString('fa-IR')}</div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>کل پکیج‌ها</div>
          </div>
          <div className={`${isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-100'} rounded-[20px] p-3.5 text-center shadow-sm ring-1`}>
            <div className="mb-1 text-xl font-black text-emerald-500">{packages.filter(pkg => pkg.is_active).length.toLocaleString('fa-IR')}</div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>فعال</div>
          </div>
          <div className={`${isDark ? 'bg-slate-900 ring-slate-800' : 'bg-white ring-slate-100'} rounded-[20px] p-3.5 text-center shadow-sm ring-1`}>
            <div className="mb-1 text-xl font-black text-amber-500">{packages.filter(pkg => pkg.status === 'pending').length.toLocaleString('fa-IR')}</div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>در حال بررسی</div>
          </div>
        </div>


        {/* Packages List */}
        {packages.length === 0 ? (
          <div className={`${isDark ? 'border-violet-500/20 bg-slate-900' : 'border-violet-200 bg-white'} rounded-[28px] border border-dashed px-6 py-10 text-center shadow-sm`}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-violet-50 text-[#7C5CFC] dark:bg-violet-500/10 dark:text-violet-300">
              <PackageOpen className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <h3 className={`mt-5 text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
              هنوز پکیجی ایجاد نکرده‌اید
            </h3>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} mx-auto mt-2 max-w-xs text-xs leading-6`}>
              اولین پیشنهاد جذاب خود را بسازید و مشتریان وفادارتری داشته باشید.
            </p>
            <button
              onClick={onCreatePackage}
              className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#7C5CFC] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-[#6D4EED]"
            >
              <Plus className="h-4 w-4" />
              ایجاد اولین پکیج
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end justify-between px-1">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>پکیج‌های من</h3>
                <p className="mt-1 text-[11px] text-slate-400">آخرین وضعیت پیشنهادهای شما</p>
              </div>
              <span className={`${isDark ? 'bg-slate-900 text-slate-400 ring-slate-800' : 'bg-white text-slate-500 ring-slate-100'} rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ring-1`}>
                {packages.length.toLocaleString('fa-IR')} مورد
              </span>
            </div>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                role="button"
                tabIndex={0}
                className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'} group rounded-[24px] border p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 ${
                  (pkg.status === 'draft' && !pkg.is_complete) || pkg.status === 'pending' || ['approved', 'rejected'].includes(pkg.status) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                } focus:outline-none focus:ring-2 focus:ring-violet-400/40`}
                onClick={() => onPackageClick(pkg)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onPackageClick(pkg)
                  }
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-[#7C5CFC] dark:bg-violet-500/10 dark:text-violet-300">
                      <WalletCards className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`truncate text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        پکیج تبلیغاتی #{pkg.id.toLocaleString('fa-IR')}
                      </h4>
                      <p className="mt-1 text-[10px] text-slate-400">
                        ایجاد در {formatShamsiDate(pkg.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {(() => {
                      const badge = packageStatusBadge(pkg)
                      return (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${badge.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
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
                    <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} flex items-center justify-between rounded-2xl px-3 py-2.5 text-[10px]`}>
                      {pkg.start_date && (
                        <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <CalendarDays className="ml-1.5 h-3.5 w-3.5 text-violet-500" />
                          شروع: {formatShamsiDate(pkg.start_date)}
                        </div>
                      )}
                      {pkg.end_date && (
                        <div className={`flex items-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <CalendarDays className="ml-1.5 h-3.5 w-3.5 text-violet-500" />
                          پایان: {formatShamsiDate(pkg.end_date)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* اطلاعات تخفیف و هدیه */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {/* تخفیف کلی */}
                    {pkg.discount_percentage && (
                      <div className="flex items-center rounded-2xl bg-rose-50 p-3 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-medium opacity-70">تخفیف فوری</div>
                          <div className="font-black">{Number(pkg.discount_percentage).toLocaleString('fa-IR')}٪</div>
                        </div>
                      </div>
                    )}
                    {Number(pkg.cashback_percentage) > 0 && (
                      <div className="flex items-center rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                          <RotateCcw className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-medium opacity-70">کش‌بک</div>
                          <div className="font-black">{Number(pkg.cashback_percentage).toLocaleString('fa-IR')}٪</div>
                        </div>
                      </div>
                    )}

                    {/* تخفیف اختصاصی - زیر تخفیف کلی */}
                    {pkg.specific_discount_title && pkg.specific_discount_percentage && (
                      <div className="flex items-center rounded-2xl bg-amber-50 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-medium opacity-70">تخفیف ویژه</div>
                          <div className="font-black">{Number(pkg.specific_discount_percentage).toLocaleString('fa-IR')}٪</div>
                          <div className="truncate text-[9px] opacity-70">{pkg.specific_discount_title}</div>
                        </div>
                      </div>
                    )}

                    {pkg.elite_gift_title && (
                      <div className="flex items-center rounded-2xl bg-violet-50 p-3 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                          <Gift className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-medium opacity-70">هدیه وفاداری</div>
                          <div className="truncate text-[11px] font-black">{pkg.elite_gift_title}</div>
                          {pkg.elite_gift_amount && (
                            <div className="truncate text-[9px] opacity-70">
                              برای {formatAmount(pkg.elite_gift_amount)} تومان خرید
                            </div>
                          )}
                          {pkg.elite_gift_count && (
                            <div className="text-[9px] opacity-70">
                              برای {pkg.elite_gift_count.toLocaleString('fa-IR')} خرید
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* تعداد تجربیات VIP و روزهای باقی‌مانده */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] dark:border-slate-800">
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      {Number(pkg.vip_experiences_count || 0).toLocaleString('fa-IR')} تجربه ویژه
                    </div>
                    
                    {pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
                      <div className={`flex items-center gap-1.5 font-medium ${pkg.days_remaining > 7 ? 'text-emerald-600' : pkg.days_remaining > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                        <Clock3 className="h-3.5 w-3.5" />
                        {pkg.days_remaining > 0 ? `${pkg.days_remaining.toLocaleString('fa-IR')} روز باقی‌مانده` : 'منقضی شده'}
                      </div>
                    )}
                  </div>
                </div>

                {/* پیام‌های راهنما */}
                {pkg.status === 'draft' && (
                  <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-3 py-2.5 dark:bg-violet-500/10">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                      <AlertCircle className="h-3.5 w-3.5" />
                      ادامه تکمیل پکیج
                    </span>
                    <ArrowLeft className="h-4 w-4 text-violet-500 transition-transform group-hover:-translate-x-1" />
                  </div>
                )}
                {pkg.status === 'pending' && (
                  <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2.5 dark:bg-amber-500/10">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      <Clock3 className="h-3.5 w-3.5" />
                      مشاهده و ویرایش
                    </span>
                    <ArrowLeft className="h-4 w-4 text-amber-500 transition-transform group-hover:-translate-x-1" />
                  </div>
                )}
                {pkg.status === 'approved' && (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-500/10">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      مشاهده جزئیات
                    </span>
                    <ArrowLeft className="h-4 w-4 text-emerald-500 transition-transform group-hover:-translate-x-1" />
                  </div>
                )}
                {pkg.status === 'rejected' && (
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-3 py-2.5 dark:bg-rose-500/10">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                      <AlertCircle className="h-3.5 w-3.5" />
                      مشاهده موارد نیازمند اصلاح
                    </span>
                    <ArrowLeft className="h-4 w-4 text-rose-500 transition-transform group-hover:-translate-x-1" />
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
          className="fixed bottom-24 right-4 z-40 flex h-14 items-center gap-2 rounded-2xl bg-[#7C5CFC] px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,252,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6D4EED]"
        >
          <Plus className="h-5 w-5" />
          پکیج جدید
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
                      {formatShamsiDate(pkg.start_date)}
                    </p>
                  </div>
                )}
                {pkg.end_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      تاریخ پایان
                    </label>
                    <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {formatShamsiDate(pkg.end_date)}
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
                    {formatShamsiDateTime(pkg.created_at)}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    آخرین ویرایش
                  </label>
                  <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {formatShamsiDateTime(pkg.modified_at)}
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
