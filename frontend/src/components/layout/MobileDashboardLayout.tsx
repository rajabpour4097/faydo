import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { CustomIcon } from '../ui/CustomIcon'
import { ThemeToggle } from '../ui/ThemeToggle'

interface MobileDashboardLayoutProps {
  children: ReactNode
}

// Removed unused ServiceItem interface

interface BottomNavItem {
  name: string
  href: string
  icon: string
  iconType?: 'emoji' | 'image' | 'base64' | 'url'
}

export const MobileDashboardLayout = ({ children }: MobileDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [forceCloseThemeMenu, setForceCloseThemeMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    // Force close theme menu when sidebar closes
    setForceCloseThemeMenu(true)
    // Reset the force close flag after a short delay
    setTimeout(() => setForceCloseThemeMenu(false), 100)
  }

  // Removed unused serviceItems - services are defined in MobileDashboard component

  const getBottomNavItems = (): BottomNavItem[] => {
    if (!user) return []

    // Business users get different bottom nav items
    if (user.type === 'business') {
      return [
        { name: 'داشبورد', href: '/dashboard', icon: '/src/assets/images/home.png', iconType: 'image' },
        { name: 'مدیریت پکیج', href: '/dashboard/packages', icon: '/src/assets/images/package.png', iconType: 'image' },
        { name: 'برندها', href: '/dashboard/brands', icon: '🏷️', iconType: 'emoji' },
        { name: 'پروفایل', href: '/dashboard/profile', icon: '/src/assets/images/user.png', iconType: 'image' },
      ]
    }

    // Default items for other user types
      return [
        { name: 'پروفایل', href: '/dashboard/profile', icon: '/src/assets/images/user.png', iconType: 'image' },
        { name: 'باشگاه ها', href: '/dashboard/clubs', icon: '/src/assets/images/club-icon.png', iconType: 'image' },
        { name: 'اکسپلور', href: '/dashboard/explore', icon: '/src/assets/images/explore.png', iconType: 'image'},
        { name: 'داشبورد', href: '/dashboard', icon: '/src/assets/images/home.png', iconType: 'image' },
      ]
  }

  const bottomNavItems = getBottomNavItems()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={`min-h-screen font-persian ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`} style={{ direction: 'rtl' }}>
      {/* Mobile Header */}
      <header className={`mobile-header sticky top-0 z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b`} style={{ direction: 'ltr' }}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* User Avatar/Logo - سمت چپ */}
          <div className="relative order-1">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'کاربر'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-teal-500"
                  onError={(e) => {
                    console.log('Avatar load error:', user.avatar)
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
             
              <div className="flex flex-col items-start">
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || user?.username || 'کاربر'}
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {user?.type === 'business' ? 'کسب‌وکار' : 'مشتری'}
                </span>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute top-12 left-0 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || user?.username || 'کاربر'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {user?.phone_number || 'شماره تماس'}
                  </p>
                </div>
                
                <Link
                  to="/dashboard/profile"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <span className="ml-3">👤</span>
                  پروفایل
                </Link>
                
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleLogout()
                  }}
                  className={`w-full flex items-center px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 ${
                    isDark ? 'text-red-400' : 'text-red-600'
                  }`}
                >
                  <span className="ml-3">🚪</span>
                  خروج
                </button>
              </div>
            )}
          </div>

          {/* App Title - وسط */}
          <div className="flex items-center space-x-2 order-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🤝</span>
            </div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              فایدو
            </h1>
          </div>

          {/* Menu Button - سمت راست */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg order-3 ${isDark ? 'text-white hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}

      {/* User Menu Overlay */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-68 transform ${
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
            onClick={closeSidebar}
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
                    { name: 'داشبورد', href: '/dashboard', icon: '📊', iconType: 'emoji' },
                    { name: 'مدیریت پکیج ها', href: '/dashboard/packages', icon: '/src/assets/images/package.png', iconType: 'image' },
                    { name: 'پروفایل', href: '/dashboard/profile', icon: '👤', iconType: 'emoji' },
                    { name: 'تنظیمات', href: '/dashboard/settings', icon: '⚙️', iconType: 'emoji' },
                  ]
                : [
                    { name: 'پروفایل', href: '/dashboard/profile', icon: '👤', iconType: 'emoji' },
                    { name: 'داشبورد', href: '/dashboard', icon: '📊', iconType: 'emoji' },
                    { name: 'تنظیمات', href: '/dashboard/settings', icon: '⚙️', iconType: 'emoji' },
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
                  onClick={closeSidebar}
                >
                  <div className="ml-3">
                    <CustomIcon 
                      type={(item.iconType as 'emoji' | 'image' | 'base64' | 'url') || 'emoji'} 
                      value={item.icon} 
                      alt={item.name}
                      className="w-5 h-5"
                    />
                  </div>
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
            <ThemeToggle forceClose={forceCloseThemeMenu} />
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
      <nav className={`fixed bottom-0 left-0 right-0 border-t ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex flex-col items-center py-1 px-3 transition-colors relative"
              >
                {/* Blue indicator line above the icon */}
                {active && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-blue-500 rounded-full"></div>
                )}
                <div className="mb-1">
                  <CustomIcon
                    type={(item.iconType as 'emoji' | 'image' | 'base64' | 'url') || 'emoji'}
                    value={item.icon}
                    alt={item.name}
                    className="w-6 h-5"
                    active={active}
                  />
                </div>
                <span className={`text-xs ${active ? 'text-blue-500' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
