import React, { useEffect, useMemo, useState } from 'react'
import { apiService, VipExperienceCategory } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import {
  GOLD_HOME_ITEMS,
  VIP_HOME_ITEMS,
  type ExperienceIconKey,
} from '../clubs/clubExperienceUtils'
import { ExperienceGlyph } from '../clubs/clubExperienceIcons'

const PURPLE = '#7C5CFC'
const TEAL = '#2DD4BF'

const formatAmount = (value: string | number): string => {
  if (value === '' || value === null || value === undefined) return ''
  const num = typeof value === 'string' ? value.replace(/,/g, '') : String(value)
  if (num === '' || isNaN(Number(num))) return typeof value === 'string' ? value : ''
  return Number(num).toLocaleString('en-US')
}

const faNum = (value: string | number): string => {
  const n = typeof value === 'string' ? Number(value.replace(/,/g, '')) : value
  if (!Number.isFinite(n)) return String(value)
  return n.toLocaleString('fa-IR')
}

const stripFormat = (value: string): string => value.replace(/,/g, '').replace(/[^0-9]/g, '')

const parseAmount = (value: string): number => {
  const stripped = stripFormat(value)
  return stripped ? parseFloat(stripped) : 0
}

const STEPS = [
  { id: 1, title: 'مزیت مشتری' },
  { id: 2, title: 'اشانتیون' },
  { id: 3, title: 'طلایی' },
  { id: 4, title: 'VIP' },
  { id: 5, title: 'شرایط' },
  { id: 6, title: 'پیش‌نمایش' },
]

const EXPERIENCE_CARD_COPY: Record<string, string> = {
  'خوشامدگویی': 'شروعی ویژه برای مشتریان جدید و وفادار.\nمثال: نوشیدنی خوشامدگویی',
  'هدیه کوچک': 'هدیه‌ای برای قدردانی از همراهی‌تان.\nمثال: دسر یا پیش‌غذا',
  'توجه ویژه': 'رسیدگی خاص به مشتریان وفادار.\nمثال: میز رزرو اختصاصی',
  'پیشنهاد اختصاصی': 'پیشنهادهای شخصی‌سازی‌شده بر اساس سابقه شما.\nمثال: پیشنهاد ویژه ماهانه',
  'امتیاز بازگشت': 'امتیاز بیشتر برای خریدهای بعدی.\nمثال: ۲ برابر امتیاز در آخر هفته',
  'دسترسی زودتر': 'دسترسی پیش از دیگران به پیشنهادها.\nمثال: معرفی محصول جدید',
  'تجربه ویژه': 'دسترسی به خدمات مخصوص VIP.\nمثال: منوی ویژه + فضای اختصاصی',
  'روز خاص من': 'تجربه‌ای اختصاصی در یک روز خاص.\nمثال: تخفیف تولد',
  'هدیه برند': 'هدایای ویژه از برند شما.\nمثال: هدیه ویژه VIP',
  'دعوت از دوست': 'دعوت دوستان و دریافت جایزه.\nمثال: تخفیف برای معرف هر دوست',
}

const SUCCESS_STEP = 7

function iconForExperience(name: string, vip: boolean): ExperienceIconKey {
  const source = vip ? VIP_HOME_ITEMS : GOLD_HOME_ITEMS
  return source.find(item => item.name === name)?.icon ?? (vip ? 'sparkle' : 'star')
}

function GiftBanner({
  title,
  subtitle,
  accent = 'purple',
}: {
  title: string
  subtitle: string
  accent?: 'purple' | 'violet'
}) {
  const bg =
    accent === 'violet'
      ? 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 55%, #C4B5FD 100%)'
      : 'linear-gradient(135deg, #6D5EF5 0%, #8B7CFF 50%, #A78BFA 100%)'

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-4 py-4 text-white"
      style={{ background: bg }}
    >
      <div className="absolute -left-3 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute left-10 -bottom-8 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        <div className="flex-1 text-right">
          <h3 className="text-[15px] font-black leading-7">{title}</h3>
          <p className="mt-1 text-[11px] leading-5 text-white/90">{subtitle}</p>
        </div>
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-16 w-16 drop-shadow-lg" aria-hidden>
            <rect x="12" y="28" width="40" height="26" rx="6" fill="#F3E8FF" />
            <rect x="10" y="22" width="44" height="10" rx="4" fill="#E9D5FF" />
            <rect x="30" y="22" width="5" height="32" fill="#C4B5FD" />
            <path d="M32 22c-6-8-14-8-16-3s3 9 16 6" fill="#DDD6FE" />
            <path d="M32 22c6-8 14-8 16-3s-3 9-16 6" fill="#C4B5FD" />
            <circle cx="48" cy="20" r="8" fill="#A7F3D0" />
            <text x="48" y="24" textAnchor="middle" fontSize="10" fill="#047857" fontWeight="700">%</text>
          </svg>
        </div>
      </div>
    </div>
  )
}

