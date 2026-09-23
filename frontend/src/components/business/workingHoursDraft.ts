import { WorkingHoursEntry } from '../../services/api'

export interface WorkingHoursDraft {
  weekday: number
  weekday_display: string
  start_time: string
  end_time: string
  is_closed: boolean
}

export const WEEKDAY_LABELS: { weekday: number; weekday_display: string }[] = [
  { weekday: 0, weekday_display: 'شنبه' },
  { weekday: 1, weekday_display: 'یکشنبه' },
  { weekday: 2, weekday_display: 'دوشنبه' },
  { weekday: 3, weekday_display: 'سه‌شنبه' },
  { weekday: 4, weekday_display: 'چهارشنبه' },
  { weekday: 5, weekday_display: 'پنج‌شنبه' },
  { weekday: 6, weekday_display: 'جمعه' },
]

export function createDefaultSchedule(): WorkingHoursDraft[] {
  return WEEKDAY_LABELS.map((day) => ({
    ...day,
    start_time: '09:00',
    end_time: '22:00',
    is_closed: false,
  }))
}

export function scheduleFromApi(entries: WorkingHoursEntry[]): WorkingHoursDraft[] {
  const byDay = new Map(entries.map((entry) => [entry.weekday, entry]))
  return WEEKDAY_LABELS.map((day) => {
    const entry = byDay.get(day.weekday)
    if (!entry) {
      return { ...day, start_time: '09:00', end_time: '22:00', is_closed: false }
    }
    return {
      ...day,
      start_time: (entry.start_time || '09:00').slice(0, 5),
      end_time: (entry.end_time || '22:00').slice(0, 5),
      is_closed: !!entry.is_closed,
    }
  })
}

export function scheduleToPayload(schedule: WorkingHoursDraft[]) {
  return schedule.map((day) => ({
    weekday: day.weekday,
    start_time: day.is_closed ? null : day.start_time,
    end_time: day.is_closed ? null : day.end_time,
    is_closed: day.is_closed,
  }))
}

export function validateSchedule(schedule: WorkingHoursDraft[]): string | null {
  for (const day of schedule) {
    if (day.is_closed) continue
    if (!day.start_time || !day.end_time || day.start_time >= day.end_time) {
      return `ساعت شروع ${day.weekday_display} باید قبل از ساعت پایان باشد`
    }
  }
  return null
}
