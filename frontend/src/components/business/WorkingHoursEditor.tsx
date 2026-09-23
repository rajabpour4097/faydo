import { WorkingHoursDraft } from './workingHoursDraft'

interface WorkingHoursEditorProps {
  schedule: WorkingHoursDraft[]
  onChange: (schedule: WorkingHoursDraft[]) => void
}

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'))

function Time24Field({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [rawHour = '09', rawMinute = '00'] = (value || '09:00').slice(0, 5).split(':')
  const hour = HOURS.includes(rawHour) ? rawHour : '09'
  const minute = /^\d{2}$/.test(rawMinute) ? rawMinute : '00'

  return (
    <div className="flex items-center gap-1" dir="ltr">
      <select
        aria-label="ساعت"
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="min-w-0 flex-1 px-1 py-2 border border-gray-200 rounded-lg bg-white text-sm text-center tabular-nums"
      >
        {HOURS.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <span className="text-gray-400 font-bold">:</span>
      <select
        aria-label="دقیقه"
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="min-w-0 flex-1 px-1 py-2 border border-gray-200 rounded-lg bg-white text-sm text-center tabular-nums"
      >
        {MINUTES.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  )
}

export const WorkingHoursEditor = ({ schedule, onChange }: WorkingHoursEditorProps) => {
  const updateDay = (weekday: number, patch: Partial<WorkingHoursDraft>) => {
    onChange(schedule.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)))
  }

  return (
    <div className="space-y-2">
      {schedule.map((day) => (
        <div
          key={day.weekday}
          className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">{day.weekday_display}</span>
            <button
              type="button"
              onClick={() => updateDay(day.weekday, { is_closed: !day.is_closed })}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                day.is_closed
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              {day.is_closed ? 'تعطیل' : 'باز'}
            </button>
          </div>
          {!day.is_closed && (
            <div className="mt-2 grid grid-cols-2 gap-2" dir="ltr">
              <label className="block">
                <span className="block text-[10px] text-gray-400 mb-1 text-right">شروع</span>
                <Time24Field
                  value={day.start_time}
                  onChange={(start_time) => updateDay(day.weekday, { start_time })}
                />
              </label>
              <label className="block">
                <span className="block text-[10px] text-gray-400 mb-1 text-right">پایان</span>
                <Time24Field
                  value={day.end_time}
                  onChange={(end_time) => updateDay(day.weekday, { end_time })}
                />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
