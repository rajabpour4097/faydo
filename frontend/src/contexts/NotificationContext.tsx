import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { loyaltyService, Transaction } from '../services/loyalty'

interface NotificationContextType {
  pendingCount: number
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
  const [newTransactions, setNewTransactions] = useState<Transaction[]>([])
  const [approvedTransactions, setApprovedTransactions] = useState<Transaction[]>([])
  const [previousTransactionIds, setPreviousTransactionIds] = useState<Set<number>>(new Set())
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date(Date.now() - 60000))
  const [isFirstCheck, setIsFirstCheck] = useState(true)

  const refreshPendingCount = useCallback(async () => {
    if (!user) {
      setPendingCount(0)
      return
    }

    try {
      const result = await loyaltyService.getPendingCount()
      setPendingCount(result.count)

      // دریافت تراکنش‌ها برای بررسی تراکنش‌های جدید
      const transactions = await loyaltyService.getTransactions()
      
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
        
        // در اولین بار، همه تراکنش‌های قابل کامنت را نشان بده
        if (isFirstCheck) {
          console.log('🎯 اولین بررسی - همه تراکنش‌های قابل کامنت:', canCommentTxs)
          if (canCommentTxs.length > 0) {
            setApprovedTransactions(canCommentTxs)
          }
          setIsFirstCheck(false)
        } else {
          // در بررسی‌های بعدی، فقط تراکنش‌های جدید
          const recentlyApproved = canCommentTxs.filter(tx => {
            const modifiedDate = new Date(tx.modified_at)
            return modifiedDate > lastCheckTime
          })
          
          if (recentlyApproved.length > 0) {
            console.log('🔔 تراکنش‌های جدید تایید شده:', recentlyApproved)
            setApprovedTransactions(prev => {
              // جلوگیری از duplicate
              const existingIds = new Set(prev.map(t => t.id))
              const uniqueNew = recentlyApproved.filter(t => !existingIds.has(t.id))
              return [...uniqueNew, ...prev]
            })
          }
        }
      }

      // به‌روزرسانی لیست transaction ID های قبلی
      const currentIds = new Set(transactions.map(tx => tx.id))
      setPreviousTransactionIds(currentIds)
      setLastCheckTime(new Date())
    } catch (error) {
      console.error('خطا در دریافت تعداد تراکنش‌های در انتظار:', error)
    }
  }, [user, previousTransactionIds, lastCheckTime, isFirstCheck])

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
