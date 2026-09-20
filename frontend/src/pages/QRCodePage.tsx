import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { BusinessQRCode } from '../components/business/BusinessQRCode'
import { BusinessScreen } from '../components/business/BusinessScreen'

export const QRCodePage: React.FC = () => {
  const { user } = useAuth()

  if (!user || user.type !== 'business') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <BusinessScreen>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <BusinessQRCode />
      </div>
    </BusinessScreen>
  )
}
