import { useEffect, useState } from 'react'
import { BusinessHomeView } from '../../components/business/BusinessHomeView'
import { apiService, BusinessDashboardData } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'

export const BusinessDashboard = () => {
  const [data, setData] = useState<BusinessDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiService.getBusinessDashboard().then(response => {
      if (response.data) setData(response.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <BusinessHomeView data={data} loading={loading} />
      </div>
    </DashboardLayout>
  )
}
