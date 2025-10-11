import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { apiService, Package, BusinessGalleryImage } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface BusinessDetailProps {}

interface Comment {
  id: number
  user_name: string
  user_avatar?: string
  content: string
  likes_count: number
  is_liked: boolean
  category: 'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'
  created_at: string
}


export const BusinessDetail: React.FC<BusinessDetailProps> = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null)
  const [packageHistory, setPackageHistory] = useState<Package[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [gallery, setGallery] = useState<BusinessGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'gallery' | 'comments'>('details')
  const [newComment, setNewComment] = useState('')
  const [commentCategory, setCommentCategory] = useState<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'>('discount_all')

  useEffect(() => {
    if (businessId) {
      loadBusinessData()
    }
  }, [businessId])

  const loadBusinessData = async () => {
    try {
      setLoading(true)
      // Load current active package
      const packageResponse = await apiService.getPackages()
      const businessPackages = packageResponse.data?.filter(pkg => 
        pkg.business_name && pkg.is_active && pkg.status === 'approved'
      ) || []
      
      const currentPkg = businessPackages.find(pkg => pkg.id.toString() === businessId)
      setCurrentPackage(currentPkg || null)
      
      if (currentPkg) {
        // Load package history
        const historyResponse = await apiService.getPackages()
        const historyPackages = historyResponse.data?.filter(pkg => 
          pkg.business_name === currentPkg.business_name && !pkg.is_active
        ) || []
        setPackageHistory(historyPackages)
        
        // Load comments for different categories
        await loadComments(currentPkg)
      }
      
      // Load gallery (for now using placeholder - in real implementation, you would get gallery by business ID)
      setGallery([
        { 
          id: 1, 
          image: '/api/placeholder/400/300', 
          image_url: '/api/placeholder/400/300', 
          title: 'نمای بیرونی رستوران',
          description: 'نمای زیبای بیرونی رستوران',
          is_featured: true,
          order: 0,
          created_at: '2024-01-01T00:00:00Z'
        },
        { 
          id: 2, 
          image: '/api/placeholder/400/300', 
          image_url: '/api/placeholder/400/300', 
          title: 'سالن اصلی',
          description: 'سالن اصلی رستوران',
          is_featured: false,
          order: 1,
          created_at: '2024-01-01T00:00:00Z'
        },
        { 
          id: 3, 
          image: '/api/placeholder/400/300', 
          image_url: '/api/placeholder/400/300', 
          title: 'آشپزخانه',
          description: 'آشپزخانه مدرن',
          is_featured: false,
          order: 2,
          created_at: '2024-01-01T00:00:00Z'
        },
        { 
          id: 4, 
          image: '/api/placeholder/400/300', 
          image_url: '/api/placeholder/400/300', 
          title: 'محیط VIP',
          description: 'محیط ویژه VIP',
          is_featured: false,
          order: 3,
          created_at: '2024-01-01T00:00:00Z'
        }
      ])
      
    } catch (err) {
      setError('خطا در بارگذاری اطلاعات کسب‌وکار')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (_pkg: Package) => {
    try {
      // For now, we'll use mock data since we need to determine the correct content type IDs
      // In a real implementation, you would need to get the content type IDs from the backend
      setComments([
        {
          id: 1,
          user_name: 'علی احمدی',
          user_avatar: '',
          content: 'تخفیف‌های این رستوران واقعاً عالی بود. کیفیت غذا هم فوق‌العاده.',
          likes_count: 12,
          is_liked: false,
          category: 'discount_all',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          user_name: 'مریم رضایی',
          user_avatar: '',
          content: 'هدیه‌ای که برای خرید بالای 500 هزار تومان دادند خیلی خوب بود.',
          likes_count: 8,
          is_liked: true,
          category: 'elite_gift',
          created_at: '2024-01-14T15:45:00Z'
        }
      ])
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }

  const handleLikeComment = async (commentId: number) => {
    try {
      const response = await apiService.likeComment(commentId)
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              is_liked: response.data?.is_liked || false,
              likes_count: response.data?.likes_count || comment.likes_count
            }
          : comment
      ))
    } catch (err) {
      console.error('Error liking comment:', err)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentPackage) return
    
    try {
      // For now, we'll use mock functionality since we need to determine the correct content type IDs
      // In a real implementation, you would need to get the content type IDs from the backend
      const comment: Comment = {
        id: Date.now(),
        user_name: user?.name || 'کاربر',
        user_avatar: '',
        content: newComment,
        likes_count: 0,
        is_liked: false,
        category: commentCategory,
        created_at: new Date().toISOString()
      }
      
      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (err) {
      console.error('Error creating comment:', err)
    }
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      discount_all: { text: 'تخفیف کلی', color: 'bg-green-100 text-green-800' },
      specific_discount: { text: 'تخفیف خاص', color: 'bg-blue-100 text-blue-800' },
      elite_gift: { text: 'هدیه ویژه', color: 'bg-purple-100 text-purple-800' },
      vip_experience: { text: 'تجربه VIP', color: 'bg-yellow-100 text-yellow-800' }
    }
    return badges[category as keyof typeof badges] || badges.discount_all
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  if (loading) {
    return (
      <>
        <div className="hidden lg:block">
          <DashboardLayout>
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </DashboardLayout>
        </div>
        <div className="lg:hidden">
          <MobileDashboardLayout>
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </MobileDashboardLayout>
        </div>
      </>
    )
  }

  if (error || !currentPackage) {
    return (
      <>
        <div className="hidden lg:block">
          <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-red-500 text-xl mb-4">خطا در بارگذاری اطلاعات</div>
              <button 
                onClick={() => navigate('/dashboard/explore')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                بازگشت به اکتشاف
              </button>
            </div>
          </DashboardLayout>
        </div>
        <div className="lg:hidden">
          <MobileDashboardLayout>
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-red-500 text-xl mb-4">خطا در بارگذاری اطلاعات</div>
              <button 
                onClick={() => navigate('/dashboard/explore')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                بازگشت به اکتشاف
              </button>
            </div>
          </MobileDashboardLayout>
        </div>
      </>
    )
  }

  // Desktop Layout Component
  const DesktopLayout = () => (
    <DashboardLayout>
      <div className="space-y-6" style={{ direction: 'rtl' }}>
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/explore')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentPackage.business_name}
            </h1>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              جزئیات پکیج فعال
            </p>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              گالری تصاویر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="relative group cursor-pointer">
                  <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title || 'تصویر گالری'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                      {item.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'details', label: 'جزئیات پکیج' },
                { id: 'gallery', label: 'گالری' },
                { id: 'comments', label: 'نظرات کاربران' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Package Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Discount Information */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      اطلاعات تخفیف‌ها
                    </h3>
                    
                    {currentPackage.discount_percentage && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-green-800 dark:text-green-200">تخفیف کلی</h4>
                            <p className="text-sm text-green-600 dark:text-green-400">برای تمام خریدها</p>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {currentPackage.discount_percentage}%
                          </div>
                        </div>
                      </div>
                    )}

                    {currentPackage.specific_discount_title && currentPackage.specific_discount_percentage && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200">تخفیف خاص</h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{currentPackage.specific_discount_title}</p>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {currentPackage.specific_discount_percentage}%
                          </div>
                        </div>
                      </div>
                    )}

                    {currentPackage.elite_gift_title && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎁</span>
                          <div>
                            <h4 className="font-semibold text-purple-800 dark:text-purple-200">هدیه ویژه</h4>
                            <p className="text-sm text-purple-600 dark:text-purple-400">{currentPackage.elite_gift_title}</p>
                            {currentPackage.elite_gift_amount && (
                              <p className="text-xs text-purple-500">برای خرید بالای {currentPackage.elite_gift_amount} تومان</p>
                            )}
                            {currentPackage.elite_gift_count && (
                              <p className="text-xs text-purple-500">برای {currentPackage.elite_gift_count} خرید</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Package Info */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      اطلاعات پکیج
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <span className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>وضعیت</span>
                        <span className="font-semibold text-green-600">فعال</span>
                      </div>
                      
                      {currentPackage.days_remaining !== null && currentPackage.days_remaining !== undefined && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <span className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>زمان باقی‌مانده</span>
                          <span className={`font-semibold ${currentPackage.days_remaining > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {currentPackage.days_remaining > 0 ? `${currentPackage.days_remaining} روز` : 'منقضی شده'}
                          </span>
                        </div>
                      )}
                      
                      {currentPackage.business_category && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <span className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>دسته‌بندی</span>
                          <span className="font-semibold">{currentPackage.business_category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Package History */}
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    سوابق پکیج‌ها
                  </h3>
                  <div className="space-y-3">
                    {packageHistory.map((pkg) => (
                      <div key={pkg.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">پکیج {pkg.id}</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                              {formatDate(pkg.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{pkg.discount_percentage}%</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">تخفیف</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-2">
                      <img 
                        src={item.image_url} 
                        alt={item.title || 'تصویر گالری'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {item.title && (
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {item.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                {/* Add Comment */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    نظر خود را بنویسید
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={commentCategory}
                      onChange={(e) => setCommentCategory(e.target.value as any)}
                      className={`w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      <option value="discount_all">تخفیف کلی</option>
                      <option value="specific_discount">تخفیف خاص</option>
                      <option value="elite_gift">هدیه ویژه</option>
                      <option value="vip_experience">تجربه VIP</option>
                    </select>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="نظر خود را بنویسید..."
                      className={`w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 ${isDark ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-gray-500'}`}
                      rows={3}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ارسال نظر
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const badge = getCategoryBadge(comment.category)
                    return (
                      <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {comment.user_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {comment.user_name}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                {badge.text}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'} mb-3`}>
                              {comment.content}
                            </p>
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1 text-sm ${
                                comment.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <svg className="w-4 h-4" fill={comment.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {comment.likes_count}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )

  // Mobile Layout Component
  const MobileLayout = () => (
    <MobileDashboardLayout>
      <div className="space-y-4" style={{ direction: 'rtl' }}>
        {/* Mobile Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/explore')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentPackage.business_name}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              جزئیات پکیج فعال
            </p>
          </div>
        </div>

        {/* Mobile Gallery */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4">
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              گالری تصاویر
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {gallery.slice(0, 4).map((item) => (
                <div key={item.id} className="relative group cursor-pointer">
                  <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title || 'تصویر گالری'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                      {item.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-4 px-4">
              {[
                { id: 'details', label: 'جزئیات' },
                { id: 'gallery', label: 'گالری' },
                { id: 'comments', label: 'نظرات' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Discount Cards */}
                {currentPackage.discount_percentage && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">تخفیف کلی</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">برای تمام خریدها</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {currentPackage.discount_percentage}%
                      </div>
                    </div>
                  </div>
                )}

                {currentPackage.specific_discount_title && currentPackage.specific_discount_percentage && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">تخفیف خاص</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{currentPackage.specific_discount_title}</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {currentPackage.specific_discount_percentage}%
                      </div>
                    </div>
                  </div>
                )}

                {currentPackage.elite_gift_title && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎁</span>
                      <div>
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">هدیه ویژه</h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{currentPackage.elite_gift_title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 gap-3">
                {gallery.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-2">
                      <img 
                        src={item.image_url} 
                        alt={item.title || 'تصویر گالری'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {item.title && (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {item.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Add Comment */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <h4 className={`font-semibold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    نظر خود را بنویسید
                  </h4>
                  <div className="space-y-2">
                    <select
                      value={commentCategory}
                      onChange={(e) => setCommentCategory(e.target.value as any)}
                      className={`w-full p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      <option value="discount_all">تخفیف کلی</option>
                      <option value="specific_discount">تخفیف خاص</option>
                      <option value="elite_gift">هدیه ویژه</option>
                      <option value="vip_experience">تجربه VIP</option>
                    </select>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="نظر خود را بنویسید..."
                      className={`w-full p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm ${isDark ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-gray-500'}`}
                      rows={2}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ارسال نظر
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const badge = getCategoryBadge(comment.category)
                    return (
                      <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {comment.user_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {comment.user_name}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                {badge.text}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                              {comment.content}
                            </p>
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1 text-xs ${
                                comment.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <svg className="w-3 h-3" fill={comment.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {comment.likes_count}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )

  // Main return with responsive layout
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout />
      </div>
    </>
  )
}
