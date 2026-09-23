import { useEffect, useState } from 'react'
import { apiService } from '../../services/api'
import { WorkingHoursEditor } from './WorkingHoursEditor'
import {
  WorkingHoursDraft,
  createDefaultSchedule,
  scheduleFromApi,
  scheduleToPayload,
  validateSchedule,
} from './workingHoursDraft'

interface BusinessHoursManageModalProps {
  onClose: () => void
  onSaved: () => void
}

export const BusinessHoursManageModal = ({ onClose, onSaved }: BusinessHoursManageModalProps) => {
  const [schedule, setSchedule] = useState<WorkingHoursDraft[]>(createDefaultSchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const response = await apiService.getBusinessWorkingHours()
      if (!active) return
      if (response.data?.schedule) {
        setSchedule(scheduleFromApi(response.data.schedule))
      } else if (response.error) {
        setError(response.error)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const save = async () => {
    const validationError = validateSchedule(schedule)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')
    const response = await apiService.saveBusinessWorkingHours(scheduleToPayload(schedule))
    setSaving(false)
    if (response.error) {
      setError(response.error)
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">ساعات کاری</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400" aria-label="بستن">
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-center text-gray-500 py-8">در حال بارگذاری...</p>
          ) : (
            <WorkingHoursEditor schedule={schedule} onChange={setSchedule} />
          )}
          {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={save}
            disabled={loading || saving}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold disabled:opacity-50"
          >
            {saving ? '...' : 'ذخیره ساعات کاری'}
          </button>
        </div>
      </div>
    </div>
  )
}
