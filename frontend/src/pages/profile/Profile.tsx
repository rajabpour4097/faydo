import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CustomerProfile } from './CustomerProfile.tsx'
import { BusinessProfile } from './BusinessProfile.tsx'
import LoadingSpinner from '../../components/LoadingSpinner.tsx'

interface ProfileData {
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    role: string
    image?: string
    date_joined: string
    last_login?: string
  }
  profile?: any
  role: string
}

export const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        
        // Debug: Check if tokens exist
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        console.log('Access token exists:', !!accessToken)
        console.log('Refresh token exists:', !!refreshToken)
        console.log('Access token (first 50 chars):', accessToken ? accessToken.substring(0, 50) + '...' : 'null')
        
        const response = await apiService.getProfile()
        console.log('Profile API response:', response)
        
        if (response.data) {
          setProfileData(response.data)
        } else {
          const errorMsg = response.error || 'خطا در دریافت اطلاعات پروفایل'
          console.log('Profile API error:', errorMsg)
          
          // If it's an authentication error, redirect to login
          if (errorMsg.includes('Authentication') || errorMsg.includes('credentials')) {
            localStorage.removeItem('auth_user')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return
          }
          
          setError(errorMsg)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('خطا در ارتباط با سرور')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profileData) {
    return (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">خطا در بارگیری پروفایل</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Render based on user role
  if (profileData.role === 'customer') {
    return (
      <DashboardLayout>
        <CustomerProfile profileData={profileData} />
      </DashboardLayout>
    )
  } else if (profileData.role === 'business') {
    return (
      <DashboardLayout>
        <BusinessProfile profileData={profileData} />
      </DashboardLayout>
    )
  } else {
    return (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">نوع کاربری پشتیبانی نشده</h1>
            <p className="text-gray-600">این نوع کاربری هنوز پشتیبانی نمی‌شود.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }
}
