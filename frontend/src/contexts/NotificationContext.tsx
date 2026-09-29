import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { loyaltyService, Transaction } from '../services/loyalty'
import { apiService } from '../services/api'
import { AppNotification, notificationService } from '../services/notifications'

interface NotificationContextType {
  pendingCount: number
  eliteGiftPendingCount: number
  newTransactions: Transaction[]
  approvedTransactions: Transaction[]
  resultTransactions: Transaction[]
  notifications: AppNotification[]
  unreadCount: number
  notificationsLoading: boolean
  soundEnabled: boolean
  refreshPendingCount: () => Promise<void>
  refreshNotifications: () => Promise<void>
  markNotificationRead: (id: number) => Promise<void>
  markNotificationUnread: (id: number) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  clearReadNotifications: () => Promise<void>
  setSoundEnabled: (enabled: boolean) => void
  markTransactionAsSeen: (transactionId: number) => void
  clearApprovedTransactions: () => void
  dismissResultTransaction: (transactionId: number) => void
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
  const [resultTransactions, setResultTransactions] = useState<Transaction[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [soundEnabledState, setSoundEnabledState] = useState(
    () => localStorage.getItem('notification_sound') !== 'off'
  )
  const previousTransactionIds = useRef<Set<number>>(new Set())
  const previousCommentableIds = useRef<Set<number>>(new Set())
  const previousStatuses = useRef<Record<number, string>>({})
  const isFirstCheck = useRef(true)
  const knownNotificationIds = useRef<Set<number>>(new Set())
  const notificationsInitialized = useRef(false)

  const playNotificationSound = useCallback(() => {
    if (!soundEnabledState) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const gain = ctx.createGain()
      const oscillator = ctx.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(740, ctx.currentTime)
      oscillator.frequency.setValueAtTime(980, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.34)
      oscillator.onended = () => ctx.close()
    } catch {
      // مرورگر ممکن است تا اولین تعامل کاربر اجازه پخش صدا ندهد.
    }
  }, [soundEnabledState])

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    try {
      if (!notificationsInitialized.current) setNotificationsLoading(true)
      const [items, countResult] = await Promise.all([
        notificationService.list(),
        notificationService.unreadCount(),
      ])
      const unread = items.filter(item => !item.is_read)
      if (notificationsInitialized.current) {
        const hasNew = unread.some(item => !knownNotificationIds.current.has(item.id))
        if (hasNew) playNotificationSound()
      }
      knownNotificationIds.current = new Set(items.map(item => item.id))
      notificationsInitialized.current = true
      setNotifications(items)
      setUnreadCount(countResult.count)
    } catch (error) {
      console.error('خطا در دریافت اعلان‌ها:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }, [user, playNotificationSound])

  const refreshPendingCount = useCallback(async () => {
    if (!user) {
      setPendingCount(0)
      return
    }

    try {
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
        const newPending = pendingTxs.filter(tx => !previousTransactionIds.current.has(tx.id))
        
        if (newPending.length > 0) {
          setNewTransactions(prev => [...newPending, ...prev])
        }
      } else if (user.type === 'customer') {
        // برای مشتری: تراکنش‌های تایید شده جدید که می‌توان کامنت گذاشت
        const canCommentTxs = transactions.filter(
          tx => tx.can_comment && !tx.has_commented && tx.can_add_comment
        )
        
        // پیدا کردن تراکنش‌هایی که قبلاً قابل کامنت نبودند
        const newCommentables = canCommentTxs.filter(
          tx => !previousCommentableIds.current.has(tx.id)
        )

        // در اولین بار، همه تراکنش‌های قابل کامنت را نشان بده
        if (isFirstCheck.current) {
          if (canCommentTxs.length > 0) {
            setApprovedTransactions(canCommentTxs)
            setResultTransactions(canCommentTxs)
          }
          isFirstCheck.current = false
        } else {
          const newlyDecided = transactions.filter(tx => {
            const prev = previousStatuses.current[tx.id]
            return (tx.status === 'approved' || tx.status === 'rejected') && prev === 'pending'
          })
          if (newlyDecided.length > 0) {
            setResultTransactions(prev => {
              const existingIds = new Set(prev.map(t => t.id))
              return [...newlyDecided.filter(t => !existingIds.has(t.id)), ...prev]
            })
          }
          if (newCommentables.length > 0) {
            setApprovedTransactions(prev => {
              const existingIds = new Set(prev.map(t => t.id))
              const uniqueNew = newCommentables.filter(t => !existingIds.has(t.id))
              return [...uniqueNew, ...prev]
            })
          }
        }
        
        // به‌روزرسانی لیست ID های قابل کامنت
        const currentCommentableIds = new Set(canCommentTxs.map(tx => tx.id))
        previousCommentableIds.current = currentCommentableIds
        previousStatuses.current = Object.fromEntries(transactions.map(tx => [tx.id, tx.status]))
      }

      // به‌روزرسانی لیست transaction ID های قبلی
      const currentIds = new Set(transactions.map(tx => tx.id))
      previousTransactionIds.current = currentIds
    } catch (error) {
      console.error('خطا در دریافت تعداد تراکنش‌های در انتظار:', error)
    }
  }, [user])

  // Polling هر 5 ثانیه برای واکنش سریع‌تر به تغییرات
  useEffect(() => {
    if (user) {
      refreshPendingCount()
      refreshNotifications()
      const pendingInterval = setInterval(refreshPendingCount, 5000)
      const notificationInterval = setInterval(refreshNotifications, 10000)
      return () => {
        clearInterval(pendingInterval)
        clearInterval(notificationInterval)
      }
    } else {
      notificationsInitialized.current = false
      knownNotificationIds.current.clear()
    }
  }, [user, refreshPendingCount, refreshNotifications])

  const updateNotification = (item: AppNotification) => {
    setNotifications(prev => prev.map(notification => notification.id === item.id ? item : notification))
    setUnreadCount(prev => prev + (item.is_read ? -1 : 1))
  }

  const markNotificationRead = async (id: number) => {
    const current = notifications.find(item => item.id === id)
    if (!current || current.is_read) return
    updateNotification(await notificationService.markRead(id))
  }

  const markNotificationUnread = async (id: number) => {
    const current = notifications.find(item => item.id === id)
    if (!current || !current.is_read) return
    updateNotification(await notificationService.markUnread(id))
  }

  const markAllNotificationsRead = async () => {
    await notificationService.markAllRead()
    setNotifications(prev => prev.map(item => ({ ...item, is_read: true, read_at: new Date().toISOString() })))
    setUnreadCount(0)
  }

  const deleteNotification = async (id: number) => {
    await notificationService.remove(id)
    setNotifications(prev => {
      const removed = prev.find(item => item.id === id)
      if (removed && !removed.is_read) setUnreadCount(count => Math.max(0, count - 1))
      return prev.filter(item => item.id !== id)
    })
  }

  const clearReadNotifications = async () => {
    await notificationService.clearRead()
    setNotifications(prev => prev.filter(item => !item.is_read))
  }

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled)
    localStorage.setItem('notification_sound', enabled ? 'on' : 'off')
  }

  const markTransactionAsSeen = useCallback((transactionId: number) => {
    setNewTransactions(prev => prev.filter(tx => tx.id !== transactionId))
  }, [])

  const clearApprovedTransactions = useCallback(() => {
    setApprovedTransactions([])
  }, [])

  const dismissResultTransaction = useCallback((transactionId: number) => {
    setResultTransactions(prev => prev.filter(tx => tx.id !== transactionId))
    setApprovedTransactions(prev => prev.filter(tx => tx.id !== transactionId))
  }, [])

  const value: NotificationContextType = {
    pendingCount,
    eliteGiftPendingCount,
    newTransactions,
    approvedTransactions,
    resultTransactions,
    notifications,
    unreadCount,
    notificationsLoading,
    soundEnabled: soundEnabledState,
    refreshPendingCount,
    refreshNotifications,
    markNotificationRead,
    markNotificationUnread,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
    setSoundEnabled,
    markTransactionAsSeen,
    clearApprovedTransactions,
    dismissResultTransaction,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
