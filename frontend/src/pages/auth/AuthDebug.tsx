import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'

export const AuthDebug = () => {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({
    user: null,
    accessToken: null,
    refreshToken: null,
    apiTest: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')
      
      // Test API call
      let apiTest = null
      try {
        const response = await apiService.getProfile()
        apiTest = { success: !!response.data, error: response.error, data: response.data }
      } catch (error) {
        apiTest = { success: false, error: String(error) }
      }
      
      setDebugInfo({
        user,
        accessToken: accessToken ? accessToken.substring(0, 50) + '...' : null,
        refreshToken: refreshToken ? refreshToken.substring(0, 50) + '...' : null,
        apiTest
      })
    }
    
    checkAuth()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User Context</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tokens</h2>
          <p><strong>Access Token:</strong> {debugInfo.accessToken || 'None'}</p>
          <p><strong>Refresh Token:</strong> {debugInfo.refreshToken || 'None'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">API Test</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(debugInfo.apiTest, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Navigation</h2>
          <div className="space-y-3">
            <a href="/profile" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Profile
            </a>
            <a href="/login" className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Go to Login
            </a>
            <a href="/" className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
