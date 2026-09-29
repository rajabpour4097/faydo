import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  Compass,
  Gift,
  User,
  QrCode,
  Package,
  Receipt,
} from 'lucide-react'

const ACTIVE = '#14b8a6'
const INACTIVE = '#5c6b7a'
const DARK_INACTIVE = '#94a3b8'

type NavIconType = 'home' | 'compass' | 'gift' | 'user' | 'package' | 'transactions'

interface NavTab {
  name: string
  href: string
  icon: NavIconType
  badge?: number
}

interface DashboardMobileBottomNavProps {
  userType: 'customer' | 'business'
  isActive: (path: string) => boolean
  onScanClick: () => void
  pendingCount?: number
  isDark?: boolean
}

function NavIcon({
  type,
  active,
  isDark,
  size = 20,
}: {
  type: NavIconType
  active: boolean
  isDark: boolean
  size?: number
}) {
  const color = active ? ACTIVE : isDark ? DARK_INACTIVE : INACTIVE
  const stroke = active ? 2.4 : 1.8

  const props = {
    size,
    color,
    strokeWidth: stroke,
    fill: type === 'home' && active ? color : 'none',
  }

  switch (type) {
    case 'home':
      return <Home {...props} />
    case 'compass':
      return <Compass {...props} />
    case 'gift':
      return <Gift {...props} />
    case 'user':
      return <User {...props} />
    case 'package':
      return <Package {...props} />
    case 'transactions':
      return <Receipt {...props} />
    default:
      return null
  }
}

function NavItem({
  tab,
  active,
  isDark,
}: {
  tab: NavTab
  active: boolean
  isDark: boolean
}) {
  return (
    <Link
      to={tab.href}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex min-h-[50px] min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1 outline-none transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 ${
        active
          ? isDark
            ? 'bg-teal-400/10'
            : 'bg-teal-50/90'
          : isDark
            ? 'hover:bg-white/5'
            : 'hover:bg-slate-50'
      } ${isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'}`}
    >
      <div
        className={`relative mb-0.5 flex h-6 w-8 items-center justify-center rounded-xl transition-transform duration-200 group-hover:-translate-y-0.5 ${
          active ? 'drop-shadow-[0_3px_6px_rgba(20,184,166,0.2)]' : ''
        }`}
      >
        <NavIcon type={tab.icon} active={active} isDark={isDark} />
        {tab.badge && tab.badge > 0 && (
          <span
            className={`absolute -right-1.5 -top-1.5 min-w-[16px] rounded-full border-2 bg-rose-500 px-1 py-0.5 text-center text-[9px] font-bold leading-none text-white shadow-sm ${
              isDark ? 'border-slate-900' : 'border-white'
            }`}
          >
            {tab.badge > 9 ? '9+' : tab.badge}
          </span>
        )}
      </div>
      <span
        className={`whitespace-nowrap text-[10px] leading-tight transition-colors ${
          active ? 'font-bold' : 'font-medium'
        }`}
        style={{ color: active ? ACTIVE : isDark ? DARK_INACTIVE : INACTIVE }}
      >
        {tab.name}
      </span>
    </Link>
  )
}

export const DashboardMobileBottomNav = ({
  userType,
  isActive,
  onScanClick,
  pendingCount = 0,
  isDark = false,
}: DashboardMobileBottomNavProps) => {
  const customerTabs: NavTab[] = [
    { name: 'خانه', href: '/dashboard', icon: 'home' },
    { name: 'اکسپلور', href: '/dashboard/explore', icon: 'compass' },
    { name: 'باشگاه‌ها', href: '/dashboard/clubs', icon: 'gift' },
    { name: 'پروفایل', href: '/dashboard/profile', icon: 'user' },
  ]

  const businessTabs: NavTab[] = [
    { name: 'خانه', href: '/dashboard', icon: 'home' },
    { name: 'مدیریت پکیج', href: '/dashboard/packages', icon: 'package' },
    {
      name: 'تراکنش‌ها',
      href: '/dashboard/transactions',
      icon: 'transactions',
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { name: 'پروفایل', href: '/dashboard/profile', icon: 'user' },
  ]

  const renderBar = (children: ReactNode) => (
    <nav
      aria-label="منوی اصلی"
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div
        className={`pointer-events-auto relative mx-auto max-w-lg rounded-[26px] border backdrop-blur-xl ${
          isDark
            ? 'border-white/10 bg-slate-900/95 shadow-[0_12px_36px_rgba(0,0,0,0.35)]'
            : 'border-white/90 bg-white/95 shadow-[0_12px_36px_rgba(15,23,42,0.14),0_2px_8px_rgba(15,23,42,0.06)]'
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-x-8 top-0 h-px ${
            isDark
              ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
              : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'
          }`}
        />
        {children}
      </div>
    </nav>
  )

  if (userType === 'business') {
    return renderBar(
      <div className="relative flex items-center justify-around gap-0.5 px-1.5 py-1" dir="rtl">
        {businessTabs.map((tab) => (
          <NavItem
            key={tab.href}
            tab={tab}
            active={isActive(tab.href)}
            isDark={isDark}
          />
        ))}
      </div>
    )
  }

  const [leftTab, rightTab, ...restTabs] = customerTabs

  return renderBar(
    <div className="relative flex items-center justify-around gap-0.5 px-1.5 py-1" dir="rtl">
      <NavItem tab={leftTab} active={isActive(leftTab.href)} isDark={isDark} />

      <NavItem tab={rightTab} active={isActive(rightTab.href)} isDark={isDark} />

      <button
        type="button"
        onClick={onScanClick}
        aria-label="اسکن کد"
        className={`group -mt-7 flex min-h-[58px] w-[54px] shrink-0 flex-col items-center rounded-2xl outline-none transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 ${
          isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
        }`}
      >
        <div
          className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[17px] bg-gradient-to-br from-teal-300 via-teal-500 to-teal-700 shadow-[0_8px_20px_rgba(13,148,136,0.42)] ring-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_24px_rgba(13,148,136,0.5)] ${
            isDark ? 'ring-slate-900' : 'ring-white'
          }`}
        >
          <span className="absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/20 blur-md" />
          <QrCode className="relative h-[22px] w-[22px] text-white" strokeWidth={2.2} />
        </div>
        <span
          className="mt-1 text-[10px] font-bold"
          style={{ color: isDark ? DARK_INACTIVE : INACTIVE }}
        >
          اسکن
        </span>
      </button>

      {restTabs.map((tab) => (
        <NavItem
          key={tab.href}
          tab={tab}
          active={isActive(tab.href)}
          isDark={isDark}
        />
      ))}
    </div>
  )
}
