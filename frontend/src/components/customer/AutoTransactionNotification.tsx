import { useEffect, useState } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { useQrScanner } from '../../contexts/QrScannerContext'
import { TransactionRatingModal } from './TransactionRatingModal'
import { PurchaseResultModal } from './PurchaseResultModal'
import { Transaction, loyaltyService } from '../../services/loyalty'

/**
 * نمایش نتیجه تایید/رد کسب‌وکار و سپس فرم نظر و امتیاز
 */
export const AutoTransactionNotification = () => {
  const { user } = useAuth()
  const { resultTransactions, refreshPendingCount, dismissResultTransaction } = useNotification()
  const qrScanner = useQrScanner()
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [stage, setStage] = useState<'idle' | 'result' | 'review'>('idle')
  const [processedTransactionIds, setProcessedTransactionIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user?.type !== 'customer') return
    if (stage !== 'idle') return
    const unprocessed = resultTransactions.find(tx => !processedTransactionIds.has(tx.id))
    if (!unprocessed) return
    setCurrentTransaction(unprocessed)
    setStage('result')
    setProcessedTransactionIds(prev => new Set([...prev, unprocessed.id]))
  }, [resultTransactions, user, stage, processedTransactionIds])

  const finish = () => {
    if (currentTransaction) {
      dismissResultTransaction(currentTransaction.id)
    }
    setCurrentTransaction(null)
    setStage('idle')
  }

  const handleSubmit = async (data: {
    transaction_id: number
    text: string
    score: number | null
    service_type: string
  }) => {
    await loyaltyService.addTransactionComment(data)
    await refreshPendingCount()
  }

  if (!currentTransaction || stage === 'idle') return null

  const serviceTypes: Array<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'> = []
  if (currentTransaction.discount_all_amount && parseFloat(currentTransaction.discount_all_amount) > 0) {
    serviceTypes.push('discount_all')
  }
  if (currentTransaction.has_special_discount) {
    serviceTypes.push('specific_discount')
  }
  if (!serviceTypes.length) serviceTypes.push('discount_all')

  const totalDiscount = (
    parseFloat(currentTransaction.discount_all_amount || '0') +
    parseFloat(currentTransaction.special_discount_amount || '0')
  ).toString()

  if (stage === 'review') {
    return (
      <TransactionRatingModal
        isOpen
        onClose={finish}
        transactionId={currentTransaction.id}
        businessName={currentTransaction.business_name}
        businessLogo={currentTransaction.business_logo}
        serviceTypes={serviceTypes}
        transactionDate={currentTransaction.created_at}
        originalAmount={currentTransaction.original_amount}
        finalAmount={currentTransaction.final_amount}
        discountAmount={totalDiscount}
        pointsEarned={currentTransaction.points_earned}
        specialDiscountTitle={currentTransaction.special_discount_title || undefined}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <PurchaseResultModal
      isOpen
      transaction={currentTransaction}
      onClose={finish}
      onReview={() => setStage('review')}
      onRestart={() => {
        finish()
        qrScanner?.openScanner()
      }}
    />
  )
}
