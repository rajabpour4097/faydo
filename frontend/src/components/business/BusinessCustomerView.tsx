import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, BusinessGalleryImage, EliteGiftProgress, AmenityItem, WorkingHoursEntry, getFullImageUrl,
} from '../../services/api'
import { AmenityIcon } from '../../utils/amenityIcons'
import { getTodayHoursLabel, isBusinessOpenNow, openNavigationApps } from '../../utils/workingHours'
import { WorkingHoursModal } from './WorkingHoursModal'
import { ImageLightboxModal } from './ImageLightboxModal'
import { AllReviewsModal, ReviewItem } from './AllReviewsModal'
import { Clock, MapPin, MessageSquare, ChevronLeft, Navigation, Gift, Tag } from 'lucide-react'

interface BusinessCustomerViewProps {
  pkg: Package
  gallery: BusinessGalleryImage[]
  amenities: AmenityItem[]
  workingHours: WorkingHoursEntry[]
  comments: ReviewItem[]
  eliteGiftProgress: EliteGiftProgress | null
  onLikeComment: (id: number) => void
}

function formatAmount(n: number): string {
  return n.toLocaleString('fa-IR')
}

export const BusinessCustomerView: React.FC<BusinessCustomerViewProps> = ({
  pkg,
  gallery,
  amenities,
  workingHours,
  comments,
  eliteGiftProgress,
  onLikeComment,
}) => {
  const navigate = useNavigate()
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const bannerUrl = gallery.find(g => g.is_featured)?.image_url
    || gallery[0]?.image_url
    || pkg.business_image
    || pkg.business_logo

  const logoUrl = pkg.business_logo || pkg.business_image
  const displayGallery = gallery.slice(0, 4)
  const isOpen = isBusinessOpenNow(workingHours)
  const todayHours = getTodayHoursLabel(workingHours)

  const lat = pkg.business_location_latitude ? Number(pkg.business_location_latitude) : null
  const lng = pkg.business_location_longitude ? Number(pkg.business_location_longitude) : null

  const tagline = pkg.business_description
    || [pkg.business_category?.name, pkg.city?.name].filter(Boolean).join(' • ')

  const lightboxImages = displayGallery.map(g => ({
    url: g.image_url,
    title: g.title,
  }))

  return (
    <div className="pb-4 -mx-1" dir="rtl">
      {/* Hero Banner */}
      <div className="relative h-44 rounded-2xl overflow-hidden mb-12 mx-1">
        {bannerUrl ? (
          <img src={getFullImageUrl(bannerUrl)} alt={pkg.business_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button
          type="button"
          onClick={() => navigate('/dashboard/explore')}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800 rotate-180" />
        </button>
      </div>

      {/* Logo + Info */}
      <div className="px-3 -mt-16 relative z-10">
        <div className="flex items-end gap-3 mb-3">
          <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-800 overflow-hidden bg-white shadow-lg shrink-0">
            {logoUrl ? (
              <img src={getFullImageUrl(logoUrl)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
                {pkg.business_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{pkg.business_name}</h1>
                {pkg.club_name && (
                  <span className="inline-block mt-1 text-[10px] font-medium bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                    عضو {pkg.club_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-800 rounded-lg px-2 py-1 shadow-sm">
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{pkg.average_rating || '—'}</span>
                <span className="text-[10px] text-gray-400">({pkg.total_comments || 0} نظر)</span>
              </div>
            </div>
            {tagline && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{tagline}</p>
            )}
          </div>
        </div>

        {/* Gallery 4 images */}
        {displayGallery.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {displayGallery.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200 dark:ring-slate-600"
              >
                <img src={getFullImageUrl(img.image_url)} alt={img.title || ''} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Discount Cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {pkg.discount_percentage != null && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 relative overflow-hidden">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                <Gift className="w-3 h-3" />
                <span>تخفیف عمومی</span>
              </div>
              <div className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                {pkg.discount_percentage}%
              </div>
              <p className="text-[11px] text-gray-500 mt-1">تخفیف روی کل منو</p>
            </div>
          )}
          {pkg.specific_discount_percentage != null && (
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-3 relative overflow-hidden text-white">
              <div className="flex items-center gap-1 text-[10px] text-red-100 mb-2">
                <Tag className="w-3 h-3" />
                <span>تخفیف ویژه</span>
              </div>
              <div className="text-3xl font-black leading-none">{pkg.specific_discount_percentage}%</div>
              <p className="text-[11px] text-red-100 mt-1 line-clamp-2">
                {pkg.specific_discount_title || 'تخفیف اختصاصی'}
              </p>
            </div>
          )}
        </div>

        {/* Elite Gift Progress */}
        {eliteGiftProgress && eliteGiftProgress.target > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-gray-800 dark:text-white">
                هدیه ویژه / {pkg.elite_gift_gift || eliteGiftProgress.gift_name || 'جایزه وفاداری'}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, eliteGiftProgress.percentage || 0)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 text-left" dir="ltr">
              {eliteGiftProgress.type === 'amount'
                ? `هدف خرید ${formatAmount(eliteGiftProgress.target)} تومان`
                : `هدف ${eliteGiftProgress.target} مراجعه`}
            </p>
          </div>
        )}

        {/* Amenities + Working Hours */}
        {(amenities.length > 0 || workingHours.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {workingHours.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHoursModal(true)}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2 min-w-[140px] flex-1"
              >
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <div className="text-right flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500">ساعات کاری</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white" dir="ltr">{todayHours}</p>
                  <p className={`text-[10px] ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                    {isOpen ? '● باز است' : '● بسته است'}
                  </p>
                </div>
              </button>
            )}
            {amenities.map(amenity => (
              <div
                key={amenity.id}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2 min-w-[100px] flex-1 max-w-[calc(50%-4px)]"
              >
                <AmenityIcon name={amenity.name} slug={amenity.slug} className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-slate-200 leading-tight">{amenity.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reviews + Map */}
        <div className="grid grid-cols-1 gap-3">
          {/* Reviews */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                نظرات کاربران
                {comments.length > 0 && (
                  <span className="text-xs font-normal text-gray-400 mr-1">({pkg.total_comments || comments.length})</span>
                )}
              </h2>
            </div>
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">هنوز نظری ثبت نشده</p>
            ) : (
              <div className="space-y-3">
                {comments.slice(0, 3).map(review => (
                  <div key={review.id} className="border-b border-gray-50 dark:border-slate-700 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-800 dark:text-white">{review.user_name}</span>
                      <span className="text-[10px] text-gray-400">{review.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 mb-1">{review.content}</p>
                    <button
                      type="button"
                      onClick={() => onLikeComment(review.id)}
                      className={`text-[10px] flex items-center gap-1 ${review.is_liked ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      ♥ {review.likes_count}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {comments.length > 0 && (
              <button
                type="button"
                onClick={() => setShowReviewsModal(true)}
                className="w-full mt-3 text-xs text-red-500 font-medium flex items-center justify-center gap-1"
              >
                نمایش همه نظرات
                <ChevronLeft className="w-3 h-3 rotate-180" />
              </button>
            )}
          </div>

          {/* Map / Location */}
          {(pkg.business_address || (lat && lng)) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">موقعیت</h2>
              </div>
              {pkg.business_address && (
                <p className="text-xs text-gray-600 dark:text-slate-300 mb-2">{pkg.business_address}</p>
              )}
              {lat && lng && (
                <>
                  <div className="rounded-xl overflow-hidden h-32 mb-2 bg-gray-100">
                    <iframe
                      title="map"
                      className="w-full h-full border-0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openNavigationApps(lat, lng, pkg.business_name)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium"
                  >
                    <Navigation className="w-4 h-4" />
                    مسیریابی
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showHoursModal && (
        <WorkingHoursModal schedule={workingHours} onClose={() => setShowHoursModal(false)} />
      )}
      {showReviewsModal && (
        <AllReviewsModal
          reviews={comments}
          totalCount={pkg.total_comments || comments.length}
          onClose={() => setShowReviewsModal(false)}
          onLike={onLikeComment}
        />
      )}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <ImageLightboxModal
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
