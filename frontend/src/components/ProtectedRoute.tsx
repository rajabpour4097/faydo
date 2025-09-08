import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    // Redirect to login with the current location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check if user has required role
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.type)) {
    // Redirect to appropriate dashboard based on user role
    const userDashboard = user.type === 'business' ? '/dashboard/business' : '/dashboard/customer'
    return <Navigate to={userDashboard} replace />
  }

  // If not requiring auth and user is logged in, redirect to dashboard for certain pages
  if (!requireAuth && user && (location.pathname === '/login' || location.pathname === '/register')) {
    const userDashboard = user.type === 'business' ? '/dashboard/business' : '/dashboard/customer'
    return <Navigate to={userDashboard} replace />
  }

  return <>{children}</>
}

// Convenience component for guest-only routes (login, register)
export const GuestRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  )
}

// Convenience component for customer-only routes
export const CustomerRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['customer']}>
      {children}
    </ProtectedRoute>
  )
}

// Convenience component for business-only routes
export const BusinessRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['business']}>
      {children}
    </ProtectedRoute>
  )
}

// Convenience component for admin routes
export const AdminRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['admin', 'it_manager', 'project_manager', 'supporter', 'financial_manager']}>
      {children}
    </ProtectedRoute>
  )
}
