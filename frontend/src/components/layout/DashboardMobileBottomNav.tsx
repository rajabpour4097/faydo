import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  Compass,
  Gift,
  User,
  QrCode,
  Package,
} from 'lucide-react'
import transactionsIcon from '../../assets/nav/transactions.png'

const ACTIVE = '#14b8a6'
const INACTIVE = '#5c6b7a'

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
  size = 22,
}: {
  type: NavIconType
  active: boolean
  size?: number
}) {
  const color = active ? ACTIVE : INACTIVE
  const stroke = active ? 2.4 : 1.8

  if (type === 'transactions') {
    return (
      <img
        src={transactionsIcon}
        alt=""
        className="object-contain"
        style={{
          width: size,
          height: size,
          opacity: active ? 1 : 0.72,
          filter: active
            ? 'none'
            : 'grayscale(30%) brightness(0.85)',
        }}
      />
    )
  }

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
    default:
      return null
  }
}

function NavItem({
  tab,
  active,
}: {
  tab: NavTab
  active: boolean
}) {
  return (
    <Link
      to={tab.href}
      className="flex flex-col items-center min-w-[52px] py-1 transition-colors"
    >
      <div className="relative mb-0.5">
        <NavIcon type={tab.icon} active={active} />
        {tab.badge && tab.badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 py-px rounded-full min-w-[14px] text-center leading-none">
            {tab.badge > 9 ? '9+' : tab.badge}
          </span>
        )}
      </div>
      <span
        className="text-[11px] font-medium leading-tight"
        style={{ color: active ? ACTIVE : INACTIVE }}
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-1 pt-0 pointer-events-none">
      <div
        className={`pointer-events-auto mx-auto max-w-lg rounded-[28px] border shadow-[0_4px_28px_rgba(15,23,42,0.1)] ${
          isDark
            ? 'bg-slate-800 border-slate-700 shadow-black/20'
            : 'bg-white border-gray-100/90'
        }`}
      >
        {children}
      </div>
    </nav>
  )

  if (userType === 'business') {
    return renderBar(
      <div className="flex items-end justify-around px-1 pt-2 pb-1.5 relative" dir="rtl">
        {businessTabs.map((tab) => (
          <NavItem key={tab.href} tab={tab} active={isActive(tab.href)} />
        ))}
      </div>
    )
  }

  const [leftTab, rightTab, ...restTabs] = customerTabs

  return renderBar(
        <div className="flex items-end justify-around px-1 pt-2 pb-1.5 relative" dir="rtl">
          <NavItem tab={leftTab} active={isActive(leftTab.href)} />

          <NavItem tab={rightTab} active={isActive(rightTab.href)} />

          <button
            type="button"
            onClick={onScanClick}
            className="flex flex-col items-center min-w-[58px] -mt-7"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#0d9488] flex items-center justify-center shadow-[0_6px_20px_rgba(13,148,136,0.45)] ring-4 ring-white">
              <QrCode className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium mt-1" style={{ color: INACTIVE }}>
              اسکن
            </span>
          </button>

          {restTabs.map((tab) => (
            <NavItem key={tab.href} tab={tab} active={isActive(tab.href)} />
          ))}
        </div>
  )
}
