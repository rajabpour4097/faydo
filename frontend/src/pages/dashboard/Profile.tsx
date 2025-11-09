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

const Field = ({ label, value, editable = false, onEdit, isPhone = false, isRequired = false, valueLeftMargin = false }: { 
  label: string; 
  value?: string; 
  editable?: boolean; 
  onEdit?: () => void;
  isPhone?: boolean;
  isRequired?: boolean;
  valueLeftMargin?: boolean;
}) => {
  const { isDark } = useTheme()
  
  // Check if required field is empty
  const isEmpty = isRequired && (!value || value.trim() === '')
  
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-4 ${
      isEmpty 
        ? (isDark ? 'bg-red-900/20 border-2 border-red-500/50' : 'bg-red-50 border-2 border-red-300')
        : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50')
    }`}>
      <div className={`text-sm ${
        isEmpty 
          ? (isDark ? 'text-red-400' : 'text-red-600') 
          : (isDark ? 'text-slate-300' : 'text-gray-600')
      }`}>
        {label}
        {isEmpty && <span className="text-red-500 mr-1">*</span>}
      </div>
      <div className="flex items-center space-x-3">
        <div className={`text-base font-medium ${valueLeftMargin ? 'mr-4' : ''} ${
          isEmpty 
            ? (isDark ? 'text-red-400' : 'text-red-600') 
            : (isDark ? 'text-white' : 'text-gray-900')
        }`}>
          {isPhone && value ? value.replace(/(.{4})(.{3})(.{4})/, '$1$2$3') : (value || (isEmpty ? 'ضروری است' : '-'))}
        </div>
        {editable && (
          <button
            onClick={onEdit}
            className={`p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
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
        return user?.name || ''
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Completion Status for Customer Users */}
        {user?.type === 'customer' && user?.isProfileComplete === false && (
          <div className={`rounded-2xl p-6 border-2 ${isDark ? 'bg-amber-900/20 border-amber-500 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">تکمیل پروفایل ضروری است</h3>
                <p className="text-sm opacity-90">
                  برای دسترسی به بخش‌های داشبورد، لطفاً ابتدا اطلاعات پروفایل خود را کامل کنید: نام، نام خانوادگی، جنسیت، تاریخ تولد و شهر.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Status for Business Users */}
        {user?.type === 'business' && user?.isProfileComplete === false && (
          <div className={`rounded-2xl p-6 border-2 ${isDark ? 'bg-amber-900/20 border-amber-500 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">تکمیل پروفایل کسب‌وکار ضروری است</h3>
                <p className="text-sm opacity-90">
                  برای دسترسی به بخش‌های داشبورد، لطفاً ابتدا اطلاعات کسب‌وکار خود را کامل کنید: نام کسب‌وکار، دسته‌بندی، آدرس، موقعیت مکانی، شهر و شماره تلفن کسب‌وکار.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`rounded-2xl p-8 ${isDark ? 'bg-slate-900/30' : 'bg-white'}`}>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profileImage ? (
                <img 
                  src={getFullImageUrl(profileImage)} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-3xl">👤</div>
              )}
              <button
                onClick={handleImageUpload}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                title={user?.type === 'business' ? 'تغییر لوگو' : 'تغییر عکس'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {user?.type === 'business' ? 'لوگو کسب‌وکار' : 'عکس پروفایل'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user?.type === 'business' ? (
            <Field 
              label="نام کسب‌وکار" 
              value={getCurrentValue('businessName')} 
              editable 
              isRequired={true}
              onEdit={() => openEditModal('businessName', 'نام کسب‌وکار را وارد نمایید', getCurrentValue('businessName'))}
            />
          ) : (
            <>
              <Field 
                label="نام" 
                value={getCurrentValue('firstName')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('firstName', 'نام را وارد نمایید', getCurrentValue('firstName'))}
              />
              <Field 
                label="نام خانوادگی" 
                value={getCurrentValue('lastName')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('lastName', 'نام خانوادگی را وارد نمایید', getCurrentValue('lastName'))}
              />
            </>
          )}
          <Field 
            label="شماره موبایل" 
            value={getCurrentValue('phone')} 
            editable 
            isPhone
            onEdit={() => openEditModal('phone', 'شماره موبایل را وارد نمایید', getCurrentValue('phone'), true)}
          />
          <Field 
            label="ایمیل" 
            value={getCurrentValue('email')} 
            editable 
            onEdit={() => openEditModal('email', 'ایمیل را وارد نمایید', getCurrentValue('email'))}
          />
          <Field label="نوع کاربر" value={user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'} valueLeftMargin={true} />
          
          {/* Business Profile Fields - Desktop */}
          {user?.type === 'business' && (
            <>
              <Field 
                label="دسته‌بندی کسب‌وکار" 
                value={getCurrentValue('category')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('category', 'دسته‌بندی کسب‌وکار را انتخاب نمایید', getCurrentValue('category'))}
              />
              <Field 
                label="آدرس" 
                value={getCurrentValue('address')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('address', 'آدرس کسب‌وکار را وارد نمایید', getCurrentValue('address'))}
              />
              <Field 
                label="شهر" 
                value={getCurrentValue('city')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('city', 'شهر کسب‌وکار را انتخاب نمایید', getCurrentValue('city'))}
              />
              <Field 
                label="شماره تلفن کسب‌وکار" 
                value={getCurrentValue('businessPhone')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('businessPhone', 'شماره تلفن کسب‌وکار را وارد نمایید', getCurrentValue('businessPhone'))}
              />
              <Field 
                label="موقعیت مکانی" 
                value={getCurrentValue('location')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('location', 'موقعیت کسب‌وکار را روی نقشه انتخاب نمایید', getCurrentValue('location'))}
              />
            </>
          )}

          {/* Business Gallery Management - Desktop */}
          {user?.type === 'business' && (
            <div className="md:col-span-2">
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-900/30' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      مدیریت گالری تصاویر
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      آپلود و مدیریت تصاویر کسب‌وکار
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGalleryModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    مدیریت گالری
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Customer Profile Fields - Desktop */}
          {user?.type === 'customer' && (
            <>
              <Field 
                label="جنسیت" 
                value={getCurrentValue('gender')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('gender', 'جنسیت خود را انتخاب کنید', getCurrentValue('gender'))}
              />
              <Field 
                label="تاریخ تولد" 
                value={getCurrentValue('birth_date')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('birth_date', 'تاریخ تولد را وارد کنید', getCurrentValue('birth_date'))}
              />
              <Field 
                label="شهر" 
                value={getCurrentValue('city')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('city', 'شهر خود را انتخاب کنید', getCurrentValue('city'))}
              />
              <Field 
                label="آدرس" 
                value={getCurrentValue('address')} 
                editable 
                onEdit={() => openEditModal('address', 'آدرس خود را وارد کنید', getCurrentValue('address'))}
              />
            </>
          )}
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

        {/* Gallery Management Modal */}
        {showGalleryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">مدیریت گالری تصاویر</h2>
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
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
        return user?.businessProfile?.name || user?.name || ''
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

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-6">
        {/* Profile Completion Status for Customer Users */}
        {user?.type === 'customer' && user?.isProfileComplete === false && (
          <div className={`rounded-2xl p-4 border-2 ${isDark ? 'bg-amber-900/20 border-amber-500 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">تکمیل پروفایل ضروری</h3>
                <p className="text-sm opacity-90">
                  برای دسترسی به داشبورد، ابتدا پروفایل خود را کامل کنید.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileImage ? (
                <img 
                  src={getFullImageUrl(profileImage)} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl">👤</div>
              )}
              <button
                onClick={handleImageUpload}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                title={user?.type === 'business' ? 'تغییر لوگو' : 'تغییر عکس'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {user?.type === 'business' ? 'لوگو کسب‌وکار' : 'عکس پروفایل'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {user?.type === 'business' ? (
            <Field 
              label="نام کسب‌وکار" 
              value={getCurrentValue('businessName')} 
              editable 
              isRequired={true}
              onEdit={() => openEditModal('businessName', 'نام کسب‌وکار را وارد نمایید', getCurrentValue('businessName'))}
            />
          ) : (
            <>
              <Field 
                label="نام" 
                value={getCurrentValue('firstName')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('firstName', 'نام را وارد نمایید', getCurrentValue('firstName'))}
              />
              <Field 
                label="نام خانوادگی" 
                value={getCurrentValue('lastName')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('lastName', 'نام خانوادگی را وارد نمایید', getCurrentValue('lastName'))}
              />
            </>
          )}
          <Field 
            label="شماره موبایل" 
            value={getCurrentValue('phone')} 
            editable 
            isPhone
            onEdit={() => openEditModal('phone', 'شماره موبایل را وارد نمایید', getCurrentValue('phone'), true)}
          />
          <Field 
            label="ایمیل" 
            value={getCurrentValue('email')} 
            editable 
            onEdit={() => openEditModal('email', 'ایمیل را وارد نمایید', getCurrentValue('email'))}
          />
          <Field label="نوع کاربر" value={user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'} valueLeftMargin={true} />
          
          {/* Business Profile Fields - Mobile */}
          {user?.type === 'business' && (
            <>
              <Field 
                label="دسته‌بندی کسب‌وکار" 
                value={getCurrentValue('category')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('category', 'دسته‌بندی کسب‌وکار را انتخاب نمایید', getCurrentValue('category'))}
              />
              <Field 
                label="آدرس" 
                value={getCurrentValue('address')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('address', 'آدرس کسب‌وکار را وارد نمایید', getCurrentValue('address'))}
              />
              <Field 
                label="شهر" 
                value={getCurrentValue('city')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('city', 'شهر کسب‌وکار را انتخاب نمایید', getCurrentValue('city'))}
              />
              <Field 
                label="شماره تلفن کسب‌وکار" 
                value={getCurrentValue('businessPhone')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('businessPhone', 'شماره تلفن کسب‌وکار را وارد نمایید', getCurrentValue('businessPhone'))}
              />
              <Field 
                label="موقعیت مکانی" 
                value={getCurrentValue('location')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('location', 'موقعیت کسب‌وکار را روی نقشه انتخاب نمایید', getCurrentValue('location'))}
              />
            </>
          )}

          {/* Business Gallery Management - Mobile */}
          {user?.type === 'business' && (
            <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900/30' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    مدیریت گالری تصاویر
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    آپلود و مدیریت تصاویر کسب‌وکار
                  </p>
                </div>
                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  مدیریت
                </button>
              </div>
            </div>
          )}
          
          {/* Customer Profile Fields - Mobile */}
          {user?.type === 'customer' && (
            <>
              <Field 
                label="جنسیت" 
                value={getCurrentValue('gender')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('gender', 'جنسیت خود را انتخاب کنید', getCurrentValue('gender'))}
              />
              <Field 
                label="تاریخ تولد" 
                value={getCurrentValue('birth_date')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('birth_date', 'تاریخ تولد را وارد کنید', getCurrentValue('birth_date'))}
              />
              <Field 
                label="شهر" 
                value={getCurrentValue('city')} 
                editable 
                isRequired={true}
                onEdit={() => openEditModal('city', 'شهر خود را انتخاب کنید', getCurrentValue('city'))}
              />
              <Field 
                label="آدرس" 
                value={getCurrentValue('address')} 
                editable 
                onEdit={() => openEditModal('address', 'آدرس خود را وارد کنید', getCurrentValue('address'))}
              />
            </>
          )}
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

        {/* Gallery Management Modal */}
        {showGalleryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-bold">مدیریت گالری تصاویر</h2>
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
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