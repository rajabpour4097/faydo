import type { Package } from '../services/api'
import { EXPLORE_SAMPLE_ASSETS } from './exploreSampleAssets'

/** وقتی تعداد کسب‌وکار واقعی به این عدد برسد، نمونه‌ها کاملاً حذف می‌شوند */
export const EXPLORE_SAMPLE_REAL_THRESHOLD = 12

export type SampleExplorePackage = Package & {
  is_sample: true
  explore_category_id: string
  promo_banner_image?: string
}

export function isSamplePackage(pkg: Package): pkg is SampleExplorePackage {
  return pkg.id < 0 || (pkg as SampleExplorePackage).is_sample === true
}

const now = new Date().toISOString()

function sample(
  id: number,
  assetKey: string,
  exploreCategoryId: string,
  categoryName: string,
  businessName: string,
  opts: {
    gift: string
    discount?: number
    rating: number
    comments?: number
    lat: number
    lng: number
    city?: string
    hasVip?: boolean
  },
): SampleExplorePackage {
  const assets = EXPLORE_SAMPLE_ASSETS[assetKey]
  if (!assets) throw new Error(`Missing assets for ${assetKey}`)

  return {
    id,
    business_id: id,
    business_name: businessName,
    is_active: true,
    status: 'approved',
    status_display: 'تایید شده',
    is_complete: true,
    created_at: now,
    modified_at: now,
    discount_percentage: opts.discount ?? 0,
    elite_gift_gift: opts.gift,
    elite_gift_title: opts.gift,
    average_rating: opts.rating,
    total_comments: opts.comments ?? Math.floor(opts.rating * 18),
    business_logo: assets.logo,
    business_image: assets.cover,
    gallery_images: [assets.cover],
    promo_banner_image: assets.hero,
    business_location_latitude: opts.lat,
    business_location_longitude: opts.lng,
    business_category: { id: id - 9000, name: categoryName },
    city: { id: id - 8000, name: opts.city ?? 'تهران' },
    has_vip: opts.hasVip ?? false,
    has_vip_plus: false,
    days_remaining: 45,
    is_sample: true,
    explore_category_id: exploreCategoryId,
  }
}

/** کسب‌وکارهای نمونه با تصاویر محلی */
export const EXPLORE_SAMPLE_PACKAGES: SampleExplorePackage[] = [
  sample(-1001, 'cafe-royal', 'cafe', 'کافه', 'کافه رویال', {
    gift: 'یک قهوه اسپرسو رایگان',
    discount: 15,
    rating: 4.8,
    lat: 35.7219,
    lng: 51.4247,
  }),
  sample(-1002, 'burgerland', 'restaurant', 'رستوران', 'رستوران برگرلند', {
    gift: 'برگر دوبل رایگان',
    discount: 20,
    rating: 4.9,
    lat: 35.7589,
    lng: 51.4082,
    hasVip: true,
  }),
  sample(-1003, 'bakery', 'bakery', 'شیرینی و بیکری', 'شیرینی سرای گلستان', {
    gift: 'یک جعبه شیرینی هدیه',
    discount: 10,
    rating: 4.7,
    lat: 35.6961,
    lng: 51.4231,
  }),
  sample(-1004, 'medical', 'medical', 'کلینیک درمانی', 'کلینیک دندانپزشکی نوین', {
    gift: 'معاینه رایگان',
    discount: 25,
    rating: 4.6,
    lat: 35.7342,
    lng: 51.3890,
  }),
  sample(-1005, 'beauty', 'beauty', 'مراکز زیبایی', 'سالن زیبایی آرتemis', {
    gift: 'یک جلسه فیشیال رایگان',
    discount: 30,
    rating: 4.9,
    lat: 35.7745,
    lng: 51.3654,
  }),
  sample(-1006, 'gym', 'gym', 'باشگاه ورزشی', 'باشگاه فیت‌لند', {
    gift: 'یک جلسه بدنسازی رایگان',
    discount: 20,
    rating: 4.5,
    lat: 35.6892,
    lng: 51.3890,
  }),
  sample(-1007, 'salon', 'salon', 'آرایشگاه', 'آرایشگاه مردانه استایل', {
    gift: 'اصلاح و استایل رایگان',
    discount: 15,
    rating: 4.8,
    lat: 35.7156,
    lng: 51.4012,
  }),
  sample(-1008, 'boutique', 'boutique', 'مزون', 'مزون لباس زنانه نگار', {
    gift: '۱۵٪ تخفیف خرید اول',
    discount: 15,
    rating: 4.7,
    lat: 35.7421,
    lng: 51.3756,
  }),
  sample(-1009, 'pets', 'pets', 'پت شاپ', 'پت شاپ پaws', {
    gift: 'یک بسته تشویقی هدیه',
    discount: 10,
    rating: 4.9,
    lat: 35.7012,
    lng: 51.3456,
  }),
  sample(-1010, 'playground', 'playground', 'خانه بازی', 'خانه بازی کودک شاد', {
    gift: 'یک ساعت بازی رایگان',
    discount: 20,
    rating: 4.6,
    lat: 35.7654,
    lng: 51.4123,
  }),
  sample(-1011, 'cafe-book', 'cafe', 'کافه', 'کافه کتاب و هنر', {
    gift: 'یک نوشیدنی گرم رایگان',
    discount: 12,
    rating: 4.4,
    lat: 35.6789,
    lng: 51.4123,
  }),
  sample(-1012, 'restaurant-shamshad', 'restaurant', 'رستوران', 'رستوران سنتی شمشاد', {
    gift: 'یک پیش‌غذا رایگان',
    discount: 18,
    rating: 4.8,
    lat: 35.7312,
    lng: 51.4567,
  }),
]

export function mergeWithExploreSamples(realPackages: Package[]): Package[] {
  const real = realPackages.filter(p => !isSamplePackage(p))
  const samplesNeeded = Math.max(0, EXPLORE_SAMPLE_REAL_THRESHOLD - real.length)
  const samples = EXPLORE_SAMPLE_PACKAGES.slice(0, samplesNeeded)
  return [...real, ...samples]
}

export function sampleCountForReal(realCount: number): number {
  return Math.max(0, EXPLORE_SAMPLE_REAL_THRESHOLD - realCount)
}

export { SAMPLE_ID_TO_ASSET_KEY, getSampleAssets } from './exploreSampleAssets'
