import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import moment from 'moment-jalaali'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]
const ITEM_HEIGHT = 40
const WHEEL_VISIBLE = 5
const PURPLE = '#7C5CFC'
const FORMATS = ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'] as const

type JMoment = moment.Moment

function faDigit(value: number, pad = 0) {
  return String(value).padStart(pad, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

function daysInJalaliMonth(year: number, month: number) {
  const m = moment(`${year}/${month}/1`, 'jYYYY/jMM/jDD')
  if (!m.isValid()) return month <= 6 ? 31 : month <= 11 ? 30 : 29
  return m.clone().endOf('jMonth').jDate()
}

export function toDateTimeValue(m: JMoment) {
  return m.format('YYYY-MM-DDTHH:mm')
}

export function startOfTodayValue() {
  return toDateTimeValue(moment().startOf('day'))
}

export function nowDateTimeValue() {
  return toDateTimeValue(moment())
}

export function endOfTodayValue() {
  return toDateTimeValue(moment().hour(23).minute(59).second(0))
}

function parseValue(value: string, fallback: 'start' | 'now' | 'end') {
  const base =
    fallback === 'start' ? moment().startOf('day') : fallback === 'end' ? moment().hour(23).minute(59) : moment()
  if (!value) return base
  const parsed = moment(value, FORMATS as unknown as string[], true)
  return parsed.isValid() ? parsed : base
}

export function formatPersianDateTime(value: string) {
  if (!value) return ''
  const m = parseValue(value, 'now')
  if (!m.isValid()) return ''
  return `${faDigit(m.jDate())} ${MONTHS[m.jMonth()]} ${faDigit(m.jYear())}  ·  ${faDigit(m.hour(), 2)}:${faDigit(m.minute(), 2)}`
}

function Wheel({
  items,
  selectedIndex,
  onChange,
  renderItem,
  isDark,
}: {
  items: number[]
  selectedIndex: number
  onChange: (index: number) => void
  renderItem: (item: number) => string
  isDark: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)
  const scrollTo = useCallback((index: number, smooth = false) => {
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    scrollTo(Math.max(0, selectedIndex))
  }, [selectedIndex, items.length, scrollTo])

  const pad = ((WHEEL_VISIBLE - 1) / 2) * ITEM_HEIGHT
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden" style={{ height: ITEM_HEIGHT * WHEEL_VISIBLE }}>
      <div
        ref={ref}
        onScroll={() => {
          if (!ref.current) return
          if (timer.current) window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => {
            if (!ref.current) return
            const index = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_HEIGHT)))
            scrollTo(index, true)
            if (index !== selectedIndex) onChange(index)
          }, 70)
        }}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'y mandatory', paddingTop: pad, paddingBottom: pad }}
      >
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center justify-center snap-center" style={{ height: ITEM_HEIGHT }}>
            <span className={`text-[15px] ${index === selectedIndex ? `font-black ${isDark ? 'text-white' : 'text-gray-900'}` : 'font-medium text-gray-300'}`}>
              {renderItem(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PersianDateTimePickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  isDark?: boolean
  fallback?: 'start' | 'now' | 'end'
}

export function PersianDateTimePicker({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ و ساعت',
  isDark = false,
  fallback = 'now',
}: PersianDateTimePickerProps) {
  const currentYear = moment().jYear()
  const parsed = parseValue(value, fallback)
  const selectedJalaliYear = parsed.jYear()
  const years = useMemo(() => {
    const min = Math.min(currentYear - 12, selectedJalaliYear)
    const max = Math.max(currentYear + 1, selectedJalaliYear)
    return Array.from({ length: max - min + 1 }, (_, i) => min + i)
  }, [currentYear, selectedJalaliYear])
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(parsed.jYear())
  const [month, setMonth] = useState(parsed.jMonth() + 1)
  const [day, setDay] = useState(parsed.jDate())
  const [hour, setHour] = useState(parsed.hour())
  const [minute, setMinute] = useState(parsed.minute())

  const maxDay = daysInJalaliMonth(year, month)
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay])

  useEffect(() => {
    if (day > maxDay) setDay(maxDay)
  }, [day, maxDay])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const applyMoment = (m: JMoment) => {
    setYear(m.jYear())
    setMonth(m.jMonth() + 1)
    setDay(m.jDate())
    setHour(m.hour())
    setMinute(m.minute())
  }

  const openSheet = () => {
    applyMoment(parseValue(value, fallback))
    setOpen(true)
  }

  const confirm = () => {
    const safeDay = Math.min(day, daysInJalaliMonth(year, month))
    const m = moment(`${year}/${month}/${safeDay} ${hour}:${minute}`, 'jYYYY/jM/jD H:m')
    onChange(toDateTimeValue(m))
    setOpen(false)
  }

  const highlight = isDark
    ? 'border border-[#7C5CFC]/35 bg-white/10'
    : 'border border-[#7C5CFC]/20 bg-white/70'
  const display = value ? parseValue(value, fallback) : null

  const sheet = open
    ? createPortal(
        <div className="fixed inset-0 z-[130] flex flex-col justify-end" dir="rtl">
          <button type="button" className="absolute inset-0 bg-black/45" aria-label="بستن" onClick={() => setOpen(false)} />
          <div
            className={`relative rounded-t-[28px] px-4 pb-6 pt-3 shadow-[0_-12px_40px_rgba(15,23,42,0.16)] ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}
            onClick={event => event.stopPropagation()}
          >
            <div className={`mx-auto mb-3 h-1 w-10 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`} />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black">{label}</h3>
              <span className="rounded-full bg-[#F3EEFF] px-2 py-0.5 text-[10px] font-bold text-[#7C5CFC]">شمسی</span>
            </div>

            <div className={`mb-2 rounded-[22px] ${isDark ? 'bg-slate-700' : 'bg-[#F4F6FB]'}`}>
              <div className="relative">
                <div className={`pointer-events-none absolute inset-x-3 top-1/2 h-10 -translate-y-1/2 rounded-xl ${highlight}`} />
                <div className="flex">
                  <Wheel items={days} selectedIndex={Math.min(day, days.length) - 1} onChange={i => setDay(i + 1)} renderItem={faDigit} isDark={isDark} />
                  <Wheel items={Array.from({ length: 12 }, (_, i) => i + 1)} selectedIndex={month - 1} onChange={i => setMonth(i + 1)} renderItem={item => MONTHS[item - 1]} isDark={isDark} />
                  <Wheel items={years} selectedIndex={Math.max(0, years.indexOf(year))} onChange={i => setYear(years[i] ?? currentYear)} renderItem={faDigit} isDark={isDark} />
                </div>
              </div>
              <div className="grid grid-cols-3 pb-2 text-center text-[10px] font-bold text-gray-400">
                <span>روز</span>
                <span>ماه</span>
                <span>سال</span>
              </div>
            </div>

            <div className={`mb-3 rounded-[22px] ${isDark ? 'bg-slate-700' : 'bg-[#F4F6FB]'}`}>
              <div className="relative">
                <div className={`pointer-events-none absolute inset-x-10 top-1/2 h-10 -translate-y-1/2 rounded-xl ${highlight}`} />
                <div className="flex items-center px-8" dir="ltr">
                  <Wheel items={hours} selectedIndex={hour} onChange={setHour} renderItem={item => faDigit(item, 2)} isDark={isDark} />
                  <div className="px-1 text-lg font-black text-[#7C5CFC]">:</div>
                  <Wheel items={minutes} selectedIndex={minute} onChange={setMinute} renderItem={item => faDigit(item, 2)} isDark={isDark} />
                </div>
              </div>
              <div className="flex justify-around pb-2 text-[10px] font-bold text-gray-400" dir="ltr">
                <span>ساعت</span>
                <span>دقیقه</span>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              {[
                { id: 'now', label: 'الان', apply: () => applyMoment(moment()) },
                { id: 'start', label: 'شروع روز', apply: () => applyMoment(moment().startOf('day')) },
                { id: 'end', label: 'پایان روز', apply: () => applyMoment(moment().hour(23).minute(59)) },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.apply}
                  className={`flex-1 rounded-full py-2 text-[11px] font-bold ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-[#F3EEFF] text-[#7C5CFC]'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className={`flex-1 rounded-2xl py-3 text-sm font-bold ${isDark ? 'bg-slate-700' : 'bg-gray-100 text-gray-600'}`}>
                انصراف
              </button>
              <button type="button" onClick={confirm} className="flex-[1.2] rounded-2xl py-3 text-sm font-black text-white" style={{ background: PURPLE }}>
                تایید
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <div>
      <div className="mb-1 text-[11px] font-bold text-gray-400">{label}</div>
      <button
        type="button"
        onClick={openSheet}
        className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-right ${
          isDark ? 'bg-slate-700 text-white' : 'bg-[#F4F6FB] text-gray-900'
        }`}
      >
        <span className={`min-w-0 ${display ? '' : 'text-gray-400'}`}>
          {display ? (
            <>
              <span className="block text-[13px] font-black">
                {faDigit(display.jDate())} {MONTHS[display.jMonth()]} {faDigit(display.jYear())}
              </span>
              <span className="mt-0.5 block text-[11px] font-bold text-[#7C5CFC]">
                ساعت {faDigit(display.hour(), 2)}:{faDigit(display.minute(), 2)}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-bold">{placeholder}</span>
          )}
        </span>
        <svg className="h-4 w-4 shrink-0 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-9 4h10M6 21h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
      {sheet}
    </div>
  )
}
