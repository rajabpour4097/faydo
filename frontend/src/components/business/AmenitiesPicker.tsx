import { AmenityItem, PackageAmenitiesData } from '../../services/api'
import { AmenityIcon } from '../../utils/amenityIcons'

interface AmenitiesPickerProps {
  catalog: PackageAmenitiesData | null
  selectedIds: number[]
  onChange: (ids: number[]) => void
  loading?: boolean
}

const AmenityCard = ({
  amenity,
  selected,
  onToggle,
}: {
  amenity: AmenityItem
  selected: boolean
  onToggle: () => void
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 min-h-[76px] text-center border transition-colors ${
      selected
        ? 'border-teal-500 bg-teal-50 text-teal-800'
        : 'border-gray-100 bg-white text-gray-700'
    }`}
  >
    <AmenityIcon
      name={amenity.name}
      slug={amenity.slug}
      className={`w-5 h-5 ${selected ? 'text-teal-600' : 'text-gray-400'}`}
    />
    <span className="text-[10px] font-medium leading-tight line-clamp-2">{amenity.name}</span>
  </button>
)

export const AmenitiesPicker = ({ catalog, selectedIds, onChange, loading }: AmenitiesPickerProps) => {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (loading) {
    return <p className="text-sm text-center text-gray-500 py-6">در حال بارگذاری امکانات...</p>
  }

  if (!catalog) {
    return <p className="text-sm text-center text-gray-500 py-6">امکانات در دسترس نیست</p>
  }

  const general = catalog.general_amenities || []
  const specific = catalog.specific_amenities || []
  if (general.length === 0 && specific.length === 0) {
    return <p className="text-sm text-center text-gray-500 py-6">برای این نوع فعالیت امکانی تعریف نشده است</p>
  }

  return (
    <div className="space-y-4">
      {general.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-2">امکانات عمومی</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {general.map((amenity) => (
              <AmenityCard
                key={amenity.id}
                amenity={amenity}
                selected={selectedIds.includes(amenity.id)}
                onToggle={() => toggle(amenity.id)}
              />
            ))}
          </div>
        </section>
      )}
      {specific.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-2">
            امکانات اختصاصی{catalog.business_type_label ? ` (${catalog.business_type_label})` : ''}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {specific.map((amenity) => (
              <AmenityCard
                key={amenity.id}
                amenity={amenity}
                selected={selectedIds.includes(amenity.id)}
                onToggle={() => toggle(amenity.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
