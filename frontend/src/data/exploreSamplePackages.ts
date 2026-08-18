import type { Package, PackageExperienceOffer } from '../services/api'
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

const G = {
  welcome: (description: string): PackageExperienceOffer => ({ id: -11, name: 'خوشامدگویی', description }),
  gift: (description: string): PackageExperienceOffer => ({ id: -12, name: 'هدیه کوچک', description }),
  attention: (description: string): PackageExperienceOffer => ({ id: -13, name: 'توجه ویژه', description }),
  exclusive: (description: string): PackageExperienceOffer => ({ id: -14, name: 'پیشنهاد اختصاصی', description }),
  returnScore: (description: string): PackageExperienceOffer => ({ id: -15, name: 'امتیاز بازگشت', description }),
}

const V = {
  early: (description: string): PackageExperienceOffer => ({ id: -21, name: 'دسترسی زودتر', description }),
  special: (description: string): PackageExperienceOffer => ({ id: -22, name: 'تجربه ویژه', description }),
  birthday: (description: string): PackageExperienceOffer => ({ id: -23, name: 'روز خاص من', description }),
  friend: (description: string): PackageExperienceOffer => ({ id: -24, name: 'دعوت از دوست', description }),
  brand: (description: string): PackageExperienceOffer => ({ id: -25, name: 'هدیه برند', description }),
}