function ValidationErrorPopup({
  errors,
  isDark,
  onClose,
}: {
  errors: string[]
  isDark: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (errors.length === 0) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [errors.length, onClose])

  if (errors.length === 0) return null

  const title = errors.length > 1 ? 'چند مورد نیاز به تکمیل دارد' : 'این مورد را تکمیل کنید'

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-5" dir="rtl">
      <button
        type="button"
        aria-label="بستن پیام خطا"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="package-error-title"
        className={`relative w-full max-w-sm overflow-hidden rounded-[28px] shadow-2xl ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        <div className="h-1.5 bg-gradient-to-l from-rose-400 via-[#7C5CFC] to-rose-500" />
        <div className="px-6 pb-6 pt-7 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-rose-500/15' : 'bg-rose-50'}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDark ? 'bg-rose-500/25 text-rose-300' : 'bg-rose-100 text-rose-500'}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.82A2 2 0 004.62 20h14.76a2 2 0 001.73-3.32l-7.4-12.82a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>
          <h3 id="package-error-title" className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            برای ادامه، موارد زیر را بررسی کنید.
          </p>
          <ul className="mt-4 space-y-2 text-right">
            {errors.map(message => (
              <li
                key={message}
                className={`flex items-start gap-2 rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                  isDark ? 'bg-rose-500/10 text-rose-200' : 'bg-rose-50 text-rose-700'
                }`}
              >
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${isDark ? 'bg-rose-300' : 'bg-rose-400'}`} />
                <span>{message}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white"
            style={{ background: PURPLE }}
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  )
}

function PaperPlaneMark() {
  return (
    <div className="relative mx-auto mb-4 h-28 w-28">
      <div className="absolute inset-0 rounded-full bg-emerald-50" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full" aria-hidden>
        <circle cx="78" cy="42" r="10" fill="#22C55E" />
        <path d="M74 42l3.2 3.2 6.8-7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M28 68 L92 36 L58 86 L50 70 Z" fill="#7C5CFC" />
        <path d="M50 70 L92 36 L62 72 Z" fill="#A78BFA" />
        <path d="M50 70 L58 86 L62 72 Z" fill="#6D28D9" />
      </svg>
    </div>
  )
}

