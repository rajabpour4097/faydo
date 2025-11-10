import React, { useState, useEffect } from 'react'
import { apiService, EliteGiftClaim } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { Gift, Check, X, Clock, CheckCircle } from 'lucide-react'

export const EliteGiftClaimsPage: React.FC = () => {
  const { isDark } = useTheme()
  const [claims, setClaims] = useState<EliteGiftClaim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<EliteGiftClaim | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionNote, setActionNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'used'>('all')

  const loadClaims = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getEliteGiftClaims()
      console.log('Elite Gift Claims Response:', response)
      
      // Check if response has paginated data (results array)
      if (response.data) {
        // If it's a paginated response with results
        const claimsData = (response.data as any).results || response.data
        
        if (Array.isArray(claimsData)) {
          setClaims(claimsData)
        } else {
          console.error('Claims data is not an array:', claimsData)
          setClaims([])
          setError('فرمت داده‌های دریافتی نامعتبر است')
        }
      } else {
        setClaims([])
        setError('خطا در دریافت درخواست‌ها')
      }
    } catch (err: any) {
      console.error('Error loading elite gift claims:', err)
      setError('خطا در بارگذاری درخواست‌های هدیه ویژه')
      setClaims([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const handleClaimClick = (claim: EliteGiftClaim) => {
    setSelectedClaim(claim)
    setActionNote(claim.business_note || '')
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedClaim(null)
    setActionNote('')
  }

  const handleApprove = async () => {
    if (!selectedClaim) return
    
    setIsSubmitting(true)
    try {
      await apiService.approveEliteGiftClaim(selectedClaim.id, actionNote)
      await loadClaims()
      handleModalClose()
    } catch (err: any) {
      console.error('Error approving claim:', err)
      alert('خطا در تایید درخواست')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedClaim) return
    
    setIsSubmitting(true)
    try {
      await apiService.rejectEliteGiftClaim(selectedClaim.id, actionNote)
      await loadClaims()
      handleModalClose()
    } catch (err: any) {
      console.error('Error rejecting claim:', err)
      alert('خطا در رد درخواست')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingClaims = claims.filter(c => c.status === 'pending')
  const filteredClaims = filterStatus === 'all' 
    ? claims 
    : claims.filter(c => c.status === filterStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <X className="w-5 h-5 text-red-500" />
      case 'used':
        return <Check className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'used':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="md:hidden">
          <MobileDashboardLayout>
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          </MobileDashboardLayout>
        </div>

        {/* Desktop Loading */}
        <div className="hidden md:flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </>
    )
  }

  const content = (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  درخواست‌های هدیه ویژه
                </h1>
                {pendingClaims.length > 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {pendingClaims.length} درخواست در انتظار تایید
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'همه', count: claims.length },
              { value: 'pending', label: 'در انتظار', count: claims.filter(c => c.status === 'pending').length },
              { value: 'approved', label: 'تایید شده', count: claims.filter(c => c.status === 'approved').length },
              { value: 'rejected', label: 'رد شده', count: claims.filter(c => c.status === 'rejected').length },
              { value: 'used', label: 'استفاده شده', count: claims.filter(c => c.status === 'used').length },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-purple-600 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Claims List */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {filteredClaims.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            <Gift className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              درخواستی وجود ندارد
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => handleClaimClick(claim)}
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {claim.customer_name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {claim.gift_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(claim.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status_display}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>پیشرفت در زمان درخواست</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {claim.progress_at_claim.current.toLocaleString()} 
                      {claim.progress_at_claim.type === 'amount' ? ' تومان' : ' تراکنش'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>درصد پیشرفت</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {claim.progress_at_claim.percentage}%
                    </p>
                  </div>
                </div>

                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  تاریخ درخواست: {new Date(claim.created_at).toLocaleDateString('fa-IR')}
                </div>

                {claim.business_note && (
                  <div className={`mt-3 p-2 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    یادداشت: {claim.business_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  جزئیات درخواست
                </h2>
                <button
                  onClick={handleModalClose}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>مشتری</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedClaim.customer_name}
                  </p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>هدیه</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedClaim.gift_name}
                  </p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>پیشرفت در زمان درخواست</p>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedClaim.progress_at_claim.current.toLocaleString()} / {selectedClaim.progress_at_claim.target.toLocaleString()}
                      {selectedClaim.progress_at_claim.type === 'amount' ? ' تومان' : ' تراکنش'}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      درصد: {selectedClaim.progress_at_claim.percentage}%
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      تعداد تراکنش‌ها: {selectedClaim.progress_at_claim.transactions_count}
                    </p>
                  </div>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>وضعیت</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedClaim.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedClaim.status)}`}>
                      {selectedClaim.status_display}
                    </span>
                  </div>
                </div>

                {selectedClaim.status === 'pending' && (
                  <div>
                    <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      یادداشت (اختیاری)
                    </label>
                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="یادداشت خود را وارد کنید..."
                    />
                  </div>
                )}

                {selectedClaim.business_note && selectedClaim.status !== 'pending' && (
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>یادداشت</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedClaim.business_note}
                    </p>
                  </div>
                )}
              </div>

              {selectedClaim.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    تایید
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <X className="w-5 h-5" />
                    رد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <MobileDashboardLayout>
          {content}
        </MobileDashboardLayout>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {content}
      </div>
    </>
  )
}
