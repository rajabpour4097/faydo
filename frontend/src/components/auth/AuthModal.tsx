import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE_URL, apiService, ServiceCategoryItem } from '../../services/api'
import { AuthServiceSlider } from './AuthServiceSlider'
import { OtpInput } from './OtpInput'
import { LocationPicker } from '../LocationPicker'
import { User, Building2, Check } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthStep =
  | 'phone'
  | 'otp'
  | 'role'
  | 'customer-register'
  | 'business-1'
  | 'business-2'
  | 'business-3'
  | 'password'

interface FormData {
  phone_number: string
  otp_code: string
  user_type: 'customer' | 'business'
  username: string
  password: string
  // customer
  first_name: string
  last_name: string
  city_id: string
  // business
  business_name: string
  category_id: string
  business_phone: string
  instagram_link: string
  website_link: string
  address: string
  business_location_latitude: number | null
  business_location_longitude: number | null
}

const INITIAL_FORM: FormData = {
  phone_number: '',
  otp_code: '',
  user_type: 'customer',
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  city_id: '',
  business_name: '',
  category_id: '',
  business_phone: '',
  instagram_link: '',
  website_link: '',
  address: '',
  business_location_latitude: null,
  business_location_longitude: null,
}


export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { registerCustomer, login } = useAuth()
  const [step, setStep] = useState<AuthStep>('phone')
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp')
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([])
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStep('phone')
      setAuthMode('otp')
      setFormData(INITIAL_FORM)
      setError('')
      setIsNewUser(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const loadLookups = async () => {
      const [catResp, cityResp] = await Promise.all([
        apiService.getServiceCategories(),
        apiService.getAllCities(),
      ])
      if (catResp.data) setCategories(catResp.data)
      if (cityResp.data) {
        const flat = cityResp.data.flatMap((p) =>
          (p.cities || []).map((c) => ({ id: c.id, name: `${c.name} (${p.name})` }))
        )
        setCities(flat)
      }
    }
    loadLookups()
  }, [isOpen])

  const patchForm = (patch: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  const completeLogin = (loginData: {
    user: Record<string, unknown>
    tokens: { access: string; refresh: string }
  }) => {
    const u = loginData.user
    const mappedUser = {
      id: u.id as number,
      username: u.username as string,
      name:
        (u.display_name as string) ||
        `${u.first_name || ''} ${u.last_name || ''}`.trim() ||
        (u.username as string),
      email: (u.email as string) || '',
      type: u.role as 'customer' | 'business',
      phone_number: u.phone_number as string,
      avatar: u.image as string | undefined,
      display_name: u.display_name as string | undefined,
      first_name: (u.first_name as string) || '',
      last_name: (u.last_name as string) || '',
    }
    localStorage.setItem('auth_user', JSON.stringify(mappedUser))
    localStorage.setItem('access_token', loginData.tokens.access)
    localStorage.setItem('refresh_token', loginData.tokens.refresh)
    onClose()
    setTimeout(() => {
      window.location.href = '/dashboard?tab=profile&welcome=true'
    }, 300)
  }

  const sendOTP = async () => {
    if (!formData.phone_number.startsWith('09') || formData.phone_number.length !== 11) {
      setError('شماره موبایل معتبر نیست (مثال: 09123456789)')
      return false
    }
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/auth/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: formData.phone_number }),
      })
      const data = await response.json()
      if (data.success) return true
      setError(data.message || 'خطا در ارسال کد تایید')
      return false
    } catch {
      setError('خطا در ارسال کد تایید')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (formData.otp_code.length !== 6) {
      setError('کد ۶ رقمی را کامل وارد کنید')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const otpResponse = await fetch(`${API_BASE_URL}/accounts/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          otp_code: formData.otp_code,
        }),
      })
      const otpData = await otpResponse.json()
      if (!otpData.success) {
        setError(otpData.message || 'کد تایید نامعتبر است')
        return
      }

      const loginResponse = await fetch(`${API_BASE_URL}/accounts/auth/login-with-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: formData.phone_number }),
      })
      const loginData = await loginResponse.json()

      if (loginData.success && loginData.user) {
        completeLogin(loginData)
        return
      }

      setIsNewUser(true)
      setStep('role')
    } catch {
      setError('خطا در تایید کد')
    } finally {
      setIsLoading(false)
    }
  }

  const submitCustomerRegistration = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('نام و نام خانوادگی الزامی است')
      return
    }
    if (!formData.city_id) {
      setError('انتخاب شهر الزامی است')
      return
    }
    setIsLoading(true)
    setError('')
    const timestamp = Date.now().toString().slice(-4)
    const tempUsername = `user_${formData.phone_number.slice(-6)}_${timestamp}`
    const result = await registerCustomer({
      username: tempUsername,
      email: '',
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone_number: formData.phone_number,
      password: '',
      password_confirm: '',
      gender: '',
      birth_date: '',
      address: '',
      city_id: parseInt(formData.city_id),
    })
    setIsLoading(false)
    if (result.success) {
      onClose()
      window.location.href = '/dashboard?tab=profile&welcome=true'
    } else {
      setError(result.error || 'خطا در ثبت نام')
    }
  }

  const submitBusinessRegistration = async () => {
    if (!formData.address.trim()) {
      setError('آدرس کامل الزامی است')
      return
    }
    setIsLoading(true)
    setError('')
    const timestamp = Date.now().toString().slice(-4)
    const tempUsername = `biz_${formData.phone_number.slice(-6)}_${timestamp}`

    const registerPayload: Record<string, unknown> = {
      username: tempUsername,
      email: '',
      phone_number: formData.phone_number,
      password: '',
      password_confirm: '',
      name: formData.business_name.trim(),
      description: '',
      address: formData.address.trim(),
    }
    if (formData.category_id) registerPayload.category = parseInt(formData.category_id)
    if (formData.city_id) registerPayload.city = parseInt(formData.city_id)
    if (formData.business_location_latitude != null) {
      registerPayload.business_location_latitude = formData.business_location_latitude
      registerPayload.business_location_longitude = formData.business_location_longitude
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/auth/register/business/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      })
      const data = await response.json()
      if (!response.ok) {
        const msg =
          typeof data === 'object' && data !== null
            ? Object.values(data).flat().join(' ')
            : 'خطا در ثبت نام'
        setError(msg || 'خطا در ثبت نام')
        setIsLoading(false)
        return
      }

      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)

      await apiService.updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      })

      await apiService.updateFullBusinessProfile({
        business_phone: formData.business_phone || undefined,
        instagram_link: formData.instagram_link || undefined,
        website_link: formData.website_link || undefined,
        address: formData.address.trim(),
        business_location_latitude: formData.business_location_latitude ?? undefined,
        business_location_longitude: formData.business_location_longitude ?? undefined,
      })

      const u = data.user
      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: u.id,
          username: u.username,
          name: formData.business_name || u.username,
          email: u.email || '',
          type: 'business',
          phone_number: u.phone_number,
          first_name: formData.first_name,
          last_name: formData.last_name,
        })
      )

      onClose()
      window.location.href = '/dashboard?tab=profile&welcome=true'
    } catch {
      setError('خطا در ثبت نام کسب‌وکار')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!formData.username || !formData.password) {
      setError('نام کاربری و رمز عبور الزامی است')
      return
    }
    setIsLoading(true)
    setError('')
    const result = await login(formData.username, formData.password)
    setIsLoading(false)
    if (result.success) {
      onClose()
      window.location.href = '/dashboard'
    } else {
      setError(result.error || 'خطا در ورود')
    }
  }

  const renderProgress = (total: number, current: number, color: string) => (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
            i + 1 <= current
              ? `${color} text-white border-transparent`
              : 'bg-gray-100 text-gray-400 border-gray-200'
          }`}
        >
          {i + 1 <= current ? <Check className="w-4 h-4" /> : i + 1}
        </div>
      ))}
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[95vh] overflow-y-auto relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 text-gray-400 hover:text-gray-600 p-1"
          aria-label="بستن"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-8">
          {(step === 'phone' || step === 'otp' || step === 'password') && <AuthServiceSlider />}

          {authMode === 'otp' && step === 'phone' && (
            <>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">ورود / ثبت نام</h2>
              <p className="text-xs text-center text-gray-500 mb-5">شماره موبایل خود را وارد کنید</p>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={formData.phone_number}
                  onChange={(e) => patchForm({ phone_number: e.target.value.replace(/\D/g, '') })}
                  className="block w-full pr-10 pl-3 py-3.5 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="09123456789"
                  dir="ltr"
                />
              </div>
              <button
                onClick={async () => {
                  setError('')
                  const ok = await sendOTP()
                  if (ok) setStep('otp')
                }}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-200"
              >
                {isLoading ? 'در حال ارسال...' : 'دریافت کد تایید'}
              </button>
            </>
          )}

          {authMode === 'otp' && step === 'otp' && (
            <>
              <h2 className="text-lg font-bold text-center mb-1">کد تایید</h2>
              <p className="text-sm text-center text-gray-500 mb-5">
                کد ارسال‌شده به{' '}
                <span className="font-medium text-gray-800" dir="ltr">
                  {formData.phone_number}
                </span>
              </p>
              <OtpInput
                value={formData.otp_code}
                onChange={(code) => patchForm({ otp_code: code })}
                disabled={isLoading}
              />
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setStep('phone'); patchForm({ otp_code: '' }) }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  بازگشت
                </button>
                <button
                  onClick={verifyOTP}
                  disabled={isLoading || formData.otp_code.length !== 6}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'در حال بررسی...' : 'ادامه'}
                </button>
              </div>
              <button
                onClick={sendOTP}
                disabled={isLoading}
                className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                ارسال مجدد کد
              </button>
            </>
          )}

          {authMode === 'otp' && step === 'role' && isNewUser && (
            <>
              <h2 className="text-lg font-bold text-center mb-1">نوع حساب خود را انتخاب کنید</h2>
              <p className="text-sm text-center text-gray-500 mb-6">برای تکمیل ثبت نام</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    patchForm({ user_type: 'customer' })
                    setStep('customer-register')
                  }}
                  className={`relative rounded-2xl p-6 text-white bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg hover:scale-[1.02] transition-transform ${
                    formData.user_type === 'customer' ? 'ring-4 ring-blue-300' : ''
                  }`}
                >
                  {formData.user_type === 'customer' && (
                    <span className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-blue-700" />
                    </span>
                  )}
                  <User className="w-10 h-10 mx-auto mb-2 opacity-90" />
                  <span className="font-bold text-lg">مشتری</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    patchForm({ user_type: 'business' })
                    setStep('business-1')
                  }}
                  className={`relative rounded-2xl p-6 text-white bg-gradient-to-br from-red-600 to-rose-800 shadow-lg hover:scale-[1.02] transition-transform ${
                    formData.user_type === 'business' ? 'ring-4 ring-rose-300' : ''
                  }`}
                >
                  {formData.user_type === 'business' && (
                    <span className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-red-700" />
                    </span>
                  )}
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-90" />
                  <span className="font-bold text-lg">کسب‌وکار</span>
                </button>
              </div>
            </>
          )}

          {step === 'customer-register' && (
            <>
              {renderProgress(1, 1, 'bg-blue-600')}
              <h2 className="text-lg font-bold text-center mb-4">اطلاعات مشتری</h2>
              <div className="space-y-3">
                <input
                  placeholder="نام *"
                  value={formData.first_name}
                  onChange={(e) => patchForm({ first_name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  placeholder="نام خانوادگی *"
                  value={formData.last_name}
                  onChange={(e) => patchForm({ last_name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={formData.city_id}
                  onChange={(e) => patchForm({ city_id: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">انتخاب شهر *</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setStep('role')} className="flex-1 py-3 border rounded-xl text-gray-600">
                  قبلی
                </button>
                <button
                  onClick={submitCustomerRegistration}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isLoading ? '...' : 'ثبت نهایی'}
                </button>
              </div>
            </>
          )}

          {step === 'business-1' && (
            <>
              {renderProgress(3, 1, 'bg-red-600')}
              <h2 className="text-lg font-bold text-center mb-4">اطلاعات کسب‌وکار</h2>
              <div className="space-y-3">
                <input
                  placeholder="نام کسب‌وکار *"
                  value={formData.business_name}
                  onChange={(e) => patchForm({ business_name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none"
                />
                <select
                  value={formData.category_id}
                  onChange={(e) => patchForm({ category_id: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 outline-none"
                >
                  <option value="">نوع فعالیت *</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  value={formData.phone_number}
                  readOnly
                  dir="ltr"
                  className="w-full px-3 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-600"
                />
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setStep('role')} className="flex-1 py-3 border rounded-xl text-gray-600">
                  قبلی
                </button>
                <button
                  onClick={() => {
                    if (!formData.business_name.trim()) { setError('نام کسب‌وکار الزامی است'); return }
                    if (!formData.category_id) { setError('نوع فعالیت الزامی است'); return }
                    setError('')
                    setStep('business-2')
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold"
                >
                  ادامه
                </button>
              </div>
            </>
          )}

          {step === 'business-2' && (
            <>
              {renderProgress(3, 2, 'bg-orange-500')}
              <h2 className="text-lg font-bold text-center mb-4">اطلاعات مالک کسب‌وکار</h2>
              <div className="space-y-3">
                <input
                  placeholder="نام *"
                  value={formData.first_name}
                  onChange={(e) => patchForm({ first_name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  placeholder="نام خانوادگی *"
                  value={formData.last_name}
                  onChange={(e) => patchForm({ last_name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                />
                <select
                  value={formData.city_id}
                  onChange={(e) => patchForm({ city_id: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                >
                  <option value="">انتخاب شهر *</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setStep('business-1')} className="flex-1 py-3 border rounded-xl text-gray-600">
                  قبلی
                </button>
                <button
                  onClick={() => {
                    if (!formData.first_name.trim() || !formData.last_name.trim()) {
                      setError('نام و نام خانوادگی الزامی است')
                      return
                    }
                    if (!formData.city_id) { setError('انتخاب شهر الزامی است'); return }
                    setError('')
                    setStep('business-3')
                  }}
                  className="flex-1 py-3 bg-blue-800 text-white rounded-xl font-semibold"
                >
                  مرحله بعد
                </button>
              </div>
            </>
          )}

          {step === 'business-3' && (
            <>
              {renderProgress(3, 3, 'bg-emerald-600')}
              <h2 className="text-lg font-bold text-center mb-4">وب‌سایت و مکان</h2>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                <input
                  placeholder="تلفن ثابت (اختیاری)"
                  dir="ltr"
                  value={formData.business_phone}
                  onChange={(e) => patchForm({ business_phone: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none"
                />
                <input
                  placeholder="instagram.com/yourname"
                  dir="ltr"
                  value={formData.instagram_link}
                  onChange={(e) => patchForm({ instagram_link: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none"
                />
                <input
                  placeholder="آدرس وب‌سایت (اختیاری)"
                  dir="ltr"
                  value={formData.website_link}
                  onChange={(e) => patchForm({ website_link: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none"
                />
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <LocationPicker
                    isDark={false}
                    initialLat={formData.business_location_latitude ?? 35.6892}
                    initialLng={formData.business_location_longitude ?? 51.389}
                    onLocationSelect={(lat, lng) =>
                      patchForm({
                        business_location_latitude: lat,
                        business_location_longitude: lng,
                      })
                    }
                  />
                </div>
                <textarea
                  placeholder="آدرس کامل *"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => patchForm({ address: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setStep('business-2')} className="flex-1 py-3 border rounded-xl text-gray-600">
                  قبلی
                </button>
                <button
                  onClick={submitBusinessRegistration}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isLoading ? '...' : 'ثبت نهایی'}
                </button>
              </div>
            </>
          )}

          {authMode === 'password' && (
            <>
              <h2 className="text-xl font-bold text-center mb-5">ورود با کلمه عبور</h2>
              <div className="space-y-3">
                <input
                  value={formData.username}
                  onChange={(e) => patchForm({ username: e.target.value })}
                  placeholder="نام کاربری / شماره موبایل"
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => patchForm({ password: e.target.value })}
                  placeholder="رمز عبور"
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handlePasswordLogin}
                disabled={isLoading}
                className="w-full mt-4 bg-blue-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {isLoading ? '...' : 'ورود'}
              </button>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          {(step === 'phone' || step === 'password') && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'otp' ? 'password' : 'otp')
                  setStep('phone')
                  setError('')
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {authMode === 'otp' ? 'ورود با کلمه عبور' : 'ورود با پیامک'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
