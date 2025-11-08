import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Transaction } from '../../services/loyalty'

interface TransactionCardProps {
  transaction: Transaction
  onClick: () => void
  showActions?: boolean
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

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onClick,
  showActions = false
}) => {
  const { isDark } = useTheme()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'approved':
        return 'text-green-500 bg-green-500/10'
      case 'rejected':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار تایید'
      case 'approved':
        return 'تایید شده'
      case 'rejected':
        return 'رد شده'
      default:
        return status
    }
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isDark
          ? 'bg-slate-800 border-slate-700 hover:border-blue-500'
          : 'bg-white border-gray-200 hover:border-blue-500'
      } ${transaction.status === 'pending' ? 'ring-2 ring-yellow-500/20' : ''}`}
      style={{ direction: 'rtl' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-50'
          }`}>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {transaction.customer_name}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {formatDate(transaction.created_at)}
            </p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
          {getStatusText(transaction.status)}
        </span>
      </div>

      {/* Amounts */}
      <div className={`p-3 rounded-lg space-y-2 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            مبلغ اصلی:
          </span>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(transaction.original_amount)} تومان
          </span>
        </div>
        
        {transaction.has_special_discount && (
          <>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {transaction.special_discount_title}:
              </span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(transaction.special_discount_original_amount)} تومان
              </span>
            </div>
          </>
        )}
        
        <div className="h-px bg-slate-600" />
        
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            مبلغ نهایی:
          </span>
          <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {formatNumber(transaction.final_amount)} تومان
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            امتیاز کسب شده:
          </span>
          <span className={`font-bold text-blue-500`}>
            {transaction.points_earned} امتیاز
          </span>
        </div>
      </div>

      {/* Note */}
      {transaction.note && (
        <div className={`mt-3 p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            یادداشت: {transaction.note}
          </p>
        </div>
      )}

      {/* Actions indicator for pending */}
      {transaction.status === 'pending' && showActions && (
        <div className="mt-3 flex items-center justify-center gap-2 text-yellow-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">کلیک کنید برای تایید یا رد</span>
        </div>
      )}
    </div>
  )
}
