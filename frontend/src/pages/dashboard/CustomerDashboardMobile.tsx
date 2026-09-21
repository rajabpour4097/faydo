import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { CustomerHeroSection } from '../../components/dashboard/CustomerHeroSection'
import { CustomerPointsCard } from '../../components/dashboard/CustomerPointsCard'
import { QuickAccessMenu } from '../../components/dashboard/QuickAccessMenu'
import { CustomerRecentActivities } from '../../components/dashboard/CustomerRecentActivities'
import { CustomerSpecialOffers } from '../../components/dashboard/CustomerSpecialOffers'

export const CustomerDashboardMobile = () => {
  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4">
        <CustomerHeroSection />

        {/* بخش میانی: امتیاز، سطوح، آمار */}
        <CustomerPointsCard fetchFromApi={true} />

        <QuickAccessMenu />

        <CustomerSpecialOffers />

        <CustomerRecentActivities />
      </div>
    </MobileDashboardLayout>
  )
}