const SAMPLE_CLUB_BY_CATEGORY: Record<string, { club: string; gold?: PackageExperienceOffer; vip?: PackageExperienceOffer }> = {
  cafe: {
    club: 'باشگاه طعم‌ها',
    gold: G.welcome('نوشیدنی ولکام یا نان تازه کوچک'),
    vip: V.birthday('دسر یا کیک تولد رایگان با تزئین ویژه'),
  },
  restaurant: {
    club: 'باشگاه طعم‌ها',
    gold: G.attention('رزرو میز با ویو بهتر'),
    vip: V.friend('یک آیتم اشتراکی رایگان برای همراه'),
  },
  bakery: {
    club: 'باشگاه طعم‌ها',
    gold: G.gift('نان تازه کوچک یا کارت برند'),
    vip: V.birthday('دسر تولد رایگان'),
  },
  medical: {
    club: 'باشگاه تندرستی',
    gold: G.welcome('مشاوره اولیه یا ارزیابی رایگان'),
    vip: V.special('یک جلسه خدمات خاص'),
  },
  beauty: {
    club: 'باشگاه تندرستی',
    gold: G.gift('پک تست محصولات مراقبتی'),
    vip: V.early('رزرو اولویت‌دار در روزهای شلوغ'),
  },
  gym: {
    club: 'باشگاه تندرستی',
    gold: G.returnScore('کارت نوبت بعد با تخفیف بیشتر'),
    vip: V.friend('تمرین مشترک با همراه'),
  },
  salon: {
    club: 'باشگاه سبک زندگی',
    gold: G.welcome('پذیرایی خوش‌آمد با نوشیدنی'),
    vip: V.birthday('استایل یا پک تولد اختصاصی'),
  },
  boutique: {
    club: 'باشگاه سبک زندگی',
    gold: G.exclusive('معرفی محصول یا سبک جدید'),
    vip: V.early('شرکت در پیش‌نمایش کالکشن'),
  },
  pets: {
    club: 'باشگاه سبک زندگی',
    gold: G.returnScore('کارت دعوت برای خدمات بعدی'),
    vip: V.special('خدمات ویژه روز مشتری'),
  },
  playground: {
    club: 'باشگاه سبک زندگی',
    gold: G.attention('نوبت‌دهی زودتر'),
    vip: V.brand('پک یادگاری خانه بازی'),
  },
}

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
    gold?: boolean
    vip?: boolean
  },
): SampleExplorePackage {
  const assets = EXPLORE_SAMPLE_ASSETS[assetKey]
  if (!assets) throw new Error(`Missing assets for ${assetKey}`)
  const clubData = SAMPLE_CLUB_BY_CATEGORY[exploreCategoryId]
  const addressCity = opts.city ?? 'تهران'
  const includeGold = opts.gold !== false
  const includeVip = opts.vip !== false

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
    total_comments: opts.comments ?? Math.floor(opts.rating * 36),
    business_logo: assets.logo,
    business_image: assets.cover,
    gallery_images: [assets.cover],
    promo_banner_image: assets.hero,
    business_location_latitude: opts.lat,
    business_location_longitude: opts.lng,
    business_category: { id: id - 9000, name: categoryName },
    city: { id: id - 8000, name: addressCity },
    business_address: `${addressCity} - خیابان دریا`,
    club_name: clubData?.club,
    has_vip: includeGold,
    has_vip_plus: includeVip,
    gold_experiences: includeGold && clubData?.gold ? [clubData.gold] : [],
    vip_experiences: includeVip && clubData?.vip ? [clubData.vip] : [],
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
    rating: 4.9,
    comments: 178,
    lat: 35.7219,
    lng: 51.4247,
    city: 'بابلسر',
    gold: true,
    vip: true,
  }),
  sample(-1002, 'burgerland', 'restaurant', 'رستوران', 'رستوران برگرلند', {
    gift: 'برگر دوبل رایگان',
    discount: 20,
    rating: 4.9,
    lat: 35.7589,
    lng: 51.4082,
    gold: true,
    vip: false,
  }),
  sample(-1003, 'bakery', 'bakery', 'شیرینی و بیکری', 'شیرینی سرای گلستان', {
    gift: 'یک جعبه شیرینی هدیه',
    discount: 10,
    rating: 4.7,
    lat: 35.6961,
    lng: 51.4231,
    gold: false,
    vip: true,
  }),
  sample(-1004, 'medical', 'medical', 'کلینیک درمانی', 'کلینیک دندانپزشکی نوین', {
    gift: 'معاینه رایگان',
    discount: 25,
    rating: 4.6,
    lat: 35.7342,
    lng: 51.3890,
    gold: true,
    vip: true,
  }),
  sample(-1005, 'beauty', 'beauty', 'مراکز زیبایی', 'سالن زیبایی آرتمیس', {
    gift: 'یک جلسه فیشیال رایگان',
    discount: 30,
    rating: 4.9,
    lat: 35.7745,
    lng: 51.3654,
    gold: true,
    vip: false,
  }),
  sample(-1006, 'gym', 'gym', 'باشگاه ورزشی', 'باشگاه فیت‌لند', {
    gift: 'یک جلسه بدنسازی رایگان',
    discount: 20,
    rating: 4.5,
    lat: 35.6892,
    lng: 51.3890,
    gold: false,
    vip: true,
  }),
  sample(-1007, 'salon', 'salon', 'آرایشگاه', 'آرایشگاه مردانه استایل', {
    gift: 'اصلاح و استایل رایگان',
    discount: 15,
    rating: 4.8,
    lat: 35.7156,
    lng: 51.4012,
    gold: true,
    vip: true,
  }),
  sample(-1008, 'boutique', 'boutique', 'مزون', 'مزون لباس زنانه نگار', {
    gift: '۱۵٪ تخفیف خرید اول',
    discount: 15,
    rating: 4.7,
    lat: 35.7421,
    lng: 51.3756,
    gold: true,
    vip: false,
  }),
  sample(-1009, 'pets', 'pets', 'پت شاپ', 'پت شاپ پاز', {
    gift: 'یک بسته تشویقی هدیه',
    discount: 10,
    rating: 4.9,
    lat: 35.7012,
    lng: 51.3456,
    gold: false,
    vip: true,
  }),
  sample(-1010, 'playground', 'playground', 'خانه بازی', 'خانه بازی کودک شاد', {
    gift: 'یک ساعت بازی رایگان',
    discount: 20,
    rating: 4.6,
    lat: 35.7654,
    lng: 51.4123,
    gold: true,
    vip: false,
  }),
  sample(-1011, 'cafe-book', 'cafe', 'کافه', 'کافه کتاب و هنر', {
    gift: 'یک نوشیدنی گرم رایگان',
    discount: 12,
    rating: 4.4,
    lat: 35.6789,
    lng: 51.4123,
    gold: true,
    vip: false,
  }),
  sample(-1012, 'restaurant-shamshad', 'restaurant', 'رستوران', 'رستوران سنتی شمشاد', {
    gift: 'یک پیش‌غذا رایگان',
    discount: 18,
    rating: 4.8,
    lat: 35.7312,
    lng: 51.4567,
    gold: false,
    vip: true,
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
