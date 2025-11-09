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
  const [processedTransactionIds, setProcessedTransactionIds] = useState<Set<number>>(new Set())

  // Log برای دیدن اینکه component render می‌شود یا نه
  useEffect(() => {
    console.log('🚀 AutoTransactionNotification mounted - user:', user?.type)
  }, [])

  useEffect(() => {
    // فقط برای مشتری‌ها
    if (user?.type !== 'customer') {
      console.log('⚠️ کاربر مشتری نیست:', user?.type)
      return
    }

    console.log('🔔 بررسی تراکنش‌های تایید شده:', {
      count: approvedTransactions.length,
      isModalOpen,
      transactions: approvedTransactions,
      processedIds: Array.from(processedTransactionIds),
      userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    })

    // اگر تراکنش جدیدی تایید شده و modal باز نیست
    if (approvedTransactions.length > 0 && !isModalOpen) {
      // پیدا کردن اولین تراکنشی که هنوز پردازش نشده
      const unprocessedTransaction = approvedTransactions.find(
        tx => !processedTransactionIds.has(tx.id)
      )
      
      if (unprocessedTransaction) {
        console.log('✅ نمایش popup برای تراکنش:', unprocessedTransaction.id, 'Device:', navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop')
        setCurrentTransaction(unprocessedTransaction)
        setIsModalOpen(true)
        // علامت‌گذاری به عنوان پردازش شده
        setProcessedTransactionIds(prev => new Set([...prev, unprocessedTransaction.id]))
      }
    }
  }, [approvedTransactions, user, isModalOpen, processedTransactionIds])

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

  // محاسبه مجموع تخفیف
  const totalDiscount = (
    parseFloat(currentTransaction.discount_all_amount || '0') +
    parseFloat(currentTransaction.special_discount_amount || '0')
  ).toString()

  return (
    <TransactionRatingModal
      isOpen={isModalOpen}
      onClose={handleClose}
      transactionId={currentTransaction.id}
      businessName={currentTransaction.business_name}
      serviceTypes={serviceTypes.length > 0 ? serviceTypes : ['discount_all']}
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
