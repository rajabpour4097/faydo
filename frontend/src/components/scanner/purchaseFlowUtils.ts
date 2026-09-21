import { toEnglishDigits } from '../../utils/digits'
import type { BusinessInfo } from '../../services/loyalty'

export const FLOW_PURPLE = '#7C5CFC'
export const FLOW_NAVY = '#1B1648'

export const RATING_POINTS = 30
export const COMMENT_POINTS = 20

export function parseToman(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  if (!value) return 0
  const digits = toEnglishDigits(String(value)).replace(/[^\d]/g, '')
  return parseInt(digits, 10) || 0
}

export function formatTomanInput(value: string | number): string {
  const num = parseToman(value)
  if (!num) return ''
  return num.toLocaleString('en-US')
}

export function formatTomanFa(value: string | number): string {
  return parseToman(value).toLocaleString('fa-IR')
}

export function calcPurchase(
  original: number,
  business: Pick<BusinessInfo, 'discount_all_percentage' | 'cashback_percentage' | 'is_first_purchase'>,
  cashbackUsed = 0,
) {
  const discountPct = Number(business.discount_all_percentage || 0)
  const cashbackPct = Number(business.cashback_percentage || 0)
  const discountAmount = Math.round(original * discountPct / 100)
  const afterDiscount = Math.max(0, original - discountAmount)
  const used = Math.min(Math.max(0, cashbackUsed), afterDiscount)
  const payable = Math.max(0, afterDiscount - used)
  const cashbackEarned = Math.round(afterDiscount * cashbackPct / 100)
  const basePts = business.is_first_purchase ? 30 : 10
  const points = basePts + Math.floor(payable * 0.0001)
  return {
    discountPct,
    cashbackPct,
    discountAmount,
    afterDiscount,
    used,
    payable,
    cashbackEarned,
    points,
  }
}
