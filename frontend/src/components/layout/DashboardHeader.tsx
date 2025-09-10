import { useAuth } from '../../contexts/AuthContext'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Dashboard Title */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">فایدو</h1>
                <p className="text-sm text-blue-700 font-medium hidden sm:block">
                  {user?.type === 'business' ? 'پنل مدیریت کسب‌وکار' : 'پنل کاربری'}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 19c0 1.105-0.895 2-2 2s-2-0.895-2-2 0.895-2 2-2 2 0.895 2 2zm11-13c0-3.866-3.134-7-7-7s-7 3.134-7 7c0 3.859 3.129 6.988 6.982 7h0.035c3.867 0 6.983-3.134 6.983-7z" />
              </svg>
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User dropdown */}
            <div className="flex items-center space-x-3 space-x-reverse bg-gray-100 rounded-lg px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="پروفایل" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'ک'}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
