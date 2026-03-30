import api from './axios'
import type { ApiResponse, Notification } from '@/types'

export interface NotificationQuery {
  unread?: boolean
}

export interface UnreadCount {
  count: number
}

export async function getNotifications(query?: NotificationQuery): Promise<Notification[]> {
  const resp = await api.get<ApiResponse<Notification[]>>('/notifications', { params: query })
  return resp.data.data
}

export async function getUnreadCount(): Promise<number> {
  const resp = await api.get<ApiResponse<number>>('/notifications/unread-count')
  // Backend returns a plain number (not {count}), wrapped by ResponseInterceptor
  const raw = resp.data.data
  return typeof raw === 'number' ? raw : (raw as unknown as UnreadCount).count ?? 0
}

export async function markAsRead(id: string): Promise<Notification> {
  const resp = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`)
  return resp.data.data
}

export async function markAllRead(): Promise<void> {
  await api.patch('/notifications/read-all')
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`)
}
