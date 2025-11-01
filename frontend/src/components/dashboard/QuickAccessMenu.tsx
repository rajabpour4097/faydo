import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

interface QuickAccessMenuItem {
  id: string
  title: string
  icon: string
  href: string
  color: string
  isActive: boolean
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
    title: 'تاریخچه خرید',
    icon: '📝',
    href: '/history',
    color: 'from-secondary-500 to-secondary-600',
    isActive: false
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

  return (
    <div className={`rounded-2xl p-6 ${
      isDark ? 'bg-slate-800' : 'bg-white'
    } shadow-lg`}>
      <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        دسترسی سریع
      </h3>
      
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-4">
        {MENU_ITEMS.map((item) => (
          item.isActive ? (
            <Link
              key={item.id}
              to={item.href}
              className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105`}
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-xs font-medium text-center">{item.title}</span>
            </Link>
          ) : (
            <div
              key={item.id}
              className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md opacity-75 cursor-not-allowed`}
              title="به زودی"
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-xs font-medium text-center">{item.title}</span>
              <span className="text-[10px] mt-1 opacity-75">به زودی</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
