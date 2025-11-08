import { useEffect, useState } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { TransactionRatingModal } from './TransactionRatingModal'
import { Transaction, loyaltyService } from '../../services/loyalty'

/**
 * کامپوننت برای نمایش خودکار modal نظردهی بعد از تایید تراکنش
 * این کامپوننت باید در سطح بالای اپلیکیشن قرار گیرد
 */
export const AutoTransactionNotification = () => {
  const { user } = useAuth()
  const { approvedTransactions, refreshPendingCount } = useNotification()
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // فقط برای مشتری‌ها
    if (user?.type !== 'customer') return

    // اگر تراکنش جدیدی تایید شده و modal باز نیست
    if (approvedTransactions.length > 0 && !isModalOpen) {
      const transaction = approvedTransactions[0]
      setCurrentTransaction(transaction)
      setIsModalOpen(true)
    }
  }, [approvedTransactions, user, isModalOpen])

  const handleClose = () => {
    setIsModalOpen(false)
    setCurrentTransaction(null)
  }

  const handleSubmit = async (data: {
    transaction_id: number
    text: string
    score: number | null
    service_type: string
  }) => {
    try {
      await loyaltyService.addTransactionComment(data)
      // به‌روزرسانی badge
      await refreshPendingCount()
      handleClose()
    } catch (error) {
      console.error('خطا در ارسال نظر:', error)
      throw error
    }
  }

  if (!currentTransaction) return null

  // استخراج service types از تراکنش
  const serviceTypes: Array<'discount_all' | 'specific_discount' | 'elite_gift' | 'vip_experience'> = []
  if (currentTransaction.discount_all_amount && parseFloat(currentTransaction.discount_all_amount) > 0) {
    serviceTypes.push('discount_all')
  }
  if (currentTransaction.has_special_discount) {
    serviceTypes.push('specific_discount')
  }
  // برای elite_gift و vip_experience باید از اطلاعات package استفاده کنیم
  // فعلاً فقط همین دو را اضافه می‌کنیم

  return (
    <TransactionRatingModal
      isOpen={isModalOpen}
      onClose={handleClose}
      transactionId={currentTransaction.id}
      businessName={currentTransaction.business_name}
      serviceTypes={serviceTypes.length > 0 ? serviceTypes : ['discount_all']}
      onSubmit={handleSubmit}
    />
  )
}
