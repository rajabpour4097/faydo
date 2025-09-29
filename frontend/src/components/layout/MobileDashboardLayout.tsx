import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { ThemeToggle } from '../ui/ThemeToggle'

interface MobileDashboardLayoutProps {
  children: ReactNode
}

// Removed unused ServiceItem interface

interface BottomNavItem {
  name: string
  href: string
  icon: string
}

export const MobileDashboardLayout = ({ children }: MobileDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Removed unused serviceItems - services are defined in MobileDashboard component

  const getBottomNavItems = (): BottomNavItem[] => {
    if (!user) return []

    // Business users get different bottom nav items
    if (user.type === 'business') {
      return [
        { name: 'داشبورد', href: '/dashboard', icon: '🏠' },
        { name: 'پروفایل', href: '/dashboard/profile', icon: '👤' },
        { name: 'شرکا', href: '/dashboard/affiliates', icon: '🤝' },
        { name: 'برندها', href: '/dashboard/brands', icon: '🏷️' },
      ]
    }

    // Default items for other user types
    return [
      { name: 'پروفایل', href: '/dashboard/profile', icon: '👤' },
      { name: 'داشبورد', href: '/dashboard', icon: '🏠' },
      { name: 'شرکا', href: '/dashboard/affiliates', icon: '🤝' },
      { name: 'برندها', href: '/dashboard/brands', icon: '🏷️' },
    ]
  }

  const bottomNavItems = getBottomNavItems()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={`min-h-screen font-persian ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`} style={{ direction: 'rtl' }}>
      {/* Mobile Header */}
      <header className={`mobile-header sticky top-0 z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg ${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* App Title - desktop branding */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🤝</span>
            </div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              فایدو
            </h1>
          </div>

          {/* Notification Bell */}
          <button className={`p-2 rounded-lg ${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 transform ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out ${
        isDark ? 'bg-slate-800' : 'bg-white'
      } shadow-lg`}>
        
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'ک'}
              </span>
            </div>
            <div>
              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || user?.username || 'کاربر'}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {user?.phone_number || 'شماره تماس'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {(() => {
              // Get sidebar items based on user type
              const sidebarItems = user?.type === 'business' 
                ? [
                    { name: 'داشبورد', href: '/dashboard', icon: '📊' },
                    { name: 'پروفایل', href: '/dashboard/profile', icon: '👤' },
                    { name: 'تنظیمات', href: '/dashboard/settings', icon: '⚙️' },
                  ]
                : [
                    { name: 'پروفایل', href: '/dashboard/profile', icon: '👤' },
                    { name: 'داشبورد', href: '/dashboard', icon: '📊' },
                    { name: 'تنظیمات', href: '/dashboard/settings', icon: '⚙️' },
                  ]

              return sidebarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-teal-500 text-white'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg ml-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))
            })()}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          {/* Theme Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>حالت تاریک</span>
            <ThemeToggle />
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              isDark 
                ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <span className="text-lg ml-3">🚪</span>
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={`mobile-bottom-nav fixed bottom-0 left-0 right-0 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } border-t`}>
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'text-teal-500'
                  : isDark 
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
