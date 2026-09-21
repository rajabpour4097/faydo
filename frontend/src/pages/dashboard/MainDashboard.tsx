import { MobileDashboard } from './MobileDashboard'
import { CustomerDashboardMobile } from './CustomerDashboardMobile'
import { BusinessDashboardMobile } from './BusinessDashboardMobile'
import { useAuth } from '../../contexts/AuthContext'
import { usePackages } from '../../hooks/usePackages'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'

export const MainDashboard = () => {
  const { user } = useAuth()
  const { loading } = usePackages()

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

  if (user?.type === 'customer') {
    return <CustomerDashboardMobile />
  }

  if (user?.type === 'business') {
    return <BusinessDashboardMobile />
  }

  return <MobileDashboard />
}
