import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Transaction, loyaltyService } from '../../services/loyalty'

interface TransactionApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onApproved: () => void
  onRejected: () => void
}

const formatNumber = (num: string | number): string => {
  const numStr = num.toString().replace(/,/g, '')
  if (!numStr || numStr === '0') return '0'
  return parseInt(numStr).toLocaleString('en-US')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const TransactionApprovalModal: React.FC<TransactionApprovalModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onApproved,
  onRejected
}) => {
  const { isDark } = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !transaction) return null

  const handleApprove = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      await loyaltyService.approveTransaction(transaction.id)
      onApproved()
      onClose()
    } catch (err: any) {
      console.error('Error approving transaction:', err)
      setError(err.error || 'خطا در تایید تراکنش')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      await loyaltyService.rejectTransaction(transaction.id)
      onRejected()
      onClose()
    } catch (err: any) {
      console.error('Error rejecting transaction:', err)
      setError(err.error || 'خطا در رد تراکنش')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              جزئیات تراکنش
            </h3>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-slate-700 text-slate-400'
                  : 'hover:bg-gray-100 text-gray-500'
              } disabled:opacity-50`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Customer Info */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {transaction.customer_name}
                </h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className={`p-4 rounded-xl space-y-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              جزئیات مبلغ
            </h4>
            
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                مبلغ اصلی:
              </span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(transaction.original_amount)} تومان
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                تخفیف اصلی:
              </span>
              <span className={`font-bold text-red-500`}>
                -{formatNumber(transaction.discount_all_amount)} تومان
              </span>
            </div>

            {transaction.has_special_discount && (
              <>
                <div className={`h-px ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`} />
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {transaction.special_discount_title}:
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(transaction.special_discount_original_amount)} تومان
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    تخفیف خاص:
                  </span>
                  <span className={`font-bold text-red-500`}>
                    -{formatNumber(transaction.special_discount_amount)} تومان
                  </span>
                </div>
              </>
            )}

            <div className={`h-px ${isDark ? 'bg-slate-600' : 'bg-gray-300'}`} />

            <div className="flex justify-between items-center">
              <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                مبلغ نهایی:
              </span>
              <span className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {formatNumber(transaction.final_amount)} تومان
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                امتیاز کسب شده:
              </span>
              <span className={`text-lg font-bold text-blue-500`}>
                +{transaction.points_earned} امتیاز
              </span>
            </div>
          </div>

          {/* Note */}
          {transaction.note && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                <span className="font-bold">یادداشت: </span>
                {transaction.note}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Actions */}
          {transaction.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors ${
                  isDark
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing ? 'در حال پردازش...' : 'رد تراکنش'}
              </button>
              
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing ? 'در حال پردازش...' : 'تایید تراکنش'}
              </button>
            </div>
          )}

          {transaction.status !== 'pending' && (
            <div className="text-center pt-2">
              <span className={`inline-block px-6 py-3 rounded-xl font-bold ${
                transaction.status === 'approved'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {transaction.status === 'approved' ? 'تراکنش تایید شده' : 'تراکنش رد شده'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
