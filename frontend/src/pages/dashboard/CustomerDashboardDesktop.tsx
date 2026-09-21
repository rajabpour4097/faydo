import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CustomerHeroSection } from '../../components/dashboard/CustomerHeroSection'
import { CustomerPointsCard } from '../../components/dashboard/CustomerPointsCard'
import { QuickAccessMenu } from '../../components/dashboard/QuickAccessMenu'
import { CustomerRecentActivities } from '../../components/dashboard/CustomerRecentActivities'
import { CustomerSpecialOffers } from '../../components/dashboard/CustomerSpecialOffers'

export const CustomerDashboardDesktop = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CustomerHeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CustomerPointsCard fetchFromApi={true} />
          </div>

          <div className="lg:col-span-2">
            <QuickAccessMenu />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomerSpecialOffers compact={false} />
          <CustomerRecentActivities compact={false} />
        </div>
      </div>
    </DashboardLayout>
  )
}
