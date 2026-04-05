import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AdminTopbar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className="pt-16 min-h-screen transition-all duration-200"
        style={{ paddingLeft: collapsed ? '4rem' : '14rem' }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
