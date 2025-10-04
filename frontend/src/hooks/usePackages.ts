import { useState, useEffect } from 'react'
import { apiService, Package } from '../services/api'

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getPackages()
      
      if (response.data) {
        setPackages(response.data)
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('خطا در دریافت پکیج‌ها')
      console.error('Error fetching packages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const hasPackages = packages.length > 0
  const hasActivePackages = packages.some(pkg => pkg.is_active)
  const hasCompletePackages = packages.some(pkg => pkg.is_complete)

  return {
    packages,
    loading,
    error,
    hasPackages,
    hasActivePackages,
    hasCompletePackages,
    refetch: fetchPackages
  }
}
