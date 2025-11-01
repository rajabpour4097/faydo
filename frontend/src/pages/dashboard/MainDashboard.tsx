import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboard } from './MobileDashboard'
import { EmptyDashboard } from './EmptyDashboard'
import { CustomerDashboardMobile } from './CustomerDashboardMobile'
import { CustomerDashboardDesktop } from './CustomerDashboardDesktop'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePackages } from '../../hooks/usePackages'

export const MainDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { hasPackages, loading } = usePackages()

  // Show loading state
  if (loading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="md:hidden">
          <div className="p-4 space-y-6">
            <div className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 rounded-2xl mt-4"></div>
            </div>
          </div>
        </div>

        {/* Desktop Loading */}
        <div className="hidden md:block">
          <DashboardLayout>
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardLayout>
        </div>
      </>
    )
  }

  // Customer Dashboard
  if (user?.type === 'customer') {
    return (
      <>
        {/* Mobile Customer Dashboard */}
        <div className="md:hidden">
          <CustomerDashboardMobile />
        </div>

        {/* Desktop Customer Dashboard */}
        <div className="hidden md:block">
          <CustomerDashboardDesktop />
        </div>
      </>
    )
  }

  // Show empty dashboard for businesses without packages
  if (user?.type === 'business' && !hasPackages) {
    return (
      <>
        {/* Mobile Empty Dashboard */}
        <div className="md:hidden">
          <MobileDashboard />
        </div>

        {/* Desktop Empty Dashboard */}
        <div className="hidden md:block">
          <DashboardLayout>
            <EmptyDashboard />
          </DashboardLayout>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileDashboard />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              Overviews
            </button>
            <button className={`px-4 py-2 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Affiliates
            </button>
            <button className={`px-4 py-2 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Brands
            </button>
            <button className={`px-4 py-2 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Clients
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className={`${
          isDark ? 'bg-slate-800' : 'bg-white'
        } rounded-2xl p-6 shadow-sm mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                سلام {user?.businessProfile?.name || user?.name || 'کسب‌وکار'}! خوش آمدید
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                چطور می‌تونیم کمکتون کنیم؟
              </p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl">👋</span>
            </div>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Affiliates */}
          <div className="stat-card-teal rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm opacity-80">Total Affiliates</div>
              </div>
            </div>
            <div className="text-sm opacity-80">+2.0% Last month</div>
          </div>

          {/* Active Brands */}
          <div className="stat-card-purple rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm opacity-80">Active Brands</div>
              </div>
            </div>
            <div className="text-sm opacity-80">+1.0% Last month</div>
          </div>

          {/* Active Deals */}
          <div className="stat-card-orange rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">36</div>
                <div className="text-sm opacity-80">Active Deals</div>
              </div>
            </div>
            <div className="text-sm opacity-80">+4.0% Last month</div>
          </div>

          {/* Average ROI */}
          <div className="stat-card-pink rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">142%</div>
                <div className="text-sm opacity-80">Average ROI</div>
              </div>
            </div>
            <div className="text-sm opacity-80">+12% Last month</div>
          </div>
        </div>

        {/* Content Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Affiliates */}
          <div className="theme-card rounded-2xl p-6">
            <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Affiliates</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Affiliates One</div>
                <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Top Casino Reviews</div>
                <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Gaming Partners</div>
                <span className="status-pending px-2 py-1 rounded-full text-xs">Pending</span>
              </div>
            </div>
          </div>

          {/* Recent Brands */}
          <div className="theme-card rounded-2xl p-6">
            <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Brands</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Lucky Casino</div>
                <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Spin Palace</div>
                <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Royal Bets</div>
                <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="theme-card rounded-2xl p-6">
            <h3 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Uploads</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Lucky Casino Performance</div>
                <span className="status-validated px-2 py-1 rounded-full text-xs">Validated</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Spin Palace Report</div>
                <span className="status-pending px-2 py-1 rounded-full text-xs">Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>Royal Bets Analytics</div>
                <span className="status-pending px-2 py-1 rounded-full text-xs">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Affiliate Management Table */}
        <div className="theme-card rounded-2xl p-6 mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${
                  isDark ? 'border-slate-600 border-opacity-30' : 'border-gray-200'
                }`}>
                  <th className={`py-4 px-6 font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>Company</th>
                  <th className={`py-4 px-6 font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>Manager</th>
                  <th className={`py-4 px-6 font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>Email</th>
                  <th className={`py-4 px-6 font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>Traffic Sources</th>
                  <th className={`py-4 px-6 font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`py-4 px-6 font-medium ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                <tr className={`border-b transition-colors ${
                  isDark 
                    ? 'border-slate-600 border-opacity-20 hover:bg-slate-700 hover:bg-opacity-30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-6">Affiliate One</td>
                  <td className="py-4 px-6">John Doe</td>
                  <td className="py-4 px-6">john@affiliateone.com</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">
                    <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className={`border-b transition-colors ${
                  isDark 
                    ? 'border-slate-600 border-opacity-20 hover:bg-slate-700 hover:bg-opacity-30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-6">Top Casino Reviews</td>
                  <td className="py-4 px-6">Jane Smith</td>
                  <td className="py-4 px-6">jane@tcreviews.com</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">
                    <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className={`border-b transition-colors ${
                  isDark 
                    ? 'border-slate-600 border-opacity-20 hover:bg-slate-700 hover:bg-opacity-30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-6">Gaming Partners</td>
                  <td className="py-4 px-6">Mike Johnson</td>
                  <td className="py-4 px-6">mike@gamingpartners.com</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">
                    <span className="status-pending px-2 py-1 rounded-full text-xs">Pending</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className={`border-b transition-colors ${
                  isDark 
                    ? 'border-slate-600 border-opacity-20 hover:bg-slate-700 hover:bg-opacity-30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-6">Bet Promoters</td>
                  <td className="py-4 px-6">Lisa Brown</td>
                  <td className="py-4 px-6">lisa@betpromoters.com</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">
                    <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className={`border-b transition-colors ${
                  isDark 
                    ? 'border-slate-600 border-opacity-20 hover:bg-slate-700 hover:bg-opacity-30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-6">Casino Affiliates</td>
                  <td className="py-4 px-6">David Wilson</td>
                  <td className="py-4 px-6">david@casinoaffiliates.com</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">
                    <span className="status-inactive px-2 py-1 rounded-full text-xs">In Active</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className={`transition-colors ${
                  isDark 
                    ? 'hover:bg-slate-700 hover:bg-opacity-30'
                    : 'hover:bg-gray-50'
                }`}>
                  <td className="py-4 px-6">Top Casino Reviews</td>
                  <td className="py-4 px-6">Jane Smith</td>
                  <td className="py-4 px-6">jane@tcreviews.com</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">
                    <span className="status-active px-2 py-1 rounded-full text-xs">Active</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </DashboardLayout>
      </div>
    </>
  )
}
