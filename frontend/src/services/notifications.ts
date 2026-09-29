import { API_BASE_URL } from './api'

export type NotificationType =
  | 'transaction_created'
  | 'transaction_approved'
  | 'transaction_rejected'
  | 'gift_claim_created'
  | 'gift_claim_approved'
  | 'gift_claim_rejected'
  | 'gift_claim_used'
  | 'review_created'
  | 'review_replied'
  | 'general'

export interface AppNotification {
  id: number
  notification_type: NotificationType
  title: string
  message: string
  priority: 'normal' | 'important' | 'urgent'
  action_url: string
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/loyalty/notifications/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    throw await response.json().catch(() => ({ error: 'خطا در دریافت اعلان‌ها' }))
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const all: AppNotification[] = []
    let path = ''
    // همه صفحه‌ها برای مدیریت کامل تاریخچه بارگذاری می‌شوند.
    for (let page = 0; page < 50; page += 1) {
      const data = await request<AppNotification[] | { results: AppNotification[]; next: string | null }>(path)
      if (Array.isArray(data)) return data
      all.push(...(data.results || []))
      if (!data.next) break
      const nextUrl = new URL(data.next, window.location.origin)
      path = `${nextUrl.search}`
    }
    return all
  },
  unreadCount: () => request<{ count: number }>('unread_count/'),
  markRead: (id: number) => request<AppNotification>(`${id}/mark_read/`, { method: 'POST' }),
  markUnread: (id: number) => request<AppNotification>(`${id}/mark_unread/`, { method: 'POST' }),
  markAllRead: () => request<{ updated: number }>('mark_all_read/', { method: 'POST' }),
  remove: (id: number) => request<void>(`${id}/`, { method: 'DELETE' }),
  clearRead: () => request<{ deleted: number }>('clear_read/', { method: 'DELETE' }),
}
