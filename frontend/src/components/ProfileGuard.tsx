import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProfileGuardProps {
  children: React.ReactNode
}

/**
 * ProfileGuard component that ensures customer users have completed their profiles
 * before accessing protected dashboard routes.
 */
export const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { user } = useAuth()

  // If not authenticated, redirect to home
  if (!user) {
    return <Navigate to="/" replace />
  }

  // For customer users, check if profile is complete
  if (user.type === 'customer' && user.isProfileComplete === false) {
    // Redirect incomplete customer profiles to profile page
    return <Navigate to="/dashboard/profile" replace />
  }

  // Profile is complete or user is not a customer, allow access
  return <>{children}</>
}