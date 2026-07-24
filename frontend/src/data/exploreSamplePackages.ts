import type { Package } from '../services/api'

/** وقتی تعداد کسب‌وکار واقعی به این عدد برسد، نمونه‌ها کاملاً حذف می‌شوند */
export const EXPLORE_SAMPLE_REAL_THRESHOLD = 12

export type SampleExplorePackage = Package & {
  is_sample: true
  explore_category_id: string
}

export function isSamplePackage(pkg: Package): pkg is SampleExplorePackage {
  return pkg.id < 0 || (pkg as SampleExplorePackage).is_sample === true
}

const now = new Date().toISOString()

function sample(
  id: number,
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
    image: string
    logo: string
    city?: string
    hasVip?: boolean
  },
): SampleExplorePackage {
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
    business_logo: opts.logo,
    business_image: opts.image,
    gallery_images: [opts.image],
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

/** منبع تصاویر: Unsplash (CDN عمومی) */
export const EXPLORE_SAMPLE_PACKAGES: SampleExplorePackage[] = [
  sample(-1001, 'cafe', 'کافه', 'کافه رویال', {
    gift: 'یک قهوه اسپرسو رایگان',
    discount: 15,
    rating: 4.8,
    lat: 35.7219,
    lng: 51.4247,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1514434783607-8bfd76313a8f?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1002, 'restaurant', 'رستوران', 'رستوران برگرلند', {
    gift: 'برگر دوبل رایگان',
    discount: 20,
    rating: 4.9,
    lat: 35.7589,
    lng: 51.4082,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop&q=80',
    hasVip: true,
  }),
  sample(-1003, 'bakery', 'شیرینی و بیکری', 'شیرینی سرای گلستان', {
    gift: 'یک جعبه شیرینی هدیه',
    discount: 10,
    rating: 4.7,
    lat: 35.6961,
    lng: 51.4231,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1004, 'medical', 'کلینیک درمانی', 'کلینیک دندانپزشکی نوین', {
    gift: 'معاینه رایگان',
    discount: 25,
    rating: 4.6,
    lat: 35.7342,
    lng: 51.3890,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1519494029934-5ba343e39b7?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1005, 'beauty', 'مراکز زیبایی', 'سالن زیبایی آرتemis', {
    gift: 'یک جلسه فیشیال رایگان',
    discount: 30,
    rating: 4.9,
    lat: 35.7745,
    lng: 51.3654,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1006, 'gym', 'باشگاه ورزشی', 'باشگاه فیت‌لند', {
    gift: 'یک جلسه بدنسازی رایگان',
    discount: 20,
    rating: 4.5,
    lat: 35.6892,
    lng: 51.3890,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1007, 'salon', 'آرایشگاه', 'آرایشگاه مردانه استایل', {
    gift: 'اصلاح و استایل رایگان',
    discount: 15,
    rating: 4.8,
    lat: 35.7156,
    lng: 51.4012,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba2459037ee?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3d1?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1008, 'boutique', 'مزون', 'مزون لباس زنانه نگار', {
    gift: '۱۵٪ تخفیف خرید اول',
    discount: 15,
    rating: 4.7,
    lat: 35.7421,
    lng: 51.3756,
    image: 'https://images.unsplash.com/photo-1483985988350-763728e4195b?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1009, 'pets', 'پت شاپ', 'پت شاپ پaws', {
    gift: 'یک بسته تشویقی هدیه',
    discount: 10,
    rating: 4.9,
    lat: 35.7012,
    lng: 51.3456,
    image: 'https://images.unsplash.com/photo-1450778868960-41d2201e8e87?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1010, 'playground', 'خانه بازی', 'خانه بازی کودک شاد', {
    gift: 'یک ساعت بازی رایگان',
    discount: 20,
    rating: 4.6,
    lat: 35.7654,
    lng: 51.4123,
    image: 'https://images.unsplash.com/photo-1566454544259-f4b0c8de4961?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1011, 'cafe', 'کافه', 'کافه کتاب و هنر', {
    gift: 'یک نوشیدنی گرم رایگان',
    discount: 12,
    rating: 4.4,
    lat: 35.6789,
    lng: 51.4123,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58220f8b?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&q=80',
  }),
  sample(-1012, 'restaurant', 'رستوران', 'رستوران سنتی شمشاد', {
    gift: 'یک پیش‌غذا رایگان',
    discount: 18,
    rating: 4.8,
    lat: 35.7312,
    lng: 51.4567,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=640&h=420&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&q=80',
    city: 'تهران',
  }),
]

/**
 * با افزایش تعداد کسب‌وکار واقعی، به‌ازای هر مورد جدید یک نمونه حذف می‌شود
 * تا وقتی که به EXPLORE_SAMPLE_REAL_THRESHOLD برسیم.
 */
export function mergeWithExploreSamples(realPackages: Package[]): Package[] {
  const real = realPackages.filter(p => !isSamplePackage(p))
  const samplesNeeded = Math.max(0, EXPLORE_SAMPLE_REAL_THRESHOLD - real.length)
  const samples = EXPLORE_SAMPLE_PACKAGES.slice(0, samplesNeeded)
  return [...real, ...samples]
}

export function sampleCountForReal(realCount: number): number {
  return Math.max(0, EXPLORE_SAMPLE_REAL_THRESHOLD - realCount)
}
