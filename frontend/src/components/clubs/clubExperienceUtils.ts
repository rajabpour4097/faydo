import type { Package, PackageExperienceOffer } from '../../services/api'

export type ClubLevelTab = 'gold' | 'vip'

export type ExperienceIconKey =
  | 'welcome'
  | 'gift'
  | 'star'
  | 'tag'
  | 'return'
  | 'percent'
  | 'sparkle'
  | 'people'
  | 'brandGift'

export type DetailItemIconKey =
  | 'cake'
  | 'sparkle'
  | 'gift'
  | 'clock'
  | 'coffee'
  | 'star'
  | 'tag'
  | 'people'
  | 'percent'
  | 'return'

export type ExperienceTone = 'pink' | 'purple' | 'yellow'

export interface ClubHomeExperience {
  name: string
  description: string
  icon: ExperienceIconKey
  tone: ExperienceTone
}

export const GOLD_HOME_ITEMS: ClubHomeExperience[] = [
  { name: 'خوشامدگویی', description: 'اولین تجربه برای شما', icon: 'welcome', tone: 'pink' },
  { name: 'هدیه کوچک', description: 'یک هدیه ویژه برای شما', icon: 'gift', tone: 'purple' },
  { name: 'توجه ویژه', description: 'خدمت ویژه برای شما', icon: 'star', tone: 'yellow' },
  { name: 'پیشنهاد اختصاصی', description: 'پیشنهاد ویژه برای شما', icon: 'tag', tone: 'purple' },
  { name: 'امتیاز بازگشت', description: 'جایزه بازگشت شما', icon: 'return', tone: 'pink' },
]

export const VIP_HOME_ITEMS: ClubHomeExperience[] = [
  { name: 'دسترسی زودتر', description: 'دسترسی قبل از دیگران', icon: 'percent', tone: 'pink' },
  { name: 'تجربه ویژه', description: 'تجربه متفاوت و خاص', icon: 'sparkle', tone: 'purple' },
  { name: 'روز خاص من', description: 'مناسبت‌های خاص شما', icon: 'gift', tone: 'yellow' },
  { name: 'دعوت از دوست', description: 'دعوت دوستان و دریافت امتیاز', icon: 'people', tone: 'purple' },
  { name: 'هدیه برند', description: 'هدیه‌ای ویژه از برندها', icon: 'brandGift', tone: 'purple' },
]

export function normalizeClubName(name: string) {
  return name
    .replace(/\u200c/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, '')
}

export function sameExperience(a?: string, b?: string) {
  if (!a || !b) return false
  return normalizeClubName(a) === normalizeClubName(b)
}

export type ClubThemeKey = 'taste' | 'wellness' | 'lifestyle'

export function clubThemeKey(name?: string | null): ClubThemeKey {
  const n = normalizeClubName(name || '')
  if (n.includes('طعم') || n.includes('کافه') || n.includes('رستوران') || n.includes('بیکری') || n.includes('شیرینی')) {
    return 'taste'
  }
  if (
    n.includes('تندرست') ||
    n.includes('کلینیک') ||
    n.includes('زیبایی') ||
    n.includes('ورزش') ||
    n.includes('فیت') ||
    (n.includes('سلامت') && !n.includes('سبک'))
  ) {
    return 'wellness'
  }
  if (
    (n.includes('سبک') && n.includes('زندگی')) ||
    n.includes('آرایش') ||
    n.includes('مزون') ||
    n.includes('پت') ||
    n.includes('بازی')
  ) {
    return 'lifestyle'
  }
  return 'taste'
}

export function offersForTab(pkg: Package, tab: ClubLevelTab): PackageExperienceOffer[] {
  let list: PackageExperienceOffer[] = []
  if (tab === 'gold') {
    if (Array.isArray(pkg.gold_experiences)) list = pkg.gold_experiences
  } else if (Array.isArray(pkg.vip_experiences)) {
    list = pkg.vip_experiences
  }

  if (list.length === 0) {
    const wanted = tab === 'gold' ? 'VIP' : 'VIP+'
    list = (pkg.experiences || [])
      .filter(exp => exp.vip_experience_category?.vip_type === wanted)
      .map(exp => ({
        id: exp.vip_experience_category?.id ?? exp.id,
        name: exp.vip_experience_category?.name || '',
        description: exp.description || exp.vip_experience_category?.description || '',
      }))
      .filter(exp => exp.name)
  }

  return list.slice(0, 1)
}

export function countBusinessesForExperience(
  packages: Package[],
  tab: ClubLevelTab,
  name: string,
): number {
  const ids = new Set<number>()
  for (const pkg of packages) {
    if (!offersForTab(pkg, tab).some(offer => sameExperience(offer.name, name))) continue
    ids.add(pkg.business_id || pkg.id)
  }
  return ids.size
}

export function faNum(n: number) {
  return n.toLocaleString('fa-IR')
}

export function findHomeExperience(tab: ClubLevelTab, name: string): ClubHomeExperience | undefined {
  const items = tab === 'gold' ? GOLD_HOME_ITEMS : VIP_HOME_ITEMS
  return items.find(item => sameExperience(item.name, name))
}
