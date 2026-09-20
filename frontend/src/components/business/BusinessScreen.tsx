import { ReactNode } from 'react'
import { DashboardLayout } from '../layout/DashboardLayout'
import { MobileDashboardLayout } from '../layout/MobileDashboardLayout'

export function BusinessScreen({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="md:hidden">
        <MobileDashboardLayout>{children}</MobileDashboardLayout>
      </div>
      <div className="hidden md:block">
        <DashboardLayout>{children}</DashboardLayout>
      </div>
    </>
  )
}
