import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { BottomNav } from './components/BottomNav'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/food-log': 'Food Log',
  '/search-food': 'Search Food',
  '/my-foods': 'My Foods',
  '/create-food': 'Create Food',
  '/workout': 'Workout',
  '/body-metrics': 'Body Metrics',
  '/reports': 'Reports',
  '/profile': 'Profile',
  '/chatbot': 'AI Chatbot',
  '/ai-scan': 'AI Food Scan',
  '/blog': 'Blog',
  '/notifications': 'Notifications',
}

export function AppLayout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Tracker'

  return (
    <>
      <Sidebar />
      <div className="main">
        <Topbar title={title} />
        <div className="content">
          <Outlet />
        </div>
      </div>
      {/* Mobile nav placeholder if needed */}
      <BottomNav />
    </>
  )
}
