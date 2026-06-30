import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from 'react-leaflet'
import L from 'leaflet'
import { X, LocateFixed, Layers, Map, Navigation } from 'lucide-react'
import { Package } from '../services/api'
import { getFullImageUrl } from '../services/api'
import { useNavigate } from 'react-router-dom'

// ─── tile providers ───────────────────────────────────────────────────────────
const STREET_TILE = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const SATELLITE_TILE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

// ─── inner component: exposes map instance via ref ────────────────────────────
const MapRefCapture: React.FC<{
  mapRef: React.MutableRefObject<L.Map | null>
  target: [number, number] | null
  zoom: number
}> = ({ mapRef, target, zoom }) => {
  const map = useMap()
  useEffect(() => { mapRef.current = map }, [map])
  useEffect(() => {
    if (target) map.flyTo(target, zoom, { animate: true, duration: 1 })
  }, [target, zoom, map])
  return null
}

// ─── custom icons ─────────────────────────────────────────────────────────────
const makeBusinessIcon = (near: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${near ? '#2563eb' : '#1f2937'};
      border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
  })

const userDot = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#3b82f6;border:3px solid #fff;
    box-shadow:0 0 0 5px rgba(59,130,246,0.25);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

// ─── helpers ──────────────────────────────────────────────────────────────────
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371, r = Math.PI / 180
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── props ────────────────────────────────────────────────────────────────────
interface ExploreMapViewProps {
  packages: Package[]
  onClose: () => void
}

