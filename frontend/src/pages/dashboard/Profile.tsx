import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { apiService, getFullImageUrl } from '../../services/api'
import moment from 'moment-jalaali'
import { LocationPicker } from '../../components/LocationPicker'
import { GalleryManagement } from '../../components/business/GalleryManagement'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  currentValue: string
  onSave: (value: string) => void
  isPhone?: boolean
  isEmail?: boolean
  isGender?: boolean
  isBirthDate?: boolean
  isCategory?: boolean
  isAddress?: boolean
  isCity?: boolean
  isLocation?: boolean
}

// ─── Set Password Modal ────────────────────────────────────────────────────
const SetPasswordModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { isDark } = useTheme()
  const [hasPassword, setHasPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(true)
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setForm({ current_password: '', new_password: '', confirm_password: '' })
    setError('')
    setSuccess('')
    setCheckLoading(true)
    apiService.checkHasPassword().then(res => {
      setHasPassword(res.data?.has_password ?? false)
      setCheckLoading(false)
    })
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.new_password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد')
      return
    }
    if (form.new_password !== form.confirm_password) {
      setError('رمز عبور و تکرار آن مطابقت ندارند')
      return
    }
    setLoading(true)
    try {
      const res = await apiService.setPassword({
        new_password: form.new_password,
        confirm_password: form.confirm_password,
        ...(hasPassword ? { current_password: form.current_password } : {}),
      })
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(res.data?.message || 'رمز عبور با موفقیت تنظیم شد')
        setHasPassword(true)
        setForm({ current_password: '', new_password: '', confirm_password: '' })
      }
    } catch {
      setError('خطا در تنظیم رمز عبور')
    } finally {
      setLoading(false)
    }
  }

  const eyeIcon = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {show ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  const inputCls = `w-full pr-4 pl-10 py-3 rounded-xl border text-sm ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {hasPassword ? 'تغییر رمز عبور' : 'تنظیم رمز عبور'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {hasPassword ? 'رمز عبور فعلی و جدید خود را وارد کنید' : 'یک رمز عبور برای ورود با رمز تنظیم کنید'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {checkLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={`text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{success}</p>
              <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                می‌توانید از این رمز برای ورود با شماره موبایل + رمز عبور استفاده کنید
              </p>
              <button onClick={onClose} className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                بستن
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {hasPassword && (
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    رمز عبور فعلی
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={form.current_password}
                      onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                      className={inputCls}
                      placeholder="رمز عبور فعلی خود را وارد کنید"
                      required
                    />
                    {eyeIcon(showCurrent, () => setShowCurrent(v => !v))}
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={form.new_password}
                    onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                    className={inputCls}
                    placeholder="حداقل ۸ کاراکتر"
                    required
                  />
                  {eyeIcon(showNew, () => setShowNew(v => !v))}
                </div>
                {form.new_password.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        form.new_password.length >= i * 2
                          ? form.new_password.length >= 8 ? 'bg-green-500' : 'bg-yellow-500'
                          : isDark ? 'bg-slate-600' : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  تکرار رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                    className={inputCls}
                    placeholder="رمز عبور جدید را مجدداً وارد کنید"
                    required
                  />
                  {eyeIcon(showConfirm, () => setShowConfirm(v => !v))}
                </div>
                {form.confirm_password.length > 0 && form.new_password !== form.confirm_password && (
                  <p className="mt-1 text-xs text-red-500">رمز عبور مطابقت ندارد</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {hasPassword ? 'تغییر رمز عبور' : 'تنظیم رمز عبور'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
// ──────────────────────────────────────────────────────────────────────────────

// Email validation helper function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Persian date utilities
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

// Convert Gregorian to Persian date using moment-jalaali
const gregorianToPersian = (gregorianDate: Date): { year: number; month: number; day: number } => {
  try {
    // Validate input date
    if (!gregorianDate || isNaN(gregorianDate.getTime())) {
      console.warn('Invalid date provided to gregorianToPersian:', gregorianDate)
      // Return current Persian date as default
      const now = moment()
      return { 
        year: now.jYear(), 
        month: now.jMonth() + 1, 
        day: now.jDate() 
      }
    }
    
    // Additional validation for reasonable year range
    const year = gregorianDate.getFullYear()
    if (year < 1900 || year > 2100) {
      console.warn('Date year out of reasonable range:', year)
      // Return current Persian date as default
      const now = moment()
      return { 
        year: now.jYear(), 
        month: now.jMonth() + 1, 
        day: now.jDate() 
      }
    }
    
    // Convert using moment-jalaali
    const momentDate = moment(gregorianDate)
    return { 
      year: momentDate.jYear(), 
      month: momentDate.jMonth() + 1, 
      day: momentDate.jDate() 
    }
    
  } catch (error) {
    console.error('Error in gregorianToPersian:', error)
    // Return current Persian date as fallback
    const now = moment()
    return { 
      year: now.jYear(), 
      month: now.jMonth() + 1, 
      day: now.jDate() 
    }
  }
}

// Convert Persian to Gregorian date using moment-jalaali
const persianToGregorian = (year: number, month: number, day: number): string => {
  try {
    // Validate input values
    if (!year || !month || !day || year < 1300 || year > 1500 || month < 1 || month > 12 || day < 1 || day > 31) {
      console.warn('Invalid Persian date values:', { year, month, day })
      return new Date().toISOString().split('T')[0]
    }
    
    // Convert using moment-jalaali
    const persianMoment = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD')
    
    // Validate the converted date
    if (!persianMoment.isValid()) {
      console.warn('Invalid Persian date conversion:', { year, month, day })
      return new Date().toISOString().split('T')[0]
    }
    
    return persianMoment.format('YYYY-MM-DD')
  } catch (error) {
    console.error('Error in persianToGregorian:', error)
    return new Date().toISOString().split('T')[0]
  }
}

// Persian Date Picker Component
const PersianDatePicker = ({ value, onChange, isDark }: { 
  value: string; 
  onChange: (value: string) => void; 
  isDark: boolean 
}) => {
  const currentDate = new Date()
  const currentPersian = gregorianToPersian(currentDate)
  
  // Parse current value or use current Persian date
  let initialPersian = { year: currentPersian.year, month: currentPersian.month, day: currentPersian.day }
  
  // Only try to parse value if it's a valid string and not empty
  if (value && value.trim() !== '' && value !== 'undefined' && value !== 'null') {
    try {
      const gregorianDate = new Date(value)
      if (gregorianDate instanceof Date && !isNaN(gregorianDate.getTime()) && gregorianDate.getFullYear() > 1900) {
        const parsedPersian = gregorianToPersian(gregorianDate)
        if (!isNaN(parsedPersian.year) && !isNaN(parsedPersian.month) && !isNaN(parsedPersian.day)) {
          initialPersian = parsedPersian
        }
      }
    } catch (error) {
      console.error('Error parsing date value:', error)
      // Keep current Persian date as default
    }
  }
  
  const [selectedYear, setSelectedYear] = useState(initialPersian.year)
  const [selectedMonth, setSelectedMonth] = useState(initialPersian.month)
  const [selectedDay, setSelectedDay] = useState(initialPersian.day)
  const [showYearPicker, setShowYearPicker] = useState(false)
  
  // Validate state values on mount and updates
  React.useEffect(() => {
    if (isNaN(selectedYear) || selectedYear < 1300 || selectedYear > 1500) {
      setSelectedYear(currentPersian.year)
    }
    if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      setSelectedMonth(currentPersian.month)
    }
    if (isNaN(selectedDay) || selectedDay < 1 || selectedDay > 31) {
      setSelectedDay(currentPersian.day)
    }
  }, [selectedYear, selectedMonth, selectedDay, currentPersian])
  
  const handleDateSelect = (day: number) => {
    setSelectedDay(day)
    const gregorianDate = persianToGregorian(selectedYear, selectedMonth, day)
    onChange(gregorianDate)
  }
  
  const getDaysInMonth = (year: number, month: number) => {
    try {
      // Use moment-jalaali to get accurate days in month
      const persianMoment = moment(`${year}/${month}/1`, 'jYYYY/jMM/jDD')
      if (!persianMoment.isValid()) {
        // Fallback to simple calculation
        if (month <= 6) return 31
        if (month <= 11) return 30
        return 29 // Esfand
      }
      
      // Get the last day of the month by going to the last day of the month
      const lastDay = persianMoment.clone().endOf('jMonth').jDate()
      return lastDay
    } catch (error) {
      console.error('Error getting days in month:', error)
      // Fallback to simple calculation
      if (month <= 6) return 31
      if (month <= 11) return 30
      return 29 // Esfand
    }
  }
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const days = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 rounded text-sm transition-colors ${
            day === selectedDay
              ? 'bg-purple-500 text-white'
              : isDark
              ? 'text-white hover:bg-slate-700'
              : 'text-gray-900 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      )
    }
    
    return days
  }
  
  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12)
        setSelectedYear(prev => prev - 1)
      } else {
        setSelectedMonth(prev => prev - 1)
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1)
        setSelectedYear(prev => prev + 1)
      } else {
        setSelectedMonth(prev => prev + 1)
      }
    }
  }
  
  return (
    <div className={`rounded-lg border p-4 ${isDark ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleMonthChange('prev')}
          className={`p-1 rounded ${isDark ? 'text-white hover:bg-slate-600' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          &lt;
        </button>
        
        <div className="text-center">
          <button
            onClick={() => setShowYearPicker(!showYearPicker)}
            className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {persianMonths[selectedMonth - 1]} {selectedYear}
          </button>
        </div>
        
        <button
          onClick={() => handleMonthChange('next')}
          className={`p-1 rounded ${isDark ? 'text-white hover:bg-slate-600' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          &gt;
        </button>
      </div>
      
      {/* Year Picker */}
      {showYearPicker && (
        <div className="mb-4 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 50 }, (_, i) => 1330 + i).map(year => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year)
                  setShowYearPicker(false)
                }}
                className={`p-2 rounded text-sm ${
                  year === selectedYear
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'text-white hover:bg-slate-600'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {persianDays.map(day => (
          <div key={day} className={`text-center text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  )
}

const EditModal = ({ isOpen, onClose, title, currentValue, onSave, isPhone = false, isEmail = false, isGender = false, isBirthDate = false, isCategory = false, isAddress = false, isCity = false, isLocation = false }: EditModalProps) => {
  const { isDark } = useTheme()
  const [value, setValue] = useState('')
  const [step, setStep] = useState<'edit' | 'verify'>('edit')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [catLoading, setCatLoading] = useState(false)
  const [catError, setCatError] = useState('')
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([])
  const [cities, setCities] = useState<{ id: number; name: string; province: { id: number; name: string } }[]>([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [cityLoading, setCityLoading] = useState(false)
  const [cityError, setCityError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      if (isCategory && isOpen) {
        setCatLoading(true)
        setCatError('')
        try {
          const resp = await apiService.getServiceCategories()
          if (resp.data) {
            setCategories(resp.data.map(c => ({ id: (c as any).id, name: (c as any).name })))
          } else if (resp.error) {
            setCatError(resp.error)
          }
        } catch (e) {
          setCatError('خطا در دریافت دسته‌بندی‌ها')
        } finally {
          setCatLoading(false)
        }
      }
    }
    loadCategories()
  }, [isCategory, isOpen])

  useEffect(() => {
    const loadProvinces = async () => {
      if (isCity && isOpen) {
        setCityLoading(true)
        setCityError('')
        try {
          const resp = await apiService.getProvinces()
          if (resp.data) {
            setProvinces(resp.data.map(p => ({ id: p.id, name: p.name })))
          } else if (resp.error) {
            setCityError(resp.error)
          }
        } catch (e) {
          setCityError('خطا در دریافت استان‌ها')
        } finally {
          setCityLoading(false)
        }
      }
    }
    loadProvinces()
  }, [isCity, isOpen])

  useEffect(() => {
    const loadCities = async () => {
      if (isCity && selectedProvince && isOpen) {
        setCityLoading(true)
        setCityError('')
        try {
          const provinceId = parseInt(selectedProvince)
          const resp = await apiService.getCitiesByProvince(provinceId)
          if (resp.data) {
            setCities(resp.data.cities.map(c => ({ 
              id: c.id, 
              name: c.name, 
              province: c.province 
            })))
          } else if (resp.error) {
            setCityError(resp.error)
          }
        } catch (e) {
          setCityError('خطا در دریافت شهرها')
        } finally {
          setCityLoading(false)
        }
      }
    }
    loadCities()
  }, [isCity, selectedProvince, isOpen])

  // Update value when modal opens
  useEffect(() => {
    if (isOpen) {
      // For gender field, convert Persian to English for internal handling
      if (isGender) {
        if (currentValue === 'مرد') {
          setValue('male')
        } else if (currentValue === 'زن') {
          setValue('female')
        } else {
          setValue('')  // Empty for first-time selection
        }
      } else if (isBirthDate) {
        // For birth date, use the Gregorian date as is
        setValue(currentValue || '')
      } else if (isCategory) {
        // For category, if currentValue is set and we have categories loaded, find the ID
        if (currentValue && categories.length > 0) {
          const matchingCategory = categories.find(c => c.name === currentValue)
          setValue(matchingCategory ? matchingCategory.id.toString() : '')
        } else {
          setValue('')
        }
      } else if (isCity) {
        // For city, reset province and city selections
        setSelectedProvince('')
        setValue('')
        setCities([])
      } else if (isLocation) {
        // For location, parse current value if it exists
        if (currentValue && currentValue.includes(',')) {
          const [lat, lng] = currentValue.split(',').map(coord => parseFloat(coord.trim()))
          if (!isNaN(lat) && !isNaN(lng)) {
            setSelectedLocation({ lat, lng })
            setValue(currentValue)
          } else {
            setSelectedLocation(null)
            setValue('')
          }
        } else {
          setSelectedLocation(null)
          setValue('')
        }
      } else {
        setValue(currentValue)
      }
      setStep('edit')
      setVerificationCode('')
      setError('')
    }
  }, [isOpen, currentValue, isGender, isBirthDate, isCategory, categories, isCity, isLocation])

  if (!isOpen) return null

  const handleSave = async () => {
    console.log('Modal handleSave called with value:', value)
    
    // Clear previous errors
    setError('')
    
    // Validate email if it's an email field
    if (isEmail && value.trim()) {
      if (!isValidEmail(value)) {
        setError('فرمت ایمیل معتبر نیست')
        return
      }
    }
    
    // Validate city selection
    if (isCity) {
      if (!selectedProvince) {
        setError('لطفا استان را انتخاب کنید')
        return
      }
      if (!value) {
        setError('لطفا شهر را انتخاب کنید')
        return
      }
    }
    
    // Validate location selection
    if (isLocation) {
      if (!selectedLocation) {
        setError('لطفا موقعیت مکانی را روی نقشه انتخاب کنید')
        return
      }
    }
    
    if (isPhone) {
      // Send OTP for phone verification
      try {
        await apiService.sendOTP(value)
        setStep('verify')
      } catch (error) {
        console.error('Failed to send OTP:', error)
        setError('خطا در ارسال کد تایید')
      }
    } else {
      console.log('Calling onSave with:', value)
      onSave(value)
      onClose()
    }
  }

  const handleVerify = async () => {
    try {
      await apiService.verifyOTP(value, verificationCode)
      onSave(value)
      onClose()
      setStep('edit')
      setVerificationCode('')
    } catch (error) {
      console.error('Failed to verify OTP:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-md mx-4 rounded-2xl p-6 ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {step === 'edit' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            {isBirthDate ? (
              // Persian date picker for birth date
              <PersianDatePicker
                value={value}
                onChange={setValue}
                isDark={isDark}
              />
            ) : isCategory ? (
              <div className="space-y-3">
                {catLoading && <div className="text-sm text-slate-400">در حال بارگذاری ...</div>}
                {catError && <div className="text-sm text-red-500">{catError}</div>}
                {!catLoading && !catError && (
                  <select
                    className={`w-full p-3 rounded-lg border text-sm focus:outline-none ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-purple-500'
                    }`}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id.toString()}>{c.name}</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-400">یک دسته‌بندی خدمات برای کسب‌وکار انتخاب کنید.</p>
              </div>
            ) : isCity ? (
              // City selection with province and city dropdowns
              <div className="space-y-3">
                {cityLoading && <div className="text-sm text-slate-400">در حال بارگذاری ...</div>}
                {cityError && <div className="text-sm text-red-500">{cityError}</div>}
                {!cityLoading && !cityError && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                        استان
                      </label>
                      <select
                        className={`w-full p-3 rounded-lg border text-sm focus:outline-none ${
                          isDark
                            ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500'
                            : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-purple-500'
                        }`}
                        value={selectedProvince}
                        onChange={e => {
                          setSelectedProvince(e.target.value)
                          setValue('') // Reset city selection when province changes
                        }}
                      >
                        <option value="">انتخاب استان</option>
                        {provinces.map(p => (
                          <option key={p.id} value={p.id.toString()}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    {selectedProvince && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                          شهر
                        </label>
                        <select
                          className={`w-full p-3 rounded-lg border text-sm focus:outline-none ${
                            isDark
                              ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500'
                              : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-purple-500'
                          }`}
                          value={value}
                          onChange={e => setValue(e.target.value)}
                        >
                          <option value="">انتخاب شهر</option>
                          {cities.map(c => (
                            <option key={c.id} value={c.id.toString()}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
                <p className="text-xs text-slate-400">ابتدا استان و سپس شهر خود را انتخاب کنید.</p>
              </div>
            ) : isLocation ? (
              // Location picker with map
              <div className="space-y-3">
                <LocationPicker
                  initialLat={selectedLocation?.lat || 35.6892}
                  initialLng={selectedLocation?.lng || 51.3890}
                  onLocationSelect={(lat, lng) => {
                    setSelectedLocation({ lat, lng })
                    setValue(`${lat}, ${lng}`)
                  }}
                  isDark={isDark}
                />
                <p className="text-xs text-slate-400">روی نقشه کلیک کنید تا موقعیت کسب‌وکار خود را انتخاب کنید.</p>
              </div>
            ) : isGender ? (
              // Gender selection with radio buttons
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border cursor-pointer transition-colors ${
                    value === 'male' 
                      ? (isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                      : (isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400')
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={value === 'male'}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>مرد</span>
                  </label>
                  <label className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border cursor-pointer transition-colors ${
                    value === 'female' 
                      ? (isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                      : (isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400')
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={value === 'female'}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>زن</span>
                  </label>
                </div>
              </div>
            ) : (
              isAddress ? (
                <textarea
                  rows={3}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border resize-none ${
                    error 
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-teal-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-teal-500'
                  } focus:border-transparent`}
                  placeholder={currentValue || 'آدرس را وارد کنید'}
                />
              ) : (
                <input
                  type={isPhone ? 'tel' : isEmail ? 'email' : 'text'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error 
                      ? 'border-red-500 focus:ring-red-500'
                      : isDark 
                        ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:ring-teal-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-teal-500'
                  } focus:border-transparent`}
                  placeholder={currentValue}
                />
              )
            )}
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            {!isBirthDate && (
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={onClose}
                  className={`px-6 py-2 rounded-lg border ${
                    isDark 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  لغو
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {isPhone ? 'ارسال کد' : 'ثبت'}
                </button>
              </div>
            )}
            {isBirthDate && (
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={onClose}
                  className={`px-6 py-2 rounded-lg border ${
                    isDark 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  لغو
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  ثبت
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                تایید شماره موبایل
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              جهت تایید شماره موبایل ({value}) کلید زیر را بزنید
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              placeholder="کد تایید را وارد نمایید"
            />
            <button
              onClick={handleVerify}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ارسال کد
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const Field = ({ label, value, editable = false, onEdit, isPhone = false, isRequired = false, icon }: { 
  label: string; 
  value?: string; 
  editable?: boolean; 
  onEdit?: () => void;
  isPhone?: boolean;
  isRequired?: boolean;
  icon?: React.ReactNode;
  valueLeftMargin?: boolean;
}) => {
  const { isDark } = useTheme()
  const isEmpty = isRequired && (!value || value.trim() === '')
  
  return (
    <div className={`group relative flex items-center gap-3 rounded-2xl px-4 py-4 transition-all duration-200 ${
      isEmpty 
        ? (isDark ? 'bg-red-900/20 border-2 border-red-500/40' : 'bg-red-50 border-2 border-red-200')
        : (isDark
            ? 'bg-slate-800/70 border border-slate-700/60 hover:border-slate-600'
            : 'bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white')
    }`}>
      {icon && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isEmpty
            ? 'bg-red-100 dark:bg-red-900/40 text-red-500'
            : isDark ? 'bg-slate-700 text-slate-400' : 'bg-white text-gray-500 shadow-sm'
        }`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium mb-0.5 ${
          isEmpty ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-slate-400' : 'text-gray-500')
        }`}>
          {label}{isEmpty && <span className="mr-1 text-red-500">*</span>}
        </div>
        <div className={`text-sm font-semibold truncate ${
          isEmpty ? (isDark ? 'text-red-300' : 'text-red-500') : (isDark ? 'text-white' : 'text-gray-900')
        }`}>
          {isPhone && value ? value.replace(/(.{4})(.{3})(.{4})/, '$1$2$3') : (value || (isEmpty ? 'تکمیل نشده' : '—'))}
        </div>
      </div>
      {editable && (
        <button
          onClick={onEdit}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
            isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-700 shadow-sm hover:shadow'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  )
}

const DesktopProfile = () => {
  const { user, updateUser, refreshProfile } = useAuth()
  const { isDark } = useTheme()
  const [editModal, setEditModal] = useState<{ isOpen: boolean; field: string; title: string; value: string; isPhone?: boolean; isEmail?: boolean; isGender?: boolean; isBirthDate?: boolean; isCategory?: boolean; isAddress?: boolean; isLocation?: boolean }>(
    { isOpen: false, field: '', title: '', value: '', isPhone: false, isEmail: false, isGender: false, isBirthDate: false, isCategory: false, isAddress: false, isLocation: false }
  )
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update profile image when user changes
  useEffect(() => {
    if (user?.avatar && user.avatar !== profileImage) {
      setProfileImage(user.avatar)
    } else if (!user?.avatar && profileImage) {
      setProfileImage(null)
    }
  }, [user?.avatar])

  const openEditModal = (field: string, title: string, value: string, isPhone = false) => {
    console.log('Opening edit modal for field:', field, 'with value:', value)
    setEditModal({ 
      isOpen: true, 
      field, 
      title, 
      value, 
      isPhone, 
      isEmail: field === 'email', 
      isGender: field === 'gender', 
      isBirthDate: field === 'birth_date',
  isCategory: field === 'category',
  isAddress: field === 'address',
  isLocation: field === 'location'
    })
  }

  const closeEditModal = () => {
  setEditModal({ isOpen: false, field: '', title: '', value: '', isPhone: false, isEmail: false, isGender: false, isBirthDate: false, isCategory: false, isAddress: false, isLocation: false })
  }

  const handleSave = async (newValue: string) => {
    console.log('handleSave called with:', editModal.field, '=', newValue)
    
    try {
      let success = false
      
      if (editModal.field === 'phone') {
        // Phone updates are handled in the verification flow
        success = await updateUser({ phone_number: newValue })
      } else if (editModal.field === 'businessName') {
        // Update business name via business profile endpoint
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ name: newValue })
          success = !!resp.data
        } else {
          success = await updateUser({ name: newValue })
        }
      } else if (editModal.field === 'firstName') {
        success = await updateUser({ first_name: newValue })
      } else if (editModal.field === 'lastName') {
        success = await updateUser({ last_name: newValue })
      } else if (editModal.field === 'email') {
        success = await updateUser({ email: newValue })
      } else if (editModal.field === 'gender') {
        // Update gender - convert to backend format
        const genderValue = newValue === 'مرد' ? 'male' : newValue === 'زن' ? 'female' : newValue
        success = await updateUser({ 
          profile: { 
            ...user?.profile, 
            gender: genderValue as 'male' | 'female' | '' 
          } 
        })
      } else if (editModal.field === 'birth_date') {
        // Update birth date - newValue is already in Gregorian format from Persian date picker
        console.log('Saving birth_date as Gregorian (Mobile):', newValue)
        success = await updateUser({ 
          profile: { 
            ...user?.profile, 
            birth_date: newValue 
          } 
        })
      } else if (editModal.field === 'city') {
        // Update city using city_id
        const cityId = parseInt(newValue)
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ city_id: cityId })
          success = !!resp.data
        } else {
          const resp = await apiService.updateCustomerProfile({ city_id: cityId })
          success = !!resp.data
        }
      } else if (editModal.field === 'address') {
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ address: newValue })
          success = !!resp.data
        } else {
          success = await updateUser({ 
            profile: { 
              ...user?.profile, 
              address: newValue 
            } 
          })
        }
      } else if (editModal.field === 'category') {
        if (user?.type === 'business') {
          // newValue is now category ID
          const categoryId = parseInt(newValue)
          if (categoryId) {
            const resp = await apiService.updateFullBusinessProfile({ category_id: categoryId })
            success = !!resp.data
          } else {
            success = true // Allow clearing category
          }
        }
      } else if (editModal.field === 'businessPhone') {
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ business_phone: newValue })
          success = !!resp.data
        }
      } else if (editModal.field === 'location') {
        if (user?.type === 'business') {
          const [lat, lng] = newValue.split(',').map(coord => parseFloat(coord.trim()))
            const resp = await apiService.updateFullBusinessProfile({ 
              business_location_latitude: lat, 
              business_location_longitude: lng 
            })
            success = !!resp.data
        }
      }
      
      if (success) {
        console.log('Profile updated successfully')
        // Refresh profile data after successful updates
        if (user?.type === 'business' && ['businessName', 'address', 'businessPhone', 'location', 'category', 'city'].includes(editModal.field)) {
          await refreshProfile()
        } else if (user?.type === 'customer' && ['city'].includes(editModal.field)) {
          await refreshProfile()
        }
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        console.log('File selected:', file.name, file.size, file.type)
        
        // Check if it's a valid image file
        if (!file.type.startsWith('image/')) {
          alert('لطفاً یک فایل تصویری انتخاب کنید')
          return
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('حجم فایل نباید بیشتر از 5 مگابایت باشد')
          return
        }
        
        // Create preview URL immediately using FileReader
        const reader = new FileReader()
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string
          console.log('Preview URL created:', previewUrl)
          setProfileImage(previewUrl)
          
          // For test users, update user data
          const isTestUser = localStorage.getItem('access_token') === 'test_access_token'
          if (isTestUser) {
            updateUser({ avatar: previewUrl })
            console.log('Profile image updated for test user')
            alert('عکس پروفایل با موفقیت تغییر کرد')
          }
        }
        
        reader.onerror = () => {
          console.error('FileReader error')
          alert('خطا در خواندن فایل')
        }
        
        reader.readAsDataURL(file)
        
        // For real users, upload to backend
        const isTestUser = localStorage.getItem('access_token') === 'test_access_token'
        if (!isTestUser) {
          try {
            const response = await apiService.uploadProfileImage(file)
            if (response.data) {
              setProfileImage(response.data.image)
              // Update local user avatar quickly (no server round-trip needed)
              await updateUser({ avatar: response.data.image })
              console.log('Profile image updated:', response.data.image, 'converted?', (response.data as any).converted)
              alert('عکس پروفایل با موفقیت آپلود شد')
            }
          } catch (uploadError) {
            console.error('Upload failed:', uploadError)
            alert('خطا در آپلود عکس')
            // Reset to previous image on error
            setProfileImage(user?.avatar || null)
          }
        }
        
      } catch (error) {
        console.error('Failed to process image:', error)
        alert('خطا در پردازش عکس')
      }
    }
  }

  // Get current values for display
  const getCurrentValue = (field: string) => {
    switch (field) {
      case 'firstName':
        return user?.first_name || ''
      case 'lastName':
        return user?.last_name || ''
      case 'businessName':
        return user?.businessProfile?.name || ''
      case 'email':
        return user?.email || ''
      case 'phone':
        return user?.phone_number || ''
      case 'gender':
        const gender = user?.profile?.gender
        if (gender === 'male') return 'مرد'
        if (gender === 'female') return 'زن'
        return '' // Empty for null, undefined, or empty string
      case 'birth_date':
        if (user?.profile?.birth_date) {
          try {
            const gregorianDate = new Date(user.profile.birth_date)
            if (!isNaN(gregorianDate.getTime())) {
              const persian = gregorianToPersian(gregorianDate)
              return `${persian.year}/${persian.month.toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')}`
            }
          } catch (error) {
            console.error('Error converting birth date:', error)
          }
        }
        return ''
      case 'city':
        if (user?.type === 'business') {
          return user?.businessProfile?.city?.name || ''
        }
        return user?.profile?.city?.name || ''
      case 'address':
        if (user?.type === 'business') {
          return user?.businessProfile?.address || ''
        }
        return user?.profile?.address || ''
      case 'category':
        return user?.businessProfile?.category?.name || ''
      case 'businessPhone':
        return user?.businessProfile?.business_phone || ''
      case 'location':
        if (user?.businessProfile?.business_location_latitude && user?.businessProfile?.business_location_longitude) {
          return `${user.businessProfile.business_location_latitude}, ${user.businessProfile.business_location_longitude}`
        }
        return ''
      default:
        return ''
    }
  }

  // ─── Icon helpers ───────────────────────────────────────────────────────
  const icons = {
    user: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    phone: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    email: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    type: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    gender: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    calendar: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    city: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    address: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    category: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    location: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Completion Banner */}
        {user?.isProfileComplete === false && (
          <div className={`rounded-2xl p-5 flex items-start gap-4 ${isDark ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>پروفایل ناقص است</h3>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {user?.type === 'business'
                  ? 'نام کسب‌وکار، دسته‌بندی، آدرس، موقعیت مکانی، شهر و شماره تلفن را تکمیل کنید.'
                  : 'نام، نام خانوادگی، جنسیت، تاریخ تولد و شهر را تکمیل کنید.'}
              </p>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
          <div className="relative">
            <div className={`h-32 px-6 pt-6 pb-16 ${user?.type === 'business'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600'
              : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500'}`}
            >
              <h2 className="text-xl font-bold text-white drop-shadow-sm pr-28 leading-tight">
                {user?.name || '—'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 bg-white/20 text-white">
                {user?.type === 'business' ? '🏢 کسب‌وکار' : '👤 مشتری'}
              </span>
            </div>
            <div className="absolute bottom-0 right-6 translate-y-1/2">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-slate-800 overflow-hidden bg-gray-200 flex items-center justify-center shadow-md">
                  {profileImage ? (
                    <img src={getFullImageUrl(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{user?.type === 'business' ? '🏢' : '👤'}</span>
                  )}
                </div>
                <button
                  onClick={handleImageUpload}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>
          </div>
          <div className="h-14" />
        </div>

        {/* Info Cards */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>اطلاعات پایه</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user?.type === 'business' ? (
              <Field label="نام کسب‌وکار" value={getCurrentValue('businessName')} editable isRequired icon={icons.user}
                onEdit={() => openEditModal('businessName', 'نام کسب‌وکار را وارد نمایید', getCurrentValue('businessName'))} />
            ) : (
              <>
                <Field label="نام" value={getCurrentValue('firstName')} editable isRequired icon={icons.user}
                  onEdit={() => openEditModal('firstName', 'نام را وارد نمایید', getCurrentValue('firstName'))} />
                <Field label="نام خانوادگی" value={getCurrentValue('lastName')} editable isRequired icon={icons.user}
                  onEdit={() => openEditModal('lastName', 'نام خانوادگی را وارد نمایید', getCurrentValue('lastName'))} />
              </>
            )}
            <Field label="شماره موبایل" value={getCurrentValue('phone')} editable isPhone icon={icons.phone}
              onEdit={() => openEditModal('phone', 'شماره موبایل را وارد نمایید', getCurrentValue('phone'), true)} />
            <Field label="ایمیل" value={getCurrentValue('email')} editable icon={icons.email}
              onEdit={() => openEditModal('email', 'ایمیل را وارد نمایید', getCurrentValue('email'))} />
            <Field label="نوع کاربری" value={user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'} icon={icons.type} />
          </div>
        </div>

        {/* Business or Customer specific fields */}
        {user?.type === 'business' ? (
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>اطلاعات کسب‌وکار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="دسته‌بندی" value={getCurrentValue('category')} editable isRequired icon={icons.category}
                onEdit={() => openEditModal('category', 'دسته‌بندی کسب‌وکار را انتخاب نمایید', getCurrentValue('category'))} />
              <Field label="شهر" value={getCurrentValue('city')} editable isRequired icon={icons.city}
                onEdit={() => openEditModal('city', 'شهر کسب‌وکار را انتخاب نمایید', getCurrentValue('city'))} />
              <Field label="شماره تلفن کسب‌وکار" value={getCurrentValue('businessPhone')} editable isRequired icon={icons.phone}
                onEdit={() => openEditModal('businessPhone', 'شماره تلفن کسب‌وکار را وارد نمایید', getCurrentValue('businessPhone'))} />
              <Field label="موقعیت مکانی" value={getCurrentValue('location') ? 'تنظیم شده ✓' : ''} editable isRequired icon={icons.location}
                onEdit={() => openEditModal('location', 'موقعیت کسب‌وکار را روی نقشه انتخاب نمایید', getCurrentValue('location'))} />
              <div className="md:col-span-2">
                <Field label="آدرس" value={getCurrentValue('address')} editable isRequired icon={icons.address}
                  onEdit={() => openEditModal('address', 'آدرس کسب‌وکار را وارد نمایید', getCurrentValue('address'))} />
              </div>
            </div>
            {/* Gallery button */}
            <div className={`mt-4 flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border border-slate-600/50' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>گالری تصاویر</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>آپلود و مدیریت تصاویر کسب‌وکار</p>
                </div>
              </div>
              <button onClick={() => setShowGalleryModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors font-medium">
                مدیریت گالری
              </button>
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>اطلاعات شخصی</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="جنسیت" value={getCurrentValue('gender')} editable isRequired icon={icons.gender}
                onEdit={() => openEditModal('gender', 'جنسیت خود را انتخاب کنید', getCurrentValue('gender'))} />
              <Field label="تاریخ تولد" value={getCurrentValue('birth_date')} editable isRequired icon={icons.calendar}
                onEdit={() => openEditModal('birth_date', 'تاریخ تولد را وارد کنید', getCurrentValue('birth_date'))} />
              <Field label="شهر" value={getCurrentValue('city')} editable isRequired icon={icons.city}
                onEdit={() => openEditModal('city', 'شهر خود را انتخاب کنید', getCurrentValue('city'))} />
              <Field label="آدرس" value={getCurrentValue('address')} editable icon={icons.address}
                onEdit={() => openEditModal('address', 'آدرس خود را وارد کنید', getCurrentValue('address'))} />
            </div>
          </div>
        )}

        {/* Security Section */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>امنیت حساب</h3>
          <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border border-slate-600/50' : 'bg-gray-50 border border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>رمز عبور</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  تنظیم رمز عبور برای ورود با شماره موبایل + رمز
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors font-medium"
            >
              تنظیم رمز عبور
            </button>
          </div>
        </div>

        <EditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          title={editModal.title}
          currentValue={editModal.value}
          onSave={handleSave}
          isPhone={editModal.isPhone}
          isEmail={editModal.field === 'email'}
          isGender={editModal.field === 'gender'}
          isBirthDate={editModal.field === 'birth_date'}
          isCategory={editModal.field === 'category'}
          isAddress={editModal.field === 'address'}
          isCity={editModal.field === 'city'}
          isLocation={editModal.field === 'location'}
        />

        <SetPasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

        {/* Gallery Management Modal */}
        {showGalleryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">مدیریت گالری تصاویر</h2>
                <button onClick={() => setShowGalleryModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <GalleryManagement />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

const MobileProfile = () => {
  const { user, updateUser, refreshProfile } = useAuth()
  const { isDark } = useTheme()
  const [editModal, setEditModal] = useState<{ isOpen: boolean; field: string; title: string; value: string; isPhone?: boolean; isEmail?: boolean; isGender?: boolean; isBirthDate?: boolean; isCategory?: boolean; isAddress?: boolean; isLocation?: boolean }>(
    { isOpen: false, field: '', title: '', value: '', isPhone: false, isEmail: false, isGender: false, isBirthDate: false, isCategory: false, isAddress: false, isLocation: false }
  )
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update profile image when user changes
  useEffect(() => {
    if (user?.avatar && user.avatar !== profileImage) {
      setProfileImage(user.avatar)
    } else if (!user?.avatar && profileImage) {
      setProfileImage(null)
    }
  }, [user?.avatar])

  const openEditModal = (field: string, title: string, value: string, isPhone = false) => {
    console.log('Opening edit modal for field:', field, 'with value:', value)
    setEditModal({ 
      isOpen: true, 
      field, 
      title, 
      value, 
      isPhone, 
      isEmail: field === 'email', 
      isGender: field === 'gender', 
      isBirthDate: field === 'birth_date',
  isCategory: field === 'category',
  isAddress: field === 'address',
  isLocation: field === 'location'
    })
  }

  const closeEditModal = () => {
  setEditModal({ isOpen: false, field: '', title: '', value: '', isPhone: false, isEmail: false, isGender: false, isBirthDate: false, isCategory: false, isAddress: false, isLocation: false })
  }

  // Desktop version handleSave
  const handleSave = async (newValue: string) => {
    console.log('handleSave called with:', editModal.field, '=', newValue)
    
    try {
      let success = false
      
      if (editModal.field === 'phone') {
        success = await updateUser({ phone_number: newValue })
      } else if (editModal.field === 'businessName') {
        // Update business name via business profile endpoint
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ name: newValue })
          success = !!resp.data
        } else {
          success = await updateUser({ name: newValue })
        }
      } else if (editModal.field === 'firstName') {
        success = await updateUser({ first_name: newValue })
      } else if (editModal.field === 'lastName') {
        success = await updateUser({ last_name: newValue })
      } else if (editModal.field === 'email') {
        success = await updateUser({ email: newValue })
      } else if (editModal.field === 'gender') {
        // Update gender - value is already in backend format (male/female)
        success = await updateUser({ 
          profile: { 
            ...user?.profile, 
            gender: newValue as 'male' | 'female' | '' 
          } 
        })
      } else if (editModal.field === 'birth_date') {
        // Update birth date - newValue is already in Gregorian format from Persian date picker
        console.log('Saving birth_date as Gregorian (Desktop):', newValue)
        success = await updateUser({ 
          profile: { 
            ...user?.profile, 
            birth_date: newValue 
          } 
        })
      } else if (editModal.field === 'city') {
        // Update city using city_id
        const cityId = parseInt(newValue)
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ city_id: cityId })
          success = !!resp.data
        } else {
          const resp = await apiService.updateCustomerProfile({ city_id: cityId })
          success = !!resp.data
        }
      } else if (editModal.field === 'address') {
        // Update address
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ address: newValue })
          success = !!resp.data
        } else {
          success = await updateUser({ 
            profile: { 
              ...user?.profile, 
              address: newValue 
            } 
          })
        }
      } else if (editModal.field === 'category') {
        if (user?.type === 'business') {
          // newValue is now category ID  
          const categoryId = parseInt(newValue)
          if (categoryId) {
            const resp = await apiService.updateFullBusinessProfile({ category_id: categoryId })
            success = !!resp.data
          } else {
            success = true // Allow clearing category
          }
        }
      } else if (editModal.field === 'businessPhone') {
        // Update business phone
        if (user?.type === 'business') {
          const resp = await apiService.updateFullBusinessProfile({ business_phone: newValue })
          success = !!resp.data
        }
      } else if (editModal.field === 'location') {
        // Update location - newValue should be "lat,lng" format
        if (user?.type === 'business') {
          const [lat, lng] = newValue.split(',').map(coord => parseFloat(coord.trim()))
          const resp = await apiService.updateFullBusinessProfile({ 
            business_location_latitude: lat, 
            business_location_longitude: lng 
          })
          success = !!resp.data
        }
      }
      
      if (success) {
        console.log('Profile updated successfully')
        // Refresh profile data after successful updates
        if (user?.type === 'business' && ['businessName', 'address', 'businessPhone', 'location', 'category', 'city'].includes(editModal.field)) {
          await refreshProfile()
        } else if (user?.type === 'customer' && ['city'].includes(editModal.field)) {
          await refreshProfile()
        }
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        console.log('File selected:', file.name, file.size, file.type)
        
        // Check if it's a valid image file
        if (!file.type.startsWith('image/')) {
          alert('لطفاً یک فایل تصویری انتخاب کنید')
          return
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('حجم فایل نباید بیشتر از 5 مگابایت باشد')
          return
        }
        
        // Create preview URL immediately using FileReader
        const reader = new FileReader()
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string
          console.log('Preview URL created:', previewUrl)
          setProfileImage(previewUrl)
          
          // For test users, update user data
          const isTestUser = localStorage.getItem('access_token') === 'test_access_token'
          if (isTestUser) {
            updateUser({ avatar: previewUrl })
            console.log('Profile image updated for test user')
            alert('عکس پروفایل با موفقیت تغییر کرد')
          }
        }
        
        reader.onerror = () => {
          console.error('FileReader error')
          alert('خطا در خواندن فایل')
        }
        
        reader.readAsDataURL(file)
        
        // For real users, upload to backend
        const isTestUser = localStorage.getItem('access_token') === 'test_access_token'
        if (!isTestUser) {
          try {
            const response = await apiService.uploadProfileImage(file)
            if (response.data) {
              setProfileImage(response.data.image)
              updateUser({ avatar: response.data.image })
              console.log('Profile image updated:', response.data.image)
              alert('عکس پروفایل با موفقیت آپلود شد')
            }
          } catch (uploadError) {
            console.error('Upload failed:', uploadError)
            alert('خطا در آپلود عکس')
            // Reset to previous image on error
            setProfileImage(user?.avatar || null)
          }
        }
        
      } catch (error) {
        console.error('Failed to process image:', error)
        alert('خطا در پردازش عکس')
      }
    }
  }

  // Get current values for display
  const getCurrentValue = (field: string) => {
    switch (field) {
      case 'firstName':
        return user?.first_name || ''
      case 'lastName':
        return user?.last_name || ''
      case 'businessName':
        return user?.businessProfile?.name || ''
      case 'email':
        return user?.email || ''
      case 'phone':
        return user?.phone_number || ''
      case 'gender':
        const gender = user?.profile?.gender
        if (gender === 'male') return 'مرد'
        if (gender === 'female') return 'زن'
        return '' // Empty for null, undefined, or empty string
      case 'birth_date':
        if (user?.profile?.birth_date) {
          try {
            const gregorianDate = new Date(user.profile.birth_date)
            if (!isNaN(gregorianDate.getTime())) {
              const persian = gregorianToPersian(gregorianDate)
              return `${persian.year}/${persian.month.toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')}`
            }
          } catch (error) {
            console.error('Error converting birth date:', error)
          }
        }
        return ''
      case 'city':
        if (user?.type === 'business') {
          return user?.businessProfile?.city?.name || ''
        }
        return user?.profile?.city?.name || ''
      case 'address':
        if (user?.type === 'business') {
          return user?.businessProfile?.address || ''
        }
        return user?.profile?.address || ''
      case 'category':
        return user?.businessProfile?.category?.name || ''
      case 'businessPhone':
        return user?.businessProfile?.business_phone || ''
      case 'location':
        if (user?.businessProfile?.business_location_latitude && user?.businessProfile?.business_location_longitude) {
          return `${user.businessProfile.business_location_latitude}, ${user.businessProfile.business_location_longitude}`
        }
        return ''
      default:
        return ''
    }
  }

  const icons = {
    user: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    phone: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    email: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    type: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    gender: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    calendar: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    city: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    address: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    category: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    location: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  }

  return (
    <MobileDashboardLayout>
      <div className="space-y-4 pb-6">

        {/* Completion Banner */}
        {user?.isProfileComplete === false && (
          <div className={`mx-4 mt-4 rounded-2xl p-4 flex items-start gap-3 ${isDark ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>پروفایل ناقص</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {user?.type === 'business' ? 'اطلاعات کسب‌وکار را تکمیل کنید' : 'اطلاعات شخصی را تکمیل کنید'}
              </p>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className={`mx-4 rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
          <div className="relative">
            <div className={`h-28 px-4 pt-5 pb-14 ${user?.type === 'business'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600'
              : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500'}`}
            >
              <h2 className="font-bold text-base text-white drop-shadow-sm pr-20 leading-tight">
                {user?.name || '—'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1.5 bg-white/20 text-white">
                {user?.type === 'business' ? '🏢 کسب‌وکار' : '👤 مشتری'}
              </span>
            </div>
            <div className="absolute bottom-0 right-4 translate-y-1/2">
              <div className="relative flex-shrink-0">
                <div className="size-16 rounded-xl ring-4 ring-white dark:ring-slate-800 overflow-hidden bg-gray-200 flex items-center justify-center shadow-md">
                  {profileImage ? (
                    <img src={getFullImageUrl(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{user?.type === 'business' ? '🏢' : '👤'}</span>
                  )}
                </div>
                <button onClick={handleImageUpload}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>
          </div>
          <div className="h-10" />
        </div>

        {/* Base Info */}
        <div className={`mx-4 rounded-2xl p-4 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
          <h3 className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>اطلاعات پایه</h3>
          <div className="space-y-2">
            {user?.type === 'business' ? (
              <Field label="نام کسب‌وکار" value={getCurrentValue('businessName')} editable isRequired icon={icons.user}
                onEdit={() => openEditModal('businessName', 'نام کسب‌وکار را وارد نمایید', getCurrentValue('businessName'))} />
            ) : (
              <>
                <Field label="نام" value={getCurrentValue('firstName')} editable isRequired icon={icons.user}
                  onEdit={() => openEditModal('firstName', 'نام را وارد نمایید', getCurrentValue('firstName'))} />
                <Field label="نام خانوادگی" value={getCurrentValue('lastName')} editable isRequired icon={icons.user}
                  onEdit={() => openEditModal('lastName', 'نام خانوادگی را وارد نمایید', getCurrentValue('lastName'))} />
              </>
            )}
            <Field label="شماره موبایل" value={getCurrentValue('phone')} editable isPhone icon={icons.phone}
              onEdit={() => openEditModal('phone', 'شماره موبایل را وارد نمایید', getCurrentValue('phone'), true)} />
            <Field label="ایمیل" value={getCurrentValue('email')} editable icon={icons.email}
              onEdit={() => openEditModal('email', 'ایمیل را وارد نمایید', getCurrentValue('email'))} />
            <Field label="نوع کاربری" value={user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'} icon={icons.type} />
          </div>
        </div>

        {/* Business or Customer-specific */}
        {user?.type === 'business' ? (
          <div className={`mx-4 rounded-2xl p-4 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
            <h3 className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>اطلاعات کسب‌وکار</h3>
            <div className="space-y-2">
              <Field label="دسته‌بندی" value={getCurrentValue('category')} editable isRequired icon={icons.category}
                onEdit={() => openEditModal('category', 'دسته‌بندی کسب‌وکار را انتخاب نمایید', getCurrentValue('category'))} />
              <Field label="شهر" value={getCurrentValue('city')} editable isRequired icon={icons.city}
                onEdit={() => openEditModal('city', 'شهر کسب‌وکار را انتخاب نمایید', getCurrentValue('city'))} />
              <Field label="شماره تلفن کسب‌وکار" value={getCurrentValue('businessPhone')} editable isRequired icon={icons.phone}
                onEdit={() => openEditModal('businessPhone', 'شماره تلفن کسب‌وکار را وارد نمایید', getCurrentValue('businessPhone'))} />
              <Field label="موقعیت مکانی" value={getCurrentValue('location') ? 'تنظیم شده ✓' : ''} editable isRequired icon={icons.location}
                onEdit={() => openEditModal('location', 'موقعیت کسب‌وکار را روی نقشه انتخاب نمایید', getCurrentValue('location'))} />
              <Field label="آدرس" value={getCurrentValue('address')} editable isRequired icon={icons.address}
                onEdit={() => openEditModal('address', 'آدرس کسب‌وکار را وارد نمایید', getCurrentValue('address'))} />
            </div>
            {/* Gallery row */}
            <div className={`mt-3 flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50 border border-slate-600/50' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>گالری تصاویر</p>
              </div>
              <button onClick={() => setShowGalleryModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium">
                مدیریت
              </button>
            </div>
          </div>
        ) : (
          <div className={`mx-4 rounded-2xl p-4 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
            <h3 className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>اطلاعات شخصی</h3>
            <div className="space-y-2">
              <Field label="جنسیت" value={getCurrentValue('gender')} editable isRequired icon={icons.gender}
                onEdit={() => openEditModal('gender', 'جنسیت خود را انتخاب کنید', getCurrentValue('gender'))} />
              <Field label="تاریخ تولد" value={getCurrentValue('birth_date')} editable isRequired icon={icons.calendar}
                onEdit={() => openEditModal('birth_date', 'تاریخ تولد را وارد کنید', getCurrentValue('birth_date'))} />
              <Field label="شهر" value={getCurrentValue('city')} editable isRequired icon={icons.city}
                onEdit={() => openEditModal('city', 'شهر خود را انتخاب کنید', getCurrentValue('city'))} />
              <Field label="آدرس" value={getCurrentValue('address')} editable icon={icons.address}
                onEdit={() => openEditModal('address', 'آدرس خود را وارد کنید', getCurrentValue('address'))} />
            </div>
          </div>
        )}

        {/* Security Section */}
        <div className={`mx-4 rounded-2xl p-4 ${isDark ? 'bg-slate-800/70' : 'bg-white border border-gray-100'} shadow-sm`}>
          <h3 className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>امنیت حساب</h3>
          <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50 border border-slate-600/50' : 'bg-gray-50 border border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>رمز عبور</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ورود با شماره + رمز</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors font-medium"
            >
              تنظیم رمز
            </button>
          </div>
        </div>

        <EditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          title={editModal.title}
          currentValue={editModal.value}
          onSave={handleSave}
          isPhone={editModal.isPhone}
          isEmail={editModal.field === 'email'}
          isGender={editModal.field === 'gender'}
          isBirthDate={editModal.field === 'birth_date'}
          isCategory={editModal.field === 'category'}
          isAddress={editModal.field === 'address'}
          isCity={editModal.field === 'city'}
          isLocation={editModal.field === 'location'}
        />

        <SetPasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

        {/* Gallery Management Modal */}
        {showGalleryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-base font-bold">مدیریت گالری تصاویر</h2>
                <button onClick={() => setShowGalleryModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
                <GalleryManagement />
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileDashboardLayout>
  )
}

export const Profile = () => {
  return (
    <>
      <div className="hidden md:block">
        <DesktopProfile />
      </div>
      <div className="md:hidden">
        <MobileProfile />
      </div>
    </>
  )
}