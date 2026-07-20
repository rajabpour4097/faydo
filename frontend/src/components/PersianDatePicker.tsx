import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import moment from 'moment-jalaali'

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const ITEM_HEIGHT = 44
const WHEEL_VISIBLE = 5

export const gregorianToPersian = (gregorianDate: Date): { year: number; month: number; day: number } => {
  try {
    if (!gregorianDate || isNaN(gregorianDate.getTime())) {
      const now = moment()
      return { year: now.jYear(), month: now.jMonth() + 1, day: now.jDate() }
    }
    const year = gregorianDate.getFullYear()
    if (year < 1900 || year > 2100) {
      const now = moment()
      return { year: now.jYear(), month: now.jMonth() + 1, day: now.jDate() }
    }
    const momentDate = moment(gregorianDate)
    return { year: momentDate.jYear(), month: momentDate.jMonth() + 1, day: momentDate.jDate() }
  } catch {
    const now = moment()
    return { year: now.jYear(), month: now.jMonth() + 1, day: now.jDate() }
  }
}

export const persianToGregorian = (year: number, month: number, day: number): string => {
  try {
    if (!year || !month || !day || year < 1300 || year > 1500 || month < 1 || month > 12 || day < 1 || day > 31) {
      return new Date().toISOString().split('T')[0]
    }
    const persianMoment = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD')
    if (!persianMoment.isValid()) {
      return new Date().toISOString().split('T')[0]
    }
    return persianMoment.format('YYYY-MM-DD')
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

const getDaysInMonth = (year: number, month: number) => {
  try {
    const persianMoment = moment(`${year}/${month}/1`, 'jYYYY/jMM/jDD')
    if (!persianMoment.isValid()) {
      if (month <= 6) return 31
      if (month <= 11) return 30
      return 29
    }
    return persianMoment.clone().endOf('jMonth').jDate()
  } catch {
    if (month <= 6) return 31
    if (month <= 11) return 30
    return 29
  }
}

function toPersianNumber(value: number): string {
  return value.toLocaleString('fa-IR', { useGrouping: false })
}

function formatPersianDisplay(year: number, month: number, day: number) {
  return `${toPersianNumber(day)} ${persianMonths[month - 1]} ${toPersianNumber(year)}`
}

function parseInitialPersian(value: string) {
  const current = gregorianToPersian(new Date())
  if (!value?.trim()) return current
  try {
    const gregorianDate = new Date(value)
    if (!isNaN(gregorianDate.getTime()) && gregorianDate.getFullYear() > 1900) {
      return gregorianToPersian(gregorianDate)
    }
  } catch {
    // keep default
  }
  return current
}

function WheelColumn({
  items,
  selectedIndex,
  onChange,
  renderItem,
}: {
  items: unknown[]
  selectedIndex: number
  onChange: (index: number) => void
  renderItem: (item: unknown, index: number, active: boolean) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollTimer = useRef<number | null>(null)

  const scrollToIndex = useCallback((index: number, smooth = false) => {
    if (!ref.current) return
    ref.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])

  useEffect(() => {
    scrollToIndex(selectedIndex)
  }, [selectedIndex, scrollToIndex])

  const handleScroll = () => {
    if (!ref.current) return
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => {
      if (!ref.current) return
      const index = Math.max(
        0,
        Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_HEIGHT))
      )
      scrollToIndex(index)
      if (index !== selectedIndex) onChange(index)
    }, 80)
  }

  const pad = ((WHEEL_VISIBLE - 1) / 2) * ITEM_HEIGHT

  return (
    <div className="relative flex-1 min-w-0 h-[220px] overflow-hidden">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overscroll-contain persian-wheel-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          paddingTop: pad,
          paddingBottom: pad,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item, index) => {
          const active = index === selectedIndex
          return (
            <div
              key={index}
              className="flex items-center justify-center snap-center select-none"
              style={{ height: ITEM_HEIGHT }}
            >
              <span
                className={`text-[15px] transition-colors ${
                  active ? 'font-bold text-gray-900' : 'font-normal text-gray-300'
                }`}
              >
                {renderItem(item, index, active)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface PersianDatePickerProps {
  value: string
  onChange: (value: string) => void
  isDark?: boolean
  accentClass?: string
  placeholder?: string
  variant?: 'sheet' | 'calendar'
}

export const PersianDatePicker = ({
  value,
  onChange,
  isDark = false,
  accentClass = 'bg-blue-600',
  placeholder = 'تاریخ تولد',
  variant = 'sheet',
}: PersianDatePickerProps) => {
  const currentJYear = moment().jYear()
  const minBirthYear = currentJYear - 100
  const maxBirthYear = currentJYear - 10

  const initial = parseInitialPersian(value)
  const [selectedYear, setSelectedYear] = useState(initial.year)
  const [selectedMonth, setSelectedMonth] = useState(initial.month)
  const [selectedDay, setSelectedDay] = useState(initial.day)
  const [showSheet, setShowSheet] = useState(false)
  const [draftYear, setDraftYear] = useState(initial.year)
  const [draftMonth, setDraftMonth] = useState(initial.month)
  const [draftDay, setDraftDay] = useState(initial.day)

  useEffect(() => {
    const parsed = parseInitialPersian(value)
    setSelectedYear(parsed.year)
    setSelectedMonth(parsed.month)
    setSelectedDay(parsed.day)
  }, [value])

  useEffect(() => {
    if (!showSheet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showSheet])

  const years = Array.from(
    { length: maxBirthYear - minBirthYear + 1 },
    (_, i) => minBirthYear + i
  )
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const draftDaysInMonth = getDaysInMonth(draftYear, draftMonth)
  const days = Array.from({ length: draftDaysInMonth }, (_, i) => i + 1)

  const openSheet = () => {
    if (value && value.trim() !== '') {
      setDraftYear(selectedYear)
      setDraftMonth(selectedMonth)
      setDraftDay(Math.min(selectedDay, getDaysInMonth(selectedYear, selectedMonth)))
    } else {
      const defaultYear = Math.min(maxBirthYear, Math.max(minBirthYear, 1380))
      setDraftYear(defaultYear)
      setDraftMonth(1)
      setDraftDay(1)
    }
    setShowSheet(true)
  }

  const closeSheet = () => setShowSheet(false)

  const confirmSheet = () => {
    const maxDay = getDaysInMonth(draftYear, draftMonth)
    const day = Math.min(draftDay, maxDay)
    setSelectedYear(draftYear)
    setSelectedMonth(draftMonth)
    setSelectedDay(day)
    onChange(persianToGregorian(draftYear, draftMonth, day))
    closeSheet()
  }

  const handleDraftMonthChange = (monthIndex: number) => {
    const month = monthIndex + 1
    setDraftMonth(month)
    const maxDay = getDaysInMonth(draftYear, month)
    if (draftDay > maxDay) setDraftDay(maxDay)
  }

  const handleDraftYearChange = (yearIndex: number) => {
    const year = years[yearIndex]
    setDraftYear(year)
    const maxDay = getDaysInMonth(year, draftMonth)
    if (draftDay > maxDay) setDraftDay(maxDay)
  }

  if (variant === 'calendar') {
    return (
      <CalendarVariant
        value={value}
        onChange={onChange}
        isDark={isDark}
        accentClass={accentClass}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDay={selectedDay}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedDay={setSelectedDay}
      />
    )
  }

  const displayText =
    value && value.trim() !== ''
      ? formatPersianDisplay(selectedYear, selectedMonth, selectedDay)
      : placeholder

  const sheet = showSheet
    ? createPortal(
        <div className="fixed inset-0 z-[120] flex flex-col justify-end">
          <button
            type="button"
            aria-label="بستن"
            className="absolute inset-0 bg-black/45"
            onClick={closeSheet}
          />

          <div className="relative bg-white rounded-t-[28px] px-4 pt-4 pb-6 shadow-[0_-8px_32px_rgba(15,23,42,0.12)]">
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[44px] border-y border-gray-100 bg-gray-50/40 rounded-lg" />
              <div className="flex items-stretch gap-1" dir="rtl">
                <WheelColumn
                  items={days}
                  selectedIndex={Math.min(draftDay, days.length) - 1}
                  onChange={(index) => setDraftDay(index + 1)}
                  renderItem={(item) => toPersianNumber(item as number)}
                />
                <WheelColumn
                  items={months}
                  selectedIndex={draftMonth - 1}
                  onChange={handleDraftMonthChange}
                  renderItem={(item) => persianMonths[(item as number) - 1]}
                />
                <WheelColumn
                  items={years}
                  selectedIndex={Math.max(0, years.indexOf(draftYear))}
                  onChange={handleDraftYearChange}
                  renderItem={(item) => toPersianNumber(item as number)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={closeSheet}
                className="flex-1 py-3.5 rounded-full bg-[#2b2b2b] text-white text-[15px] font-semibold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmSheet}
                className="flex-1 py-3.5 rounded-full bg-[#2b2b2b] text-white text-[15px] font-semibold"
              >
                تایید
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-2xl text-right transition-colors ${
          isDark
            ? 'border-slate-600 bg-slate-800 text-white'
            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
        } ${!value ? 'text-gray-400' : ''}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-400 flex-shrink-0"
          aria-hidden
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={`text-[15px] ${value ? 'text-gray-800 font-medium' : ''}`}>
          {displayText}
        </span>
      </button>
      {sheet}
    </>
  )
}

function CalendarVariant({
  isDark,
  accentClass,
  selectedYear,
  selectedMonth,
  selectedDay,
  setSelectedYear,
  setSelectedMonth,
  setSelectedDay,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
  isDark: boolean
  accentClass: string
  selectedYear: number
  selectedMonth: number
  selectedDay: number
  setSelectedYear: (v: number) => void
  setSelectedMonth: (v: number) => void
  setSelectedDay: (v: number) => void
}) {
  const [showYearPicker, setShowYearPicker] = useState(false)
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)

  const handleDateSelect = (day: number) => {
    setSelectedDay(day)
    onChange(persianToGregorian(selectedYear, selectedMonth, day))
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  return (
    <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => handleMonthChange('prev')}
          className={`p-1 rounded ${isDark ? 'text-white hover:bg-slate-600' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={() => setShowYearPicker((v) => !v)}
          className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {persianMonths[selectedMonth - 1]} {selectedYear}
        </button>
        <button
          type="button"
          onClick={() => handleMonthChange('next')}
          className={`p-1 rounded ${isDark ? 'text-white hover:bg-slate-600' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          &gt;
        </button>
      </div>

      {showYearPicker && (
        <div className="mb-3 max-h-28 overflow-y-auto">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 50 }, (_, i) => 1330 + i).map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(year)
                  setShowYearPicker(false)
                }}
                className={`p-1.5 rounded text-xs ${
                  year === selectedYear
                    ? `${accentClass} text-white`
                    : isDark
                      ? 'text-white hover:bg-slate-600'
                      : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 mb-1">
        {persianDays.map((day) => (
          <div key={day} className={`text-center text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => handleDateSelect(day)}
            className={`w-8 h-8 rounded text-sm transition-colors ${
              day === selectedDay
                ? `${accentClass} text-white`
                : isDark
                  ? 'text-white hover:bg-slate-700'
                  : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}