function SplitSlider({
  total,
  instant,
  onInstantChange,
  isDark,
}: {
  total: number
  instant: number
  onInstantChange: (value: number) => void
  isDark: boolean
}) {
  const maxInstant = Math.max(1, total - 1)
  const safeInstant = Math.min(maxInstant, Math.max(1, instant))
  const cashback = Math.max(1, total - safeInstant)
  const instantRatio = total > 0 ? safeInstant / total : 0.5
  const disabled = total < 2
  const handlePct = maxInstant === 1 ? 50 : ((safeInstant - 1) / (maxInstant - 1)) * 100

  return (
    <div className={`rounded-3xl p-4 ${isDark ? 'bg-slate-800' : 'bg-[#F4F1FF]'}`}>
      <div className="mb-4 text-center">
        <div className="text-[32px] font-black leading-none text-[#7C5CFC]">{total || 0}%</div>
        <div className={`mt-1 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          تخفیف مشتری
        </div>
      </div>

      <div className="relative px-4" dir="ltr">
        <div
          className="pointer-events-none absolute left-4 right-4 top-1/2 h-2.5 -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${PURPLE} 0%, ${PURPLE} ${instantRatio * 100}%, ${TEAL} ${instantRatio * 100}%, ${TEAL} 100%)`,
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
          style={{ left: `calc(16px + (100% - 32px) * ${handlePct / 100})` }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M5 3.5L2 7l3 3.5" stroke={PURPLE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 3.5L12 7l-3 3.5" stroke={PURPLE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <input
          type="range"
          min={1}
          max={disabled ? 1 : maxInstant}
          step={1}
          disabled={disabled}
          value={safeInstant}
          onChange={e => onInstantChange(Number(e.target.value))}
          className="relative z-30 h-9 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-none [&::-moz-range-thumb]:h-9 [&::-moz-range-thumb]:w-9 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3" dir="ltr">
        <div className="rounded-2xl bg-[#EFE7FF] px-3 py-3 text-center">
          <div className="text-lg font-black text-[#7C5CFC]">{safeInstant}%</div>
          <div className="text-[11px] font-medium text-[#7C5CFC]">تخفیف فوری</div>
        </div>
        <div className="rounded-2xl bg-[#E7FBF4] px-3 py-3 text-center">
          <div className="text-lg font-black text-teal-600">{disabled ? 0 : cashback}%</div>
          <div className="text-[11px] font-medium text-teal-600">کش‌بک</div>
        </div>
      </div>
      {disabled && (
        <p className="mt-2 text-center text-[11px] text-amber-600">
          برای تقسیم تخفیف و کش‌بک، مقدار کل باید حداقل ۲ درصد باشد.
        </p>
      )}
    </div>
  )
}

interface CreatePackageModalProps {
  onClose: () => void
  onSuccess: () => void
  onViewDetails?: (packageId: number) => void
  editingPackageId?: number
  vipExperiences: VipExperienceCategory[]
  vipExperiencesLoading?: boolean
  vipExperiencesError?: string | null
  businessName?: string
}

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  onClose,
  onSuccess,
  onViewDetails,
  editingPackageId,
  vipExperiences,
  vipExperiencesLoading = false,
  vipExperiencesError = null,
  businessName = 'کسب‌وکار',
}) => {
  const { isDark } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [packageId] = useState<number | null>(editingPackageId || null)

  const [formData, setFormData] = useState({
    globalDiscountPercentage: '',
    cashbackPercentage: '1',
    specificTitle: '',
    specificDescription: '',
    specificPercentage: '',
    showSpecificDiscount: false,
    giftEnabled: false,
    giftType: 'amount',
    giftAmount: '',
    giftCount: '',
    giftDescription: '',
    giftNotes: '',
    goldFeatureId: '',
    goldDescription: '',
    vipEnabled: false,
    vipFeatureId: '',
    vipDescription: '',
    duration: '',
  })

  const goldOptions = useMemo(
    () => (vipExperiences || []).filter(exp => exp.vip_type === 'VIP'),
    [vipExperiences],
  )
  const vipOptions = useMemo(
    () => (vipExperiences || []).filter(exp => exp.vip_type === 'VIP+'),
    [vipExperiences],
  )

  const totalDiscount = parseFloat(formData.globalDiscountPercentage) || 0
  const cashbackValue = Math.min(
    Math.max(1, parseInt(formData.cashbackPercentage || '1', 10) || 1),
    Math.max(1, totalDiscount - 1),
  )
  const instantValue = totalDiscount >= 2 ? totalDiscount - cashbackValue : totalDiscount

  useEffect(() => {
    if (editingPackageId) {
      loadPackageData(editingPackageId)
    }
  }, [editingPackageId])

  const loadPackageData = async (pkgId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getPackageStatus(pkgId)
      if (!response.data) return
      const data = response.data

      if (data.discount_all) {
        const instant = Number(data.discount_all)
        const cashback = Number(data.cashback_percentage || 0)
        const total = instant + (cashback > 0 ? cashback : 0)
        let nextCashback = cashback
        if (total >= 2 && cashback < 1) {
          nextCashback = Math.max(1, Math.min(total - 1, Math.floor(total / 2)))
        }
        setFormData(prev => ({
          ...prev,
          globalDiscountPercentage: String(total || instant),
          cashbackPercentage: String(nextCashback || 1),
        }))
      }

      if (data.specific_discount) {
        setFormData(prev => ({
          ...prev,
          showSpecificDiscount: true,
          specificTitle: data.specific_discount!.title,
          specificDescription: data.specific_discount!.description || '',
          specificPercentage: data.specific_discount!.percentage.toString(),
        }))
      }

      if (data.elite_gift) {
        const gift = data.elite_gift
        setFormData(prev => ({
          ...prev,
          giftEnabled: true,
          giftDescription: gift.gift,
          giftNotes: gift.description || '',
          giftType: gift.amount ? 'amount' : 'count',
          giftAmount: gift.amount ? formatAmount(gift.amount) : '',
          giftCount: gift.count ? gift.count.toString() : '',
        }))
      } else {
        setFormData(prev => ({ ...prev, giftEnabled: false }))
      }

      if (data.vip_experiences && data.vip_experiences.length > 0) {
        const goldExp = data.vip_experiences.find(v => v.vip_type === 'VIP')
        const vipExp = data.vip_experiences.find(v => v.vip_type === 'VIP+')
        setFormData(prev => ({
          ...prev,
          goldFeatureId: goldExp ? goldExp.id.toString() : '',
          goldDescription: goldExp?.description || '',
          vipEnabled: Boolean(vipExp),
          vipFeatureId: vipExp ? vipExp.id.toString() : '',
          vipDescription: vipExp?.description || '',
        }))
      }
    } catch {
      setErrors(['خطا در بارگذاری داده‌های پکیج'])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => {
      let finalValue = value
      if (name === 'giftAmount') {
        const digits = stripFormat(String(value))
        finalValue = digits ? formatAmount(digits) : ''
      }

      const next = { ...prev, [name]: finalValue }

      if (name === 'giftType') {
        if (value === 'amount') next.giftCount = ''
        else next.giftAmount = ''
      }

      if (name === 'globalDiscountPercentage') {
        const total = parseFloat(String(value)) || 0
        if (total >= 2) {
          const hadTotal = Boolean(prev.globalDiscountPercentage)
          let cashback = parseInt(prev.cashbackPercentage || '1', 10) || 1
          if (!hadTotal) cashback = Math.max(1, Math.floor(total / 2))
          if (cashback < 1) cashback = 1
          if (cashback > total - 1) cashback = total - 1
          next.cashbackPercentage = String(cashback)
        }
      }

      return next
    })
  }

  const saveDiscounts = async () => {
    if (!packageId) return false
    try {
      setLoading(true)
      setErrors([])
      const specificDiscount = formData.showSpecificDiscount && formData.specificTitle
        ? {
            title: formData.specificTitle,
            description: formData.specificDescription,
            percentage: parseFloat(formData.specificPercentage),
          }
        : undefined

      const response = await apiService.savePackageDiscounts(
        packageId,
        { percentage: instantValue, cashback_percentage: cashbackValue },
        specificDiscount,
        !formData.showSpecificDiscount,
      )
      if (response.error) {
        setErrors([response.error])
        return false
      }
      return true
    } catch {
      setErrors(['خطا در ذخیره تخفیفات'])
      return false
    } finally {
      setLoading(false)
    }
  }

  const saveLoyalGift = async () => {
    if (!packageId) return false
    try {
      setLoading(true)
      setErrors([])
      if (!formData.giftEnabled) {
        const response = await apiService.savePackageLoyalGift(packageId, '', undefined, undefined, '', true)
        if (response.error) {
          setErrors([response.error])
          return false
        }
        return true
      }

      const amount = formData.giftType === 'amount' && formData.giftAmount ? parseAmount(formData.giftAmount) : undefined
      const count = formData.giftType === 'count' && formData.giftCount ? parseInt(formData.giftCount) : undefined
      const response = await apiService.savePackageLoyalGift(
        packageId,
        formData.giftDescription,
        amount,
        count,
        formData.giftNotes,
      )
      if (response.error) {
        setErrors([response.error])
        return false
      }
      return true
    } catch {
      setErrors(['خطا در ذخیره اشانتیون'])
      return false
    } finally {
      setLoading(false)
    }
  }

  const saveExperiences = async (requireVip: boolean) => {
    if (!packageId) return false
    try {
      setLoading(true)
      setErrors([])
      const experiences: { category_id: number; description: string }[] = []
      const goldId = parseInt(formData.goldFeatureId)
      if (!isNaN(goldId) && formData.goldDescription.trim()) {
        experiences.push({ category_id: goldId, description: formData.goldDescription.trim() })
      }

      if (formData.vipEnabled) {
        const vipId = parseInt(formData.vipFeatureId)
        if (!isNaN(vipId) && formData.vipDescription.trim()) {
          experiences.push({ category_id: vipId, description: formData.vipDescription.trim() })
        } else if (requireVip) {
          setErrors(['برای تجربه VIP انتخاب آیتم و نوشتن جایزه الزامی است.'])
          return false
        }
      }

      const response = await apiService.savePackageVip(packageId, experiences)
      if (response.error) {
        setErrors([response.error])
        return false
      }
      return true
    } catch {
      setErrors(['خطا در ذخیره تجربه‌ها'])
      return false
    } finally {
      setLoading(false)
    }
  }

  const finalizePackage = async () => {
    if (!packageId) return false
    try {
      setLoading(true)
      setErrors([])
      const durationMap: Record<string, number> = { '3months': 3, '6months': 6 }
      const response = await apiService.finalizePackage(packageId, durationMap[formData.duration], true)
      if (response.error) {
        setErrors([response.error])
        return false
      }
      return true
    } catch {
      setErrors(['خطا در تکمیل پکیج'])
      return false
    } finally {
      setLoading(false)
    }
  }

  const collectStepErrors = (): string[] => {
    const messages: string[] = []

    if (currentStep === 1) {
      if (!formData.globalDiscountPercentage) {
        messages.push('مقدار تخفیف الزامی است.')
      } else if (totalDiscount < 2) {
        messages.push('مقدار تخفیف باید حداقل ۲ درصد باشد تا هم تخفیف فوری و هم کش‌بک حداقل ۱ درصد باشند.')
      } else if (instantValue < 1 || cashbackValue < 1) {
        messages.push('تخفیف فوری و کش‌بک هیچ‌کدام نباید کمتر از ۱ درصد باشند.')
      }
      if (formData.showSpecificDiscount) {
        if (!formData.specificTitle.trim()) {
          messages.push('عنوان تخفیف اختصاصی الزامی است.')
        }
        if (!formData.specificPercentage) {
          messages.push('درصد تخفیف اختصاصی الزامی است.')
        } else if (parseFloat(formData.specificPercentage) <= totalDiscount) {
          messages.push('درصد تخفیف اختصاصی باید از مجموع تخفیف و کش‌بک بیشتر باشد.')
        }
      }
    } else if (currentStep === 2 && formData.giftEnabled) {
      if (!formData.giftDescription.trim()) {
        messages.push('عنوان هدیه الزامی است.')
      }
      if (formData.giftType === 'amount' && !formData.giftAmount) {
        messages.push('مبلغ مجموع خرید الزامی است.')
      }
      if (formData.giftType === 'count' && !formData.giftCount) {
        messages.push('تعداد مراجعه الزامی است.')
      }
    } else if (currentStep === 3) {
      if (!formData.goldFeatureId) {
        messages.push('انتخاب یک تجربه طلایی الزامی است.')
      }
      if (!formData.goldDescription.trim()) {
        messages.push('جایزه تجربه طلایی را بنویسید.')
      }
    } else if (currentStep === 4 && formData.vipEnabled) {
      if (!formData.vipFeatureId) {
        messages.push('یک تجربه VIP را انتخاب کنید یا فعال‌سازی را خاموش کنید.')
      }
      if (!formData.vipDescription.trim()) {
        messages.push('جایزه تجربه VIP را بنویسید.')
      }
    } else if (currentStep === 5 && !formData.duration) {
      messages.push('مدت زمان پکیج را انتخاب کنید.')
    }

    return messages
  }

  const nextStep = async () => {
    const stepErrors = collectStepErrors()
    if (stepErrors.length > 0) {
      setErrors(stepErrors)
      return
    }

    setErrors([])
    let saved = true

    if (currentStep === 1) {
      saved = await saveDiscounts()
    } else if (currentStep === 2) {
      saved = await saveLoyalGift()
    } else if (currentStep === 3) {
      saved = await saveExperiences(false)
    } else if (currentStep === 4) {
      saved = await saveExperiences(formData.vipEnabled)
    } else if (currentStep === 6) {
      saved = await finalizePackage()
    }

    if (saved) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1 && currentStep < SUCCESS_STEP) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }

  const selectedGold = goldOptions.find(e => e.id.toString() === formData.goldFeatureId)
  const selectedVip = vipOptions.find(e => e.id.toString() === formData.vipFeatureId)

  const renderExperienceGrid = (
    options: VipExperienceCategory[],
    selectedId: string,
    prize: string,
    onSelect: (id: string) => void,
    onPrize: (text: string) => void,
    required: boolean,
  ) => {
    if (vipExperiencesLoading) {
      return <p className="py-6 text-center text-xs text-gray-500">در حال بارگذاری گزینه‌ها...</p>
    }
    if (options.length === 0) {
      return (
        <p className="py-6 text-center text-xs text-red-500">
          {vipExperiencesError || 'گزینه‌ای یافت نشد.'}
        </p>
      )
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {options.map(option => {
            const selected = selectedId === option.id.toString()
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id.toString())}
                className={`relative rounded-2xl border p-3 text-right transition ${
                  selected
                    ? 'border-[#7C5CFC] bg-[#F6F2FF] ring-2 ring-[#7C5CFC]/20'
                    : isDark
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-gray-100 bg-white'
                }`}
              >
                <span
                  className={`absolute left-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                    selected ? 'border-[#7C5CFC] bg-[#7C5CFC]' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.2l2.4 2.3 4.6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#7C5CFC]">
                  <ExperienceGlyph icon={iconForExperience(option.name, option.vip_type === 'VIP+')} />
                </div>
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {option.name}
                </div>
                <p className={`mt-1 whitespace-pre-line text-[10px] leading-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {EXPERIENCE_CARD_COPY[option.name] || option.description}
                </p>
              </button>
            )
          })}
        </div>
        {selectedId && (
          <div>
            <label className={`mb-1 block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              جایزه
            </label>
            <input
              type="text"
              value={prize}
              onChange={e => onPrize(e.target.value)}
              placeholder={
                options.find(o => o.id.toString() === selectedId)?.description
                  ? `مثال: ${options.find(o => o.id.toString() === selectedId)!.description}`
                  : 'هدیه مورد نظر خود را بنویسید'
              }
              className={`w-full rounded-2xl border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 ${
                isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-gray-200 bg-white text-gray-900'
              }`}
            />
          </div>
        )}
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <GiftBanner
              title="ایجاد پکیج جدید"
              subtitle="با تنظیم مزیت‌های متنوع، تخفیف‌های ویژه و پیشنهادهای جذاب برای مشتریان فروش خود را افزایش دهید."
            />
            <div>
              <label className={`mb-2 flex items-center justify-start gap-1.5 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7C5CFC]" aria-hidden>
                  <path d="M20 12l-8 8-8-8 8-8 8 8z" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="12" r="1.4" fill="currentColor" />
                </svg>
                مقدار تخفیف
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  dir="rtl"
                  value={formData.globalDiscountPercentage}
                  onChange={e => {
                    const next = e.target.value.replace(/[^\d.]/g, '')
                    handleInputChange('globalDiscountPercentage', next)
                  }}
                  placeholder="مثال: ۲۰ درصد تخفیف"
                  className={`w-full rounded-2xl border py-3 pl-4 pr-11 text-right text-sm outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 ${
                    isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-gray-200 bg-white'
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
            </div>
            <div className={`rounded-2xl p-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className={`mb-1 flex items-center justify-start gap-1.5 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">i</span>
                مزیت مشتری
              </div>
              <p className={`mb-3 text-right text-[11px] leading-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                متنوع تخفیف، پکیج و یا تخفیف به مشتری ارائه می‌شود.
              </p>
              <SplitSlider
                total={totalDiscount}
                instant={instantValue}
                onInstantChange={value => handleInputChange('cashbackPercentage', String(totalDiscount - value))}
                isDark={isDark}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <GiftBanner
              accent="violet"
              title="اشانتیون وفاداری"
              subtitle="با یک هدیه اختصاصی مشتریان وفادارتر و خوشحال‌تر داشته باشید."
            />
            <div className={`flex items-center justify-between rounded-2xl border p-4 ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-100 bg-white'}`}>
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>فعال‌سازی اشانتیون</div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  در این مرحله، هدیه اختصاصی خود را فعال کنید.
                </p>
              </div>
              <ToggleSwitch
                tone="purple"
                checked={formData.giftEnabled}
                onChange={checked => handleInputChange('giftEnabled', checked)}
              />
            </div>
            {formData.giftEnabled && (
              <>
                <div>
                  <p className={`mb-2 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>شرط دریافت هدیه</p>
                  <p className={`mb-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    مشخص کنید مشتری برای دریافت هدیه باید چه شرطی را برآورده کند.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'amount', title: 'مجموع خرید', hint: 'مثلاً با خرید ۳,۰۰۰,۰۰۰ تومان' },
                      { value: 'count', title: 'تعداد مراجعه', hint: 'مثلاً پس از ۳ بار مراجعه' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('giftType', option.value)}
                        className={`rounded-2xl border p-3 text-right ${
                          formData.giftType === option.value
                            ? 'border-[#7C5CFC] bg-[#F6F2FF]'
                            : isDark
                              ? 'border-slate-600 bg-slate-800'
                              : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            formData.giftType === option.value ? 'border-[#7C5CFC] bg-[#7C5CFC]' : 'border-gray-300'
                          }`}>
                            {formData.giftType === option.value && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm font-bold">{option.title}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {formData.giftType === 'amount' ? (
                  <div>
                    <label className="mb-1 block text-xs font-medium">مبلغ مجموع خرید (تومان)</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.giftAmount}
                        onChange={e => handleInputChange('giftAmount', e.target.value)}
                        placeholder="۳,۰۰۰,۰۰۰"
                        className={`w-full rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-200'}`}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                          <path d="M12 7v10M9.5 9.2c.7-1 2.4-1.2 3.3-.3.9.8.7 2.1-.4 2.6H9.8M9.8 12.5h2.6c1.3.3 1.8 1.7.7 2.6-.9.8-2.6.7-3.4-.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs font-medium">تعداد مراجعه</label>
                    <input
                      type="number"
                      value={formData.giftCount}
                      onChange={e => handleInputChange('giftCount', e.target.value)}
                      placeholder="مثال: ۳"
                      className={`w-full rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-200'}`}
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium">
                    عنوان هدیه
                  </label>
                  <input
                    type="text"
                    value={formData.giftDescription}
                    onChange={e => handleInputChange('giftDescription', e.target.value)}
                    placeholder="مثلاً: دسر ویژه مهمانان فایدو"
                    className={`w-full rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">توضیحات هدیه (اختیاری)</label>
                  <textarea
                    value={formData.giftNotes}
                    onChange={e => handleInputChange('giftNotes', e.target.value)}
                    rows={2}
                    placeholder="مثلاً: یک دسر اختصاصی رایگان در مراجعه چهارم..."
                    className={`w-full rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-200'}`}
                  />
                </div>
                <div className={`flex items-center gap-3 overflow-hidden rounded-2xl p-3 ${isDark ? 'bg-violet-950/30 text-violet-200' : 'bg-[#F6F2FF] text-violet-800'}`}>
                  <div className="flex-1 text-right">
                    <div className="text-[12px] font-bold">پیش‌نمایش برای مشتری</div>
                    <p className="mt-1 text-[11px] leading-5">
                      پس از رسیدن به شرط تعیین‌شده، این هدیه به مشتری اعطا می‌شود.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">🍰</div>
                </div>
              </>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <GiftBanner
              title="تجربه‌های ویژه مشتری"
              subtitle="با انتخاب تجربه‌های طلایی و ویژه، مشتریان خود را خاص‌تر کنید."
            />
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تجربه‌های طلایی</h3>
                <p className="text-[11px] text-gray-500">حداقل یک تجربه طلایی را انتخاب کنید.</p>
              </div>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                اجباری
              </span>
            </div>
            
            {renderExperienceGrid(
              goldOptions,
              formData.goldFeatureId,
              formData.goldDescription,
              id => {
                if (id !== formData.goldFeatureId) {
                  handleInputChange('goldFeatureId', id)
                  handleInputChange('goldDescription', '')
                }
              },
              text => handleInputChange('goldDescription', text),
              true,
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <GiftBanner
              accent="violet"
              title="تجربه‌های ویژه VIP"
              subtitle="با فعال‌سازی VIP، مشتریان خاص را با تجربه‌های انحصاری جذب کنید."
            />
            <div className={`flex items-center justify-between rounded-2xl border p-4 ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-100 bg-white'}`}>
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>فعال‌سازی تجربه VIP</div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  این بخش اختیاری است؛ در صورت تمایل یک آیتم را انتخاب کنید.
                </p>
              </div>
              <ToggleSwitch
                tone="purple"
                checked={formData.vipEnabled}
                onChange={checked => {
                  handleInputChange('vipEnabled', checked)
                  if (!checked) {
                    handleInputChange('vipFeatureId', '')
                    handleInputChange('vipDescription', '')
                  }
                }}
              />
            </div>
            {formData.vipEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تجربه‌های ویژه VIP</h3>
                  <span className="text-[11px] text-gray-500">حداقل یک تجربه VIP را انتخاب کنید.</span>
                </div>
                {renderExperienceGrid(
                  vipOptions,
                  formData.vipFeatureId,
                  formData.vipDescription,
                  id => {
                    if (id !== formData.vipFeatureId) {
                      handleInputChange('vipFeatureId', id)
                      handleInputChange('vipDescription', '')
                    }
                  },
                  text => handleInputChange('vipDescription', text),
                  true,
                )}
              </>
            )}
          </div>
        )
      case 5:
        return (
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>مدت‌دار پکیج</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EEFF] text-[#7C5CFC]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 9.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9 4h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '3months', label: '۳ ماه' },
                { value: '6months', label: '۶ ماه' },
              ].map(option => {
                const selected = formData.duration === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('duration', option.value)}
                    className={`rounded-[22px] border-2 py-10 text-lg font-black transition ${
                      selected
                        ? 'border-[#7C5CFC] bg-white text-[#7C5CFC] shadow-[0_8px_24px_rgba(124,92,252,0.12)]'
                        : isDark
                          ? 'border-slate-600 bg-slate-800 text-white'
                          : 'border-gray-100 bg-[#F7F8FC] text-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      case 6: {
        const durationLabel = formData.duration === '6months' ? '۶ ماه' : '۳ ماه'
        const giftCondition =
          formData.giftType === 'amount' && formData.giftAmount
            ? `پس از ${faNum(formData.giftAmount)} تومان خرید`
            : formData.giftType === 'count' && formData.giftCount
              ? `پس از ${faNum(formData.giftCount)} مراجعه`
              : undefined
        const joinRelated = (...parts: Array<string | undefined>) =>
          parts.map(part => part?.trim()).filter(Boolean).join(' · ')
        return (
          <div className="space-y-4">
            <div className={`overflow-hidden rounded-3xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
              <div className="h-28 bg-gradient-to-l from-[#7C5CFC] to-[#A78BFA] px-4 py-4 text-white">
                <div className="text-right text-[11px] opacity-80">پیش‌نمایش</div>
                <div className="mt-6 text-right text-lg font-black">پکیج ویژه {businessName}</div>
              </div>
              <div className="p-2">
                <PreviewRow
                  label="مزیت مشتری"
                  value={`${faNum(instantValue)}٪ تخفیف فوری + ${faNum(cashbackValue)}٪ کش‌بک`}
                />
                {formData.giftEnabled && formData.giftDescription && (
                  <PreviewRow
                    label="اشانتیون وفاداری"
                    value={joinRelated(formData.giftDescription, giftCondition)}
                  />
                )}
                {selectedGold && (
                  <PreviewRow
                    label="تجربه طلایی"
                    value={joinRelated(selectedGold.name, formData.goldDescription)}
                  />
                )}
                {formData.vipEnabled && selectedVip && (
                  <PreviewRow
                    label="تجربه VIP"
                    value={joinRelated(selectedVip.name, formData.vipDescription)}
                  />
                )}
                <PreviewRow label="مدت اعتبار" value={durationLabel} />
              </div>
            </div>
          </div>
        )
      }
      case SUCCESS_STEP:
        return (
          <div className="px-2 py-6 text-center">
            <PaperPlaneMark />
            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
              پکیج شما با موفقیت ثبت شد!
            </h3>
            <p className={`mx-auto mt-2 max-w-xs text-[12px] leading-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              درخواست شما برای بررسی و تایید ارسال شد. پس از تایید، پکیج فعال خواهد شد.
            </p>
            <div className={`mt-6 rounded-3xl border p-4 text-right ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{businessName}</div>
                  <div className="text-[11px] text-gray-500">پکیج تبلیغاتی</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-gray-400">شماره پکیج</div>
                  <div className="text-sm font-bold">{packageId}</div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                در انتظار بررسی
              </div>
            </div>
            <button
              type="button"
              onClick={onSuccess}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-bold text-white"
              style={{ background: PURPLE }}
            >
              بازگشت به داشبورد
            </button>
            {packageId && (
              <button
                type="button"
                onClick={() => {
                  onViewDetails?.(packageId)
                  onSuccess()
                }}
                className="mt-3 w-full text-sm font-bold text-[#7C5CFC]"
              >
                مشاهده جزئیات پکیج
              </button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const isSuccess = currentStep === SUCCESS_STEP
  const showPrev = currentStep > 1 && !isSuccess
  const showNext = currentStep < SUCCESS_STEP

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-0 sm:p-4" dir="rtl">
      <div className={`flex h-[100dvh] w-full flex-col overflow-hidden sm:h-auto sm:max-h-[92vh] sm:max-w-lg sm:rounded-[28px] ${isDark ? 'bg-slate-900' : 'bg-[#F7F8FC]'}`}>
        <div className="relative flex items-center justify-center px-12 py-4">
          <button
            type="button"
            onClick={onClose}
            className={`absolute left-4 flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'text-slate-300' : 'text-gray-500'}`}
            aria-label="بستن"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>ایجاد پکیج جدید</h2>
        </div>

        {!isSuccess && (
          <div className="px-4 pb-2">
            <div className="flex items-start justify-between">
              {STEPS.map((step, index) => {
                const done = currentStep > step.id
                const active = currentStep === step.id
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex min-w-0 flex-1 flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                          done || active ? 'bg-[#7C5CFC] text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {done ? (
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`mt-1 max-w-[52px] text-center text-[8px] leading-3 ${active ? 'font-bold text-[#7C5CFC]' : 'text-gray-400'}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`mt-3 h-0.5 flex-1 ${currentStep > step.id ? 'bg-[#7C5CFC]' : isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {renderStep()}
        </div>

        {!isSuccess && (
          <div className="flex items-center gap-3 px-4 py-4">
            {showPrev && (
              <button
                type="button"
                onClick={prevStep}
                className={`flex-1 rounded-2xl border py-3 text-sm font-bold ${isDark ? 'border-slate-600 text-white' : 'border-gray-200 text-gray-700'}`}
              >
                مرحله قبل
              </button>
            )}
            {showNext && (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className={`${showPrev ? 'flex-[1.3]' : 'w-full'} rounded-2xl py-3 text-sm font-bold text-white disabled:opacity-50`}
                style={{ background: PURPLE }}
              >
                {loading ? 'در حال ذخیره...' : currentStep === 6 ? 'تایید و انتشار' : 'مرحله بعد'}
              </button>
            )}
          </div>
        )}
      </div>
      <ValidationErrorPopup errors={errors} isDark={isDark} onClose={() => setErrors([])} />
    </div>
  )
}

function PreviewRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      dir="ltr"
      className="grid grid-cols-[minmax(0,1fr)_max-content] items-start gap-x-4 border-b border-gray-100 px-3 py-3 last:border-0"
    >
      <div dir="rtl" className="min-w-0 break-words text-left text-[13px] font-semibold leading-6 text-gray-900 [unicode-bidi:isolate]">
        {value}
      </div>
      <div dir="rtl" className="whitespace-nowrap pt-0.5 text-right text-[12px] font-medium leading-6 text-gray-500">
        {label}
      </div>
    </div>
  )
}
