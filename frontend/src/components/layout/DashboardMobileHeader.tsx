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

  const actionBtnClass = isCustomer
    ? `w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border ${
        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-100 text-gray-700'
      }`
    : `w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-100 text-gray-700'
      }`

  const actionIconClass = isCustomer ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <header
      className={`sticky top-0 z-50 ${
        isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-[#f5f6f8] border-b border-transparent'
      }`}
      style={{ direction: 'ltr' }}
    >
      <div
        className={`grid grid-cols-3 items-center px-3 gap-1 ${isCustomer ? 'py-2' : 'py-3'}`}
      >
        {/* Left: menu + notifications */}
        <div className="flex items-center gap-1.5 justify-start">
          <button onClick={onMenuOpen} className={actionBtnClass} aria-label="منو">
            <Menu className={actionIconClass} />
          </button>
          <Link to="/dashboard/transactions" className={`relative ${actionBtnClass}`} aria-label="اعلان‌ها">
            <Bell className={actionIconClass} />
            {notificationCount > 0 && (
              <span
                className={`absolute bg-teal-500 rounded-full ring-2 ring-white ${
                  isCustomer ? 'top-2 right-2 w-1.5 h-1.5' : 'top-2.5 right-2.5 w-2 h-2'
                }`}
              />
            )}
          </Link>
        </div>

        {/* Center: logo — always true center via equal grid columns */}
        <div className="flex justify-center min-w-0">
          <FaydoLogo size="sm" />
        </div>

        {/* Right: profile */}
        <div className="relative flex justify-end min-w-0 overflow-hidden">
          <button
            onClick={onUserMenuToggle}
            className={`flex items-center min-w-0 max-w-full ${isCustomer ? 'gap-1.5' : 'gap-2'}`}
          >
            <div
              className={`text-right min-w-0 overflow-hidden ${
                isCustomer ? 'flex-1' : 'max-w-[110px]'
              }`}
            >
              <p
                className={`font-semibold truncate leading-tight ${
                  isCustomer ? 'text-[11px] sm:text-xs' : 'text-sm'
                } ${isDark ? 'text-white' : 'text-[#0D1B3E]'}`}
              >
                {displayName}
              </p>
              {isCustomer ? (
                <div className="flex items-center justify-end gap-1 mt-0.5 min-w-0">
                  <MembershipTierBadge micro />
                  <span
                    className={`text-[8px] sm:text-[9px] leading-none flex-shrink-0 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
                  >
                    {getRoleLabel(user?.type)}
                  </span>
                </div>
              ) : (
                <p
                  className={`text-[10px] mt-0.5 leading-tight ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  {getRoleLabel(user?.type)}
                </p>
              )}
            </div>
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className={`rounded-full object-cover border-2 border-white shadow-sm ${
                    isCustomer ? 'w-8 h-8' : 'w-10 h-10'
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div
                  className={`rounded-full bg-gradient-to-br from-[#0D1B3E] to-[#1a3a6b] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ${
                    isCustomer ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
                  }`}
                >
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
          </button>

          {userMenuOpen && (
            <div
              className="absolute top-11 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50"
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
