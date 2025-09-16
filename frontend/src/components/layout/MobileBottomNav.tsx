import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type Variant = 'public' | 'dashboard'

interface MobileBottomNavProps {
  variant?: Variant
}

const Icon = {
  home: (active: boolean) => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2 7-7 7 7 2 2v7a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3H10v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" />
    </svg>
  ),
  search: (_active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  ),
  heart: (active: boolean) => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  user: (_active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  qr: () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M21 7V5a2 2 0 00-2-2h-2M3 17v2a2 2 0 002 2h2M21 17v2a2 2 0 01-2 2h-2M9 9h6v6H9z" />
    </svg>
  ),
  plus: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  ),
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ variant = 'public' }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [edgeToEdge, setEdgeToEdge] = useState(false)

  // Detect standalone PWA (installed) to allow true edge-to-edge bottom
  useEffect(() => {
    const mm = window.matchMedia?.('(display-mode: standalone)')
    const isStandalone = mm?.matches || (navigator as any).standalone === true
    setEdgeToEdge(Boolean(isStandalone))
    const onChange = (e: MediaQueryListEvent) => setEdgeToEdge(e.matches)
    mm?.addEventListener?.('change', onChange)
    return () => mm?.removeEventListener?.('change', onChange)
  }, [])

  const isDashboard = variant === 'dashboard'
  const isCustomer = user?.type === 'customer'

  const barClasses = isDashboard
    ? 'bg-night-900/70 backdrop-blur-xl border-t border-white/10 text-white'
    : 'bg-white/90 backdrop-blur-md border-t border-gray-200 text-gray-800'

  const activeColor = isDashboard ? 'text-white' : 'text-blue-600'
  const inactiveColor = isDashboard ? 'text-white/70' : 'text-gray-500'

  // Sides (RTL): right group then left group; center FAB rendered separately
  const rightItems = isCustomer
    ? [
        { to: '/dashboard/customer', label: 'خانه', icon: Icon.home, end: true },
        { to: '/dashboard/customer/discounts', label: 'تخفیفات', icon: Icon.search },
      ]
    : [
        { to: '/dashboard/business', label: 'خانه', icon: Icon.home, end: true },
        { to: '/dashboard/business/discounts', label: 'تخفیفات', icon: Icon.search },
      ]

  const leftItems = isCustomer
    ? [
        { to: '/dashboard/customer/favorites', label: 'علاقه‌مندی', icon: Icon.heart },
        { to: '/profile', label: 'پروفایل', icon: Icon.user },
      ]
    : [
        { to: '/dashboard/business/eliteoffer', label: 'الیت', icon: Icon.heart },
        { to: '/profile', label: 'پروفایل', icon: Icon.user },
      ]

  const center = isCustomer
    ? { to: '/dashboard/customer/scan', icon: Icon.qr, label: 'اسکن' }
    : { to: '/dashboard/business/discounts/create', icon: Icon.plus, label: 'افزودن' }

  return (
    <nav
      className={`sm:hidden fixed bottom-0 inset-x-0 z-[90] w-full max-w-[100vw] rounded-b-[32px] md:rounded-b-[40px] shadow-[0_-10px_28px_rgba(0,0,0,0.25)] ${barClasses}`}
      style={{
        paddingBottom: edgeToEdge ? 0 : 'calc(env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)'
      }}
      aria-label="ناوبری پایین موبایل"
    >
      <div className="relative">
        {/* Bar background */}
        <div className="px-4 pt-3 pb-4 rounded-b-[32px] md:rounded-b-[40px] max-w-[100vw] overflow-x-hidden">
          <div className="flex items-end justify-between">
            {/* Right group (RTL first) */}
            <ul className="flex items-end gap-2">
              {rightItems.map((item: any) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={Boolean(item.end)}
                    className={({ isActive }) => {
                      const active = item.end ? (isActive && location.pathname === item.to) : isActive
                      return (
                        `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all select-none border ` +
                        (active
                          ? `${isDashboard ? 'bg-white/10 border-white/20' : 'bg-white shadow'} ${activeColor}`
                          : `${inactiveColor} ${isDashboard ? 'hover:bg-white/5' : 'hover:bg-gray-50'} border-transparent`)
                      )
                    }}
                  >
                    {({ isActive }) => {
                      const active = item.end ? (isActive && location.pathname === item.to) : isActive
                      return (
                        <>
                          <span className={`${active ? activeColor : inactiveColor}`}>{item.icon(active)}</span>
                          <span className={`text-[11px] leading-none ${active ? activeColor : inactiveColor}`}>{item.label}</span>
                        </>
                      )
                    }}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Left group */}
            <ul className="flex items-end gap-2">
              {leftItems.map((item: any) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all select-none border ` +
                      (isActive
                        ? `${isDashboard ? 'bg-white/10 border-white/20' : 'bg-white shadow'} ${activeColor}`
                        : `${inactiveColor} ${isDashboard ? 'hover:bg-white/5' : 'hover:bg-gray-50'} border-transparent`)
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`${isActive ? activeColor : inactiveColor}`}>{item.icon(isActive)}</span>
                        <span className={`text-[11px] leading-none ${isActive ? activeColor : inactiveColor}`}>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center FAB */}
  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
          <Link
            to={center.to}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border border-white/10 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white ring-4 ring-black/10"
            aria-label={center.label}
          >
            {center.icon()}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default MobileBottomNav
