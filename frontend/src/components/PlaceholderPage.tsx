import { DashboardLayout } from './layout/DashboardLayout'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: string
  comingSoon?: boolean
}

export const PlaceholderPage = ({ title, description, icon, comingSoon = true }: PlaceholderPageProps) => {
  return (
    <DashboardLayout>
      <div className="mr-64 min-h-[calc(100vh-4rem)] bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-6">{icon}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 mb-8">{description}</p>
            
            {comingSoon && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 در حال توسعه</h3>
                <p className="text-blue-800">این بخش به زودی راه‌اندازی خواهد شد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
