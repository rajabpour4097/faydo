import { WorkingHoursEntry } from '../services/api'

/** Saturday=0 … Friday=6 (matches backend WEEKDAY_CHOICES) */
export function getCurrentWeekday(): number {
  const jsDay = new Date().getDay() // 0=Sun … 6=Sat
  return jsDay === 6 ? 0 : jsDay + 1
}

export function formatTimeDisplay(time: string | null | undefined): string {
  if (!time) return '--:--'
  return time.slice(0, 5)
}

export function getTodaySchedule(schedule: WorkingHoursEntry[]): WorkingHoursEntry | null {
  const today = getCurrentWeekday()
  return schedule.find(d => d.weekday === today) ?? null
}

export function isBusinessOpenNow(schedule: WorkingHoursEntry[]): boolean {
  const today = getTodaySchedule(schedule)
  if (!today || today.is_closed) return false

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = formatTimeDisplay(today.start_time).split(':').map(Number)
  const [eh, em] = formatTimeDisplay(today.end_time).split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  return nowMinutes >= start && nowMinutes < end
}

export function getTodayHoursLabel(schedule: WorkingHoursEntry[]): string {
  const today = getTodaySchedule(schedule)
  if (!today) return 'نامشخص'
  if (today.is_closed) return 'تعطیل'
  return `${formatTimeDisplay(today.start_time)} - ${formatTimeDisplay(today.end_time)}`
}

export function openNavigationApps(lat: number, lng: number, label?: string) {
  const destination = `${lat},${lng}`
  const name = encodeURIComponent(label || 'مقصد')
  const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
  const waze = `https://waze.com/ul?ll=${destination}&navigate=yes`
  const neshan = `https://neshan.org/maps/routing/car/destination/${lng},${lat}`

  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
  if (isMobile) {
    window.open(googleMaps, '_blank')
  } else {
    window.open(googleMaps, '_blank')
  }

  void name
  void waze
  void neshan
}
