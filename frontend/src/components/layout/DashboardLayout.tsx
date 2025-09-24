import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { ThemeToggle } from '../ui/ThemeToggle'

interface DashboardLayoutProps {
  children: ReactNode
}

interface SidebarItem {
  name: string
  href: string
  icon: string
  badge?: number
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Affiliate Partnership sidebar items
  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return []

    return [
      { name: 'داشبورد', href: '/dashboard', icon: '📊' },
      { name: 'شرکای تبلیغاتی', href: '/dashboard/affiliates', icon: '🤝' },
      { name: 'برندها', href: '/dashboard/brands', icon: '🏷️' },
      { name: 'مشتریان', href: '/dashboard/clients', icon: '👥' },
      { name: 'عملکرد', href: '/dashboard/performance', icon: '📈' },
      { name: 'یادداشت‌ها و فایل‌ها', href: '/dashboard/notes', icon: '📋' },
      { name: 'آپلودها', href: '/dashboard/uploads', icon: '📤' },
      { name: 'تنظیمات', href: '/dashboard/settings', icon: '⚙️' },
    ]
  }

  const sidebarItems = getSidebarItems()
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen dashboard-bg font-persian flex" style={{ direction: 'rtl' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar on the left (LTR for this design) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 theme-sidebar transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-16 px-6 border-b ${
          isDark ? 'border-slate-600 border-opacity-30' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🤝</span>
            </div>
            <div>
              <div className="text-teal-500 font-bold text-sm">AFFILIATE</div>
              <div className={`text-xs opacity-80 ${isDark ? 'text-white' : 'text-gray-700'}`}>PARTNERSHIP</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-teal-500 text-white shadow-lg'
                    : isDark 
                      ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
        {/* Logout */}
        <div className={`p-4 border-t ${
          isDark ? 'border-slate-600 border-opacity-30' : 'border-gray-200'
        }`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isDark 
                ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <span className="text-lg mr-3">🚪</span>
            خروج
          </button>
        </div>
      </div>

      {/* Main Content - add left padding to avoid overlap with fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top Header */}
        <header className={`theme-card sticky top-0 z-30 border-b ${
          isDark ? 'border-slate-600 border-opacity-30' : 'border-gray-200'
        }`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Dashboard"
                    className={`w-80 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      isDark 
                        ? 'border-slate-600 border-opacity-30 bg-slate-700 bg-opacity-50 text-white placeholder-slate-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notification */}
                <button className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700 hover:bg-opacity-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || user?.username || 'کاربر'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {user?.phone_number || 'شماره تماس'}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'ک'}
                    </span>
                  </div>
                  
                  {/* Logout button in header */}
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                    title="خروج"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
