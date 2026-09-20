import moment from 'moment-jalaali'
import { BusinessTransaction } from '../../services/api'
import { MEMBERSHIP_TIERS } from '../../constants/membershipTiers'
import { faNum } from './businessHomeUtils'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

export const TX_PURPLE = '#7C5CFC'
export const TX_NAVY = '#1B1648'

export type TxStatus = 'all' | 'pending' | 'approved' | 'rejected'
export type TxPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export const STATUS_TABS: { id: TxStatus; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'approved', label: 'تایید شده' },
  { id: 'pending', label: 'در انتظار' },
  { id: 'rejected', label: 'رد شده' },
]

export const PERIOD_OPTIONS: { id: TxPeriod; label: string }[] = [
  { id: 'today', label: 'امروز' },
  { id: 'yesterday', label: 'دیروز' },
  { id: 'week', label: 'این هفته' },
  { id: 'month', label: 'این ماه' },
  { id: 'custom', label: 'بازه دلخواه' },
]

export const TYPE_OPTIONS = [
  { id: 'all', label: 'همه انواع' },
  { id: 'regular', label: 'عادی' },
  { id: 'elite_gift', label: 'هدیه ویژه' },
]

export const statusStyle: Record<Exclude<TxStatus, 'all'>, { label: string; wrap: string; dot: string }> = {
  approved: { label: 'تایید شده', wrap: 'bg-emerald-50 text-emerald-500', dot: 'bg-emerald-400' },
  pending: { label: 'در انتظار', wrap: 'bg-amber-50 text-amber-500', dot: 'bg-amber-400' },
  rejected: { label: 'رد شده', wrap: 'bg-rose-50 text-rose-500', dot: 'bg-rose-400' },
}

export const toFaDigits = (value: string | number) =>
  String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])

export const maskPhone = (phone?: string | null) => {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.length < 8) return phone || '—'
  return toFaDigits(`${digits.slice(0, 4)} *** ${digits.slice(-4)}`)
}

export const money = (value: string | number | null | undefined) => faNum(Math.round(Number(value || 0)))

export const percentLabel = (value: string | number | null | undefined) => `${faNum(Math.round(Number(value || 0)))}٪`

export const formatListTime = (iso: string) => {
  const date = moment(iso)
  const clock = toFaDigits(date.format('HH:mm'))
  if (date.isSame(moment(), 'day')) return `امروز ${clock}`
  if (date.isSame(moment().subtract(1, 'day'), 'day')) return `دیروز ${clock}`
  return `${toFaDigits(date.format('jD'))} ${date.format('jMMMM')} ${clock}`
}

export const formatDetailDate = (iso?: string | null) => {
  if (!iso) return '—'
  const date = moment(iso)
  return `${toFaDigits(date.format('jD'))} ${date.format('jMMMM')} ${toFaDigits(date.format('jYYYY'))} - ${toFaDigits(date.format('HH:mm'))}`
}

export const customerInitial = (name?: string) => (name || 'م').trim().charAt(0)

export const membershipInfo = (level?: BusinessTransaction['customer_membership_level']) =>
  MEMBERSHIP_TIERS[level || 'bronze']

export const benefitTitle = (tx: BusinessTransaction) => {
  const info = membershipInfo(tx.customer_membership_level)
  if (tx.transaction_type === 'elite_gift' && tx.elite_gift_title) {
    return `${info.label} — ${tx.elite_gift_title}`
  }
  if (tx.has_special_discount) {
    const title = tx.special_discount_title || 'تخفیف اختصاصی'
    return `${info.label} — ${percentLabel(tx.special_discount_percentage)} ${title}`
  }
  return `${info.label} — ${percentLabel(tx.discount_percentage)} تخفیف فایدو`
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
