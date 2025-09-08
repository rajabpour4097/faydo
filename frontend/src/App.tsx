import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute, GuestRoute, CustomerRoute, BusinessRoute } from './components/ProtectedRoute'

// Pages
import { Home } from './pages/Home'
import { Businesses } from './pages/Businesses'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { CustomerDashboard } from './pages/dashboard/CustomerDashboard'
import { BusinessDashboard } from './pages/dashboard/BusinessDashboard'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Guest-only routes (redirect to dashboard if logged in) */}
            <Route 
              path="/login" 
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } 
            />
            
            {/* Protected routes - Customer only */}
            <Route 
              path="/dashboard/customer" 
              element={
                <CustomerRoute>
                  <CustomerDashboard />
                </CustomerRoute>
              } 
            />
            
            {/* Protected routes - Business only */}
            <Route 
              path="/dashboard/business" 
              element={
                <BusinessRoute>
                  <BusinessDashboard />
                </BusinessRoute>
              } 
            />
            
            {/* Generic dashboard redirect based on user role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div></div> {/* This will auto-redirect to appropriate dashboard */}
                </ProtectedRoute>
              } 
            />
            
            {/* 404 - Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
