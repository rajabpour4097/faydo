import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { apiService } from '../../services/api'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  currentValue: string
  onSave: (value: string) => void
  isPhone?: boolean
}

const EditModal = ({ isOpen, onClose, title, currentValue, onSave, isPhone = false }: EditModalProps) => {
  const { isDark } = useTheme()
  const [value, setValue] = useState('')
  const [step, setStep] = useState<'edit' | 'verify'>('edit')
  const [verificationCode, setVerificationCode] = useState('')

  // Update value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(currentValue)
      setStep('edit')
      setVerificationCode('')
    }
  }, [isOpen, currentValue])

  if (!isOpen) return null

  const handleSave = async () => {
    console.log('Modal handleSave called with value:', value)
    if (isPhone) {
      // Send OTP for phone verification
      try {
        await apiService.sendOTP(value)
        setStep('verify')
      } catch (error) {
        console.error('Failed to send OTP:', error)
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
            <input
              type={isPhone ? 'tel' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              placeholder={currentValue}
            />
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

const Field = ({ label, value, editable = false, onEdit, isPhone = false }: { 
  label: string; 
  value?: string; 
  editable?: boolean; 
  onEdit?: () => void;
  isPhone?: boolean;
}) => {
  const { isDark } = useTheme()
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-4 ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50'
    }`}>
      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{label}</div>
      <div className="flex items-center space-x-3">
        <div className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {isPhone && value ? value.replace(/(.{4})(.{3})(.{4})/, '$1$2$3') : (value || '-')}
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
  const [editModal, setEditModal] = useState<{ isOpen: boolean; field: string; title: string; value: string; isPhone?: boolean }>(
    { isOpen: false, field: '', title: '', value: '', isPhone: false }
  )
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
    setEditModal({ isOpen: true, field, title, value, isPhone })
  }

  const closeEditModal = () => {
    setEditModal({ isOpen: false, field: '', title: '', value: '', isPhone: false })
  }

  const handleSave = async (newValue: string) => {
    console.log('handleSave called with:', editModal.field, '=', newValue)
    
    try {
      if (editModal.field === 'phone') {
        // Phone updates are handled in the verification flow
        updateUser({ phone_number: newValue })
      } else if (editModal.field === 'businessName') {
        // For test users, update the name field
        updateUser({ name: newValue })
      } else if (editModal.field === 'firstName') {
        const currentName = user?.name || ''
        const lastName = currentName.split(' ').slice(1).join(' ')
        updateUser({ name: `${newValue} ${lastName}`.trim() })
      } else if (editModal.field === 'lastName') {
        const currentName = user?.name || ''
        const firstName = currentName.split(' ')[0]
        updateUser({ name: `${firstName} ${newValue}`.trim() })
      } else if (editModal.field === 'email') {
        updateUser({ email: newValue })
      }
      
      // Refresh profile data to update completion status
      await refreshProfile()
      
      console.log('Profile updated successfully')
      alert('پروفایل با موفقیت به‌روزرسانی شد')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('خطا در به‌روزرسانی پروفایل')
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
        return user?.name || ''
      case 'email':
        return user?.email || ''
      case 'phone':
        return user?.phone_number || ''
      case 'gender':
        return user?.profile?.gender === 'male' ? 'مرد' : user?.profile?.gender === 'female' ? 'زن' : ''
      case 'birth_date':
        return user?.profile?.birth_date || ''
      case 'city':
        return user?.profile?.city?.name || ''
      case 'address':
        return user?.profile?.address || ''
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

        <div className={`rounded-2xl p-8 ${isDark ? 'bg-slate-900/30' : 'bg-white'}`}>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profileImage ? (
                <img 
                  src={profileImage} 
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
              onEdit={() => openEditModal('businessName', 'نام کسب‌وکار را وارد نمایید', getCurrentValue('businessName'))}
            />
          ) : (
            <>
              <Field 
                label="نام" 
                value={getCurrentValue('firstName')} 
                editable 
                onEdit={() => openEditModal('firstName', 'نام را وارد نمایید', getCurrentValue('firstName'))}
              />
              <Field 
                label="نام خانوادگی" 
                value={getCurrentValue('lastName')} 
                editable 
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
          <Field label="نوع کاربر" value={user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'} />
          
          {/* Customer Profile Fields */}
          {user?.type === 'customer' && (
            <>
              <Field 
                label="جنسیت" 
                value={getCurrentValue('gender')} 
                editable 
                onEdit={() => openEditModal('gender', 'جنسیت خود را انتخاب کنید', getCurrentValue('gender'))}
              />
              <Field 
                label="تاریخ تولد" 
                value={getCurrentValue('birth_date')} 
                editable 
                onEdit={() => openEditModal('birth_date', 'تاریخ تولد را وارد کنید', getCurrentValue('birth_date'))}
              />
              <Field 
                label="شهر" 
                value={getCurrentValue('city')} 
                editable 
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
        />
      </div>
    </DashboardLayout>
  )
}

const MobileProfile = () => {
  const { user, updateUser, refreshProfile } = useAuth()
  const { isDark } = useTheme()
  const [editModal, setEditModal] = useState<{ isOpen: boolean; field: string; title: string; value: string; isPhone?: boolean }>(
    { isOpen: false, field: '', title: '', value: '', isPhone: false }
  )
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
    setEditModal({ isOpen: true, field, title, value, isPhone })
  }

  const closeEditModal = () => {
    setEditModal({ isOpen: false, field: '', title: '', value: '', isPhone: false })
  }

  const handleSave = async (newValue: string) => {
    console.log('handleSave called with:', editModal.field, '=', newValue)
    
    try {
      if (editModal.field === 'phone') {
        updateUser({ phone_number: newValue })
      } else if (editModal.field === 'businessName') {
        updateUser({ name: newValue })
      } else if (editModal.field === 'firstName') {
        const currentName = user?.name || ''
        const lastName = currentName.split(' ').slice(1).join(' ')
        updateUser({ name: `${newValue} ${lastName}`.trim() })
      } else if (editModal.field === 'lastName') {
        const currentName = user?.name || ''
        const firstName = currentName.split(' ')[0]
        updateUser({ name: `${firstName} ${newValue}`.trim() })
      } else if (editModal.field === 'email') {
        updateUser({ email: newValue })
      }
      
      // Refresh profile data to update completion status
      await refreshProfile()
      
      console.log('Profile updated successfully')
      alert('پروفایل با موفقیت به‌روزرسانی شد')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('خطا در به‌روزرسانی پروفایل')
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
        return user?.name || ''
      case 'email':
        return user?.email || ''
      case 'phone':
        return user?.phone_number || ''
      case 'gender':
        return user?.profile?.gender === 'male' ? 'مرد' : user?.profile?.gender === 'female' ? 'زن' : ''
      case 'birth_date':
        return user?.profile?.birth_date || ''
      case 'city':
        return user?.profile?.city?.name || ''
      case 'address':
        return user?.profile?.address || ''
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
                  src={profileImage} 
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
              onEdit={() => openEditModal('businessName', 'نام کسب‌وکار را وارد نمایید', getCurrentValue('businessName'))}
            />
          ) : (
            <>
              <Field 
                label="نام" 
                value={getCurrentValue('firstName')} 
                editable 
                onEdit={() => openEditModal('firstName', 'نام را وارد نمایید', getCurrentValue('firstName'))}
              />
              <Field 
                label="نام خانوادگی" 
                value={getCurrentValue('lastName')} 
                editable 
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
          <Field label="نوع کاربر" value={user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'} />
        </div>
        
        <EditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          title={editModal.title}
          currentValue={editModal.value}
          onSave={handleSave}
          isPhone={editModal.isPhone}
        />
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