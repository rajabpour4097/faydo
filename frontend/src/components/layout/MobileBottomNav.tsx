import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type Variant = 'public' | 'dashboard'

interface MobileBottomNavProps {
  variant?: Variant
}

const Icon = {
  home: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? '' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  search: (_active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  ),
  heart: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  user: (_active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ variant = 'public' }) => {
  const { user } = useAuth()
  const location = useLocation()

  const isDashboard = variant === 'dashboard'
  const isCustomer = user?.type === 'customer'

  const classes = isDashboard
    ? 'bg-night-900/70 backdrop-blur-xl border-t border-white/10 text-white'
    : 'bg-white/90 backdrop-blur-md border-t border-gray-200 text-gray-800'

  const activeColor = isDashboard ? 'text-white' : 'text-blue-600'
  const inactiveColor = isDashboard ? 'text-white/70' : 'text-gray-500'

  const items = isDashboard
    ? (isCustomer
        ? [
            { to: '/dashboard/customer', label: 'خانه', icon: Icon.home },
            { to: '/dashboard/customer/discounts', label: 'تخفیفات', icon: Icon.search },
            { to: '/dashboard/customer/favorites', label: 'علاقه‌مندی', icon: Icon.heart },
            { to: '/profile', label: 'پروفایل', icon: Icon.user },
          ]
        : [
            { to: '/dashboard/business', label: 'خانه', icon: Icon.home },
            { to: '/dashboard/business/discounts', label: 'تخفیفات', icon: Icon.search },
            { to: '/dashboard/business/customers', label: 'مشتریان', icon: Icon.heart },
            { to: '/profile', label: 'پروفایل', icon: Icon.user },
          ])
    : [
        { to: '/', label: 'خانه', icon: Icon.home },
        { to: '/discounts', label: 'جستجو', icon: Icon.search },
        { to: user ? (isCustomer ? '/dashboard/customer/favorites' : '/dashboard/business') : '/login', label: 'علاقه‌مندی', icon: Icon.heart },
        { to: user ? '/profile' : '/login', label: 'پروفایل', icon: Icon.user },
      ]

  return (
    <nav
      className={`sm:hidden fixed bottom-0 inset-x-0 z-[90] ${classes}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}
      aria-label="ناوبری پایین موبایل"
    >
      <ul className="grid grid-cols-4 gap-1 px-4 py-2">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <li key={item.to} className="flex items-center justify-center">
              <Link
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all select-none border ${
                  active
                    ? `${isDashboard ? 'bg-white/10 border-white/20' : 'bg-white shadow'} ${activeColor}`
                    : `${inactiveColor} ${isDashboard ? 'hover:bg-white/5' : 'hover:bg-gray-50'} border-transparent`
                }`}
              >
                <span className={`${active ? activeColor : inactiveColor}`}>{item.icon(active)}</span>
                <span className={`text-[11px] leading-none ${active ? activeColor : inactiveColor}`}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default MobileBottomNav
