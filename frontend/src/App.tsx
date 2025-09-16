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
import { AuthDebug } from './pages/auth/AuthDebug'
import { CustomerDashboard } from './pages/dashboard/CustomerDashboard'
import { BusinessDashboard } from './pages/dashboard/BusinessDashboard'
import { CustomerEliteOffer } from './pages/dashboard/CustomerEliteOffer'
import { BusinessEliteOffer } from './pages/dashboard/BusinessEliteOffer'
import { CustomerFavorites } from './pages/dashboard/CustomerFavorites'
import { CustomerOrders } from './pages/dashboard/CustomerOrders'
import { CustomerMessages } from './pages/dashboard/CustomerMessages'
import { CustomerSupport } from './pages/dashboard/CustomerSupport'
import { ScanQR } from './pages/dashboard/ScanQR'
import { BusinessCustomers } from './pages/dashboard/BusinessCustomers'
import { Profile } from './pages/profile/Profile'
import { NotFound } from './pages/NotFound'
import { DiscountList } from './pages/customer/DiscountList'
import { DiscountDetail } from './pages/customer/DiscountDetail'
import { DiscountManagement } from './pages/business/DiscountManagement'
import { DiscountCreate } from './pages/business/DiscountCreate'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with Layout (Header + Footer) */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/businesses" element={<Layout><Businesses /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route 
            path="/discounts" 
            element={
              <Layout>
                <ProtectedRoute>
                  <DiscountList />
                </ProtectedRoute>
              </Layout>
            } 
          />
          <Route 
            path="/discounts/:id" 
            element={
              <Layout>
                <ProtectedRoute>
                  <DiscountDetail />
                </ProtectedRoute>
              </Layout>
            } 
          />
          
          {/* Guest-only routes with Layout */}
          <Route 
            path="/login" 
            element={
              <Layout>
                <GuestRoute>
                  <Login />
                </GuestRoute>
              </Layout>
            } 
          />
          <Route 
            path="/register" 
            element={
              <Layout>
                <GuestRoute>
                  <Register />
                </GuestRoute>
              </Layout>
            } 
          />
            
          {/* Protected routes - Customer only (no Layout) */}
          <Route 
            path="/dashboard/customer" 
            element={
              <CustomerRoute>
                <CustomerDashboard />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/discounts" 
            element={
              <CustomerRoute>
                <DiscountList />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/scan" 
            element={
              <CustomerRoute>
                <ScanQR />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/discounts/:id" 
            element={
              <CustomerRoute>
                <DiscountDetail />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/eliteoffer" 
            element={
              <CustomerRoute>
                <CustomerEliteOffer />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/discounts" 
            element={
              <CustomerRoute>
                <DiscountList />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/favorites" 
            element={
              <CustomerRoute>
                <CustomerFavorites />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/orders" 
            element={
              <CustomerRoute>
                <CustomerOrders />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/messages" 
            element={
              <CustomerRoute>
                <CustomerMessages />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/dashboard/customer/support" 
            element={
              <CustomerRoute>
                <CustomerSupport />
              </CustomerRoute>
            } 
          />
          
          {/* Protected routes - Business only (no Layout) */}
          <Route 
            path="/dashboard/business" 
            element={
              <BusinessRoute>
                <BusinessDashboard />
              </BusinessRoute>
            } 
          />
          <Route 
            path="/dashboard/business/eliteoffer" 
            element={
              <BusinessRoute>
                <BusinessEliteOffer />
              </BusinessRoute>
            } 
          />
          <Route 
            path="/dashboard/business/customers" 
            element={
              <BusinessRoute>
                <BusinessCustomers />
              </BusinessRoute>
            } 
          />
          <Route 
            path="/dashboard/business/discounts" 
            element={
              <BusinessRoute>
                <DiscountManagement />
              </BusinessRoute>
            } 
          />
          <Route 
            path="/dashboard/business/discounts/create" 
            element={
              <BusinessRoute>
                <DiscountCreate />
              </BusinessRoute>
            } 
          />
          
          {/* Profile page (no Layout) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Debug page with Layout */}
          <Route 
            path="/debug" 
            element={
              <Layout>
                <ProtectedRoute>
                  <AuthDebug />
                </ProtectedRoute>
              </Layout>
            } 
          />
          
          {/* Generic dashboard redirect based on user role (no Layout) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div></div> {/* This will auto-redirect to appropriate dashboard */}
              </ProtectedRoute>
            } 
          />
          
          {/* 404 - Catch all route with Layout */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
