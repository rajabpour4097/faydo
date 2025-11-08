import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'

interface QuickAccessMenuItem {
  id: string
  title: string
  icon: string
  href: string
  color: string
  isActive: boolean
  badge?: number
}

const MENU_ITEMS: QuickAccessMenuItem[] = [
  {
    id: 'explore',
    title: 'کشف تجربیات',
    icon: '🔍',
    href: '/explore',
    color: 'from-primary-500 to-primary-600',
    isActive: true
  },
  {
    id: 'clubs',
    title: 'باشگاه‌ها',
    icon: '🎯',
    href: '/clubs',
    color: 'from-purple-500 to-pink-500',
    isActive: true
  },
  {
    id: 'qr-scan',
    title: 'اسکن QR',
    icon: '📷',
    href: '/qr-scan',
    color: 'from-accent-500 to-accent-600',
    isActive: false
  },
  {
    id: 'wallet',
    title: 'کیف پول',
    icon: '💰',
    href: '/wallet',
    color: 'from-success-500 to-success-600',
    isActive: false
  },
  {
    id: 'history',
    title: 'تراکنش‌های من',
    icon: '📋',
    href: '/dashboard/transactions',
    color: 'from-blue-500 to-blue-600',
    isActive: true
  },
  {
    id: 'favorites',
    title: 'علاقه‌مندی‌ها',
    icon: '❤️',
    href: '/favorites',
    color: 'from-danger-400 to-danger-500',
    isActive: false
  },
  {
    id: 'clubs',
    title: 'باشگاه‌ها',
    icon: '🎯',
    href: '/clubs',
    color: 'from-warning-500 to-warning-600',
    isActive: false
  },
  {
    id: 'challenges',
    title: 'چالش‌ها',
    icon: '🏆',
    href: '/challenges',
    color: 'from-purple-500 to-purple-600',
    isActive: false
  },
  {
    id: 'support',
    title: 'پشتیبانی',
    icon: '💬',
    href: '/support',
    color: 'from-teal-500 to-teal-600',
    isActive: false
  },
  {
    id: 'settings',
    title: 'تنظیمات',
    icon: '⚙️',
    href: '/settings',
    color: 'from-slate-500 to-slate-600',
    isActive: false
  }
]

export const QuickAccessMenu = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { pendingCount } = useNotification()

  // آپدیت badge در آیتم history
  const menuItems = MENU_ITEMS.map(item => {
    if (item.id === 'history' && user?.type === 'customer') {
      return { ...item, badge: pendingCount > 0 ? pendingCount : undefined }
    }
    return item
  })

  return (
    <div className={`rounded-2xl p-6 ${
      isDark ? 'bg-slate-800' : 'bg-white'
    } shadow-lg`}>
      
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-4">
        {menuItems.map((item) => (
          item.isActive ? (
            <Link
              key={item.id}
              to={item.href}
              className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 relative`}
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-xs font-medium text-center">{item.title}</span>
              {/* Badge for pending count */}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center shadow-lg">
                  {item.badge}
                </span>
              )}
            </Link>
          ) : (
            <div
              key={item.id}
              className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md opacity-75 cursor-not-allowed`}
              title="به زودی"
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-xs font-medium text-center">{item.title}</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
