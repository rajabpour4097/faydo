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

  const clubBadge = pkg.club_name
    ? (pkg.club_name.includes('عضو') ? pkg.club_name : `عضو ${pkg.club_name}`)
    : null

  const ratingDisplay = pkg.average_rating != null
    ? Number(pkg.average_rating).toFixed(1)
    : '—'

  const reviewCount = (pkg.total_comments || 0).toLocaleString('fa-IR')

  return (
    <div className="pb-6" dir="rtl">
      {/* ── Header block ── */}
      <section className="bg-white dark:bg-slate-900 mb-3">
        {/* Banner */}
        <div className="relative h-[130px] overflow-hidden">
          {bannerUrl ? (
            <img src={getFullImageUrl(bannerUrl)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          <button
            type="button"
            onClick={() => navigate('/dashboard/explore')}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center z-10"
            aria-label="بازگشت"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800 rotate-180" />
          </button>
        </div>

        {/* Info row — logo overlaps banner; name & rating sit on white bg */}
        <div className="px-4 pb-3">
          <div className="flex items-start gap-3" dir="ltr">
            {/* Logo (left) */}
            <div className="w-[68px] h-[68px] -mt-[34px] rounded-full border-[3px] border-white dark:border-slate-900 overflow-hidden bg-white shadow-md shrink-0 relative z-10">
              {logoUrl ? (
                <img src={getFullImageUrl(logoUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-xl">
                  {(pkg.business_name || '?').charAt(0)}
                </div>
              )}
            </div>

            {/* Name + badge + tagline (center) */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-[20px] leading-snug font-bold text-gray-900 dark:text-white">
                {pkg.business_name || 'کسب\u200cوکار'}
              </h1>
              {clubBadge && (
                <span className="inline-block mt-1.5 text-[11px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded-md">
                  {clubBadge}
                </span>
              )}
              {tagline && (
                <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {tagline}
                </p>
              )}
            </div>

            {/* Rating (right) */}
            <div className="shrink-0 pt-1 text-right w-[52px]">
              <div className="flex items-center justify-end gap-0.5 leading-none">
                <span className="text-amber-400 text-[15px]">★</span>
                <span className="text-[20px] font-bold text-gray-900 dark:text-white">
                  {ratingDisplay}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-none">
                <span dir="ltr">({reviewCount}</span>
                <span> نظر)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-3">

        {/* Gallery 4 images */}
        {displayGallery.length > 0 && (
          <div className="grid grid-cols-4 gap-1.5 mb-4">
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
          <div className="mb-4">
            {workingHours.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHoursModal(true)}
                className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2.5 mb-2 text-right"
              >
                <Clock className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500">ساعات کاری</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white" dir="ltr">{todayHours}</p>
                </div>
                <span className={`text-[11px] font-medium shrink-0 ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                  {isOpen ? '● باز است' : '● بسته است'}
                </span>
              </button>
            )}
            {amenities.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {amenities.map(amenity => (
                  <div
                    key={amenity.id}
                    className="flex flex-col items-center justify-center gap-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-2 py-2.5 min-h-[72px] text-center"
                  >
                    <AmenityIcon name={amenity.name} slug={amenity.slug} className="w-5 h-5 text-teal-600" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-slate-200 leading-tight line-clamp-2">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
                  <div className="rounded-xl overflow-hidden h-32 mb-2 bg-gray-100 pointer-events-none">
                    <iframe
                      title="map"
                      className="w-full h-full border-0 scale-105"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.008}%2C${lng + 0.008}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`}
                      scrolling="no"
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
