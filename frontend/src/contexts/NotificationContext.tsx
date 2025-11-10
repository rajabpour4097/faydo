import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { loyaltyService, Transaction } from '../services/loyalty'
import { apiService } from '../services/api'

interface NotificationContextType {
  pendingCount: number
  eliteGiftPendingCount: number
  newTransactions: Transaction[]
  approvedTransactions: Transaction[]
  refreshPendingCount: () => Promise<void>
  markTransactionAsSeen: (transactionId: number) => void
  clearApprovedTransactions: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [eliteGiftPendingCount, setEliteGiftPendingCount] = useState(0)
  const [newTransactions, setNewTransactions] = useState<Transaction[]>([])
  const [approvedTransactions, setApprovedTransactions] = useState<Transaction[]>([])
  const [previousTransactionIds, setPreviousTransactionIds] = useState<Set<number>>(new Set())
  const [previousCommentableIds, setPreviousCommentableIds] = useState<Set<number>>(new Set())
  const [isFirstCheck, setIsFirstCheck] = useState(true)

  const refreshPendingCount = useCallback(async () => {
    if (!user) {
      setPendingCount(0)
      return
    }

    try {
      console.log('🔄 شروع بررسی تراکنش‌ها - کاربر:', user.type, 'زمان:', new Date().toLocaleTimeString())
      
      const result = await loyaltyService.getPendingCount()
      setPendingCount(result.count)

      // برای کسب‌وکار: دریافت تعداد Elite Gift Claims در انتظار
      if (user.type === 'business') {
        try {
          const claimsResponse = await apiService.getEliteGiftClaims()
          const claims = (claimsResponse.data as any)?.results || claimsResponse.data || []
          const pendingClaims = Array.isArray(claims) ? claims.filter((c: any) => c.status === 'pending') : []
          setEliteGiftPendingCount(pendingClaims.length)
        } catch (error) {
          console.error('خطا در دریافت Elite Gift Claims:', error)
          setEliteGiftPendingCount(0)
        }
      }

      // دریافت تراکنش‌ها برای بررسی تراکنش‌های جدید
      const transactions = await loyaltyService.getTransactions()
      
      console.log('📋 تراکنش‌های دریافتی:', transactions.length, transactions)
      
      if (user.type === 'business') {
        // برای کسب‌وکار: تراکنش‌های pending جدید
        const pendingTxs = transactions.filter(tx => tx.status === 'pending')
        const newPending = pendingTxs.filter(tx => !previousTransactionIds.has(tx.id))
        
        if (newPending.length > 0) {
          setNewTransactions(prev => [...newPending, ...prev])
        }
      } else if (user.type === 'customer') {
        // برای مشتری: تراکنش‌های تایید شده جدید که می‌توان کامنت گذاشت
        const canCommentTxs = transactions.filter(
          tx => tx.can_comment && !tx.has_commented && tx.can_add_comment
        )
        
        console.log('💬 تراکنش‌های قابل کامنت:', canCommentTxs.length, canCommentTxs)
        console.log('🕒 previousCommentableIds:', Array.from(previousCommentableIds))
        
        // پیدا کردن تراکنش‌هایی که قبلاً قابل کامنت نبودند
        const newCommentables = canCommentTxs.filter(
          tx => !previousCommentableIds.has(tx.id)
        )
        
        console.log('🆕 تراکنش‌های جدید قابل کامنت:', newCommentables.length, newCommentables)
        
        // در اولین بار، همه تراکنش‌های قابل کامنت را نشان بده
        if (isFirstCheck) {
          console.log('🎯 اولین بررسی - همه تراکنش‌های قابل کامنت:', canCommentTxs)
          if (canCommentTxs.length > 0) {
            setApprovedTransactions(canCommentTxs)
          }
          setIsFirstCheck(false)
        } else if (newCommentables.length > 0) {
          // در بررسی‌های بعدی، فقط تراکنش‌های جدید
          console.log('✨ افزودن تراکنش‌های جدید به لیست approved:', newCommentables)
          setApprovedTransactions(prev => {
            // جلوگیری از duplicate
            const existingIds = new Set(prev.map(t => t.id))
            const uniqueNew = newCommentables.filter(t => !existingIds.has(t.id))
            return [...uniqueNew, ...prev]
          })
        }
        
        // به‌روزرسانی لیست ID های قابل کامنت
        const currentCommentableIds = new Set(canCommentTxs.map(tx => tx.id))
        setPreviousCommentableIds(currentCommentableIds)
      }

      // به‌روزرسانی لیست transaction ID های قبلی
      const currentIds = new Set(transactions.map(tx => tx.id))
      setPreviousTransactionIds(currentIds)
    } catch (error) {
      console.error('خطا در دریافت تعداد تراکنش‌های در انتظار:', error)
    }
  }, [user, previousTransactionIds, previousCommentableIds, isFirstCheck])

  // Polling هر 5 ثانیه برای واکنش سریع‌تر به تغییرات
  useEffect(() => {
    if (user) {
      refreshPendingCount()
      const interval = setInterval(refreshPendingCount, 5000) // 5 ثانیه
      return () => clearInterval(interval)
    }
  }, [user, refreshPendingCount])

  const markTransactionAsSeen = useCallback((transactionId: number) => {
    setNewTransactions(prev => prev.filter(tx => tx.id !== transactionId))
  }, [])

  const clearApprovedTransactions = useCallback(() => {
    setApprovedTransactions([])
  }, [])

  const value: NotificationContextType = {
    pendingCount,
    eliteGiftPendingCount,
    newTransactions,
    approvedTransactions,
    refreshPendingCount,
    markTransactionAsSeen,
    clearApprovedTransactions
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
