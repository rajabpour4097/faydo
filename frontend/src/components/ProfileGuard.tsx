import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProfileGuardProps {
  children: React.ReactNode
  allowProfileAccess?: boolean // Allow access to profile page even if profile is incomplete
}

/**
 * ProfileGuard component that ensures users have completed their profiles
 * before accessing protected dashboard routes.
 */
export const ProfileGuard: React.FC<ProfileGuardProps> = ({ children, allowProfileAccess = false }) => {
  const { user } = useAuth()

  // If not authenticated, redirect to home
  if (!user) {
    return <Navigate to="/" replace />
  }

  // If allowProfileAccess is true, always allow access (for profile page itself)
  if (allowProfileAccess) {
    return <>{children}</>
  }

  // For customer users, check if profile is complete
  if (user.type === 'customer' && user.isProfileComplete === false) {
    // Redirect incomplete customer profiles to profile page
    return <Navigate to="/dashboard/profile" replace />
  }

  // For business users, check if profile is complete
  if (user.type === 'business' && user.isProfileComplete === false) {
    // Redirect incomplete business profiles to profile page
    return <Navigate to="/dashboard/profile" replace />
  }

  // Profile is complete or user doesn't need profile completion, allow access
  return <>{children}</>
}