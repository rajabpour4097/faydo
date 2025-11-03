import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { BusinessQRCode } from '../components/business/BusinessQRCode'

export const QRCodePage: React.FC = () => {
  const { user } = useAuth()

  // Only business users can access this page
  if (!user || user.type !== 'business') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <BusinessQRCode />
    </div>
  )
}
