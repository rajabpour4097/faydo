import { useEffect, useMemo, useState } from 'react'
import { apiService, Package } from '../services/api'
import {
  EXPLORE_CATEGORIES,
  matchCategoryIds,
} from '../constants/exploreCategories'
import { mergeWithExploreSamples, isSamplePackage } from '../data/exploreSamplePackages'
import {
  attachDistance,
  buildNearYou,
  buildSpecialOffers,
  buildWeeklyTrends,
  DEFAULT_EXPLORE_FILTERS,
  extractCategoriesFromPackages,
  ExploreFilterState,
  haversineKm,
  PackageWithDistance,
} from '../utils/exploreHelpers'

const defaultFilters: ExploreFilterState = DEFAULT_EXPLORE_FILTERS

export function useExplorePackages(initialFilters: Partial<ExploreFilterState> = {}) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [filters, setFilters] = useState<ExploreFilterState>({
    ...defaultFilters,
    ...initialFilters,
  })

  const availableCategories = useMemo(
    () => extractCategoriesFromPackages(packages),
    [packages],
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getPackages()
        let dataArray: Package[] = []
        if (Array.isArray(response.data)) {
          dataArray = response.data
        } else if (
          response.data &&
          Array.isArray((response.data as { results?: Package[] }).results)
        ) {
          dataArray = (response.data as { results: Package[] }).results
        } else if (response.error) {
          if (!cancelled) setError('خطا در دریافت پکیج‌ها')
          return
        }
        if (!cancelled) {
          const real = dataArray.filter(
            pkg => pkg.is_active && pkg.status === 'approved' && pkg.is_complete,
          )
          setPackages(mergeWithExploreSamples(real))
        }
      } catch (err) {
        console.error('Error loading packages:', err)
        if (!cancelled) {
          setPackages(mergeWithExploreSamples([]))
          setError(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [])

  const filteredPackages = useMemo(() => {
    let filtered = [...packages]

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter(
        pkg =>
          pkg.business_name?.toLowerCase().includes(term) ||
          pkg.elite_gift_title?.toLowerCase().includes(term) ||
          pkg.elite_gift_gift?.toLowerCase().includes(term) ||
          pkg.business_category?.name?.toLowerCase().includes(term),
      )
    }

    if (filters.exploreCategoryId) {
      const cat = EXPLORE_CATEGORIES.find(c => c.id === filters.exploreCategoryId)
      filtered = filtered.filter(pkg => {
        if (isSamplePackage(pkg)) {
          return pkg.explore_category_id === filters.exploreCategoryId
        }
        if (filters.categories.length > 0) {
          return pkg.business_category && filters.categories.includes(pkg.business_category.id)
        }
        if (cat) {
          const name = (pkg.business_category?.name || '').toLowerCase()
          return cat.keywords.some(k => name.includes(k.toLowerCase()))
        }
        return true
      })
    } else if (filters.categories.length > 0) {
      filtered = filtered.filter(
        pkg =>
          !isSamplePackage(pkg) &&
          pkg.business_category &&
          filters.categories.includes(pkg.business_category.id),
      )
    }

    if (filters.cities.length > 0) {
      filtered = filtered.filter(pkg => pkg.city && filters.cities.includes(pkg.city.id))
    } else if (filters.selectedCityName) {
      const cityTerm = filters.selectedCityName.toLowerCase()
      filtered = filtered.filter(pkg => pkg.city?.name?.toLowerCase().includes(cityTerm))
    }

    if (filters.hasGiftOnly) {
      filtered = filtered.filter(
        pkg =>
          pkg.elite_gift_gift ||
          pkg.elite_gift_title ||
          (pkg.discount_percentage != null && pkg.discount_percentage > 0),
      )
    }

    if (filters.highRatedOnly) {
      filtered = filtered.filter(pkg => (pkg.average_rating ?? 0) >= 4)
    }

    if (filters.nearMeOnly && userPos) {
      const NEARBY_KM = 5
      filtered = filtered.filter(pkg => {
        if (isSamplePackage(pkg)) return true
        if (
          pkg.business_location_latitude == null ||
          pkg.business_location_longitude == null
        ) {
          return false
        }
        return (
          haversineKm(
            userPos[0],
            userPos[1],
            pkg.business_location_latitude,
            pkg.business_location_longitude,
          ) <= NEARBY_KM
        )
      })
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'discount_high':
          filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
          break
        case 'discount_low':
          filtered.sort((a, b) => (a.discount_percentage || 0) - (b.discount_percentage || 0))
          break
        case 'newest':
          filtered.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          break
        case 'rating':
          filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
          break
        case 'distance':
          filtered.sort((a, b) => {
            const da =
              a.business_location_latitude != null && userPos
                ? Math.abs(a.business_location_latitude - userPos[0])
                : 999
            const db =
              b.business_location_latitude != null && userPos
                ? Math.abs(b.business_location_latitude - userPos[0])
                : 999
            return da - db
          })
          break
      }
    }

    return filtered
  }, [packages, filters, userPos])

  const packagesWithDistance = useMemo(
    () => attachDistance(filteredPackages, userPos),
    [filteredPackages, userPos],
  )

  const specialOffers = useMemo(
    () => buildSpecialOffers(packagesWithDistance),
    [packagesWithDistance],
  )

  const nearYou = useMemo(() => buildNearYou(packagesWithDistance), [packagesWithDistance])

  const weeklyTrends = useMemo(
    () => buildWeeklyTrends(packagesWithDistance),
    [packagesWithDistance],
  )

  return {
    packages,
    loading,
    error,
    userPos,
    filters,
    setFilters,
    availableCategories,
    packagesWithDistance,
    specialOffers,
    nearYou,
    weeklyTrends,
  }
}

export type { PackageWithDistance }
