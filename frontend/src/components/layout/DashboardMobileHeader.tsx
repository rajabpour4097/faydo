import { Link } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { FaydoLogo } from '../brand/FaydoLogo'
import { MembershipTierBadge } from '../dashboard/MembershipTierBadge'
import { useAuth } from '../../contexts/AuthContext'

interface DashboardMobileHeaderProps {
  onMenuOpen: () => void
  notificationCount: number
  userMenuOpen: boolean
  onUserMenuToggle: () => void
  onUserMenuClose: () => void
  onLogout: () => void
  isDark: boolean
}

function getDisplayName(user: ReturnType<typeof useAuth>['user']) {
  if (!user) return 'کاربر'
  if (user.type === 'business') {
    return user.businessProfile?.name || user.name || user.username
  }
  return user.display_name || user.name || user.username
}

function getRoleLabel(type: string | undefined) {
  if (type === 'business') return 'کسب‌وکار'
  if (type === 'customer') return 'مشتری'
  if (['admin', 'it_manager', 'project_manager'].includes(type ?? '')) return 'مدیر'
  return 'کاربر'
}

export const DashboardMobileHeader = ({
  onMenuOpen,
  notificationCount,
  userMenuOpen,
  onUserMenuToggle,
  onUserMenuClose,
  onLogout,
  isDark,
}: DashboardMobileHeaderProps) => {
  const { user } = useAuth()
  const displayName = getDisplayName(user)
  const isCustomer = user?.type === 'customer'

  const actionBtnClass = `w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-100 text-gray-700'
  }`

  return (
    <header
      className={`sticky top-0 z-50 ${
        isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-[#f5f6f8] border-b border-transparent'
      }`}
      style={{ direction: 'ltr' }}
    >
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Left: menu + notifications */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onMenuOpen} className={actionBtnClass} aria-label="منو">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard/transactions" className={`relative ${actionBtnClass}`} aria-label="اعلان‌ها">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
            )}
          </Link>
        </div>

        {/* Center: logo */}
        <div className="flex-1 flex justify-center min-w-0">
          <FaydoLogo size="sm" />
        </div>

        {/* Right: profile */}
        <div className="relative flex-shrink-0">
          <button onClick={onUserMenuToggle} className="flex items-center gap-2 min-w-0">
            {isCustomer && (
              <div className="flex-shrink-0">
                <MembershipTierBadge compact />
              </div>
            )}
            <div className="text-right min-w-0 max-w-[110px]">
              <p
                className={`text-sm font-semibold truncate leading-tight ${
                  isDark ? 'text-white' : 'text-[#0D1B3E]'
                }`}
              >
                {displayName}
              </p>
              <p
                className={`text-[10px] mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {getRoleLabel(user?.type)}
              </p>
            </div>
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D1B3E] to-[#1a3a6b] flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
          </button>

          {userMenuOpen && (
            <div
              className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50"
              style={{ direction: 'rtl' }}
            >
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {displayName}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {user?.phone_number || 'شماره تماس'}
                </p>
              </div>
              <Link
                to="/dashboard/profile"
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={onUserMenuClose}
              >
                <span className="ml-2">👤</span> پروفایل
              </Link>
              <button
                onClick={() => {
                  onUserMenuClose()
                  onLogout()
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="ml-2">🚪</span> خروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
