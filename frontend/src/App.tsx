import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { Layout } from './components/layout/Layout'
import { ProfileGuard } from './components/ProfileGuard'
import { AutoTransactionNotification } from './components/customer/AutoTransactionNotification'

// Pages to keep
import { Home } from './pages/Home'
import { Businesses } from './pages/Businesses'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { TestUsers } from './pages/TestUsers'
import { Explore } from './pages/Explore'
import { Clubs } from './pages/Clubs'
import { ClubDetail } from './pages/ClubDetail'
import { BusinessDetail } from './pages/BusinessDetail'
import { QRCodePage } from './pages/QRCodePage'

// Dashboard Pages
import { MainDashboard } from './pages/dashboard/MainDashboard'
import { Profile } from './pages/dashboard/Profile'
import { PackageManagement } from './pages/dashboard/PackageManagement'
import { BusinessTransactionsPage } from './pages/business/BusinessTransactionsPage'
import { EliteGiftClaimsPage } from './pages/business/EliteGiftClaimsPage'
import { CustomerTransactionsPage } from './pages/customer/CustomerTransactionsPage'
import { useAuth } from './contexts/AuthContext'

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth()

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
      <Route path="clubs" element={
        <ProfileGuard>
          <Clubs />
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
      <Route path="transactions" element={
        <ProfileGuard>
          {isBusinessUser ? <BusinessTransactionsPage /> : <CustomerTransactionsPage />}
        </ProfileGuard>
      } />
      <Route path="elite-gift-claims" element={
        <ProfileGuard>
          {isBusinessUser ? <EliteGiftClaimsPage /> : <Navigate to="/dashboard" />}
        </ProfileGuard>
      } />
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            {/* Auto Notification برای نمایش خودکار modal نظردهی */}
            <AutoTransactionNotification />
            
            <Routes>
              {/* Public routes with Layout (Header + Footer) */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/businesses" element={<Layout><Businesses /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />

              {/* Redirect old auth routes to home */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />

              {/* Dashboard routes - no Layout wrapper as DashboardLayout handles its own layout */}
              <Route path="/dashboard/*" element={<DashboardRouter />} />

              {/* Test Users Page */}
              <Route path="/test-users" element={<TestUsers />} />

              {/* Only keep specified routes */}
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
