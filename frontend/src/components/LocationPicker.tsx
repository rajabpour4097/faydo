import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LocationPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
  isDark: boolean
}

// Component to handle map click events
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    },
  })
  return null
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  initialLat = 35.6892, 
  initialLng = 51.3890, 
  onLocationSelect, 
  isDark 
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    // Set initial position
    setPosition([initialLat, initialLng])
    setIsMapReady(true)
  }, [initialLat, initialLng])

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setPosition([latitude, longitude])
          onLocationSelect(latitude, longitude)
        },
        (error) => {
          console.error('Error getting current location:', error)
          alert('خطا در دریافت موقعیت فعلی. لطفاً دسترسی به موقعیت مکانی را فعال کنید.')
        }
      )
    } else {
      alert('مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.')
    }
  }

  if (!isMapReady) {
    return (
      <div className={`w-full h-64 rounded-lg flex items-center justify-center ${
        isDark ? 'bg-slate-700' : 'bg-gray-100'
      }`}>
        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          در حال بارگذاری نقشه...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          روی نقشه کلیک کنید تا موقعیت را انتخاب کنید
        </div>
        <button
          onClick={handleCurrentLocation}
          className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
            isDark 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          موقعیت فعلی
        </button>
      </div>
      
      <div className="relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '300px', width: '100%', borderRadius: '8px' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>
      
      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        موقعیت انتخاب شده: {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </div>
    </div>
  )
}
