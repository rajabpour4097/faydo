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
  const [showActivePackageNotice, setShowActivePackageNotice] = useState(false)

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

      if (packageBlockReason === 'active') {
        setError(null)
        setShowActivePackageNotice(true)
        return
      }
      
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

        {showActivePackageNotice && (
          <ActivePackageNotice onClose={() => setShowActivePackageNotice(false)} />
        )}
    </>
  )
}

const ActivePackageNotice: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" dir="rtl">
      <button
        type="button"
        aria-label="بستن پیام"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="active-package-notice-title"
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="h-1.5 bg-gradient-to-l from-[#7C5CFC] via-violet-400 to-amber-400" />
        <div className="px-6 pb-6 pt-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-[#7C5CFC] dark:bg-violet-500/10 dark:text-violet-300">
            <Clock3 className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <h3 id="active-package-notice-title" className="text-base font-black text-slate-900 dark:text-white">
            پکیج فعال دارید
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
            بیش از ۱۰ روز تا پایان پکیج فعال شما باقی مانده است. در ۱۰ روز پایانی می‌توانید پکیج جدیدی ایجاد کنید.
          </p>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="mt-6 w-full rounded-2xl bg-[#7C5CFC] py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-[#6D4EED]"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
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
  const packageSequenceById = new Map(
    [...packages]
      .sort((a, b) => {
        const dateDifference = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        return dateDifference || a.id - b.id
      })
      .map((pkg, index) => [pkg.id, index + 1]),
  )

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
                        پکیج تبلیغاتی شماره {packageSequenceById.get(pkg.id)?.toLocaleString('fa-IR')}
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
                      <div className="col-span-2 flex items-start rounded-2xl bg-violet-50 p-3 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                          <Gift className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-medium opacity-70">هدیه وفاداری</div>
                          <div className="mt-0.5 whitespace-normal break-words text-[10px] font-bold leading-5">
                            {pkg.elite_gift_title}
                          </div>
                          {pkg.elite_gift_amount && (
                            <div className="mt-0.5 whitespace-normal text-[9px] leading-4 opacity-70">
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
  const statusBadge = packageStatusBadge(pkg)
  const goldExperiences = pkg.experiences?.filter(
    experience => experience.vip_experience_category?.vip_type === 'VIP',
  ) || []
  const vipExperiences = pkg.experiences?.filter(
    experience => experience.vip_experience_category?.vip_type === 'VIP+',
  ) || []

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" dir="rtl">
      <button type="button" aria-label="بستن جزئیات" className="absolute inset-0" onClick={onClose} />
      <div className={`${isDark ? 'bg-slate-950' : 'bg-[#F7F7FB]'} relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[30px] shadow-2xl sm:max-h-[90vh] sm:rounded-[30px]`}>
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6D5DFB] via-[#7C5CFC] to-[#9B7BFF] px-5 pb-5 pt-4 text-white">
          <div className="absolute -left-8 -top-12 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/10" />
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="بستن"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative flex items-center gap-3 pl-11">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <WalletCards className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/70">جزئیات پیشنهاد</p>
              <h2 className="mt-0.5 text-lg font-black">پکیج تبلیغاتی</h2>
              <p className="mt-1 truncate text-[11px] text-white/75">{pkg.business_name}</p>
            </div>
          </div>
          <div className="relative mt-4 flex items-center justify-between rounded-2xl bg-black/10 px-3.5 py-2.5 backdrop-blur-sm">
            <span className="text-[11px] text-white/75">وضعیت فعلی پکیج</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700">
              <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.text}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-3 p-4 sm:p-5">
            {/* وضعیت و اطلاعات کلی */}
            <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'} rounded-[24px] border p-4 shadow-sm`}>
              <h3 className={`mb-3 flex items-center gap-2 text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-[#7C5CFC] dark:bg-violet-500/10 dark:text-violet-300">
                  <Layers className="h-4 w-4" />
                </span>
                اطلاعات کلی
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                  <label className="text-[10px] font-medium text-slate-400">
                    وضعیت پکیج
                  </label>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusBadge.className}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
                <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                  <label className="text-[10px] font-medium text-slate-400">
                    وضعیت تکمیل
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      pkg.is_complete
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {pkg.is_complete ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {pkg.is_complete ? 'کامل' : 'ناقص'}
                    </span>
                  </div>
                </div>
                {pkg.start_date && (
                  <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                    <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
                      تاریخ شروع
                    </label>
                    <p className={`mt-1.5 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {formatShamsiDate(pkg.start_date)}
                    </p>
                  </div>
                )}
                {pkg.end_date && (
                  <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                    <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
                      تاریخ پایان
                    </label>
                    <p className={`mt-1.5 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {formatShamsiDate(pkg.end_date)}
                    </p>
                  </div>
                )}
                {pkg.days_remaining !== null && pkg.days_remaining !== undefined && (
                  <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} col-span-2 rounded-2xl p-3`}>
                    <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      روزهای باقی‌مانده
                    </label>
                    <p className={`mt-1.5 text-sm font-black ${
                      pkg.days_remaining > 7 ? 'text-emerald-600' :
                      pkg.days_remaining > 0 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {pkg.days_remaining > 0 ? `${pkg.days_remaining.toLocaleString('fa-IR')} روز` : 'منقضی شده'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* تخفیف کلی */}
            {pkg.discount_all && (
              <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-rose-100 bg-white'} rounded-[24px] border p-4 shadow-sm`}>
                <h3 className={`mb-3 flex items-center text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    <Tag className="h-4 w-4" />
                  </span>
                  تخفیف روی تمام محصولات
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-rose-50 p-3 dark:bg-rose-500/10">
                    <label className="text-[10px] font-medium text-rose-500">
                      درصد تخفیف فوری
                    </label>
                    <p className="mt-1 text-2xl font-black text-rose-700 dark:text-rose-300">
                      {Number(pkg.discount_all.percentage).toLocaleString('fa-IR')}٪
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                    <label className="text-[10px] font-medium text-emerald-500">
                      درصد کش‌بک
                    </label>
                    <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">
                      {Number(pkg.discount_all.cashback_percentage || pkg.cashback_percentage || 0).toLocaleString('fa-IR')}٪
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* تخفیف ویژه */}
            {pkg.specific_discount && (
              <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-amber-100 bg-white'} rounded-[24px] border p-4 shadow-sm`}>
                <h3 className={`mb-3 flex items-center text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  تخفیف ویژه
                </h3>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className={`${isDark ? 'bg-slate-800/70' : 'bg-amber-50/70'} min-w-0 rounded-2xl p-3`}>
                    <label className="text-[10px] font-medium text-slate-400">
                      عنوان
                    </label>
                    <p className={`mt-1 whitespace-normal break-words text-xs font-bold leading-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {pkg.specific_discount.title}
                    </p>
                  </div>
                  <div className="min-w-[88px] rounded-2xl bg-amber-50 p-3 dark:bg-amber-500/10">
                    <label className="text-[10px] font-medium text-amber-500">
                      درصد تخفیف
                    </label>
                    <p className="mt-1 text-xl font-black text-amber-700 dark:text-amber-300">
                      {Number(pkg.specific_discount.percentage).toLocaleString('fa-IR')}٪
                    </p>
                  </div>
                  {pkg.specific_discount.description && (
                  <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} col-span-2 rounded-2xl p-3`}>
                    <label className="text-[10px] font-medium text-slate-400">
                      توضیحات
                    </label>
                    <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {pkg.specific_discount.description}
                    </p>
                  </div>
                  )}
                </div>
              </div>
            )}

            {/* هدیه ویژه */}
            {pkg.elite_gift && (
              <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-violet-100 bg-white'} rounded-[24px] border p-4 shadow-sm`}>
                <h3 className={`mb-3 flex items-center text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                    <Gift className="h-4 w-4" />
                  </span>
                  هدیه وفاداری
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`${isDark ? 'bg-slate-800/70' : 'bg-violet-50/70'} col-span-2 rounded-2xl p-3`}>
                    <label className="text-[10px] font-medium text-violet-500">
                      عنوان هدیه
                    </label>
                    <p className={`mt-1 whitespace-normal break-words text-xs font-bold leading-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {pkg.elite_gift.gift}
                    </p>
                  </div>
                  {pkg.elite_gift.amount && (
                    <div className="col-span-2 rounded-2xl bg-violet-50 p-3 dark:bg-violet-500/10">
                      <label className="text-[10px] font-medium text-violet-500">
                        شرط مجموع خرید
                      </label>
                      <p className="mt-1 text-base font-black text-violet-700 dark:text-violet-300">
                        {pkg.elite_gift.amount.toLocaleString('fa-IR')} تومان
                      </p>
                    </div>
                  )}
                  {pkg.elite_gift.count && (
                    <div className="col-span-2 rounded-2xl bg-violet-50 p-3 dark:bg-violet-500/10">
                      <label className="text-[10px] font-medium text-violet-500">
                        شرط تعداد مراجعه
                      </label>
                      <p className="mt-1 text-base font-black text-violet-700 dark:text-violet-300">
                        {pkg.elite_gift.count.toLocaleString('fa-IR')} مراجعه
                      </p>
                    </div>
                  )}
                  {pkg.elite_gift.description && (
                    <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} col-span-2 rounded-2xl p-3`}>
                      <label className="text-[10px] font-medium text-slate-400">
                        توضیحات هدیه
                      </label>
                      <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {pkg.elite_gift.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تجربیات VIP */}
            {pkg.experiences && pkg.experiences.length > 0 && (
              <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-amber-100 bg-white'} rounded-[24px] border p-4 shadow-sm`}>
                <h3 className={`mb-3 flex items-center text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  تجربیات ویژه
                  <span className="mr-auto rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    {pkg.experiences.length.toLocaleString('fa-IR')} تجربه
                  </span>
                </h3>
                <div className="space-y-3">
                  {goldExperiences.length > 0 && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-500/15 dark:bg-amber-500/5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] font-black text-amber-700 dark:text-amber-300">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] text-white">G</span>
                          تجربیات Gold
                        </span>
                        <span className="text-[9px] font-bold text-amber-600/70">
                          {goldExperiences.length.toLocaleString('fa-IR')} مورد
                        </span>
                      </div>
                      <div className="space-y-2">
                        {goldExperiences.map(experience => (
                          <div key={experience.id} className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-xl p-3 shadow-sm`}>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {experience.vip_experience_category?.name}
                              </h4>
                              <span className="shrink-0 text-[9px] font-bold text-amber-600">
                                امتیاز {Number(experience.score).toLocaleString('fa-IR')} از ۵
                              </span>
                            </div>
                            <p className={`mt-1 whitespace-normal break-words text-[10px] leading-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {experience.description || experience.vip_experience_category?.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {vipExperiences.length > 0 && (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3 dark:border-violet-500/15 dark:bg-violet-500/5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] font-black text-violet-700 dark:text-violet-300">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[8px] text-white">VIP</span>
                          تجربیات VIP
                        </span>
                        <span className="text-[9px] font-bold text-violet-600/70">
                          {vipExperiences.length.toLocaleString('fa-IR')} مورد
                        </span>
                      </div>
                      <div className="space-y-2">
                        {vipExperiences.map(experience => (
                          <div key={experience.id} className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} rounded-xl p-3 shadow-sm`}>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {experience.vip_experience_category?.name}
                              </h4>
                              <span className="shrink-0 text-[9px] font-bold text-violet-600">
                                امتیاز {Number(experience.score).toLocaleString('fa-IR')} از ۵
                              </span>
                            </div>
                            <p className={`mt-1 whitespace-normal break-words text-[10px] leading-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {experience.description || experience.vip_experience_category?.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {goldExperiences.length === 0 && vipExperiences.length === 0 && (
                    <div className="space-y-2">
                      {pkg.experiences.map(experience => (
                        <div key={experience.id} className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {experience.vip_experience_category?.name}
                            </h4>
                            <p className={`mt-1 whitespace-normal break-words text-[10px] leading-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {experience.description || experience.vip_experience_category?.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تاریخ‌های ایجاد و ویرایش */}
            <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'} rounded-[24px] border p-4 shadow-sm`}>
              <h3 className={`mb-3 flex items-center gap-2 text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <Clock3 className="h-4 w-4" />
                </span>
                اطلاعات زمانی
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                  <label className="text-[10px] font-medium text-slate-400">
                    تاریخ ایجاد
                  </label>
                  <p className={`mt-1.5 text-[10px] font-bold leading-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {formatShamsiDateTime(pkg.created_at)}
                  </p>
                </div>
                <div className={`${isDark ? 'bg-slate-800/70' : 'bg-slate-50'} rounded-2xl p-3`}>
                  <label className="text-[10px] font-medium text-slate-400">
                    آخرین ویرایش
                  </label>
                  <p className={`mt-1.5 text-[10px] font-bold leading-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {formatShamsiDateTime(pkg.modified_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'} border-t px-4 py-3`}>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-[#7C5CFC] py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/15 transition hover:bg-[#6D4EED]"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  )
}
