import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Transaction, loyaltyService } from '../../services/loyalty'
import { TransactionCard } from '../../components/business/TransactionCard'
import { TransactionRatingModal } from '../../components/customer/TransactionRatingModal'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'

// Mobile Component
interface MobileMyTransactionsProps {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected'
  canCommentTransactions: Transaction[]
  error: string | null
  onFilterChange: (status: 'all' | 'pending' | 'approved' | 'rejected') => void
  onTransactionClick: (transaction: Transaction) => void
  onRetry: () => void
}

const MobileMyTransactions: React.FC<MobileMyTransactionsProps> = ({
  filteredTransactions,
  filterStatus,
  canCommentTransactions,
  error,
  onFilterChange,
  onTransactionClick,
  onRetry
}) => {
  const { isDark } = useTheme()

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            تراکنش‌های من
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            مشاهده و مدیریت تراکنش‌های شما
          </p>
        </div>

        {/* Alert for comment opportunity */}
        {canCommentTransactions.length > 0 && (
          <div className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-blue-500 text-sm">
                  {canCommentTransactions.length} تراکنش آماده دریافت نظر شما
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  فرصت نظردهی در 12 ساعت اول
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'همه' },
            { key: 'pending', label: 'در انتظار' },
            { key: 'approved', label: 'تایید شده' },
            { key: 'rejected', label: 'رد شده' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === filter.key
                  ? 'bg-blue-500 text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-white text-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-gray-100'
            }`}>
              <svg className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              هیچ تراکنشی یافت نشد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="relative">
                <TransactionCard
                  transaction={transaction}
                  onClick={() => onTransactionClick(transaction)}
                  showActions={false}
                />
                {transaction.can_add_comment && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">
                      آماده نظر
                    </span>
                  </div>
                )}
                {transaction.has_commented && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      نظر داده شد
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileDashboardLayout>
  )
}

export const CustomerTransactionsPage: React.FC = () => {
  const { isDark } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const loadTransactions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await loyaltyService.getCustomerTransactions()
      console.log('Loaded customer transactions:', data)
      if (Array.isArray(data)) {
        setTransactions(data)
      } else {
        console.error('Data is not an array:', data)
        setTransactions([])
        setError('فرمت داده‌های دریافتی نامعتبر است')
      }
    } catch (err: any) {
      console.error('Error loading transactions:', err)
      setError('خطا در بارگذاری تراکنش‌ها')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.can_add_comment) {
      setSelectedTransaction(transaction)
      setShowRatingModal(true)
    }
  }

  const handleModalClose = () => {
    setShowRatingModal(false)
    setSelectedTransaction(null)
  }

  const handleRatingSubmit = async (data: {
    transaction_id: number
    text: string
    score: number | null
    service_type: string
  }) => {
    await loyaltyService.addTransactionComment(data)
    loadTransactions()
  }

  const handleFilterChange = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setFilterStatus(status)
  }

  const canCommentTransactions = Array.isArray(transactions) ? transactions.filter(t => t.can_add_comment) : []
  const filteredTransactions = filterStatus === 'all' 
    ? transactions 
    : Array.isArray(transactions) ? transactions.filter(t => t.status === filterStatus) : []

  // تعیین نوع‌های خدمت موجود برای تراکنش
  const getServiceTypes = (transaction: Transaction): Array<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'> => {
    const types: Array<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'> = ['discount_all']
    if (transaction.has_special_discount) {
      types.push('specific_discount')
    }
    // می‌توانید بر اساس منطق برنامه، elite_gift و vip_experience را هم اضافه کنید
    return types
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
        <div className="hidden md:block">
          <DashboardLayout>
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          </DashboardLayout>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileMyTransactions
          transactions={transactions}
          filteredTransactions={filteredTransactions}
          filterStatus={filterStatus}
          canCommentTransactions={canCommentTransactions}
          error={error}
          onFilterChange={handleFilterChange}
          onTransactionClick={handleTransactionClick}
          onRetry={loadTransactions}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DashboardLayout>
          <div className="p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                تراکنش‌های من
              </h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                مشاهده و مدیریت تراکنش‌های شما
              </p>
            </div>

            {/* Can Comment Alert */}
            {canCommentTransactions.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-500 mb-1">
                      {canCommentTransactions.length} تراکنش آماده دریافت نظر شما
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      شما ۱۲ ساعت فرصت دارید برای این تراکنش‌ها نظر بگذارید و امتیاز دهید
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Can Comment Transactions Section */}
            {canCommentTransactions.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  آماده دریافت نظر
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {canCommentTransactions.map((transaction) => (
                    <div key={transaction.id} className="relative cursor-pointer" onClick={() => handleTransactionClick(transaction)}>
                      <TransactionCard
                        transaction={transaction}
                        onClick={() => handleTransactionClick(transaction)}
                        showActions={false}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-3 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">
                          کلیک کنید برای نظر
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'همه' },
                { key: 'pending', label: 'در انتظار' },
                { key: 'approved', label: 'تایید شده' },
                { key: 'rejected', label: 'رد شده' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filterStatus === filter.key
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* All Transactions List */}
            <div>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filterStatus === 'all' ? 'همه تراکنش‌ها' : 
                 filterStatus === 'pending' ? 'تراکنش‌های در انتظار' :
                 filterStatus === 'approved' ? 'تراکنش‌های تایید شده' :
                 'تراکنش‌های رد شده'}
              </h2>

              {error ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-500 font-medium">{error}</p>
                  <button
                    onClick={loadTransactions}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-slate-800' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    هیچ تراکنشی یافت نشد
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="relative">
                      <TransactionCard
                        transaction={transaction}
                        onClick={() => transaction.can_add_comment && handleTransactionClick(transaction)}
                        showActions={false}
                      />
                      {transaction.has_commented && (
                        <div className="absolute top-2 left-2">
                          <span className="px-3 py-1 text-xs font-bold bg-green-500 text-white rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            نظر داده شد
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DashboardLayout>
      </div>

      {/* Rating Modal */}
      {selectedTransaction && (
        <TransactionRatingModal
          isOpen={showRatingModal}
          onClose={handleModalClose}
          transactionId={selectedTransaction.id}
          businessName={selectedTransaction.business_name}
          serviceTypes={getServiceTypes(selectedTransaction)}
          transactionDate={selectedTransaction.created_at}
          originalAmount={selectedTransaction.original_amount}
          finalAmount={selectedTransaction.final_amount}
          discountAmount={(
            parseFloat(selectedTransaction.discount_all_amount || '0') +
            parseFloat(selectedTransaction.special_discount_amount || '0')
          ).toString()}
          pointsEarned={selectedTransaction.points_earned}
          specialDiscountTitle={selectedTransaction.special_discount_title || undefined}
          onSubmit={handleRatingSubmit}
        />
      )}
    </>
  )
}
