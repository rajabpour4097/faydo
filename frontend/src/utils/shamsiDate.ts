import moment from 'moment-jalaali'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, digit => FA_DIGITS[Number(digit)] ?? digit)
}

function asMoment(value?: string | Date | null) {
  if (value == null || value === '') return null
  const date = moment(value)
  return date.isValid() ? date : null
}

/** Absolute Shamsi date, e.g. ۷ مهر ۱۴۰۵ */
export function formatShamsiDate(value?: string | Date | null) {
  const date = asMoment(value)
  if (!date) return '—'
  return `${toFaDigits(date.format('jD'))} ${date.format('jMMMM')} ${toFaDigits(date.format('jYYYY'))}`
}

/** Shamsi date with clock, e.g. ۷ مهر ۱۴۰۵ - ۱۸:۴۰ */
export function formatShamsiDateTime(value?: string | Date | null) {
  const date = asMoment(value)
  if (!date) return '—'
  return `${formatShamsiDate(date.toDate())} - ${toFaDigits(date.format('HH:mm'))}`
}

/** Day and month only, e.g. ۷ مهر */
export function formatShamsiDayMonth(value?: string | Date | null) {
  const date = asMoment(value)
  if (!date) return '—'
  return `${toFaDigits(date.format('jD'))} ${date.format('jMMMM')}`
}

/** Today, yesterday, recent relative text, otherwise a Shamsi date. */
export function formatRelativeShamsi(value?: string | Date | null) {
  const date = asMoment(value)
  if (!date) return '—'
  const days = moment().startOf('day').diff(date.clone().startOf('day'), 'days')
  if (days <= 0) return 'امروز'
  if (days === 1) return 'دیروز'
  if (days < 7) return `${toFaDigits(days)} روز پیش`
  return formatShamsiDate(date.toDate())
}

export function shamsiYear() {
  return toFaDigits(moment().format('jYYYY'))
}

/**
 * `sales_series.day` is the day number inside the current Gregorian month.
 * Show that calendar day as a Shamsi day and month.
 */
export function formatShamsiFromGregorianMonthDay(day: number) {
  if (!Number.isFinite(day) || day < 1) return '—'
  const now = moment()
  const date = moment({ year: now.year(), month: now.month(), date: day })
  if (!date.isValid()) return toFaDigits(day)
  return formatShamsiDayMonth(date.toDate())
}
