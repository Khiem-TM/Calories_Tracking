import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { AnimatedPage } from '@/components/common/AnimatedPage'
import { ListSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/axios'
import type { Notification } from '@/types/api'

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data?.data ?? r.data),
  })

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'notifications-unread-count'] }),
  })

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications: Notification[] = Array.isArray(data) ? data : (data?.items ?? [])
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <AnimatedPage>
      <div className="space-y-4">
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={() => markAllRead()}
              variant="outline"
              className="flex items-center gap-1.5 text-sm rounded-full"
              style={{ borderColor: '#c9e4d4', color: '#3a8f67' }}
            >
              <CheckCheck size={14} /> Mark all as read
            </Button>
          </div>
        )}

        {isLoading ? <ListSkeleton count={5} /> : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-4 bg-white rounded-xl"
                style={{
                  boxShadow: '0 1px 8px rgba(30,77,53,0.06)',
                  borderLeft: notif.isRead ? 'none' : `3px solid #3a8f67`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: notif.isRead ? '#f8faf9' : '#d4eddf' }}>
                  <Bell size={16} style={{ color: notif.isRead ? '#7a9080' : '#1e4d35' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1a3829' }}>{notif.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a9080' }}>{notif.message}</p>
                  <p className="text-xs mt-1" style={{ color: '#7a9080' }}>
                    {new Date(notif.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-green-light transition-colors"
                      style={{ color: '#3a8f67' }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ color: '#e05c5c' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}
