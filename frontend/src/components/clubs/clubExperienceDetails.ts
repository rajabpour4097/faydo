import type { ClubLevelTab, DetailItemIconKey } from './clubExperienceUtils'
import { findHomeExperience, sameExperience } from './clubExperienceUtils'
import heroWelcome from '../../assets/clubs/heroes/welcome.jpg'
import heroSmallGift from '../../assets/clubs/heroes/small-gift.jpg'
import heroAttention from '../../assets/clubs/heroes/attention.jpg'
import heroExclusive from '../../assets/clubs/heroes/exclusive.jpg'
import heroReturn from '../../assets/clubs/heroes/return.jpg'
import heroEarly from '../../assets/clubs/heroes/early.jpg'
import heroSpecial from '../../assets/clubs/heroes/special.jpg'
import heroBirthday from '../../assets/clubs/heroes/birthday.jpg'
import heroFriends from '../../assets/clubs/heroes/friends.jpg'
import heroBrandGift from '../../assets/clubs/heroes/brand-gift.jpg'

export interface ExperienceDetailItem {
  icon: DetailItemIconKey
  label: string
}

export interface ExperienceDetail {
  name: string
  tab: ClubLevelTab
  hero: string
  headline: string
  items: ExperienceDetailItem[]
}

export const EXPERIENCE_DETAILS: ExperienceDetail[] = [
  {
    name: 'خوشامدگویی',
    tab: 'gold',
    hero: heroWelcome,
    headline: 'اولین تجربه گرم ورود شما به کسب‌وکارهای فایدو',
    items: [
      { icon: 'coffee', label: 'نوشیدنی یا پذیرایی خوش‌آمد' },
      { icon: 'cake', label: 'نان تازه یا میان‌وعده کوچک' },
      { icon: 'star', label: 'راهنمایی میزبان در لحظه ورود' },
      { icon: 'clock', label: 'شروع سریع و بدون معطلی' },
    ],
  },
  {
    name: 'هدیه کوچک',
    tab: 'gold',
    hero: heroSmallGift,
    headline: 'یک یادگاری کوچک و دوست‌داشتنی از برند برای شما',
    items: [
      { icon: 'gift', label: 'یادگاری کوچک از برند' },
      { icon: 'tag', label: 'کوپن یا استیکر ویژه' },
      { icon: 'sparkle', label: 'نمونه محصول یا سوپرایز' },
      { icon: 'star', label: 'هدیه لحظه‌ای هنگام خرید' },
    ],
  },
  {
    name: 'توجه ویژه',
    tab: 'gold',
    hero: heroAttention,
    headline: 'جایگاه بهتر و پذیرایی خاص مخصوص اعضای فایدو',
    items: [
      { icon: 'star', label: 'رزرو میز یا جایگاه بهتر' },
      { icon: 'clock', label: 'پذیرش سریع‌تر از دیگران' },
      { icon: 'sparkle', label: 'خدمت اختصاصی میزبان' },
      { icon: 'coffee', label: 'فضای آرام‌تر و خاص‌تر' },
    ],
  },
  {
    name: 'پیشنهاد اختصاصی',
    tab: 'gold',
    hero: heroExclusive,
    headline: 'پیشنهادهایی که فقط برای اعضای فایدو چیده شده‌اند',
    items: [
      { icon: 'tag', label: 'پیشنهاد مخصوص فایدو' },
      { icon: 'cake', label: 'معرفی غذا یا محصول روز' },
      { icon: 'sparkle', label: 'انتخاب سفارشی برای شما' },
      { icon: 'star', label: 'تجربه متفاوت از منوی عادی' },
    ],
  },
  {
    name: 'امتیاز بازگشت',
    tab: 'gold',
    hero: heroReturn,
    headline: 'جایزه‌ای برای برگشتن دوباره و ادامه مسیر با فایدو',
    items: [
      { icon: 'return', label: 'امتیاز بیشتر برای مراجعه بعد' },
      { icon: 'gift', label: 'کارت دعوت بازگشت' },
      { icon: 'tag', label: 'تخفیف مراجعه بعدی' },
      { icon: 'clock', label: 'پاداش سریع در خرید بعد' },
    ],
  },
  {
    name: 'دسترسی زودتر',
    tab: 'vip',
    hero: heroEarly,
    headline: 'اولویت رزرو و ورود، قبل از دیگران',
    items: [
      { icon: 'clock', label: 'اولویت رزرو در ساعات شلوغ' },
      { icon: 'percent', label: 'ورود زودتر از دیگران' },
      { icon: 'star', label: 'نوبت یا تایم خاص' },
      { icon: 'sparkle', label: 'دسترسی پیش از عرضه عمومی' },
    ],
  },
  {
    name: 'تجربه ویژه',
    tab: 'vip',
    hero: heroSpecial,
    headline: 'تجربه‌های امضا و متفاوت هر کسب‌وکار برای شما',
    items: [
      { icon: 'sparkle', label: 'خدمت شخصی‌سازی‌شده' },
      { icon: 'star', label: 'تجربه امضای کسب‌وکار' },
      { icon: 'cake', label: 'جزئیات خاص و متفاوت' },
      { icon: 'gift', label: 'لحظه‌ای فراتر از خرید عادی' },
    ],
  },
  {
    name: 'روز خاص من',
    tab: 'vip',
    hero: heroBirthday,
    headline: 'تجربه‌های ویژه برای تولد و مناسبت‌های خاص شما',
    items: [
      { icon: 'cake', label: 'دسر یا کیک اختصاصی' },
      { icon: 'sparkle', label: 'تزیین میز و فضای ویژه' },
      { icon: 'gift', label: 'هدایای کوچک و سوپرایز' },
      { icon: 'clock', label: 'تخفیف یا امتیاز ویژه' },
    ],
  },
  {
    name: 'دعوت از دوست',
    tab: 'vip',
    hero: heroFriends,
    headline: 'تجربه دونفره با همراه و امتیاز برای هر دو',
    items: [
      { icon: 'people', label: 'تجربه دونفره با همراه' },
      { icon: 'gift', label: 'آیتم اشتراکی رایگان' },
      { icon: 'star', label: 'دعوت دوست به باشگاه' },
      { icon: 'percent', label: 'امتیاز برای شما و همراه' },
    ],
  },
  {
    name: 'هدیه برند',
    tab: 'vip',
    hero: heroBrandGift,
    headline: 'هدیه‌ای ویژه و یادگاری از برندهای منتخب فایدو',
    items: [
      { icon: 'gift', label: 'پک یادگاری برند' },
      { icon: 'sparkle', label: 'محصولات اختصاصی' },
      { icon: 'star', label: 'بسته‌بندی ویژه' },
      { icon: 'tag', label: 'سوغات کسب‌وکار برای شما' },
    ],
  },
]

export function findExperienceDetail(tab: ClubLevelTab, name: string): ExperienceDetail | undefined {
  const home = findHomeExperience(tab, name)
  return EXPERIENCE_DETAILS.find(
    item => item.tab === tab && sameExperience(item.name, home?.name || name),
  )
}
