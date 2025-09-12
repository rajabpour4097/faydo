import { useAuth } from '../../contexts/AuthContext'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    // Force redirect to home page after logout
    window.location.href = '/'
  }

  return (
    <header className="bg-night-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-[70] shadow-lg">
      <div className="max-w-full px-4 sm:px-6 text-white">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Dashboard Title */}
          <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition border border-white/10"
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
                <h1 className="text-xl font-bold text-white">فایدو</h1>
                <p className="text-sm text-white/70 font-medium hidden sm:block">
                  {user?.type === 'business' ? 'پنل مدیریت کسب‌وکار' : 'پنل کاربری'}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">

            {/* User dropdown */}
            <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse bg-white/10 border border-white/10 rounded-lg px-3 sm:px-4 py-2">
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
                <p className="text-sm font-medium text-white">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-white/80 bg-white/10 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-white/10 active:scale-95 flex items-center justify-center"
            >
              <span className="hidden sm:inline">خروج</span>
              <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="خروج">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m12 0l-4-4m4 4l-4 4m6-10h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
