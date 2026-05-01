import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import type { Notification } from '@/types/api';

interface Props {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data?.data ?? r.data),
    staleTime: 30000,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const notifications: Notification[] = Array.isArray(data) ? data : data?.items ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'streak': return '🔥';
      case 'goal_progress': return '🎯';
      case 'system': return '📢';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  return (
    <div ref={ref} className="notif-dropdown absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-[200] overflow-hidden flex flex-col max-h-[80vh]">
      <div className="p-3 border-b flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-gray-800">Thông báo {unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({unreadCount} unread)</span>}</h3>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead()} className="text-xs text-green-700 hover:text-green-800 flex items-center gap-1 font-medium">
            <CheckCheck size={14} /> Mark all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[100px]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">You're all caught up!</div>
        ) : (
          <div className="flex flex-col">
            {notifications.slice(0, 10).map((notif) => (
              <div 
                key={notif.id} 
                className={`notif-item p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.isRead ? 'unread' : ''}`}
                style={{ borderLeft: !notif.isRead ? '3px solid var(--green-accent)' : '3px solid transparent' }}
              >
                <div className="flex-shrink-0 mt-1 text-lg">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0" onClick={() => { if (!notif.isRead) markRead(notif.id); }} style={{ cursor: !notif.isRead ? 'pointer' : 'default' }}>
                  <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteNotif(notif.id)} className="p-1 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t bg-gray-50 text-center">
        <button 
          onClick={() => { onClose(); navigate('/notifications'); }}
          className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center justify-center gap-1 w-full p-2"
        >
          Xem tất cả <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
