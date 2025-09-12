import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { DashboardHeader } from './DashboardHeader'

interface DashboardLayoutProps {
  children: ReactNode
}

interface MenuItem {
  name: string
  href: string
  icon: ReactNode
  badge?: string | number
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const customerMenuItems: MenuItem[] = [
    {
      name: 'داشبورد',
      href: '/dashboard/customer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      name: 'تخفیفات',
      href: '/dashboard/customer/discounts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'تخفیف اعضای ویژه',
      href: '/dashboard/customer/eliteoffer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      name: 'پیشنهادها',
      href: '/dashboard/customer/suggestions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-4v2m0 4h.01" />
        </svg>
      ),
      badge: 5
    },
    {
      name: 'علاقه‌مندی‌ها',
      href: '/dashboard/customer/favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      name: 'تاریخچه خرید',
      href: '/dashboard/customer/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      name: 'پیام‌ها',
      href: '/dashboard/customer/messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: 3
    },
    {
      name: 'پشتیبانی',
      href: '/dashboard/customer/support',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.196l1.771 5.467a1 1 0 00.95.69h5.754c.969 0 1.371 1.24.588 1.81l-4.651 3.379a1 1 0 00-.362 1.118l1.771 5.467c.3.926-.755 1.688-1.538 1.118L12 17.865l-4.283 3.118c-.783.57-1.838-.192-1.538-1.118l1.771-5.467a1 1 0 00-.362-1.118L2.937 9.901c-.783-.57-.38-1.81.588-1.81h5.754a1 1 0 00.95-.69L12 2.196z" />
        </svg>
      )
    }
  ]

  const businessMenuItems: MenuItem[] = [
    {
      name: 'داشبورد',
      href: '/dashboard/business',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      name: 'مدیریت تخفیفات',
      href: '/dashboard/business/discounts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      name: 'تخفیف اعضای ویژه',
      href: '/dashboard/business/eliteoffer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-4v2m0 4h.01" />
        </svg>
      )
    },
    {
      name: 'مشتریان',
      href: '/dashboard/business/customers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      name: 'سفارش‌ها',
      href: '/dashboard/business/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      badge: 12
    },
    {
      name: 'پیام‌ها',
      href: '/dashboard/business/messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: 7
    },
    {
      name: 'گزارش‌ها',
      href: '/dashboard/business/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'تنظیمات',
      href: '/dashboard/business/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  const menuItems = user?.type === 'business' ? businessMenuItems : customerMenuItems

  const isActive = (href: string) => {
    if (href === `/dashboard/${user?.type}`) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen dashboard-bg overflow-x-hidden">
      {/* Dashboard Header */}
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:mr-64">
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Right Sidebar */}
        <div className={`w-64 bg-night-900/70 backdrop-blur-xl shadow-2xl border-l border-white/10 fixed right-0 top-0 lg:top-16 h-screen lg:h-[calc(100vh-4rem)] z-[80] overflow-y-auto will-change-transform transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-[105%] lg:translate-x-0'
        }`}>

        {/* Mobile sidebar header */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-night-900/80 backdrop-blur-xl border-b border-white/10">
          <span className="text-white/80 text-sm font-medium">منو</span>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="بستن منو"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-r from-surface-600 to-surface-500 rounded-full flex items-center justify-center shadow-soft">
              {user?.avatar ? (
                <img src={user.avatar} alt="پروفایل" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-lg font-medium">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'ک'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || user?.username}
              </p>
              <p className="text-xs text-white/60">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 text-white">
          <div className="mb-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider px-4">منو اصلی</p>
          </div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white shadow-lg transform scale-[1.02] border-transparent'
                    : 'text-white/80 hover:text-white hover:bg-white/5 hover:shadow-soft border-white/10'
                }`}
              >
                <span className={`ml-3 flex-shrink-0 ${
                  isActive(item.href) ? 'text-white' : 'text-white/60 group-hover:text-white'
                }`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Profile and Logout */}
        <div className="p-4 border-t border-white/10 bg-white/5 text-white">
          <div className="space-y-2">
            <Link
              to="/profile"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border ${
                location.pathname === '/profile'
                  ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white shadow-lg border-transparent'
                  : 'text-white/80 hover:text-white hover:bg-white/5 hover:shadow-soft border-white/10'
              }`}
            >
              <svg className={`ml-3 w-5 h-5 ${
                location.pathname === '/profile' ? 'text-white' : 'text-white/60 group-hover:text-white'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>پروفایل</span>
            </Link>
            <Link
              to="/"
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-white/80 hover:text-white hover:bg-white/5 hover:shadow-soft transition-all duration-200 border border-white/10"
            >
              <svg className="ml-3 w-5 h-5 text-white/60 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>بازگشت به خانه</span>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
