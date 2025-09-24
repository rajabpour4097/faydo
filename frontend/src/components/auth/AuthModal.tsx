import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  phone_number: string
  otp_code: string
  user_type: 'customer' | 'business'
  username: string
  password: string
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate()
  const { registerCustomer, registerBusiness, login } = useAuth()
  const [currentStep, setCurrentStep] = useState(1) // 1: phone, 2: otp, 3: success
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp')
  const [formData, setFormData] = useState<FormData>({
    phone_number: '',
    otp_code: '',
    user_type: 'customer',
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const sendOTP = async () => {
    if (!formData.phone_number) {
      setError('شماره تماس الزامی است')
      return false
    }

    if (!formData.phone_number.startsWith('09') || formData.phone_number.length !== 11) {
      setError('شماره تماس معتبر نیست')
      return false
    }

    setIsLoading(true)
    setError('')

    try {
      const API_BASE_URL = `http://${window.location.hostname}:8000/api`
      const response = await fetch(`${API_BASE_URL}/accounts/auth/send-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError('')
        return true
      } else {
        setError(data.message || 'خطا در ارسال کد تایید')
        return false
      }
    } catch (err) {
      console.error('OTP send error:', err)
      setError(`خطا در ارسال کد تایید: ${err instanceof Error ? err.message : 'نامشخص'}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTPAndAuth = async () => {
    if (!formData.otp_code) {
      setError('کد تایید الزامی است')
      return false
    }

    setIsLoading(true)
    setError('')

    try {
      // First verify OTP
      const API_BASE_URL = `http://${window.location.hostname}:8000/api`
      const otpResponse = await fetch(`${API_BASE_URL}/accounts/auth/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          otp_code: formData.otp_code,
        }),
      })

      const otpData = await otpResponse.json()

      if (otpData.success) {
        // Try to login first (existing user)
        try {
          const loginResponse = await fetch(`${API_BASE_URL}/accounts/auth/login-with-otp/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone_number: formData.phone_number,
            }),
          })

          const loginData = await loginResponse.json()

          if (loginData.success && loginData.user) {
            // Check if user type matches selected type
            if (loginData.user.role !== formData.user_type) {
              // Go back to step 1 and show error there
              setCurrentStep(1)
              // Clear OTP code and set correct user type
              setFormData({ 
                ...formData, 
                otp_code: '',
                user_type: loginData.user.role as 'customer' | 'business'
              })
              setError(`این شماره برای ${loginData.user.role === 'customer' ? 'مشتری' : 'کسب‌وکار'} ثبت شده است. نوع کاربر به درستی تنظیم شد.`)
              return false
            }

            // Login successful - store tokens and reload page to update AuthContext
            localStorage.setItem('auth_user', JSON.stringify(loginData.user))
            localStorage.setItem('access_token', loginData.tokens.access)
            localStorage.setItem('refresh_token', loginData.tokens.refresh)
            
            onClose()
            // Force page reload to trigger AuthContext useEffect
            window.location.href = '/dashboard?tab=profile&welcome=true'
            return true
          }
        } catch (loginErr) {
          console.log('User not found, proceeding with registration')
        }

        // If login failed, register new user
        await handleAutoRegistration()
        return true
      } else {
        setError(otpData.message || 'کد تایید نامعتبر است')
        return false
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(`خطا در احراز هویت: ${err instanceof Error ? err.message : 'نامشخص'}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoRegistration = async () => {
    try {
      const timestamp = Date.now().toString().slice(-4)
      const tempUsername = `user_${formData.phone_number.slice(-6)}_${timestamp}`

      let result
      if (formData.user_type === 'business') {
        result = await registerBusiness({
          username: tempUsername,
          email: '',
          phone_number: formData.phone_number,
          password: '',
          password_confirm: '',
          name: '',
          description: '',
          address: '',
        })
      } else {
        result = await registerCustomer({
          username: tempUsername,
          email: '',
          first_name: '',
          last_name: '',
          phone_number: formData.phone_number,
          password: '',
          password_confirm: '',
          gender: null,
          birth_date: null,
          address: '',
        })
      }

      if (result.success) {
        onClose()
        // Force page reload to trigger AuthContext useEffect
        window.location.href = '/dashboard?tab=profile&welcome=true'
      } else {
        setError(result.error || 'خطا در ثبت نام')
      }
    } catch (err) {
      console.error('Auto registration error:', err)
      setError(`خطا در ثبت نام: ${err instanceof Error ? err.message : 'نامشخص'}`)
    }
  }

  const handlePasswordLogin = async () => {
    if (!formData.username || !formData.password) {
      setError('نام کاربری و رمز عبور الزامی است')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.username, formData.password)
      
      if (result.success && result.user) {
        onClose()
        // Force page reload to trigger AuthContext useEffect
        window.location.href = '/dashboard'
      } else {
        setError(result.error || 'خطا در ورود')
      }
    } catch (error) {
      setError('خطا در ورود. لطفاً دوباره تلاش کنید.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    setError('')

    if (currentStep === 1) {
      const otpSent = await sendOTP()
      if (otpSent) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      await verifyOTPAndAuth()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
          ورود / ثبت نام
        </h2>

        {/* OTP Mode */}
        {authMode === 'otp' && (
          <>
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع کاربر
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: 'customer' })}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.user_type === 'customer'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      مشتری
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: 'business' })}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.user_type === 'business'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      کسب‌وکار
                    </button>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="block w-full pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="شماره موبایل"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'در حال ارسال...' : 'دریافت کد تایید'}
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    کد تایید به شماره {formData.phone_number} ارسال شد
                  </p>
                </div>

                <div>
                  <input
                    name="otp_code"
                    type="text"
                    value={formData.otp_code}
                    onChange={handleChange}
                    className="block w-full py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="۱۲۳۴۵۶"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'در حال تایید...' : 'ورود'}
                  </button>
                </div>

                <button
                  onClick={sendOTP}
                  disabled={isLoading}
                  className="w-full text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  ارسال مجدد کد
                </button>
              </div>
            )}
          </>
        )}

        {/* Password Mode */}
        {authMode === 'password' && (
          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="شماره موبایل"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="رمز"
                />
              </div>
            </div>

            <button
              onClick={handlePasswordLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex justify-between mt-6 text-sm">
        
          <button
            onClick={() => setAuthMode(authMode === 'otp' ? 'password' : 'otp')}
            className={`${authMode === 'otp' ? 'text-gray-500' : 'text-blue-600 font-medium'}`}
          >
            {authMode === 'otp' ? 'ورود با کلمه عبور' : 'ورود با پیامک'}
          </button>
        </div>
      </div>
    </div>
  )
}
