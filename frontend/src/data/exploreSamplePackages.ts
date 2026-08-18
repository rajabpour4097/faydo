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

const SAMPLE_CLUB_BY_CATEGORY: Record<string, { club: string; gold: PackageExperienceOffer[]; vip: PackageExperienceOffer[] }> = {
  cafe: {
    club: 'باشگاه طعم‌ها',
    gold: [
      { id: -11, name: 'خوشامدگویی', description: 'نوشیدنی ولکام یا نان تازه کوچک' },
      { id: -12, name: 'هدیه کوچک', description: 'کوپن دسر بعدی یا کارت برند' },
      { id: -13, name: 'پیشنهاد اختصاصی', description: 'معرفی غذای روز یا نوشیدنی مخصوص فایدو' },
    ],
    vip: [
      { id: -21, name: 'روز خاص من', description: 'دسر یا کیک تولد رایگان با تزئین ویژه' },
      { id: -22, name: 'تجربه ویژه', description: 'سرو غذای شخصی‌سازی‌شده براساس سلیقه مشتری' },
    ],
  },
  restaurant: {
    club: 'باشگاه طعم‌ها',
    gold: [
      { id: -11, name: 'توجه ویژه', description: 'رزرو میز با ویو بهتر' },
      { id: -12, name: 'پیشنهاد اختصاصی', description: 'معرفی غذای روز فایدو' },
      { id: -14, name: 'امتیاز بازگشت', description: 'کارت دعوت برای دفعه بعد' },
    ],
    vip: [
      { id: -21, name: 'روز خاص من', description: 'کیک تولد ویژه' },
      { id: -23, name: 'دعوت از دوست', description: 'یک آیتم اشتراکی رایگان برای همراه' },
      { id: -24, name: 'هدیه برند', description: 'پک یادگاری برند رستوران' },
    ],
  },
  bakery: {
    club: 'باشگاه طعم‌ها',
    gold: [
      { id: -11, name: 'خوشامدگویی', description: 'نان تازه کوچک' },
      { id: -12, name: 'هدیه کوچک', description: 'استیکر یا کارت برند' },
    ],
    vip: [
      { id: -21, name: 'روز خاص من', description: 'دسر تولد رایگان' },
      { id: -25, name: 'دسترسی زودتر', description: 'اولویت رزرو در تایم‌های شلوغ' },
    ],
  },
  medical: {
    club: 'باشگاه تندرستی',
    gold: [
      { id: -31, name: 'خوشامدگویی', description: 'مشاوره اولیه یا ارزیابی رایگان' },
      { id: -32, name: 'توجه ویژه', description: 'پذیرش سریع‌تر در سالن انتظار' },
    ],
    vip: [
      { id: -41, name: 'تجربه ویژه', description: 'یک جلسه خدمات خاص' },
      { id: -42, name: 'روز خاص من', description: 'سرویس مخصوص تولد مشتری' },
    ],
  },
  beauty: {
    club: 'باشگاه تندرستی',
    gold: [
      { id: -31, name: 'هدیه کوچک', description: 'پک تست محصولات مراقبتی' },
      { id: -33, name: 'پیشنهاد اختصاصی', description: 'معرفی خدمت جدید مثل ماساژ' },
    ],
    vip: [
      { id: -41, name: 'دسترسی زودتر', description: 'رزرو اولویت‌دار در روزهای شلوغ' },
      { id: -43, name: 'هدیه برند', description: 'پک مراقبت با برند کلینیک' },
    ],
  },
  gym: {
    club: 'باشگاه تندرستی',
    gold: [
      { id: -31, name: 'خوشامدگویی', description: 'ارزیابی بدن رایگان' },
      { id: -34, name: 'امتیاز بازگشت', description: 'کارت نوبت بعد با تخفیف بیشتر' },
    ],
    vip: [
      { id: -44, name: 'دعوت از دوست', description: 'تمرین مشترک با همراه' },
      { id: -41, name: 'تجربه ویژه', description: 'یک جلسه خدمات خاص' },
    ],
  },
  salon: {
    club: 'باشگاه سبک زندگی',
    gold: [
      { id: -51, name: 'خوشامدگویی', description: 'پذیرایی خوش‌آمد با نوشیدنی' },
      { id: -52, name: 'توجه ویژه', description: 'نوبت‌دهی زودتر' },
    ],
    vip: [
      { id: -61, name: 'روز خاص من', description: 'استایل یا پک تولد اختصاصی' },
      { id: -62, name: 'تجربه ویژه', description: 'خدمات ویژه روز مشتری' },
    ],
  },
  boutique: {
    club: 'باشگاه سبک زندگی',
    gold: [
      { id: -51, name: 'هدیه کوچک', description: 'اکسسوری کوچک یا نمونه محصول' },
      { id: -53, name: 'پیشنهاد اختصاصی', description: 'معرفی محصول یا سبک جدید' },
    ],
    vip: [
      { id: -63, name: 'دسترسی زودتر', description: 'شرکت در پیش‌نمایش کالکشن' },
      { id: -64, name: 'هدیه برند', description: 'پک محصولات با برند فروشگاه' },
    ],
  },
  pets: {
    club: 'باشگاه سبک زندگی',
    gold: [
      { id: -51, name: 'خوشامدگویی', description: 'پذیرایی خوش‌آمد' },
      { id: -54, name: 'امتیاز بازگشت', description: 'کارت دعوت برای خدمات بعدی' },
    ],
    vip: [
      { id: -62, name: 'تجربه ویژه', description: 'خدمات ویژه روز مشتری' },
      { id: -65, name: 'دعوت از دوست', description: 'هدیه دوتایی برای مشتری و همراه' },
    ],
  },
  playground: {
    club: 'باشگاه سبک زندگی',
    gold: [
      { id: -51, name: 'توجه ویژه', description: 'نوبت‌دهی زودتر' },
      { id: -52, name: 'هدیه کوچک', description: 'کوپن یا نمونه محصول' },
    ],
    vip: [
      { id: -61, name: 'روز خاص من', description: 'تجربه ویژه تولد کودک' },
      { id: -63, name: 'دسترسی زودتر', description: 'رزرو نوبت خاص' },
    ],
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
    hasVip?: boolean
  },
): SampleExplorePackage {
  const assets = EXPLORE_SAMPLE_ASSETS[assetKey]
  if (!assets) throw new Error(`Missing assets for ${assetKey}`)
  const clubData = SAMPLE_CLUB_BY_CATEGORY[exploreCategoryId]
  const addressCity = opts.city ?? 'تهران'

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
    has_vip: true,
    has_vip_plus: opts.hasVip ?? true,
    gold_experiences: clubData?.gold ?? [],
    vip_experiences: clubData?.vip ?? [],
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
  sample(-1005, 'beauty', 'beauty', 'مراکز زیبایی', 'سالن زیبایی آرتمیس', {
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
  sample(-1009, 'pets', 'pets', 'پت شاپ', 'پت شاپ پاز', {
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
