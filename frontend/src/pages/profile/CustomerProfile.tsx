import { useState } from 'react'

interface CustomerProfileData {
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
  profile?: {
    id: number
    gender: string
    birth_date: string
    membership_level: string
    points: number
    address?: string
  }
  role: string
}

interface CustomerProfileProps {
  profileData: CustomerProfileData
}

export const CustomerProfile = ({ profileData }: CustomerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { user, profile } = profileData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const getMembershipLevelInfo = (level: string) => {
    switch (level) {
      case 'bronze':
        return { name: 'برنزی', color: 'text-orange-600 bg-orange-100', icon: '🥉' }
      case 'silver':
        return { name: 'نقره‌ای', color: 'text-gray-600 bg-gray-100', icon: '🥈' }
      case 'vip':
        return { name: 'ویژه', color: 'text-purple-600 bg-purple-100', icon: '👑' }
      default:
        return { name: 'برنزی', color: 'text-orange-600 bg-orange-100', icon: '🥉' }
    }
  }

  const getGenderDisplay = (gender: string) => {
    return gender === 'male' ? 'مرد' : 'زن'
  }

  const membershipInfo = getMembershipLevelInfo(profile?.membership_level || 'bronze')

  return (
    <div className="mr-64 min-h-[calc(100vh-4rem)] bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {user.image ? (
                  <img src={user.image} alt="پروفایل" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.first_name?.charAt(0) || user.username?.charAt(0) || '👤'
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username
                  }
                </h1>
                <p className="text-blue-200 text-lg">مشتری فایدو</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${membershipInfo.color} text-blue-900`}>
                    {membershipInfo.icon} {membershipInfo.name}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {isEditing ? 'لغو' : 'ویرایش پروفایل'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl ml-3">👤</span>
                اطلاعات شخصی
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام کاربری</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{user.username}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{user.first_name || 'وارد نشده'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{user.last_name || 'وارد نشده'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{user.phone_number || 'وارد نشده'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">جنسیت</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{getGenderDisplay(profile?.gender || 'male')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ تولد</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{profile?.birth_date ? formatDate(profile.birth_date) : 'وارد نشده'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ عضویت</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{formatDate(user.date_joined)}</span>
                  </div>
                </div>
              </div>
              
              {profile?.address && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{profile.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl ml-3">📊</span>
                آمار حساب کاربری
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div>
                    <p className="text-sm text-blue-700">امتیاز فعلی</p>
                    <p className="text-2xl font-bold text-blue-900">{profile?.points?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div>
                    <p className="text-sm text-green-700">سطح عضویت</p>
                    <p className="text-lg font-bold text-green-900">{membershipInfo.name}</p>
                  </div>
                  <div className="text-2xl">{membershipInfo.icon}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div>
                    <p className="text-sm text-purple-700">آخرین ورود</p>
                    <p className="text-sm font-medium text-purple-900">
                      {user.last_login ? formatDate(user.last_login) : 'هرگز'}
                    </p>
                  </div>
                  <div className="text-2xl">🕒</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl ml-3">⚡</span>
                اقدامات سریع
              </h3>
              <div className="space-y-3">
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  🎯 مشاهده تخفیف‌ها
                </button>
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  📈 تاریخچه خرید
                </button>
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  🔔 تنظیمات اطلاع‌رسانی
                </button>
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  🛡️ حریم خصوصی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
