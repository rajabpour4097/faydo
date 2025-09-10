import { useState } from 'react'

interface BusinessProfileData {
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
    name?: string
    description?: string
    address?: string
    rating_avg: number
    business_location_latitude?: number
    business_location_longitude?: number
    category?: any
    city?: any
  }
  role: string
}

interface BusinessProfileProps {
  profileData: BusinessProfileData
}

export const BusinessProfile = ({ profileData }: BusinessProfileProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { user, profile } = profileData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐')
    }
    if (hasHalfStar) {
      stars.push('⭐')
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆')
    }
    
    return stars.join('')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {user.image ? (
                  <img src={user.image} alt="پروفایل" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile?.name?.charAt(0) || user.username?.charAt(0) || '🏢'
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profile?.name || user.username}
                </h1>
                <p className="text-green-200 text-lg">کسب‌وکار فایدو</p>
                <div className="flex items-center mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {getRatingStars(profile?.rating_avg || 0)} ({profile?.rating_avg?.toFixed(1) || '0.0'})
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
            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl ml-3">🏢</span>
                اطلاعات کسب‌وکار
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام کسب‌وکار</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{profile?.name || 'وارد نشده'}</span>
                  </div>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{user.phone_number || 'وارد نشده'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">امتیاز</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{getRatingStars(profile?.rating_avg || 0)} ({profile?.rating_avg?.toFixed(1) || '0.0'})</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ عضویت</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{formatDate(user.date_joined)}</span>
                  </div>
                </div>
              </div>
              
              {profile?.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{profile.description}</span>
                  </div>
                </div>
              )}

              {profile?.address && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{profile.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Location Information */}
            {(profile?.business_location_latitude && profile?.business_location_longitude) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl ml-3">📍</span>
                  موقعیت جغرافیایی
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عرض جغرافیایی</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{profile.business_location_latitude}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">طول جغرافیایی</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{profile.business_location_longitude}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl ml-3">📊</span>
                آمار کسب‌وکار
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div>
                    <p className="text-sm text-green-700">امتیاز فعلی</p>
                    <p className="text-2xl font-bold text-green-900">{profile?.rating_avg?.toFixed(1) || '0.0'}</p>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div>
                    <p className="text-sm text-blue-700">وضعیت</p>
                    <p className="text-lg font-bold text-blue-900">فعال</p>
                  </div>
                  <div className="text-2xl">✅</div>
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
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors">
                  📈 مشاهده گزارش‌ها
                </button>
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors">
                  🎯 مدیریت تخفیف‌ها
                </button>
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors">
                  👥 مشتریان
                </button>
                <button className="w-full text-right p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors">
                  ⚙️ تنظیمات کسب‌وکار
                </button>
              </div>
            </div>

            {/* Category & City Info */}
            {(profile?.category || profile?.city) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl ml-3">📋</span>
                  جزئیات بیشتر
                </h3>
                <div className="space-y-3">
                  {profile?.category && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">دسته‌بندی:</span>
                      <p className="font-medium text-gray-900">{profile.category.name || 'وارد نشده'}</p>
                    </div>
                  )}
                  {profile?.city && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">شهر:</span>
                      <p className="font-medium text-gray-900">{profile.city.name || 'وارد نشده'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
