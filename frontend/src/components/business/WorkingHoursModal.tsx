import React from 'react'
import { WorkingHoursEntry } from '../../services/api'
import { formatTimeDisplay } from '../../utils/workingHours'

interface WorkingHoursModalProps {
  schedule: WorkingHoursEntry[]
  onClose: () => void
}

export const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({ schedule, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">ساعات کاری</h3>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl leading-none">✕</button>
        </div>
        <div className="space-y-2">
          {schedule.map(day => (
            <div
              key={day.weekday}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                {day.weekday_display}
              </span>
              {day.is_closed ? (
                <span className="text-sm text-red-500">تعطیل</span>
              ) : (
                <span className="text-sm text-gray-600 dark:text-slate-400" dir="ltr">
                  {formatTimeDisplay(day.start_time)} – {formatTimeDisplay(day.end_time)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
