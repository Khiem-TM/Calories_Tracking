import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Simple global toast state (not in Zustand to keep it lightweight)
type Listener = (toasts: ToastMessage[]) => void
let toasts: ToastMessage[] = []
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((l) => l([...toasts]))
}

export const toast = {
  success: (message: string, duration = 3000) => addToast('success', message, duration),
  error: (message: string, duration = 4000) => addToast('error', message, duration),
  info: (message: string, duration = 3000) => addToast('info', message, duration),
  warning: (message: string, duration = 3500) => addToast('warning', message, duration),
}

function addToast(type: ToastType, message: string, duration: number) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, type, message, duration }]
  notify()
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const iconClasses: Record<ToastType, string> = {
  success: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-yellow-100 text-yellow-700',
}

function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md text-sm min-w-72 max-w-sm',
        typeClasses[t.type],
      )}
    >
      <span className={clsx('flex-none w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold', iconClasses[t.type])}>
        {icons[t.type]}
      </span>
      <p className="flex-1 leading-5">{t.message}</p>
      <button onClick={onDismiss} className="flex-none opacity-60 hover:opacity-100 leading-none">
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [list, setList] = useState<ToastMessage[]>([])

  useEffect(() => {
    listeners.add(setList)
    return () => {
      listeners.delete(setList)
    }
  }, [])

  if (list.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => removeToast(t.id)} />
        </div>
      ))}
    </div>,
    document.body,
  )
}
