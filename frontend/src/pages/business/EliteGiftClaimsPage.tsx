import React, { useState, useEffect, useMemo, useRef } from 'react'
import { apiService, EliteGiftClaim, EliteGiftCustomerRow } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { Gift, Check, X, Clock, CheckCircle, ChevronLeft } from 'lucide-react'
import { formatRelativeShamsi, formatShamsiDate, formatShamsiDateTime } from '../../utils/shamsiDate'
import { useSearchParams } from 'react-router-dom'

export const EliteGiftClaimsPage: React.FC = () => {
  const { isDark } = useTheme()
  const [params] = useSearchParams()
  const [claims, setClaims] = useState<EliteGiftClaim[]>([])
  const [customers, setCustomers] = useState<EliteGiftCustomerRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<EliteGiftClaim | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionNote, setActionNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [modalError, setModalError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | EliteGiftCustomerRow['status']>('all')
  const openedClaimId = useRef(0)
  const deliveryOptions = useMemo(() => (
    ['امروز', 'فردا', 'پس‌فردا'].map((prefix, index) => {
      const date = new Date()
      date.setDate(date.getDate() + index)
      const value = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')
      return { value, label: `${prefix} ـ ${formatShamsiDate(date)}` }
    })
  ), [])

  const loadClaims = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getEliteGiftCustomers()
      if (response.data) {
        setCustomers(response.data.customers)
        setClaims(response.data.customers.flatMap(row => row.claim ? [row.claim] : []))
      } else {
        setCustomers([])
        setClaims([])
        setError(response.error ? String(response.error) : 'خطا در دریافت درخواست‌ها')
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
    setDeliveryDate(deliveryOptions[0].value)
    setModalError('')
    setShowModal(true)
  }

  const targetClaimId = Number(params.get('claim') || 0)
  useEffect(() => {
    if (!targetClaimId || showModal || openedClaimId.current === targetClaimId) return
    const claim = claims.find(item => item.id === targetClaimId)
    if (claim) {
      openedClaimId.current = targetClaimId
      handleClaimClick(claim)
    }
  }, [targetClaimId, claims, showModal])

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedClaim(null)
    setActionNote('')
    setModalError('')
  }

  const handleApprove = async () => {
    if (!selectedClaim) return
    if (!deliveryDate) {
      setModalError('تاریخ تحویل را انتخاب کنید.')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await apiService.approveEliteGiftClaim(selectedClaim.id, deliveryDate, actionNote)
      if (response.error) {
        const detail = (response.error as any)?.detail || String(response.error)
        setModalError(detail)
        return
      }
      await loadClaims()
      handleModalClose()
    } catch (err: any) {
      console.error('Error approving claim:', err)
      setModalError('خطا در تایید درخواست')
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

  const handleMarkUsed = async () => {
    if (!selectedClaim) return
    setIsSubmitting(true)
    const response = await apiService.markEliteGiftClaimUsed(selectedClaim.id)
    setIsSubmitting(false)
    if (response.error) {
      setModalError((response.error as any)?.detail || String(response.error))
      return
    }
    await loadClaims()
    handleModalClose()
  }

  const pendingClaims = claims.filter(c => c.status === 'pending')
  const filteredCustomers = filterStatus === 'all'
    ? customers
    : customers.filter(customer => customer.status === filterStatus)

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
      case 'expired':
        return <Clock className="w-5 h-5 text-gray-500" />
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
      case 'expired':
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
      case 'ready':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'near':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const statusLabel = (status: EliteGiftCustomerRow['status']) => ({
    pending: 'درخواست هدیه',
    approved: 'زمان‌بندی شده',
    expired: 'منقضی',
    ready: 'آماده دریافت',
    near: 'نزدیک',
    in_progress: 'در مسیر',
    used: 'دریافت شده',
    rejected: 'رد شده',
  }[status])

  if (isLoading) {
    return (
      <MobileDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </MobileDashboardLayout>
    )
  }

  const content = (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { value: 'all', label: 'همه', count: customers.length },
              { value: 'pending', label: 'درخواست‌ها', count: customers.filter(c => c.status === 'pending').length },
              { value: 'ready', label: 'آماده دریافت', count: customers.filter(c => c.status === 'ready').length },
              { value: 'near', label: 'نزدیک', count: customers.filter(c => c.status === 'near').length },
              { value: 'in_progress', label: 'در مسیر', count: customers.filter(c => c.status === 'in_progress').length },
              { value: 'approved', label: 'زمان‌بندی‌شده', count: customers.filter(c => c.status === 'approved').length },
              { value: 'expired', label: 'منقضی', count: customers.filter(c => c.status === 'expired').length },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value as any)}
                className={`shrink-0 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
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

        {filteredCustomers.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            <Gift className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              مشتری‌ای در این دسته وجود ندارد
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filteredCustomers.map(row => (
                <button
                  type="button"
                  key={row.customer_id}
                  onClick={() => row.claim && handleClaimClick(row.claim)}
                  disabled={!row.claim}
                  className={`w-full rounded-2xl border p-4 text-right shadow-sm transition ${
                    isDark
                      ? 'border-gray-700 bg-gray-800'
                      : 'border-gray-100 bg-white'
                  } ${row.claim ? 'active:scale-[0.99]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`truncate text-[15px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {row.customer_name}
                      </p>
                      <p className={`mt-1 text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        آخرین خرید: {formatRelativeShamsi(row.last_purchase_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusColor(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                      {row.claim && <ChevronLeft className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        پیشرفت دریافت هدیه
                      </span>
                      <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {row.progress.percentage.toLocaleString('fa-IR')}٪
                      </span>
                    </div>
                    <div className={`h-2.5 overflow-hidden rounded-full ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-purple-600 to-fuchsia-400 transition-all"
                        style={{ width: `${Math.min(100, row.progress.percentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  {row.status === 'pending' && (
                    <p className="mt-3 text-[11px] font-bold text-purple-600 dark:text-purple-300">
                      برای بررسی درخواست لمس کنید
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div className={`hidden overflow-x-auto rounded-2xl border md:block ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
              <table className="w-full min-w-[680px] text-right">
              <thead className={isDark ? 'bg-gray-700/60' : 'bg-gray-50'}>
                <tr className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  <th className="p-4 font-semibold">مشتری</th>
                  <th className="p-4 font-semibold">وضعیت</th>
                  <th className="p-4 font-semibold">آخرین خرید</th>
                  <th className="p-4 font-semibold">پیشرفت</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(row => (
                  <tr
                    key={row.customer_id}
                    onClick={() => row.claim && handleClaimClick(row.claim)}
                    className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700/40' : 'border-gray-100 hover:bg-gray-50'} ${row.claim ? 'cursor-pointer' : ''}`}
                  >
                    <td className={`p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {row.customer_name}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className={`p-4 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatRelativeShamsi(row.last_purchase_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-28 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${Math.min(100, row.progress.percentage || 0)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {row.progress.percentage.toLocaleString('fa-IR')}٪
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className={`max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-4 pb-6 sm:p-6">
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
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        تاریخ تحویل
                      </label>
                      <select
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className={`w-full rounded-xl border px-3 py-3 text-sm font-bold ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        {deliveryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className={`mt-1.5 text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        یکی از سه روز پیش‌رو را انتخاب کنید.
                      </p>
                    </div>
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
                  </div>
                )}

                {selectedClaim.scheduled_for && (
                  <div className={`rounded-lg p-3 text-sm ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-purple-50 text-purple-800'}`}>
                    <p>تاریخ تحویل: {formatShamsiDate(selectedClaim.scheduled_for)}</p>
                    <p className="mt-1">مهلت دریافت: {formatShamsiDate(selectedClaim.expires_at)}</p>
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
                {modalError && <p className="text-sm text-red-500">{modalError}</p>}
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
              {selectedClaim.status === 'approved' && (
                <button
                  onClick={handleMarkUsed}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                >
                  <Check className="w-5 h-5" />
                  ثبت تحویل هدیه
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <MobileDashboardLayout>
      {content}
    </MobileDashboardLayout>
  )
}
