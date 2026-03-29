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
  const resp = await api.get<ApiResponse<UnreadCount>>('/notifications/unread-count')
  return resp.data.data.count
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
