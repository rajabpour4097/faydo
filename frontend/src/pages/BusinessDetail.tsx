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
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')
  const [newComment, setNewComment] = useState('')
  const [commentCategory, setCommentCategory] = useState<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'>('discount_all')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (businessId) {
      loadBusinessData()
    }
  }, [businessId])

  useEffect(() => {
    // Reset selected image index when gallery changes
    if (gallery.length > 0) {
      const featuredIndex = gallery.findIndex(img => img.is_featured)
      setSelectedImageIndex(featuredIndex >= 0 ? featuredIndex : 0)
    }
  }, [gallery])

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
      
      // Load gallery images for the business
      if (currentPkg && currentPkg.business_id) {
        try {
          const galleryResponse = await apiService.getBusinessGalleryByBusinessId(currentPkg.business_id)
          setGallery(galleryResponse.data || [])
        } catch (galleryError) {
          console.error('Error loading gallery:', galleryError)
          // Fallback to empty gallery if API fails
          setGallery([])
        }
      } else {
        setGallery([])
      }
      
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

  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => prev > 0 ? prev - 1 : gallery.length - 1)
  }

  const handleNextImage = () => {
    setSelectedImageIndex(prev => prev < gallery.length - 1 ? prev + 1 : 0)
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index)
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
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPackage.business_name}
                </h1>
                <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  جزئیات پکیج فعال
                </p>
              </div>
              {/* Business Rating */}
              <div className="flex items-center gap-2 text-gray-700 dark:text-slate-200">
                <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xl font-semibold">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section - Main Image + Thumbnails */}
        {gallery.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="relative">
              {/* Main Featured Image */}
              <div className="relative h-80 md:h-96">
                <img 
                  src={gallery[selectedImageIndex]?.image_url} 
                  alt={gallery[selectedImageIndex]?.title || 'تصویر اصلی کسب‌وکار'}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation buttons */}
                {gallery.length > 1 && (
                  <>
                    <button 
                      onClick={handlePreviousImage}
                      className="absolute top-4 left-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {gallery.map((item, index) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleThumbnailClick(index)}
                      className={`relative flex-shrink-0 group cursor-pointer transition-all duration-200 ${
                        selectedImageIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-700">
                        <img 
                          src={item.image_url} 
                          alt={item.title || 'تصویر گالری'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {item.is_featured && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {gallery.length > 5 && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        +{gallery.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'details', label: 'جزئیات پکیج' },
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
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🎁</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-800 dark:text-purple-200">هدیه ویژه</h4>
                            <p className="text-sm text-purple-600 dark:text-purple-400">{currentPackage.elite_gift_title}</p>
                          </div>
                        </div>
                        
                        {/* Progress Section */}
                        <div className="space-y-2">
                          {currentPackage.elite_gift_amount && (() => {
                            // Mock data - will be replaced with real data from API
                            const currentAmount = 450000 // مبلغ خرید فعلی مشتری
                            const targetAmount = currentPackage.elite_gift_amount
                            const remainingAmount = Math.max(0, targetAmount - currentAmount)
                            const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100)
                            
                            return (
                              <>
                                <div className="flex items-center justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                    مبلغ خرید شما: {currentAmount.toLocaleString('fa-IR')} تومان
                                  </span>
                                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                    هدف: {targetAmount.toLocaleString('fa-IR')} تومان
                                  </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="relative w-full h-3 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                
                                {remainingAmount > 0 ? (
                                  <p className="text-center text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    {remainingAmount.toLocaleString('fa-IR')} تومان تا دریافت هدیه مانده 🎉
                                  </p>
                                ) : (
                                  <p className="text-center text-xs text-purple-600 dark:text-purple-400 font-bold">
                                    تبریک! شما واجد شرایط دریافت هدیه هستید 🎊
                                  </p>
                                )}
                              </>
                            )
                          })()}
                          
                          {currentPackage.elite_gift_count && !currentPackage.elite_gift_amount && (() => {
                            // Mock data for count-based gifts
                            const currentCount = 3 // تعداد خرید فعلی مشتری
                            const targetCount = currentPackage.elite_gift_count
                            const remainingCount = Math.max(0, targetCount - currentCount)
                            const progressPercentage = Math.min(100, (currentCount / targetCount) * 100)
                            
                            return (
                              <>
                                <div className="flex items-center justify-between text-xs">
                                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                    تعداد خرید شما: {currentCount.toLocaleString('fa-IR')}
                                  </span>
                                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                    هدف: {targetCount.toLocaleString('fa-IR')} خرید
                                  </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="relative w-full h-3 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                
                                {remainingCount > 0 ? (
                                  <p className="text-center text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    {remainingCount.toLocaleString('fa-IR')} خرید تا دریافت هدیه مانده 🎉
                                  </p>
                                ) : (
                                  <p className="text-center text-xs text-purple-600 dark:text-purple-400 font-bold">
                                    تبریک! شما واجد شرایط دریافت هدیه هستید 🎊
                                  </p>
                                )}
                              </>
                            )
                          })()}
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
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPackage.business_name}
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  جزئیات پکیج فعال
                </p>
              </div>
              {/* Business Rating */}
              <div className="flex items-center gap-1 text-gray-700 dark:text-slate-200">
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-[13px] font-semibold ml-2">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Gallery - Main Image + Thumbnails */}
        {gallery.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 mx-1 overflow-hidden">
            <div className="relative">
              {/* Main Featured Image */}
              <div className="relative h-64">
                <img 
                  src={gallery[selectedImageIndex]?.image_url} 
                  alt={gallery[selectedImageIndex]?.title || 'تصویر اصلی کسب‌وکار'}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation buttons */}
                {gallery.length > 1 && (
                  <>
                    <button 
                      onClick={handlePreviousImage}
                      className="absolute top-3 left-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((item, index) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleThumbnailClick(index)}
                      className={`relative flex-shrink-0 group cursor-pointer transition-all duration-200 ${
                        selectedImageIndex === index ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-700">
                        <img 
                          src={item.image_url} 
                          alt={item.title || 'تصویر گالری'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {item.is_featured && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {gallery.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        +{gallery.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 mx-1 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-4 px-4">
              {[
                { id: 'details', label: 'جزئیات' },
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
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🎁</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">هدیه ویژه</h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{currentPackage.elite_gift_title}</p>
                      </div>
                    </div>
                    
                    {/* Progress Section - Mobile */}
                    <div className="space-y-2">
                      {currentPackage.elite_gift_amount && (() => {
                        // Mock data - will be replaced with real data from API
                        const currentAmount = 450000
                        const targetAmount = currentPackage.elite_gift_amount
                        const remainingAmount = Math.max(0, targetAmount - currentAmount)
                        const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100)
                        
                        return (
                          <>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                خرید شما: {currentAmount.toLocaleString('fa-IR')} ت
                              </span>
                              <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                هدف: {targetAmount.toLocaleString('fa-IR')} ت
                              </span>
                            </div>
                            
                            <div className="relative w-full h-2.5 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            
                            {remainingAmount > 0 ? (
                              <p className="text-center text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                {remainingAmount.toLocaleString('fa-IR')} تومان تا دریافت هدیه 🎉
                              </p>
                            ) : (
                              <p className="text-center text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                                تبریک! شما واجد شرایط هستید 🎊
                              </p>
                            )}
                          </>
                        )
                      })()}
                      
                      {currentPackage.elite_gift_count && !currentPackage.elite_gift_amount && (() => {
                        const currentCount = 3
                        const targetCount = currentPackage.elite_gift_count
                        const remainingCount = Math.max(0, targetCount - currentCount)
                        const progressPercentage = Math.min(100, (currentCount / targetCount) * 100)
                        
                        return (
                          <>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                خرید شما: {currentCount.toLocaleString('fa-IR')}
                              </span>
                              <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                                هدف: {targetCount.toLocaleString('fa-IR')} خرید
                              </span>
                            </div>
                            
                            <div className="relative w-full h-2.5 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            
                            {remainingCount > 0 ? (
                              <p className="text-center text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                {remainingCount.toLocaleString('fa-IR')} خرید تا دریافت هدیه 🎉
                              </p>
                            ) : (
                              <p className="text-center text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                                تبریک! شما واجد شرایط هستید 🎊
                              </p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
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
