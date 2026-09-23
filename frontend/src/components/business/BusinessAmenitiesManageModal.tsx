import { useEffect, useState } from 'react'
import { apiService, PackageAmenitiesData } from '../../services/api'
import { AmenitiesPicker } from './AmenitiesPicker'

interface BusinessAmenitiesManageModalProps {
  onClose: () => void
  onSaved: () => void
}

export const BusinessAmenitiesManageModal = ({ onClose, onSaved }: BusinessAmenitiesManageModalProps) => {
  const [catalog, setCatalog] = useState<PackageAmenitiesData | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const response = await apiService.getBusinessAmenities()
      if (!active) return
      if (response.data) {
        setCatalog(response.data)
        setSelectedIds(response.data.selected_amenity_ids || [])
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
    setSaving(true)
    setError('')
    const response = await apiService.saveBusinessAmenities(selectedIds)
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
          <h2 className="text-base font-bold text-gray-900">امکانات</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400" aria-label="بستن">
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <AmenitiesPicker
            catalog={catalog}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            loading={loading}
          />
          {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={save}
            disabled={loading || saving}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold disabled:opacity-50"
          >
            {saving ? '...' : 'ذخیره امکانات'}
          </button>
        </div>
      </div>
    </div>
  )
}
