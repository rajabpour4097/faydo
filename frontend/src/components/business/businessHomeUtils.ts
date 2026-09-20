export const HOME_PURPLE = '#7C5CFC'
export const HOME_TEAL = '#2DD4BF'

export const faNum = (n: number | string) => {
  const value = typeof n === 'string' ? Number(n) : n
  if (!Number.isFinite(value)) return String(n)
  return value.toLocaleString('fa-IR')
}

export const faSignedPct = (n: number) => {
  const rounded = Math.round(n)
  const abs = faNum(Math.abs(rounded))
  if (rounded > 0) return `+${abs}٪`
  if (rounded < 0) return `−${abs}٪`
  return `${abs}٪`
}

export const todayLabel = () => {
  const formatted = new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  return `امروز ${formatted}`
}

export const formatToman = (n: number) => `${faNum(Math.round(n))} تومان`

export const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${faNum(Math.round(n / 1_000_000))}M`
  if (n >= 1_000) return `${faNum(Math.round(n / 1_000))}K`
  return faNum(Math.round(n))
}
