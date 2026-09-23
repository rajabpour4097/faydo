import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { QrScannerProvider } from './contexts/QrScannerContext'
import { Layout } from './components/layout/Layout'
import { MobileAppFrame } from './components/layout/MobileAppFrame'
import { ProfileGuard } from './components/ProfileGuard'
import { AutoTransactionNotification } from './components/customer/AutoTransactionNotification'
import { QRScannerModal } from './components/scanner/QRScannerModal'

// Pages to keep
import { Home } from './pages/Home'
import { Businesses } from './pages/Businesses'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { TestUsers } from './pages/TestUsers'
import { Explore } from './pages/Explore'
import { ExploreSectionList } from './pages/ExploreSectionList'
import { Clubs } from './pages/Clubs'
import { ClubDetail } from './pages/ClubDetail'
import { ClubSearchResults } from './pages/ClubSearchResults'
import { ClubExperienceResults } from './pages/ClubExperienceResults'
import { BusinessDetail } from './pages/BusinessDetail'
import { QRCodePage } from './pages/QRCodePage'

// Dashboard Pages
import { MainDashboard } from './pages/dashboard/MainDashboard'
import { Profile } from './pages/dashboard/Profile'
import { PackageManagement } from './pages/dashboard/PackageManagement'
import { ClubManagement } from './pages/dashboard/ClubManagement'
import { ServiceCategoryManagement } from './pages/dashboard/ServiceCategoryManagement'
import { BusinessTransactionsPage } from './pages/business/BusinessTransactionsPage'
import { EliteGiftClaimsPage } from './pages/business/EliteGiftClaimsPage'
import { BusinessHealthPage } from './pages/business/BusinessHealthPage'
import { BusinessCustomersPage } from './pages/business/BusinessCustomersPage'
import { BusinessSalesPage } from './pages/business/BusinessSalesPage'
import { BusinessRegisterTransactionPage } from './pages/business/BusinessRegisterTransactionPage'
import { CustomerTransactionsPage } from './pages/customer/CustomerTransactionsPage'
import { CustomerPointsDetailsPage } from './pages/customer/CustomerPointsDetailsPage'
import { CustomerCashbackDetailsPage } from './pages/customer/CustomerCashbackDetailsPage'
import { CustomerFavoritesPage } from './pages/customer/CustomerFavoritesPage'
import { useAuth } from './contexts/AuthContext'

// Dashboard Router Component
const DashboardRouter = () => {
  const { user, isLoading } = useAuth()

  if (isLoading && !user) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center text-gray-500">در حال ورود...</div>
      </Layout>
    )
  }

  if (!user) {
    return <Layout><Home /></Layout>
  }

  const isBusinessUser = user.type === 'business'

  // All dashboard routes need profile completion except the profile page itself
  return (
    <Routes>
      <Route path="profile" element={<Profile />} />
      <Route path="packages" element={
        <ProfileGuard>
          <PackageManagement />
        </ProfileGuard>
      } />
      <Route path="explore" element={
        <ProfileGuard>
          <Explore />
        </ProfileGuard>
      } />
      <Route path="explore/:section" element={
        <ProfileGuard>
          <ExploreSectionList />
        </ProfileGuard>
      } />
      <Route path="clubs" element={
        <ProfileGuard>
          <Clubs />
        </ProfileGuard>
      } />
      <Route path="clubs/search" element={
        <ProfileGuard>
          <ClubSearchResults />
        </ProfileGuard>
      } />
      <Route path="clubs/experiences" element={
        <ProfileGuard>
          <ClubExperienceResults />
        </ProfileGuard>
      } />
      <Route path="clubs/:clubId" element={
        <ProfileGuard>
          <ClubDetail />
        </ProfileGuard>
      } />
      <Route path="business/:businessId" element={
        <ProfileGuard>
          <BusinessDetail />
        </ProfileGuard>
      } />
      <Route path="qrcode" element={
        <ProfileGuard>
          <QRCodePage />
        </ProfileGuard>
      } />
      <Route path="health" element={
        <ProfileGuard>
          {isBusinessUser ? <BusinessHealthPage /> : <Navigate to="/dashboard" />}
        </ProfileGuard>
      } />
      <Route path="customers" element={
        <ProfileGuard>
          {isBusinessUser ? <BusinessCustomersPage /> : <Navigate to="/dashboard" />}
        </ProfileGuard>
      } />
      <Route path="sales" element={
        <ProfileGuard>
          {isBusinessUser ? <BusinessSalesPage /> : <Navigate to="/dashboard" />}
        </ProfileGuard>
      } />
      <Route path="transactions/new" element={
        <ProfileGuard>
          {isBusinessUser ? <BusinessRegisterTransactionPage /> : <Navigate to="/dashboard" />}
        </ProfileGuard>
      } />
      <Route path="transactions" element={
        <ProfileGuard>
          {isBusinessUser ? <BusinessTransactionsPage /> : <CustomerTransactionsPage />}
        </ProfileGuard>
      } />
      <Route path="points" element={
        <ProfileGuard>
          {isBusinessUser ? <Navigate to="/dashboard" /> : <CustomerPointsDetailsPage />}
        </ProfileGuard>
      } />
      <Route path="cashback" element={
        <ProfileGuard>
          {isBusinessUser ? <Navigate to="/dashboard" /> : <CustomerCashbackDetailsPage />}
        </ProfileGuard>
      } />
      <Route path="favorites" element={
        <ProfileGuard>
          {isBusinessUser ? <Navigate to="/dashboard" /> : <CustomerFavoritesPage />}
        </ProfileGuard>
      } />
      <Route path="elite-gift-claims" element={
        <ProfileGuard>
          {isBusinessUser ? <EliteGiftClaimsPage /> : <Navigate to="/dashboard" />}
        </ProfileGuard>
      } />
      <Route path="admin/clubs" element={<ClubManagement />} />
      <Route path="admin/service-categories" element={<ServiceCategoryManagement />} />
      <Route path="" element={
        <ProfileGuard>
          <MainDashboard />
        </ProfileGuard>
      } />
      <Route path="*" element={
        <ProfileGuard>
          <MainDashboard />
        </ProfileGuard>
      } />
    </Routes>
  )
}

function AppShell() {
  const { user } = useAuth()
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <QrScannerProvider openScanner={() => setScannerOpen(true)}>
      <AutoTransactionNotification />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/businesses" element={<Layout><Businesses /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/dashboard/*" element={<DashboardRouter />} />
        <Route path="/test-users" element={<TestUsers />} />
      </Routes>
      {user?.type === 'customer' && (
        <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      )}
    </QrScannerProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
        <NotificationProvider>
          <Router>
            <MobileAppFrame>
              <AppShell />
            </MobileAppFrame>
          </Router>
        </NotificationProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
