import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileDashboardLayout } from '../components/layout/MobileDashboardLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import {
  apiService, Package, BusinessGalleryImage, EliteGiftProgress, AmenityItem, WorkingHoursEntry,
} from '../services/api'
import { BusinessCustomerView } from '../components/business/BusinessCustomerView'
import { ReviewItem } from '../components/business/AllReviewsModal'

interface Comment {
  id: number
  user_name: string
  content: string
  likes_count: number
  is_liked: boolean
  category: string
  created_at: string
}

export const BusinessDetail: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()

  const [currentPackage, setCurrentPackage] = useState<Package | null>(null)
  const [comments, setComments] = useState<ReviewItem[]>([])
  const [gallery, setGallery] = useState<BusinessGalleryImage[]>([])
  const [amenities, setAmenities] = useState<AmenityItem[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHoursEntry[]>([])
  const [eliteGiftProgress, setEliteGiftProgress] = useState<EliteGiftProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (businessId) {
      loadBusinessData()
    }
  }, [businessId])

  const loadBusinessData = async () => {
    const pkgId = parseInt(businessId || '0', 10)
    if (!pkgId) {
      setError('شناسه نامعتبر')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const packageResponse = await apiService.getPackages()
      let pkg = packageResponse.data?.find(p => p.id === pkgId) || null

      if (!pkg) {
        const single = await apiService.getPackage(pkgId)
        if (single.data) {
          pkg = { ...single.data } as Package
        }
      }

      if (!pkg || !pkg.is_active || pkg.status !== 'approved') {
        setCurrentPackage(null)
        setError('کسب\u200cوکار یافت نشد')
        return
      }

      setCurrentPackage(pkg)

      const tasks = await Promise.allSettled([
        pkg.business_id
          ? apiService.getBusinessGalleryByBusinessId(pkg.business_id)
          : Promise.resolve({ data: [] }),
        apiService.getPackageAmenities(pkgId),
        apiService.getPackageWorkingHours(pkgId),
        pkg.business_id
          ? apiService.getBusinessComments(pkg.business_id)
          : Promise.resolve({ data: [] }),
        pkg.elite_gift_gift || pkg.elite_gift_title
          ? apiService.getEliteGiftProgress(pkgId)
          : Promise.resolve({ data: null }),
      ])

      const [galleryRes, amenitiesRes, hoursRes, commentsRes, progressRes] = tasks

      if (galleryRes.status === 'fulfilled' && galleryRes.value.data) {
        setGallery(galleryRes.value.data.slice(0, 4))
      }

      if (amenitiesRes.status === 'fulfilled' && amenitiesRes.value.data) {
        const data = amenitiesRes.value.data
        const selected = [
          ...data.general_amenities,
          ...data.specific_amenities,
        ].filter(a => a.is_selected)
        setAmenities(selected)
      }

      if (hoursRes.status === 'fulfilled' && hoursRes.value.data?.schedule) {
        setWorkingHours(hoursRes.value.data.schedule)
      }

      if (commentsRes.status === 'fulfilled' && commentsRes.value.data) {
        setComments(
          (commentsRes.value.data as Comment[]).map(c => ({
            id: c.id,
            user_name: c.user_name,
            content: c.content,
            likes_count: c.likes_count,
            is_liked: c.is_liked,
            created_at: c.created_at,
            category: c.category,
          }))
        )
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        setEliteGiftProgress(progressRes.value.data)
      }
    } catch {
      setError('خطا در بارگذاری اطلاعات کسب\u200cوکار')
    } finally {
      setLoading(false)
    }
  }

  const handleLikeComment = async (commentId: number) => {
    const response = await apiService.likeComment(commentId)
    if (response.error || !response.data) {
      return
    }
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              is_liked: response.data!.is_liked,
              likes_count: response.data!.likes_count,
            }
          : comment
      )
    )
  }

  const loadingView = (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
    </div>
  )

  const errorView = (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <p className="text-red-500 mb-4">{error || 'خطا در بارگذاری'}</p>
      <button
        type="button"
        onClick={() => navigate('/dashboard/explore')}
        className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm"
      >
        بازگشت به اکتشاف
      </button>
    </div>
  )

  const content = loading
    ? loadingView
    : error || !currentPackage
      ? errorView
      : (
        <BusinessCustomerView
          pkg={currentPackage}
          gallery={gallery}
          amenities={amenities}
          workingHours={workingHours}
          comments={comments}
          eliteGiftProgress={eliteGiftProgress}
          onLikeComment={handleLikeComment}
        />
      )

  return (
    <>
      <div className="hidden lg:block">
        <DashboardLayout>
          <div className="max-w-lg mx-auto">{content}</div>
        </DashboardLayout>
      </div>
      <div className="lg:hidden">
        <MobileDashboardLayout>
          {content}
        </MobileDashboardLayout>
      </div>
    </>
  )
}

export default BusinessDetail
