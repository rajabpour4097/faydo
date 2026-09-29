import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, BellRing, CheckCheck, Gift, Receipt, Trash2,
  Volume2, VolumeX, XCircle,
} from 'lucide-react'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useNotification } from '../../contexts/NotificationContext'
import { useTheme } from '../../contexts/ThemeContext'
import { AppNotification } from '../../services/notifications'

const iconFor = (item: AppNotification) => {
  if (item.notification_type.includes('gift')) return Gift
  if (item.notification_type.includes('rejected')) return XCircle
  if (item.notification_type.includes('transaction')) return Receipt
  return Bell
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))

export const NotificationsPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const {
    notifications, unreadCount, notificationsLoading, soundEnabled,
    markNotificationRead, markNotificationUnread, markAllNotificationsRead,
    deleteNotification, clearReadNotifications, setSoundEnabled,
  } = useNotification()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const visible = useMemo(
    () => filter === 'unread' ? notifications.filter(item => !item.is_read) : notifications,
    [filter, notifications],
  )

  const openNotification = async (item: AppNotification) => {
    if (!item.is_read) await markNotificationRead(item.id)
    if (item.action_url) navigate(item.action_url)
  }

  return (
    <MobileDashboardLayout>
      <section className={`min-h-[calc(100dvh-8rem)] px-4 py-5 ${isDark ? 'text-white' : 'text-[#0D1B3E]'}`}>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <BellRing className="w-6 h-6 text-teal-500" />
              اعلان‌ها
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {unreadCount ? `${unreadCount.toLocaleString('fa-IR')} اعلان خوانده‌نشده` : 'همه اعلان‌ها دیده شده‌اند'}
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}
            aria-label={soundEnabled ? 'خاموش کردن صدای اعلان' : 'روشن کردن صدای اعلان'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-teal-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>
        </div>

        <div className={`flex items-center justify-between gap-2 p-1 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-gray-200/70'}`}>
          <div className="flex flex-1">
            {(['all', 'unread'] as const).map(value => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`flex-1 py-2 text-sm rounded-lg transition ${
                  filter === value
                    ? isDark ? 'bg-slate-700 text-white shadow' : 'bg-white text-[#0D1B3E] shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {value === 'all' ? 'همه' : `خوانده‌نشده (${unreadCount.toLocaleString('fa-IR')})`}
              </button>
            ))}
          </div>
        </div>

        {!!notifications.length && (
          <div className="flex justify-between mb-3 text-xs">
            <button onClick={markAllNotificationsRead} disabled={!unreadCount} className="flex items-center gap-1 text-teal-600 disabled:opacity-40">
              <CheckCheck className="w-4 h-4" /> خواندن همه
            </button>
            <button onClick={clearReadNotifications} className="flex items-center gap-1 text-red-500">
              <Trash2 className="w-4 h-4" /> پاک‌کردن خوانده‌شده‌ها
            </button>
          </div>
        )}

        {notificationsLoading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold">{filter === 'unread' ? 'اعلان خوانده‌نشده‌ای ندارید' : 'هنوز اعلانی ندارید'}</p>
            <p className="text-xs text-gray-500 mt-2">رویدادهای مهم اینجا نمایش داده می‌شوند.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map(item => {
              const Icon = iconFor(item)
              return (
                <article
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className={`relative flex gap-3 p-3.5 rounded-2xl border cursor-pointer transition active:scale-[.99] ${
                    isDark
                      ? item.is_read ? 'bg-slate-800 border-slate-700' : 'bg-teal-950/40 border-teal-700/50'
                      : item.is_read ? 'bg-white border-gray-100' : 'bg-teal-50 border-teal-100 shadow-sm'
                  }`}
                >
                  {!item.is_read && <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-red-500" />}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pl-3">
                    <h2 className={`text-sm ${item.is_read ? 'font-semibold' : 'font-black'}`}>{item.title}</h2>
                    <p className={`text-xs leading-5 mt-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{item.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <time className="text-[10px] text-gray-400">{formatDate(item.created_at)}</time>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={event => { event.stopPropagation(); item.is_read ? markNotificationUnread(item.id) : markNotificationRead(item.id) }}
                          className="text-[10px] text-teal-600"
                        >
                          {item.is_read ? 'خوانده‌نشده' : 'خوانده شد'}
                        </button>
                        <button
                          onClick={event => { event.stopPropagation(); deleteNotification(item.id) }}
                          className="text-red-400"
                          aria-label="حذف اعلان"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </MobileDashboardLayout>
  )
}
