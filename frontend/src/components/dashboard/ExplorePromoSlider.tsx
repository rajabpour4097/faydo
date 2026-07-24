import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, getFullImageUrl } from '../../services/api'
import { isSamplePackage } from '../../data/exploreSamplePackages'

interface ExplorePromoSliderProps {
  packages: Package[]
}

const BANNER_GRADIENTS = [
  'linear-gradient(105deg, #ec4899 0%, #f43f5e 35%, #14b8a6 100%)',
  'linear-gradient(105deg, #8b5cf6 0%, #6366f1 40%, #06b6d4 100%)',
  'linear-gradient(105deg, #f97316 0%, #ef4444 40%, #0d9488 100%)',
  'linear-gradient(105deg, #db2777 0%, #e11d48 30%, #0f766e 100%)',
]

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

    // اولویت با هدیه ویژه / تخفیف، سپس یک نمونه از هر دسته
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

    const selected = [...byCategory.values(), ...extras].slice(0, 6)
    setSlides(selected.length > 0 ? selected : active.slice(0, 4))
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
      // RTL: swipe right (positive) → previous, swipe left → next
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

  const imageUrl = getFullImageUrl(current.business_image || current.business_logo)
  const gradient = BANNER_GRADIENTS[currentIndex % BANNER_GRADIENTS.length]

  return (
    <div className="relative" style={{ direction: 'rtl' }}>
      <div
        className="relative overflow-hidden rounded-[28px] shadow-lg select-none"
        style={{ background: gradient, minHeight: 168 }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => openPackage(current)}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-32 w-32 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex min-h-[168px] items-stretch">
          {/* Text side */}
          <div className="relative z-10 flex flex-1 flex-col justify-center py-4 pr-4 pl-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-white/90">پیشنهاد ویژه امروز</span>
              <span className="text-xs">⭐</span>
            </div>
            <h3 className="mb-1 text-[17px] font-extrabold leading-snug text-white line-clamp-2">
              {giftTitle}
            </h3>
            <p className="mb-3 text-xs text-white/85 line-clamp-1">
              در {current.business_name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openPackage(current)
              }}
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-teal-700 shadow-sm active:scale-95 transition-transform"
            >
              مشاهده هدیه
              <svg className="h-3.5 w-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Image side */}
          <div className="relative w-[42%] shrink-0 self-end">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={current.business_name}
                className="h-[150px] w-full object-contain object-bottom drop-shadow-xl"
                draggable={false}
              />
            ) : (
              <div className="flex h-[150px] items-end justify-center pb-4 text-5xl opacity-40">🎁</div>
            )}
          </div>
        </div>

        {/* Pagination dots — inside banner */}
        {slides.length > 1 && (
          <div
            className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`اسلاید ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'h-2 w-2 bg-white'
                    : 'h-1.5 w-1.5 bg-white/45'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side hit zones for left/right navigation */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="اسلاید قبلی"
            className="absolute inset-y-0 right-0 z-30 w-[18%] opacity-0"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
          />
          <button
            type="button"
            aria-label="اسلاید بعدی"
            className="absolute inset-y-0 left-0 z-30 w-[18%] opacity-0"
            onClick={(e) => { e.stopPropagation(); goNext() }}
          />
        </>
      )}
    </div>
  )
}