// ─── main component ───────────────────────────────────────────────────────────
export const ExploreMapView: React.FC<ExploreMapViewProps> = ({
  packages,
  onClose,
}) => {
  const navigate = useNavigate()
  const mapRef = useRef<L.Map | null>(null)
  const [isSatellite, setIsSatellite] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [flyZoom, setFlyZoom] = useState(15)
  const NEARBY_KM = 5

  const locatedPackages = packages.filter(
    (p) => p.business_location_latitude != null && p.business_location_longitude != null,
  )

  const defaultCenter: [number, number] =
    locatedPackages.length > 0
      ? [locatedPackages[0].business_location_latitude!, locatedPackages[0].business_location_longitude!]
      : [35.6892, 51.389]

  const isNear = useCallback(
    (pkg: Package) => {
      if (!userPos) return false
      return haversineKm(userPos[0], userPos[1], pkg.business_location_latitude!, pkg.business_location_longitude!) <= NEARBY_KM
    },
    [userPos],
  )

  const nearCount = userPos ? locatedPackages.filter(isNear).length : 0

  const handleLocate = () => {
    if (!navigator.geolocation) { alert('مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.'); return }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude]
        setUserPos(pos)
        setFlyTarget(pos)
        setFlyZoom(13)
        setIsLocating(false)
      },
      () => { alert('خطا در دریافت موقعیت.'); setIsLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col" style={{ direction: 'ltr' }}>

      {/* ── top bar ── */}
      <div
        className="absolute top-0 left-0 right-0 z-[2001]
                   flex items-center justify-between px-4 py-3
                   bg-white/95 backdrop-blur-sm shadow-sm"
        style={{ direction: 'rtl' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900">نقشه کسب‌وکارها</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {locatedPackages.length} کسب‌وکار
          </span>
          {userPos && nearCount > 0 && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {nearCount} نزدیک شما (تا {NEARBY_KM} کیلومتر)
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200
                     flex items-center justify-center transition-colors shrink-0"
        >
          <X size={18} className="text-gray-700" />
        </button>
      </div>

      {/* ── map ── */}
      <MapContainer
        center={defaultCenter}
        zoom={locatedPackages.length > 1 ? 11 : 13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          key={isSatellite ? 'sat' : 'street'}
          url={isSatellite ? SATELLITE_TILE : STREET_TILE}
          attribution={isSatellite ? '© Esri' : '© OpenStreetMap © CARTO'}
        />

        <MapRefCapture mapRef={mapRef} target={flyTarget} zoom={flyZoom} />

        {/* user dot + radius circle */}
        {userPos && (
          <>
            <Marker position={userPos} icon={userDot} />
            <CircleMarker
              center={userPos}
              radius={60}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.07,
                weight: 1.5,
                dashArray: '6 4',
              }}
            />
          </>
        )}

        {/* business markers */}
        {locatedPackages.map((pkg) => (
          <Marker
            key={pkg.id}
            position={[pkg.business_location_latitude!, pkg.business_location_longitude!]}
            icon={makeBusinessIcon(isNear(pkg))}
          >
            <Popup minWidth={210} maxWidth={250}>
              <BusinessPopup
                pkg={pkg}
                onNavigate={() => { onClose(); navigate(`/dashboard/business/${pkg.id}`) }}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── floating controls (right) ── */}
      <div className="absolute bottom-8 right-4 z-[2001] flex flex-col gap-2">
        {/* GPS */}
        <button
          onClick={handleLocate}
          disabled={isLocating}
          title="موقعیت من"
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all
            ${isLocating ? 'bg-blue-500 animate-pulse cursor-wait'
              : userPos ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'} text-white`}
        >
          <LocateFixed size={19} strokeWidth={2} />
        </button>

        {/* satellite toggle */}
        <button
          onClick={() => setIsSatellite(v => !v)}
          title={isSatellite ? 'نقشه معمولی' : 'نمایش ماهواره‌ای'}
          className="w-11 h-11 rounded-full bg-gray-800 hover:bg-gray-700 shadow-lg
                     flex items-center justify-center text-white transition-all cursor-pointer"
        >
          {isSatellite ? <Map size={19} strokeWidth={2} /> : <Layers size={19} strokeWidth={2} />}
        </button>
      </div>

      {/* ── zoom controls (left) ── */}
      <div className="absolute bottom-8 left-4 z-[2001] flex flex-col gap-1">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 rounded-t-lg bg-gray-800 hover:bg-gray-700 text-white shadow-lg
                     flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
        >+</button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 rounded-b-lg bg-gray-800 hover:bg-gray-700 text-white shadow-lg
                     flex items-center justify-center text-lg font-bold transition-all cursor-pointer border-t border-gray-600"
        >−</button>
      </div>

      {/* satellite badge */}
      {isSatellite && (
        <div className="absolute top-16 right-4 z-[2001] bg-gray-900/70 text-white text-xs
                        px-2 py-1 rounded-full backdrop-blur-sm">
          🛰 ماهواره‌ای
        </div>
      )}

      {/* no-location notice */}
      {packages.length > 0 && locatedPackages.length === 0 && (
        <div
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[2001]
                     bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3
                     text-sm text-gray-600 shadow-lg text-center"
          style={{ direction: 'rtl', minWidth: 240 }}
        >
          کسب‌وکارها هنوز موقعیت مکانی ثبت نکرده‌اند.
        </div>
      )}
    </div>
  )
}

// ─── popup card ───────────────────────────────────────────────────────────────
const BusinessPopup: React.FC<{ pkg: Package; onNavigate: () => void }> = ({ pkg, onNavigate }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{ direction: 'rtl', fontFamily: 'IRANYekan, sans-serif', minWidth: 200 }}>
      {/* image */}
      <div className="w-full h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 mb-2">
        {!imgError && (pkg.business_image || pkg.business_logo) ? (
          <img
            src={getFullImageUrl(pkg.business_image || pkg.business_logo)}
            alt={pkg.business_name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
        )}
      </div>

      <p className="font-bold text-gray-900 text-sm leading-tight">{pkg.business_name}</p>
      {pkg.business_category?.name && (
        <p className="text-xs text-gray-400 mt-0.5">{pkg.business_category.name}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-semibold text-gray-700">{pkg.average_rating ?? '—'}</span>
        </div>
        {pkg.discount_percentage != null && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {pkg.discount_percentage}٪ تخفیف
          </span>
        )}
      </div>

      {(pkg as any)?.city?.name && (
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-0.5">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
          {(pkg as any).city.name}
        </p>
      )}

      <button
        onClick={onNavigate}
        className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs
                   font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <Navigation size={12} />
        مشاهده پکیج
      </button>
    </div>
  )
}
