import { useEffect, useState } from 'react'
import { BusinessHomeView } from '../../components/business/BusinessHomeView'
import { apiService, BusinessDashboardData } from '../../services/api'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'

export const BusinessDashboardMobile = () => {
  const [data, setData] = useState<BusinessDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiService.getBusinessDashboard().then(response => {
      if (response.data) setData(response.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <MobileDashboardLayout>
      <BusinessHomeView data={data} loading={loading} />
    </MobileDashboardLayout>
  )
}
