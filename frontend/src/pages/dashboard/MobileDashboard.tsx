import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { EmptyDashboard } from './EmptyDashboard'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePackages } from '../../hooks/usePackages'
import { Link } from 'react-router-dom'

interface ServiceCardProps {
  title: string
  icon: string
  color: string
  href: string
}

// Desktop-style list items for mobile cards
interface ListItem {
  title: string
  status?: 'active' | 'pending' | 'validated' | 'inactive'
}

const ServiceCard = ({ title, icon, color, href }: ServiceCardProps) => {
  return (
    <Link
      to={href}
      className={`mobile-service-card ${color} rounded-2xl p-4 text-white shadow-lg`}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
    </Link>
  )
}

// Simple list section card used for Recent Affiliates/Brands/Uploads
const ListSection = ({ title, items }: { title: string; items: ListItem[] }) => {
  const { isDark } = useTheme()
  return (
    <div className={`${
      isDark ? 'bg-slate-800' : 'bg-white'
    } rounded-2xl p-4 shadow-sm`}>
      <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className={isDark ? 'text-slate-300' : 'text-gray-700'}>{item.title}</div>
            {item.status && (
              <span className={`${
                item.status === 'active' ? 'status-active' :
                item.status === 'pending' ? 'status-pending' :
                item.status === 'validated' ? 'status-validated' : 'status-inactive'
              } px-2 py-1 rounded-full text-xs`}>
                {item.status === 'active' && 'Active'}
                {item.status === 'pending' && 'Pending'}
                {item.status === 'validated' && 'Validated'}
                {item.status === 'inactive' && 'In Active'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export const MobileDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { hasPackages, loading } = usePackages()

  // Show loading state
  if (loading) {
    return (
      <MobileDashboardLayout>
        <div className="p-4 space-y-6">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl mt-4"></div>
          </div>
        </div>
      </MobileDashboardLayout>
    )
  }

  // Show empty dashboard for businesses without packages
  if (user?.type === 'business' && !hasPackages) {
    return (
      <MobileDashboardLayout>
        <EmptyDashboard />
      </MobileDashboardLayout>
    )
  }

  // Quick actions matching desktop sections
  const services = [
    { title: 'شرکای تبلیغاتی', icon: '🤝', color: 'bg-teal-500', href: '/dashboard/affiliates' },
    { title: 'برندها', icon: '🏷️', color: 'bg-purple-500', href: '/dashboard/brands' },
    { title: 'مشتریان', icon: '👥', color: 'bg-orange-500', href: '/dashboard/clients' },
    { title: 'آپلودها', icon: '📤', color: 'bg-blue-500', href: '/dashboard/uploads' },
  ]

  // Recent lists adapted from desktop content
  const recentAffiliates: ListItem[] = [
    { title: 'Affiliates One', status: 'active' },
    { title: 'Top Casino Reviews', status: 'active' },
    { title: 'Gaming Partners', status: 'pending' },
  ]

  const recentBrands: ListItem[] = [
    { title: 'Lucky Casino', status: 'active' },
    { title: 'Spin Palace', status: 'active' },
    { title: 'Royal Bets', status: 'active' },
  ]

  const recentUploads: ListItem[] = [
    { title: 'Lucky Casino Performance', status: 'validated' },
    { title: 'Spin Palace Report', status: 'pending' },
    { title: 'Royal Bets Analytics', status: 'pending' },
  ]

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className={`${
          isDark ? 'bg-slate-800' : 'bg-white'
        } rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                سلام {user?.businessProfile?.name || user?.name || 'کسب‌وکار'}! خوش آمدید
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                چطور می‌تونیم کمکتون کنیم؟
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">👋</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (match desktop sections) */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            بخش‌ها
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                icon={service.icon}
                color={service.color}
                href={service.href}
              />
            ))}
          </div>
        </div>

        {/* Search Section */}
        <div className={`${
          isDark ? 'bg-slate-800' : 'bg-white'
        } rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="جستجوی پزشک یا تخصص"
                className={`w-full pl-4 pr-10 py-3 rounded-lg border ${
                  isDark 
                    ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                    : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button className="bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm whitespace-nowrap">
            همه ⭐
          </button>
          <button className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${
            isDark 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            بالاترین امتیاز
          </button>
          <button className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${
            isDark 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            پزشکان فعال
          </button>
          <button className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${
            isDark 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            ارزان‌ترین
          </button>
        </div>

        {/* Recent sections (desktop parity) */}
        <ListSection title="Recent Affiliates" items={recentAffiliates} />
        <ListSection title="Recent Brands" items={recentBrands} />
        <ListSection title="Recent Uploads" items={recentUploads} />

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`${
            isDark ? 'bg-slate-800' : 'bg-white'
          } rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-teal-500 mb-1">۲۴۰,۰۰۰</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>ویزیت حضوری</div>
          </div>
          <div className={`${
            isDark ? 'bg-slate-800' : 'bg-white'
          } rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-purple-500 mb-1">۱۵۰,۰۰۰</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>مشاوره فوری</div>
          </div>
        </div>

        {/* Consultation Options */}
        <div className={`${
          isDark ? 'bg-slate-800' : 'bg-white'
        } rounded-2xl p-4 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            مشاوره فوری
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500">📞</span>
                </div>
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>مشاوره تلفنی</div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>۵ دقیقه کمک با پزشک</div>
                </div>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                دریافت مشاوره فوری
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Spacing for Navigation */}
        <div className="h-4"></div>
      </div>
    </MobileDashboardLayout>
  )
}
