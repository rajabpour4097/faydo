import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, ChevronLeft, Gift, Map, MapPin, RotateCcw, Search, SlidersHorizontal, Star, X } from 'lucide-react'
import { apiService, City } from '../../services/api'
import { ExploreFilterState, hasActiveExploreFilters, isExploreCitySelected } from '../../utils/exploreHelpers'

type OverlayView = 'main' | 'cities'

export interface PopularCity {
  id: number
  name: string
}

type SortOption = ExploreFilterState['sortBy']

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: '', label: 'پیش‌فرض' },
  { value: 'distance', label: 'نزدیک‌ترین' },
  { value: 'rating', label: 'بیشترین امتیاز' },
  { value: 'discount_high', label: 'بیشترین تخفیف' },
  { value: 'newest', label: 'جدیدترین' },
]

interface ExploreSearchOverlayProps {
  open: boolean
  onClose: () => void
  filters: ExploreFilterState
  onSearchChange: (value: string) => void
  onSelectCity: (cityId: number, cityName: string) => void
  onClearCity: () => void
  onSortChange: (sortBy: SortOption) => void
  onGiftOnlyChange: (enabled: boolean) => void
  onNearMeOnlyChange: (enabled: boolean) => void
  onHighRatedOnlyChange: (enabled: boolean) => void
  onResetFilters: () => void
  popularCities: PopularCity[]
  onOpenMap: () => void
  isDark: boolean
}

