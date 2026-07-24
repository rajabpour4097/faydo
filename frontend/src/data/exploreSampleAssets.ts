import cafeRoyalCover from '../assets/explore/samples/cafe-royal/cover.jpg'
import cafeRoyalLogo from '../assets/explore/samples/cafe-royal/logo.jpg'
import cafeRoyalHero from '../assets/explore/samples/cafe-royal/hero.png'

import burgerlandCover from '../assets/explore/samples/burgerland/cover.jpg'
import burgerlandLogo from '../assets/explore/samples/burgerland/logo.jpg'
import burgerlandHero from '../assets/explore/samples/burgerland/hero.png'

import bakeryCover from '../assets/explore/samples/bakery/cover.jpg'
import bakeryLogo from '../assets/explore/samples/bakery/logo.jpg'
import bakeryHero from '../assets/explore/samples/bakery/hero.png'

import medicalCover from '../assets/explore/samples/medical/cover.jpg'
import medicalLogo from '../assets/explore/samples/medical/logo.jpg'
import medicalHero from '../assets/explore/samples/medical/hero.png'

import beautyCover from '../assets/explore/samples/beauty/cover.jpg'
import beautyLogo from '../assets/explore/samples/beauty/logo.jpg'
import beautyHero from '../assets/explore/samples/beauty/hero.png'

import gymCover from '../assets/explore/samples/gym/cover.jpg'
import gymLogo from '../assets/explore/samples/gym/logo.jpg'
import gymHero from '../assets/explore/samples/gym/hero.png'

import salonCover from '../assets/explore/samples/salon/cover.jpg'
import salonLogo from '../assets/explore/samples/salon/logo.jpg'
import salonHero from '../assets/explore/samples/salon/hero.png'

import boutiqueCover from '../assets/explore/samples/boutique/cover.jpg'
import boutiqueLogo from '../assets/explore/samples/boutique/logo.jpg'
import boutiqueHero from '../assets/explore/samples/boutique/hero.png'

import petsCover from '../assets/explore/samples/pets/cover.jpg'
import petsLogo from '../assets/explore/samples/pets/logo.jpg'
import petsHero from '../assets/explore/samples/pets/hero.png'

import playgroundCover from '../assets/explore/samples/playground/cover.jpg'
import playgroundLogo from '../assets/explore/samples/playground/logo.jpg'
import playgroundHero from '../assets/explore/samples/playground/hero.png'

import cafeBookCover from '../assets/explore/samples/cafe-book/cover.jpg'
import cafeBookLogo from '../assets/explore/samples/cafe-book/logo.jpg'
import cafeBookHero from '../assets/explore/samples/cafe-book/hero.png'

import restaurantShamshadCover from '../assets/explore/samples/restaurant-shamshad/cover.jpg'
import restaurantShamshadLogo from '../assets/explore/samples/restaurant-shamshad/logo.jpg'
import restaurantShamshadHero from '../assets/explore/samples/restaurant-shamshad/hero.png'

export interface SampleAssetSet {
  cover: string
  logo: string
  hero: string
}

export const EXPLORE_SAMPLE_ASSETS: Record<string, SampleAssetSet> = {
  'cafe-royal': { cover: cafeRoyalCover, logo: cafeRoyalLogo, hero: cafeRoyalHero },
  burgerland: { cover: burgerlandCover, logo: burgerlandLogo, hero: burgerlandHero },
  bakery: { cover: bakeryCover, logo: bakeryLogo, hero: bakeryHero },
  medical: { cover: medicalCover, logo: medicalLogo, hero: medicalHero },
  beauty: { cover: beautyCover, logo: beautyLogo, hero: beautyHero },
  gym: { cover: gymCover, logo: gymLogo, hero: gymHero },
  salon: { cover: salonCover, logo: salonLogo, hero: salonHero },
  boutique: { cover: boutiqueCover, logo: boutiqueLogo, hero: boutiqueHero },
  pets: { cover: petsCover, logo: petsLogo, hero: petsHero },
  playground: { cover: playgroundCover, logo: playgroundLogo, hero: playgroundHero },
  'cafe-book': { cover: cafeBookCover, logo: cafeBookLogo, hero: cafeBookHero },
  'restaurant-shamshad': {
    cover: restaurantShamshadCover,
    logo: restaurantShamshadLogo,
    hero: restaurantShamshadHero,
  },
}

/** نگاشت شناسه نمونه به پوشه asset */
export const SAMPLE_ID_TO_ASSET_KEY: Record<number, string> = {
  [-1001]: 'cafe-royal',
  [-1002]: 'burgerland',
  [-1003]: 'bakery',
  [-1004]: 'medical',
  [-1005]: 'beauty',
  [-1006]: 'gym',
  [-1007]: 'salon',
  [-1008]: 'boutique',
  [-1009]: 'pets',
  [-1010]: 'playground',
  [-1011]: 'cafe-book',
  [-1012]: 'restaurant-shamshad',
}

export function getSampleAssets(pkgId: number): SampleAssetSet | undefined {
  const key = SAMPLE_ID_TO_ASSET_KEY[pkgId]
  return key ? EXPLORE_SAMPLE_ASSETS[key] : undefined
}
