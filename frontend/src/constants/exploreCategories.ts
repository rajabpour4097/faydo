import cafeIcon from '../assets/explore/categories/cafe.png'
import restaurantIcon from '../assets/explore/categories/restaurant.png'
import bakeryIcon from '../assets/explore/categories/bakery.png'
import medicalIcon from '../assets/explore/categories/medical.png'
import beautyIcon from '../assets/explore/categories/beauty.png'
import gymIcon from '../assets/explore/categories/gym.png'
import salonIcon from '../assets/explore/categories/salon.png'
import boutiqueIcon from '../assets/explore/categories/boutique.png'
import petsIcon from '../assets/explore/categories/pets.png'
import playgroundIcon from '../assets/explore/categories/playground.png'

export interface ExploreCategory {
  id: string
  name: string
  icon: string
  /** کلمات کلیدی برای تطبیق با نام دسته‌بندی‌های بک‌اند */
  keywords: string[]
}

/** ترتیب مطابق عکس (راست به چپ در RTL) — دو ردیف پنج‌تایی */
export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: 'cafe', name: 'کافه', icon: cafeIcon, keywords: ['کافه', 'قهوه', 'cafe', 'coffee'] },
  { id: 'restaurant', name: 'رستوران', icon: restaurantIcon, keywords: ['رستوران', 'restaurant', 'غذا'] },
  { id: 'bakery', name: 'شیرینی و بیکری', icon: bakeryIcon, keywords: ['شیرینی', 'بیکری', 'نان', 'bakery', 'شیرینی‌فروشی'] },
  { id: 'medical', name: 'کلینیک های درمانی', icon: medicalIcon, keywords: ['کلینیک', 'درمان', 'پزشکی', 'medical', 'سلامت'] },
  { id: 'beauty', name: 'مراکز زیبایی', icon: beautyIcon, keywords: ['زیبایی', 'آرایشی', 'beauty', 'اسپا'] },
  { id: 'gym', name: 'باشگاه ورزشی', icon: gymIcon, keywords: ['باشگاه', 'ورزش', 'gym', 'فیتنس'] },
  { id: 'salon', name: 'آرایشگاه', icon: salonIcon, keywords: ['آرایشگاه', 'مو', 'salon', 'آرایش'] },
  { id: 'boutique', name: 'مزون', icon: boutiqueIcon, keywords: ['مزون', 'بوتیک', 'لباس', 'boutique'] },
  { id: 'pets', name: 'پت شاپ', icon: petsIcon, keywords: ['پت', 'حیوان', 'pet'] },
  { id: 'playground', name: 'خانه های بازی', icon: playgroundIcon, keywords: ['بازی', 'کودک', 'playground', 'خانه بازی'] },
]

export function matchCategoryIds(
  exploreCat: ExploreCategory,
  available: { id: number; name: string }[],
): number[] {
  const ids: number[] = []
  for (const cat of available) {
    const name = (cat.name || '').toLowerCase()
    if (exploreCat.keywords.some(k => name.includes(k.toLowerCase()))) {
      ids.push(cat.id)
    }
  }
  return ids
}