export const ExploreSearchOverlay: React.FC<ExploreSearchOverlayProps> = ({
  open,
  onClose,
  filters,
  onSearchChange,
  onSelectCity,
  onClearCity,
  onSortChange,
  onGiftOnlyChange,
  onNearMeOnlyChange,
  onHighRatedOnlyChange,
  onResetFilters,
  popularCities,
  onOpenMap,
  isDark,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<OverlayView>('main')
  const [citySearch, setCitySearch] = useState('')
  const [provinces, setProvinces] = useState<{ id: number; name: string; cities: City[] }[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)

  const selectedCityId = filters.cities[0] ?? null
  const hasFilters = hasActiveExploreFilters(filters)

  useEffect(() => {
    if (!open) {
      setView('main')
      setCitySearch('')
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open || view !== 'cities' || provinces.length > 0) return
    let cancelled = false
    const load = async () => {
      setCitiesLoading(true)
      try {
        const resp = await apiService.getAllCities()
        if (!cancelled && resp.data) {
          setProvinces(resp.data)
        }
      } finally {
        if (!cancelled) setCitiesLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, view, provinces.length])

  const filteredProvinces = useMemo(() => {
    const term = citySearch.trim().toLowerCase()
    if (!term) return provinces
    return provinces
      .map(province => ({
        ...province,
        cities: province.cities.filter(
          city =>
            city.name.toLowerCase().includes(term) ||
            province.name.toLowerCase().includes(term),
        ),
      }))
      .filter(
        province =>
          province.name.toLowerCase().includes(term) || province.cities.length > 0,
      )
  }, [provinces, citySearch])

  const handleSelectCity = (cityId: number, cityName: string) => {
    if (isExploreCitySelected(filters, cityId, cityName)) {
      onClearCity()
      return
    }
    onSelectCity(cityId, cityName)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onClose()
  }

  const cityChipClass = (active: boolean) =>
    active
      ? 'bg-teal-600 text-white ring-1 ring-teal-600'
      : isDark
        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1600]" style={{ direction: 'rtl' }}>
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        className={`relative mx-auto w-full max-w-lg rounded-b-[28px] shadow-[0_16px_48px_rgba(15,23,42,0.18)] ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
        style={{ animation: 'exploreSearchSlideDown 0.28s ease-out' }}
      >
        <div className="px-4 pt-4 pb-5 max-h-[88vh] overflow-y-auto">
          {view === 'main' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-[15px] font-extrabold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  جستجو
                </h2>
                <div className="flex items-center gap-1.5">
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${
                        isDark
                          ? 'bg-slate-800 text-teal-300'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      <RotateCcw className="h-3 w-3" />
                      پاک کردن
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onClose}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {hasFilters ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {filters.selectedCityName || selectedCityId ? (
                    <button
                      type="button"
                      onClick={onClearCity}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDark ? 'bg-teal-900/50 text-teal-200' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {filters.selectedCityName || 'شهر انتخاب‌شده'}
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                  {filters.hasGiftOnly ? (
                    <button
                      type="button"
                      onClick={() => onGiftOnlyChange(false)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDark ? 'bg-rose-900/40 text-rose-200' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      با هدیه/تخفیف
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                  {filters.sortBy ? (
                    <button
                      type="button"
                      onClick={() => onSortChange('')}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label}
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                  {filters.nearMeOnly ? (
                    <button
                      type="button"
                      onClick={() => onNearMeOnlyChange(false)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      نزدیک من
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                  {filters.highRatedOnly ? (
                    <button
                      type="button"
                      onClick={() => onHighRatedOnlyChange(false)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDark ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      امتیاز ۴+
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-1.5 ${
                    isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="search"
                    value={filters.search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="دنبال چه کسب‌وکاری می‌گردی؟"
                    className={`min-w-0 flex-1 bg-transparent px-2 py-2 text-[13px] focus:outline-none ${
                      isDark
                        ? 'text-white placeholder:text-slate-500'
                        : 'text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,0.35)]"
                    aria-label="جستجو"
                  >
                    <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </button>
                </div>
              </form>

              <div className="mt-5">
                <p
                  className={`mb-2.5 flex items-center gap-1.5 text-[12px] font-bold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
                  مرتب‌سازی
                </p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value || 'default'}
                      type="button"
                      onClick={() => onSortChange(option.value)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                        filters.sortBy === option.value
                          ? 'bg-teal-600 text-white'
                          : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <FilterToggleRow
                  isDark={isDark}
                  active={filters.nearMeOnly}
                  onToggle={() => onNearMeOnlyChange(!filters.nearMeOnly)}
                  icon={<MapPin className="h-5 w-5" />}
                  activeIconClass="bg-blue-600 text-white"
                  title="فقط نزدیک من"
                  subtitle="کسب‌وکارهای تا ۵ کیلومتر اطراف"
                />
                <FilterToggleRow
                  isDark={isDark}
                  active={filters.highRatedOnly}
                  onToggle={() => onHighRatedOnlyChange(!filters.highRatedOnly)}
                  icon={<Star className="h-5 w-5" />}
                  activeIconClass="bg-amber-500 text-white"
                  title="امتیاز ۴ به بالا"
                  subtitle="فقط کسب‌وکارهای با امتیاز بالا"
                />
                <FilterToggleRow
                  isDark={isDark}
                  active={filters.hasGiftOnly}
                  onToggle={() => onGiftOnlyChange(!filters.hasGiftOnly)}
                  icon={<Gift className="h-5 w-5" />}
                  activeIconClass="bg-teal-600 text-white"
                  title="فقط با هدیه یا تخفیف"
                  subtitle="نمایش کسب‌وکارهای دارای پیشنهاد ویژه"
                />
              </div>

              {popularCities.length > 0 ? (
                <div className="mt-5">
                  <p
                    className={`mb-2.5 text-[12px] font-bold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}
                  >
                    شهرهای پرطرفدار:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map(city => {
                      const isActive = isExploreCitySelected(filters, city.id, city.name)
                      return (
                        <button
                          key={`${city.id}-${city.name}`}
                          type="button"
                          onClick={() => handleSelectCity(city.id, city.name)}
                          className={`rounded-full px-3.5 py-2 text-[11px] font-bold transition active:scale-[0.98] ${
                            isActive
                              ? 'bg-teal-600 text-white ring-1 ring-teal-600'
                              : isDark
                                ? 'bg-teal-900/40 text-teal-300 ring-1 ring-teal-700/50'
                                : 'bg-teal-50 text-teal-700 ring-1 ring-teal-100'
                          }`}
                        >
                          {city.name}
                          {isActive ? ' ×' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div
                className={`mt-5 overflow-hidden rounded-2xl border ${
                  isDark ? 'border-slate-700' : 'border-gray-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setView('cities')}
                  className={`flex w-full items-center gap-3 px-3 py-3.5 text-right transition ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13px] font-extrabold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      لیست شهرها
                    </p>
                    <p className={`mt-0.5 text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {filters.selectedCityName
                        ? `انتخاب فعلی: ${filters.selectedCityName}`
                        : 'لیست تمامی شهرها و استان‌ها'}
                    </p>
                  </div>
                  <ChevronLeft className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                </button>

                <div className={`h-px ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />

                <button
                  type="button"
                  onClick={() => {
                    onOpenMap()
                    onClose()
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-3.5 text-right transition ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Map className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13px] font-extrabold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      جستجو در نقشه
                    </p>
                    <p className={`mt-0.5 text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      کسب‌وکارها را بر اساس موقعیت روی نقشه ببین
                    </p>
                  </div>
                  <ChevronLeft className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setView('main')}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </button>
                <h2
                  className={`flex-1 text-[15px] font-extrabold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  لیست شهرها
                </h2>
                {(selectedCityId || filters.selectedCityName) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearCity()
                      setView('main')
                    }}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      isDark ? 'bg-slate-800 text-teal-300' : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    همه شهرها
                  </button>
                )}
              </div>

              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-2 mb-4 ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  type="search"
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  placeholder="جستجوی شهر یا استان..."
                  className={`min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none ${
                    isDark ? 'text-white placeholder:text-slate-500' : 'text-gray-900'
                  }`}
                />
              </div>

              {citiesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {filteredProvinces.map(province => (
                    <div key={province.id}>
                      <p
                        className={`mb-2 text-[11px] font-bold ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}
                      >
                        {province.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {province.cities.map(city => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => handleSelectCity(city.id, city.name)}
                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${cityChipClass(
                              isExploreCitySelected(filters, city.id, city.name),
                            )}`}
                          >
                            {city.name}
                            {isExploreCitySelected(filters, city.id, city.name) ? ' ×' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredProvinces.length === 0 ? (
                    <p className={`py-8 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                      شهری یافت نشد
                    </p>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes exploreSearchSlideDown {
          from { transform: translateY(-100%); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const FilterToggleRow: React.FC<{
  isDark: boolean
  active: boolean
  onToggle: () => void
  icon: React.ReactNode
  activeIconClass: string
  title: string
  subtitle: string
}> = ({ isDark, active, onToggle, icon, activeIconClass, title, subtitle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 transition ${
      active
        ? isDark
          ? 'border-teal-600 bg-teal-900/30'
          : 'border-teal-500 bg-teal-50'
        : isDark
          ? 'border-slate-700 bg-slate-800/50'
          : 'border-gray-100 bg-gray-50'
    }`}
  >
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        active
          ? activeIconClass
          : isDark
            ? 'bg-slate-700 text-slate-300'
            : 'bg-white text-gray-600'
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1 text-right">
      <p className={`text-[12px] font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </p>
      <p className={`mt-0.5 text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {subtitle}
      </p>
    </div>
    <div
      className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${
        active ? 'bg-teal-600' : isDark ? 'bg-slate-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
          active ? '-translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  </button>
)
