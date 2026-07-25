import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { CustomerFavoriteItem, Package } from '../services/api'
import { apiService } from '../services/api'
import { useAuth } from './AuthContext'
import { buildCoverUrl, buildLogoUrl, giftLabel } from '../utils/exploreHelpers'
import { isSamplePackage } from '../data/exploreSamplePackages'

export interface FavoriteBusiness {
  id: number
  packageId: number
  businessId: number
  businessName: string
  categoryName: string
  logoUrl: string
  coverUrl: string
  giftText: string
  rating?: number
  isSample: boolean
  addedAt: string
}

interface FavoritesContextType {
  favorites: FavoriteBusiness[]
  favoriteIds: Set<number>
  loading: boolean
  isFavorite: (packageId: number) => boolean
  toggleFavorite: (pkg: Package, e?: React.MouseEvent) => void
  removeFavorite: (packageId: number) => void
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

function legacyStorageKey(userId: number) {
  return `faydo_favorites_${userId}`
}

function mapApiFavorite(item: CustomerFavoriteItem): FavoriteBusiness {
  return {
    id: item.id,
    packageId: item.package_id,
    businessId: item.business_id,
    businessName: item.business_name,
    categoryName: item.category_name,
    logoUrl: item.logo_url,
    coverUrl: item.cover_url,
    giftText: item.gift_text,
    rating: item.rating ?? undefined,
    isSample: false,
    addedAt: item.added_at,
  }
}

function toLocalFavoriteEntry(pkg: Package): FavoriteBusiness {
  return {
    id: -Math.abs(pkg.id),
    packageId: pkg.id,
    businessId: pkg.business_id,
    businessName: pkg.business_name || 'کسب‌وکار',
    categoryName: pkg.business_category?.name || 'کسب‌وکار',
    logoUrl: buildLogoUrl(pkg),
    coverUrl: buildCoverUrl(pkg),
    giftText: giftLabel(pkg),
    rating: pkg.average_rating,
    isSample: isSamplePackage(pkg),
    addedAt: new Date().toISOString(),
  }
}

export function favoriteToPackage(fav: FavoriteBusiness): Package {
  const pkg = {
    id: fav.packageId,
    business_id: fav.businessId,
    business_name: fav.businessName,
    business_logo: fav.logoUrl,
    business_image: fav.coverUrl,
    business_category: { id: 0, name: fav.categoryName },
    elite_gift_gift: fav.giftText,
    average_rating: fav.rating,
    is_active: true,
    status: 'approved',
    is_complete: true,
    created_at: fav.addedAt,
    modified_at: fav.addedAt,
  } as Package
  if (fav.isSample) {
    ;(pkg as Package & { is_sample?: boolean }).is_sample = true
  }
  return pkg
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const migratedRef = useRef(false)

  const refreshFavorites = useCallback(async () => {
    if (user?.type !== 'customer' || !user.id) {
      setFavorites([])
      return
    }

    setLoading(true)
    try {
      const resp = await apiService.getCustomerFavorites()
      const serverItems = (resp.data ?? []).map(mapApiFavorite)
      setFavorites(prev => {
        const samples = prev.filter(f => f.isSample)
        const sampleIds = new Set(samples.map(f => f.packageId))
        const merged = [
          ...samples,
          ...serverItems.filter(f => !sampleIds.has(f.packageId)),
        ]
        return merged
      })

      if (!migratedRef.current) {
        migratedRef.current = true
        try {
          const raw = localStorage.getItem(legacyStorageKey(user.id))
          if (raw) {
            const legacy = JSON.parse(raw) as FavoriteBusiness[]
            if (Array.isArray(legacy)) {
              const serverPackageIds = new Set(serverItems.map(f => f.packageId))
              for (const item of legacy) {
                if (item.isSample || item.packageId <= 0) continue
                if (!serverPackageIds.has(item.packageId)) {
                  await apiService.addCustomerFavorite(item.packageId)
                }
              }
              localStorage.removeItem(legacyStorageKey(user.id))
              const refreshed = await apiService.getCustomerFavorites()
              if (refreshed.data) {
                setFavorites(prev => {
                  const samples = prev.filter(f => f.isSample)
                  const sampleIds = new Set(samples.map(f => f.packageId))
                  return [
                    ...samples,
                    ...refreshed.data!.map(mapApiFavorite).filter(
                      f => !sampleIds.has(f.packageId),
                    ),
                  ]
                })
              }
            }
          }
        } catch {
          // ignore legacy migration errors
        }
      }
    } catch {
      setFavorites(prev => prev.filter(f => f.isSample))
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.type])

  useEffect(() => {
    migratedRef.current = false
    if (user?.type === 'customer' && user.id) {
      refreshFavorites()
    } else {
      setFavorites([])
    }
  }, [user?.id, user?.type, refreshFavorites])

  const favoriteIds = useMemo(
    () => new Set(favorites.map(f => f.packageId)),
    [favorites],
  )

  const isFavorite = useCallback(
    (packageId: number) => favoriteIds.has(packageId),
    [favoriteIds],
  )

  const removeFavorite = useCallback(
    async (packageId: number) => {
      const target = favorites.find(f => f.packageId === packageId)
      if (!target) return

      setFavorites(prev => prev.filter(f => f.packageId !== packageId))

      if (target.isSample || target.id <= 0) return

      const resp = await apiService.removeCustomerFavorite(target.id)
      if (resp.error) {
        await refreshFavorites()
      }
    },
    [favorites, refreshFavorites],
  )

  const toggleFavorite = useCallback(
    (pkg: Package, e?: React.MouseEvent) => {
      e?.stopPropagation()

      if (isSamplePackage(pkg)) {
        if (favoriteIds.has(pkg.id)) {
          setFavorites(prev => prev.filter(f => f.packageId !== pkg.id))
        } else {
          setFavorites(prev => [
            toLocalFavoriteEntry(pkg),
            ...prev.filter(f => f.packageId !== pkg.id),
          ])
        }
        return
      }

      if (favoriteIds.has(pkg.id)) {
        void removeFavorite(pkg.id)
        return
      }

      const optimistic = toLocalFavoriteEntry(pkg)
      optimistic.id = 0
      optimistic.isSample = false
      setFavorites(prev => [optimistic, ...prev.filter(f => f.packageId !== pkg.id)])

      void (async () => {
        const resp = await apiService.addCustomerFavorite(pkg.id)
        if (resp.data) {
          setFavorites(prev => [
            mapApiFavorite(resp.data!),
            ...prev.filter(f => f.packageId !== pkg.id),
          ])
        } else {
          await refreshFavorites()
        }
      })()
    },
    [favoriteIds, removeFavorite, refreshFavorites],
  )

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      refreshFavorites,
    }),
    [favorites, favoriteIds, loading, isFavorite, toggleFavorite, removeFavorite, refreshFavorites],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}
