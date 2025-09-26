import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Layout } from './components/layout/Layout'
import { ProfileGuard } from './components/ProfileGuard'

// Pages to keep
import { Home } from './pages/Home'
import { Businesses } from './pages/Businesses'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { TestUsers } from './pages/TestUsers'

// Dashboard Pages
import { MainDashboard } from './pages/dashboard/MainDashboard'
import { Profile } from './pages/dashboard/Profile'
import { useAuth } from './contexts/AuthContext'

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth()

  if (!user) {
    return <Layout><Home /></Layout>
  }

  // All users get the same main dashboard design, but customers need completed profiles
  return (
    <ProfileGuard>
      <MainDashboard />
    </ProfileGuard>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
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
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/dashboard/profile" element={<Profile />} />

            {/* Test Users Page */}
            <Route path="/test-users" element={<TestUsers />} />

            {/* Only keep specified routes */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
