import { ReactNode } from 'react'
import { MobileDashboardLayout } from '../layout/MobileDashboardLayout'

export function BusinessScreen({ children }: { children: ReactNode }) {
  return <MobileDashboardLayout>{children}</MobileDashboardLayout>
}
