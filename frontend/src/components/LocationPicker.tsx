import React, { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed, Layers, Map } from 'lucide-react'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const STREET_TILE = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const SATELLITE_TILE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

interface LocationPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
  isDark: boolean
}

// Handles map click events
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Flies to a new center when target changes
const FlyToController: React.FC<{ target: [number, number] | null }> = ({ target }) => {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo(target, 16, { animate: true, duration: 1.2 })
    }
  }, [target, map])
  return null
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = 35.6892,
  initialLng = 51.389,
  onLocationSelect,
  isDark,
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [isSatellite, setIsSatellite] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const isFirstMount = useRef(true)

  useEffect(() => {
    setPosition([initialLat, initialLng])
    if (isFirstMount.current) {
      // First time map mounts — just show it at this position
      isFirstMount.current = false
      setIsMapReady(true)
    } else {
      // Props changed after mount (e.g. saved coords loaded async) — fly there
      setFlyTarget([initialLat, initialLng])
    }
  }, [initialLat, initialLng])

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng])
      onLocationSelect(lat, lng)
    },
    [onLocationSelect]
  )

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords
        setPosition([latitude, longitude])
        setFlyTarget([latitude, longitude])
        onLocationSelect(latitude, longitude)
        setIsLocating(false)
      },
      () => {
        alert('خطا در دریافت موقعیت. لطفاً دسترسی به موقعیت مکانی را فعال کنید.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (!isMapReady) {
    return (
      <div
        className={`w-full h-64 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-slate-700' : 'bg-gray-100'
        }`}
      >
        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>
          در حال بارگذاری نقشه...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
        روی نقشه کلیک کنید تا موقعیت کسب‌وکار را انتخاب کنید
      </div>

      {/* Map wrapper */}
      <div className="relative rounded-xl overflow-hidden shadow-md"
           style={{ height: '320px' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className="z-0"
        >
          <TileLayer
            key={isSatellite ? 'satellite' : 'street'}
            url={isSatellite ? SATELLITE_TILE : STREET_TILE}
            attribution={
              isSatellite
                ? '&copy; Esri &mdash; Source: Esri, Maxar, GeoEye'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            }
          />
          <Marker position={position} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <FlyToController target={flyTarget} />
        </MapContainer>

        {/* Floating action buttons — bottom-right */}
        <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-2">
          {/* GPS / locate me */}
          <button
            onClick={handleCurrentLocation}
            title="موقعیت من"
            disabled={isLocating}
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all
              ${isLocating
                ? 'bg-blue-500 animate-pulse cursor-wait'
                : 'bg-gray-800 hover:bg-gray-700 active:scale-95 cursor-pointer'
              } text-white`}
          >
            <LocateFixed size={18} strokeWidth={2} />
          </button>

          {/* Map / Satellite toggle */}
          <button
            onClick={() => setIsSatellite((v) => !v)}
            title={isSatellite ? 'نمایش نقشه' : 'نمایش ماهواره‌ای'}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:scale-95
                       shadow-lg flex items-center justify-center text-white transition-all cursor-pointer"
          >
            {isSatellite ? <Map size={18} strokeWidth={2} /> : <Layers size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Satellite label badge */}
        {isSatellite && (
          <div className="absolute top-2 left-2 z-[1000] bg-gray-900/70 text-white text-xs
                          px-2 py-1 rounded-full backdrop-blur-sm">
            🛰 ماهواره‌ای
          </div>
        )}
      </div>

      {/* Coordinates display */}
      <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        <span>📍</span>
        <span dir="ltr">{position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
      </div>
    </div>
  )
}
