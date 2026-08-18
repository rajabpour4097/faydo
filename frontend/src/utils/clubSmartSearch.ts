import Fuse from 'fuse.js'
import type { Package, PackageExperienceOffer } from '../services/api'

export const CLUB_SEARCH_SUGGESTION = 'امروز تولدمه، کجا برم؟'

export type SearchLevelTab = 'gold' | 'vip'

export interface ClubSearchHit {
  pkg: Package
  score: number
  matchedTab: SearchLevelTab
  matchedName?: string
  reasons: string[]
}

export interface ClubSearchResult {
  hits: ClubSearchHit[]
  intents: { id: string; label: string }[]
  mode: 'simple' | 'smart'
}

function normalize(value: string) {
  return value
    .replace(/\u200c/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const QUESTION_HINTS = [
  'کجا',
  'برم',
  'بریم',
  'میخوام',
  'می‌خوام',
  'پیشنهاد',
  'چی',
  'چه',
  'دنبال',
  'امروز',
  'شب',
  'مناسب',
  'میتونم',
  'می‌تونم',
  'کدوم',
]

interface SearchIntent {
  id: string
  label: string
  preferTab: SearchLevelTab
  triggers: string[]
  boostTerms: string[]
}

const INTENTS: SearchIntent[] = [
  {
    id: 'birthday',
    label: 'تولد و مناسبت',
    preferTab: 'vip',
    triggers: ['تولد', 'تولدمه', 'کیک', 'جشن', 'مناسبت', 'سورپرایز', 'روزخاص', 'birthday'],
    boostTerms: ['روز خاص من', 'کیک', 'تولد', 'دسر تولد', 'پک تولد'],
  },
  {
    id: 'welcome',
    label: 'خوشامدگویی',
    preferTab: 'gold',
    triggers: ['خوشامد', 'ورود', 'ولکام', 'welcome'],
    boostTerms: ['خوشامدگویی', 'ولکام', 'نوشیدنی'],
  },
  {
    id: 'gift',
    label: 'هدیه',
    preferTab: 'gold',
    triggers: ['هدیه', 'کادو', 'گیفت', 'یادگاری', 'gift'],
    boostTerms: ['هدیه کوچک', 'هدیه برند', 'کارت برند'],
  },
  {
    id: 'friend',
    label: 'دعوت از دوست',
    preferTab: 'vip',
    triggers: ['دوست', 'همراه', 'دونفره', 'دعوت'],
    boostTerms: ['دعوت از دوست', 'همراه', 'اشتراکی'],
  },
  {
    id: 'early',
    label: 'دسترسی زودتر',
    preferTab: 'vip',
    triggers: ['زودتر', 'اولویت', 'صف', 'نوبت', 'رزرو'],
    boostTerms: ['دسترسی زودتر', 'اولویت', 'رزرو'],
  },
  {
    id: 'taste',
    label: 'کافه و رستوران',
    preferTab: 'gold',
    triggers: ['کافه', 'قهوه', 'غذا', 'رستوران', 'دسر', 'شیرینی', 'نان', 'بیکری'],
    boostTerms: ['طعم', 'کافه', 'رستوران', 'شیرینی'],
  },
  {
    id: 'wellness',
    label: 'تندرستی و زیبایی',
    preferTab: 'gold',
    triggers: ['ماساژ', 'اسپا', 'زیبایی', 'پوست', 'دندان', 'ورزش', 'باشگاه', 'آرامش'],
    boostTerms: ['تندرستی', 'زیبایی', 'کلینیک', 'ورزش'],
  },
  {
    id: 'lifestyle',
    label: 'سبک زندگی',
    preferTab: 'gold',
    triggers: ['لباس', 'مزون', 'آرایش', 'پت', 'بازی', 'کودک', 'استایل'],
    boostTerms: ['سبک زندگی', 'مزون', 'آرایش', 'پت', 'بازی'],
  },
]

function packageText(pkg: Package) {
  const offers = [...(pkg.gold_experiences || []), ...(pkg.vip_experiences || [])]
  return normalize(
    [
      pkg.business_name,
      pkg.club_name,
      pkg.business_category?.name,
      pkg.business_description,
      pkg.business_address,
      pkg.city?.name,
      pkg.elite_gift_gift,
      pkg.elite_gift_title,
      ...offers.map(offer => `${offer.name} ${offer.description || ''}`),
    ]
      .filter(Boolean)
      .join(' '),
  )
}

function bestOffer(pkg: Package, preferTab: SearchLevelTab, terms: string[]) {
  const gold = pkg.gold_experiences?.[0]
  const vip = pkg.vip_experiences?.[0]
  const scoreOffer = (offer?: PackageExperienceOffer) => {
    if (!offer) return -1
    const blob = normalize(`${offer.name} ${offer.description || ''}`)
    return terms.reduce((sum, term) => sum + (blob.includes(term) ? 1 : 0), 0)
  }
  const goldScore = scoreOffer(gold)
  const vipScore = scoreOffer(vip)
  if (vipScore > goldScore) return { tab: 'vip' as const, offer: vip }
  if (goldScore > vipScore) return { tab: 'gold' as const, offer: gold }
  if (preferTab === 'vip' && vip) return { tab: 'vip' as const, offer: vip }
  if (gold) return { tab: 'gold' as const, offer: gold }
  if (vip) return { tab: 'vip' as const, offer: vip }
  return { tab: preferTab, offer: undefined }
}

function detectIntents(normalizedQuery: string) {
  return INTENTS.filter(intent => intent.triggers.some(trigger => normalizedQuery.includes(normalize(trigger))))
}

function isSmartQuery(normalizedQuery: string, tokens: string[], intents: SearchIntent[]) {
  if (intents.length > 0 && tokens.length >= 2) return true
  if (tokens.length >= 4) return true
  return QUESTION_HINTS.some(hint => normalizedQuery.includes(normalize(hint)))
}

export function searchClubBusinesses(query: string, packages: Package[]): ClubSearchResult {
  const raw = query.trim()
  const normalizedQuery = normalize(raw)
  if (!normalizedQuery) {
    return { hits: [], intents: [], mode: 'simple' }
  }

  const tokens = normalizedQuery.split(' ').filter(token => token.length >= 2)
  const intents = detectIntents(normalizedQuery)
  const mode = isSmartQuery(normalizedQuery, tokens, intents) ? 'smart' : 'simple'
  const expandTerms = [
    ...tokens,
    ...intents.flatMap(intent => intent.boostTerms.map(normalize)),
  ]
  const uniqueTerms = [...new Set(expandTerms.filter(Boolean))]
  const preferTab = intents[0]?.preferTab ?? 'gold'

  const fuse = new Fuse(packages, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.46,
    minMatchCharLength: 2,
    keys: [
      { name: 'business_name', weight: 0.35 },
      { name: 'club_name', weight: 0.12 },
      { name: 'business_category.name', weight: 0.12 },
      { name: 'city.name', weight: 0.06 },
      { name: 'business_address', weight: 0.05 },
      { name: 'gold_experiences.name', weight: 0.12 },
      { name: 'gold_experiences.description', weight: 0.08 },
      { name: 'vip_experiences.name', weight: 0.12 },
      { name: 'vip_experiences.description', weight: 0.08 },
      { name: 'elite_gift_gift', weight: 0.05 },
    ],
  })

  const fuseMap = new Map<number, number>()
  fuse.search(raw).forEach(result => {
    if (result.item?.id == null || result.score == null) return
    fuseMap.set(result.item.id, 1 - result.score)
  })

  const hits: ClubSearchHit[] = []

  packages.forEach(pkg => {
    const hay = packageText(pkg)
    let score = 0
    const reasons: string[] = []

    if (hay.includes(normalizedQuery)) {
      score += 90
      reasons.push('تطابق کامل عبارت')
    }

    tokens.forEach(token => {
      if (hay.includes(token)) score += 14
    })

    intents.forEach(intent => {
      const matchedBoost = intent.boostTerms.some(term => hay.includes(normalize(term)))
      const matchedTrigger = intent.triggers.some(term => hay.includes(normalize(term)))
      if (matchedBoost || matchedTrigger) {
        score += mode === 'smart' ? 70 : 28
        reasons.push(intent.label)
      }
    })

    const fuzzy = fuseMap.get(pkg.id) ?? 0
    if (fuzzy > 0.2) {
      score += Math.round(fuzzy * 50)
      reasons.push('جستجوی تقریبی')
    }

    if (score < (mode === 'simple' ? 14 : 28)) return

    const match = bestOffer(pkg, preferTab, uniqueTerms)
    hits.push({
      pkg,
      score,
      matchedTab: match.tab,
      matchedName: match.offer?.name,
      reasons: [...new Set(reasons)],
    })
  })

  hits.sort((a, b) => b.score - a.score)

  return {
    hits,
    intents: intents.map(intent => ({ id: intent.id, label: intent.label })),
    mode,
  }
}
