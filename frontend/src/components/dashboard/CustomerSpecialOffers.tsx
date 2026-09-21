import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { apiService, getFullImageUrl, Package } from '../../services/api'
import { isSamplePackage } from '../../data/exploreSamplePackages'
import { giftLabel } from '../../utils/exploreHelpers'

const DISPLAY_LIMIT = 3

const CARD_THEMES = [
  {
    lightBg: 'bg-gradient-to-r from-primary-50 to-primary-100',
    lightBorder: 'border-primary-200',
  },
  {
    lightBg: 'bg-gradient-to-r from-success-50 to-success-100',
    lightBorder: 'border-success-200',
  },
  {
    lightBg: 'bg-gradient-to-r from-accent-50 to-accent-100',
    lightBorder: 'border-accent-200',
  },
] as const

function categoryEmoji(categoryName?: string): string {
  const name = (categoryName || '').toLowerCase()
  if (['کافه', 'قهوه', 'cafe', 'coffee'].some(k => name.includes(k))) return '☕'
  if (['رستوران', 'restaurant', 'غذا'].some(k => name.includes(k))) return '🍽️'
  if (['شیرینی', 'بیکری', 'نان', 'bakery'].some(k => name.includes(k))) return '🥐'
  if (['کلینیک', 'درمان', 'پزشک', 'medical'].some(k => name.includes(k))) return '🏥'
  if (['زیبایی', 'beauty', 'اسپا'].some(k => name.includes(k))) return '💅'
  if (['باشگاه', 'ورزش', 'gym', 'فیتنس'].some(k => name.includes(k))) return '🏋️'
  if (['آرایش', 'مو', 'salon'].some(k => name.includes(k))) return '💇'
  if (['مزون', 'بوتیک', 'لباس', 'boutique'].some(k => name.includes(k))) return '👗'
  if (['پت', 'حیوان', 'pet'].some(k => name.includes(k))) return '🐾'
  if (['بازی', 'کودک', 'playground'].some(k => name.includes(k))) return '🎠'
  if (['vip', 'طلایی'].some(k => name.includes(k))) return '👑'
  return '🎁'
}

function isLivePackage(pkg: Package): boolean {
  return (
    pkg.id > 0 &&
    !isSamplePackage(pkg) &&
    pkg.is_active &&
    pkg.status === 'approved' &&
    pkg.is_complete
  )
}

function isSpecialOffer(pkg: Package): boolean {
  return Boolean(
    pkg.elite_gift_gift ||
      pkg.elite_gift_title ||
      (pkg.discount_percentage != null && pkg.discount_percentage > 0) ||
      (pkg.specific_discount_percentage != null && pkg.specific_discount_percentage > 0) ||
      pkg.specific_discount_title,
  )
}

function offerStrength(pkg: Package): number {
  return Math.max(
    pkg.discount_percentage || 0,
    pkg.specific_discount_percentage || 0,
  )
}

function pickSpecialOffers(packages: Package[], limit: number): Package[] {
  const live = packages.filter(isLivePackage)
  const withOffer = live.filter(isSpecialOffer)
  const source = withOffer.length > 0 ? withOffer : live
  return [...source].sort((a, b) => {
    const discountDiff = offerStrength(b) - offerStrength(a)
    if (discountDiff !== 0) return discountDiff
    return (b.average_rating || 0) - (a.average_rating || 0)
  }).slice(0, limit)
}

function offerSubtitle(pkg: Package): string {
  if (pkg.specific_discount_description) {
    return pkg.specific_discount_description
  }
  const parts = [pkg.business_name, pkg.business_category?.name].filter(Boolean)
  return parts.join(' · ')
}

function OfferIcon({ pkg }: { pkg: Package }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const logo = getFullImageUrl(pkg.business_logo || pkg.business_image)

  if (logo && !logoFailed) {
    return (
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/80 flex-shrink-0 mr-3">
        <img
          src={logo}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setLogoFailed(true)}
        />
      </div>
    )
  }

  return <div className="text-3xl mr-3 flex-shrink-0">{categoryEmoji(pkg.business_category?.name)}</div>
}

interface CustomerSpecialOffersProps {
  compact?: boolean
}

export function CustomerSpecialOffers({ compact = true }: CustomerSpecialOffersProps) {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOffers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getPackages()
      if (response.error && !response.data) {
        setError(response.error)
        setOffers([])
        return
      }

      const packages = Array.isArray(response.data) ? response.data : []
      setOffers(pickSpecialOffers(packages, DISPLAY_LIMIT))
    } catch {
      setError('خطا در بارگذاری پیشنهادها')
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.25)'
    : '0 10px 30px rgba(15, 23, 42, 0.06)'
  const padding = compact ? 'p-5' : 'p-6'

  return (
    <div
      className={`rounded-[24px] ${padding} ${isDark ? 'bg-slate-800' : 'bg-white'}`}
      style={{ boxShadow: cardShadow }}
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          پیشنهادهای ویژه برای شما
        </h3>
        <Link
          to="/dashboard/explore/special-offers"
          className={`text-xs font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}
        >
          مشاهده همه
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map(key => (
            <div
              key={key}
              className={`h-[72px] rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            type="button"
            onClick={loadOffers}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 text-white"
          >
            تلاش مجدد
          </button>
        </div>
      ) : offers.length === 0 ? (
        <p
          className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
        >
          در حال حاضر پیشنهاد ویژه‌ای موجود نیست
        </p>
      ) : (
        <div className="space-y-3">
          {offers.map((pkg, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length]
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => navigate(`/dashboard/business/${pkg.id}`)}
                className={`w-full text-right p-4 rounded-xl border transition-transform active:scale-[0.99] ${
                  isDark
                    ? 'bg-slate-700 border-slate-600'
                    : `${theme.lightBg} ${theme.lightBorder}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-bold text-sm mb-1 truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {giftLabel(pkg)}
                    </h4>
                    <p
                      className={`text-xs truncate ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      {offerSubtitle(pkg)}
                    </p>
                  </div>
                  <OfferIcon pkg={pkg} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
