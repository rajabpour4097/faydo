import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package } from '../../services/api'
import { isSamplePackage } from '../../data/exploreSamplePackages'

interface ExplorePromoSliderProps {
  packages: Package[]
}

const BANNER_GRADIENTS = [
  'linear-gradient(128deg, #f72585 0%, #e040a0 28%, #009688 72%, #00796b 100%)',
  'linear-gradient(128deg, #ec4899 0%, #f43f5e 35%, #14b8a6 100%)',
  'linear-gradient(128deg, #db2777 0%, #e11d48 32%, #0d9488 100%)',
  'linear-gradient(128deg, #8b5cf6 0%, #6366f1 40%, #06b6d4 100%)',
]

function bannerSortPriority(pkg: Package): number {
  if (isSamplePackage(pkg) && pkg.explore_category_id === 'restaurant') return 0
  if (pkg.business_name?.includes('برگر')) return 0
  if (isSamplePackage(pkg) && pkg.explore_category_id === 'cafe') return 1
  return 2
}

function getBannerHeroImage(pkg: Package): string {
  if (isSamplePackage(pkg) && pkg.promo_banner_image) {
    return pkg.promo_banner_image
  }
  return pkg.business_image || pkg.business_logo || ''
}

export const ExplorePromoSlider: React.FC<ExplorePromoSliderProps> = ({ packages }) => {
  const navigate = useNavigate()
  const [slides, setSlides] = useState<Package[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)
  const autoPaused = useRef(false)

  useEffect(() => {
    if (!packages?.length) {
      setSlides([])
      return
    }

    const active = packages.filter(
      pkg => pkg.is_active && pkg.status === 'approved' && pkg.is_complete,
    )

    const withGift = active.filter(
      p => p.elite_gift_title || p.elite_gift_gift || (p.discount_percentage && p.discount_percentage > 0),
    )
    const source = withGift.length > 0 ? withGift : active

    const byCategory = new Map<number, Package>()
    const extras: Package[] = []

    for (const pkg of source) {
      const catId = pkg.business_category?.id
      if (catId != null && !byCategory.has(catId)) {
        byCategory.set(catId, pkg)
      } else {
        extras.push(pkg)
      }
    }

    const selected = [...byCategory.values(), ...extras].slice(0, 4)
    const ordered = selected.sort((a, b) => bannerSortPriority(a) - bannerSortPriority(b))
    setSlides(ordered.length > 0 ? ordered : active.slice(0, 4))
    setCurrentIndex(0)
  }, [packages])

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % Math.max(slides.length, 1))
  }, [slides.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % Math.max(slides.length, 1))
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      if (!autoPaused.current) goNext()
    }, 4500)
    return () => clearInterval(interval)
  }, [slides.length, goNext])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
    autoPaused.current = true
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
    touchDeltaX.current = 0
    setTimeout(() => { autoPaused.current = false }, 2500)
  }

  const openPackage = (pkg: Package) => {
    if (isSamplePackage(pkg)) return
    navigate(`/dashboard/business/${pkg.id}`)
  }

  if (slides.length === 0) return null

  const current = slides[currentIndex]
  if (!current) return null

  const giftTitle =
    current.elite_gift_gift ||
    current.elite_gift_title ||
    (current.discount_percentage
      ? `${current.discount_percentage}٪ تخفیف`
      : current.specific_discount_title) ||
    'پیشنهاد ویژه'

  const heroImage = getBannerHeroImage(current)
  const gradient = BANNER_GRADIENTS[currentIndex % BANNER_GRADIENTS.length]

  return (
    <div className="relative w-full">
      {/* LTR برای قرارگیری دقیق: متن چپ | تصویر راست */}
      <div
        dir="ltr"
        className="relative h-[176px] w-full overflow-hidden rounded-[20px] select-none shadow-[0_8px_24px_rgba(247,37,133,0.18)]"
        style={{ background: gradient }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => openPackage(current)}
      >
        {/* متن — سمت چپ */}
        <div
          dir="rtl"
          className="absolute inset-y-0 left-0 z-[2] flex w-[56%] flex-col justify-center pb-7 pl-4 pr-1 pt-2 text-right"
        >
          <div className="mb-2 inline-flex w-fit items-center gap-1 self-start rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white">پیشنهاد ویژه امروز</span>
            <span className="text-[10px] leading-none">⭐</span>
          </div>

          <h3 className="mb-1 text-[17px] font-extrabold leading-[1.35] text-white line-clamp-2">
            {giftTitle}
          </h3>

          <p className="mb-2.5 text-[11px] font-medium text-white/90 line-clamp-1">
            در {current.business_name}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              openPackage(current)
            }}
            className="inline-flex w-fit items-center gap-1 self-start rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#0d9488] shadow-sm active:scale-95 transition-transform"
          >
            <span>مشاهده هدیه</span>
            <svg className="h-3 w-3 shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* تصویر محصول — سمت راست، برش‌خورده پایین */}
        <div className="pointer-events-none absolute bottom-0 right-0 z-[1] h-full w-[48%]">
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="absolute bottom-[-4px] right-0 h-[168px] w-auto max-w-[220px] object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              draggable={false}
            />
          ) : (
            <div className="absolute bottom-4 right-6 text-5xl opacity-50">🎁</div>
          )}
        </div>

        {/* نقطه‌های اسلایدر — پایین وسط */}
        {slides.length > 1 && (
          <div
            className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`اسلاید ${i + 1}`}
                aria-current={i === currentIndex}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'h-[6px] w-[18px] bg-white'
                    : 'h-[6px] w-[6px] bg-white/45'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="اسلاید قبلی"
            className="absolute inset-y-0 left-0 z-10 w-[18%]"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
          />
          <button
            type="button"
            aria-label="اسلاید بعدی"
            className="absolute inset-y-0 right-0 z-10 w-[18%]"
            onClick={(e) => { e.stopPropagation(); goNext() }}
          />
        </>
      )}
    </div>
  )
}
