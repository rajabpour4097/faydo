import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { Package } from '../services/api'
import { apiService } from '../services/api'
import { useAuth } from './AuthContext'
import { buildCoverUrl, buildLogoUrl, giftLabel } from '../utils/exploreHelpers'
import { isSamplePackage } from '../data/exploreSamplePackages'

export interface FavoriteBusiness {
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
  isFavorite: (packageId: number) => boolean
  toggleFavorite: (pkg: Package, e?: React.MouseEvent) => void
  removeFavorite: (packageId: number) => void
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

function storageKey(userId: number) {
  return `faydo_favorites_${userId}`
}

function loadFavorites(userId: number): FavoriteBusiness[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveFavorites(userId: number, items: FavoriteBusiness[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(items))
}

function toFavoriteEntry(pkg: Package): FavoriteBusiness {
  return {
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
    ;(pkg as Package & { is_sample?: boolean; explore_category_id?: string }).is_sample = true
  }
  return pkg
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([])

  useEffect(() => {
    if (user?.type === 'customer' && user.id) {
      setFavorites(loadFavorites(user.id))
    } else {
      setFavorites([])
    }
  }, [user?.id, user?.type])

  const persist = useCallback(
    (next: FavoriteBusiness[]) => {
      setFavorites(next)
      if (user?.type === 'customer' && user.id) {
        saveFavorites(user.id, next)
      }
    },
    [user?.id, user?.type],
  )

  const favoriteIds = useMemo(
    () => new Set(favorites.map(f => f.packageId)),
    [favorites],
  )

  const isFavorite = useCallback(
    (packageId: number) => favoriteIds.has(packageId),
    [favoriteIds],
  )

  const removeFavorite = useCallback(
    (packageId: number) => {
      persist(favorites.filter(f => f.packageId !== packageId))
    },
    [favorites, persist],
  )

  const toggleFavorite = useCallback(
    (pkg: Package, e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (favoriteIds.has(pkg.id)) {
        removeFavorite(pkg.id)
        return
      }

      const entry = toFavoriteEntry(pkg)
      persist([entry, ...favorites.filter(f => f.packageId !== pkg.id)])

      if (!isSamplePackage(pkg) && pkg.business_id) {
        apiService.awardFavoriteBusiness(pkg.business_id).catch(() => {})
      }
    },
    [favoriteIds, favorites, persist, removeFavorite],
  )

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      removeFavorite,
    }),
    [favorites, favoriteIds, isFavorite, toggleFavorite, removeFavorite],
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
