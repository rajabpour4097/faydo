import { Package, getFullImageUrl } from '../services/api'
import { isSamplePackage } from '../data/exploreSamplePackages'

export interface ExploreFilterState {
  categories: number[]
  sortBy: 'discount_high' | 'discount_low' | 'newest' | 'distance' | 'rating' | ''
  search: string
  cities: number[]
  selectedCityName: string | null
  exploreCategoryId: string | null
  hasGiftOnly: boolean
  nearMeOnly: boolean
  highRatedOnly: boolean
}

export const DEFAULT_EXPLORE_FILTERS: ExploreFilterState = {
  categories: [],
  sortBy: '',
  search: '',
  cities: [],
  selectedCityName: null,
  exploreCategoryId: null,
  hasGiftOnly: false,
  nearMeOnly: false,
  highRatedOnly: false,
}

export function hasActiveExploreFilters(filters: ExploreFilterState): boolean {
  return Boolean(
    filters.search ||
      filters.cities.length > 0 ||
      filters.selectedCityName ||
      filters.sortBy ||
      filters.hasGiftOnly ||
      filters.nearMeOnly ||
      filters.highRatedOnly ||
      filters.exploreCategoryId ||
      filters.categories.length > 0,
  )
}

export function isExploreCitySelected(
  filters: ExploreFilterState,
  cityId: number,
  cityName: string,
): boolean {
  return filters.cities[0] === cityId || filters.selectedCityName === cityName
}

export const EXPLORE_PREVIEW_LIMITS = {
  special: 3,
  nearYou: 4,
  trends: 4,
} as const

export type PackageWithDistance = {
  pkg: Package
  distanceKm: number | null
}

export function buildLogoUrl(pkg: Package): string {
  if (isSamplePackage(pkg)) return pkg.business_logo || ''
  return getFullImageUrl(pkg.business_logo)
}

export function buildCoverUrl(pkg: Package): string {
  if (isSamplePackage(pkg)) {
    return pkg.business_image || pkg.gallery_images?.[0] || pkg.business_logo || ''
  }
  return getFullImageUrl(pkg.business_image || pkg.gallery_images?.[0] || pkg.business_logo)
}

export function extractCategoriesFromPackages(pkgs: Package[]) {
  const categoryMap = new Map<number, { id: number; name: string }>()
  pkgs.forEach(pkg => {
    if (pkg.business_category?.id && pkg.business_category?.name) {
      categoryMap.set(pkg.business_category.id, {
        id: pkg.business_category.id,
        name: pkg.business_category.name,
      })
    }
  })
  return Array.from(categoryMap.values()).sort((a, b) => {
    try {
      return a.name.localeCompare(b.name, 'fa')
    } catch {
      return a.name.localeCompare(b.name)
    }
  })
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const r = Math.PI / 180
  const dLat = (lat2 - lat1) * r
  const dLng = (lng2 - lng1) * r
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} متر`
  return `${km.toFixed(1)} کیلومتر`
}

export function giftLabel(pkg: Package): string {
  if (pkg.elite_gift_gift) return pkg.elite_gift_gift
  if (pkg.elite_gift_title) return pkg.elite_gift_title
  if (pkg.discount_percentage) return `${pkg.discount_percentage}٪ تخفیف`
  if (pkg.specific_discount_title) return pkg.specific_discount_title
  return 'پیشنهاد ویژه'
}

export function attachDistance(
  packages: Package[],
  userPos: [number, number] | null,
): PackageWithDistance[] {
  return packages.map(pkg => {
    let distanceKm: number | null = null
    if (
      userPos &&
      pkg.business_location_latitude != null &&
      pkg.business_location_longitude != null
    ) {
      distanceKm = haversineKm(
        userPos[0],
        userPos[1],
        pkg.business_location_latitude,
        pkg.business_location_longitude,
      )
    } else if (isSamplePackage(pkg)) {
      distanceKm = 0.25 + (Math.abs(pkg.id) % 18) * 0.12
    }
    return { pkg, distanceKm }
  })
}

export function buildSpecialOffers(items: PackageWithDistance[]): PackageWithDistance[] {
  const withGift = items.filter(
    ({ pkg }) =>
      pkg.elite_gift_gift ||
      pkg.elite_gift_title ||
      (pkg.discount_percentage != null && pkg.discount_percentage > 0),
  )
  return withGift.length > 0 ? withGift : items
}

export function buildNearYou(items: PackageWithDistance[]): PackageWithDistance[] {
  return items
    .filter(({ distanceKm }) => distanceKm != null)
    .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
}

export function buildWeeklyTrends(items: PackageWithDistance[]): PackageWithDistance[] {
  return [...items].sort((a, b) => (b.pkg.average_rating || 0) - (a.pkg.average_rating || 0))
}

export function trendGrowth(pkg: Package): number {
  return 12 + (Math.abs(pkg.id * 7) % 20)
}

export type ExploreSectionSlug = 'special-offers' | 'near-you' | 'trends'

export const EXPLORE_SECTION_META: Record<
  ExploreSectionSlug,
  { title: string; defaultSort: ExploreFilterState['sortBy'] }
> = {
  'special-offers': { title: 'پیشنهادهای مخصوص شما', defaultSort: 'discount_high' },
  'near-you': { title: 'نزدیک شما', defaultSort: 'distance' },
  trends: { title: 'ترندهای هفته', defaultSort: 'rating' },
}

export function isExploreSectionSlug(value: string | undefined): value is ExploreSectionSlug {
  return value === 'special-offers' || value === 'near-you' || value === 'trends'
}
