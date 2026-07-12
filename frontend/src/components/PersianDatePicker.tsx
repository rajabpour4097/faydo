import { useEffect, useState } from 'react'
import moment from 'moment-jalaali'

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

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

interface PersianDatePickerProps {
  value: string
  onChange: (value: string) => void
  isDark?: boolean
  accentClass?: string
}

export const PersianDatePicker = ({
  value,
  onChange,
  isDark = false,
  accentClass = 'bg-blue-600',
}: PersianDatePickerProps) => {
  const currentPersian = gregorianToPersian(new Date())

  let initialPersian = { year: currentPersian.year, month: currentPersian.month, day: currentPersian.day }
  if (value && value.trim() !== '') {
    try {
      const gregorianDate = new Date(value)
      if (!isNaN(gregorianDate.getTime()) && gregorianDate.getFullYear() > 1900) {
        initialPersian = gregorianToPersian(gregorianDate)
      }
    } catch {
      // keep default
    }
  }

  const [selectedYear, setSelectedYear] = useState(initialPersian.year)
  const [selectedMonth, setSelectedMonth] = useState(initialPersian.month)
  const [selectedDay, setSelectedDay] = useState(initialPersian.day)
  const [showYearPicker, setShowYearPicker] = useState(false)

  useEffect(() => {
    if (isNaN(selectedYear) || selectedYear < 1300 || selectedYear > 1500) {
      setSelectedYear(currentPersian.year)
    }
    if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      setSelectedMonth(currentPersian.month)
    }
    if (isNaN(selectedDay) || selectedDay < 1 || selectedDay > 31) {
      setSelectedDay(currentPersian.day)
    }
  }, [selectedYear, selectedMonth, selectedDay, currentPersian])

  const handleDateSelect = (day: number) => {
    setSelectedDay(day)
    onChange(persianToGregorian(selectedYear, selectedMonth, day))
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

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12)
        setSelectedYear((prev) => prev - 1)
      } else {
        setSelectedMonth((prev) => prev - 1)
      }
    } else if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear((prev) => prev + 1)
    } else {
      setSelectedMonth((prev) => prev + 1)
    }
  }

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)

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
