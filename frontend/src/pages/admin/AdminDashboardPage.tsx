import { useNavigate } from 'react-router-dom'
import { useAdminStats, useAdminPendingFoods, useAdminBlogs } from '@/features/admin/hooks/useAdmin'

const StatCard = ({
  icon,
  label,
  value,
  badge,
  badgeColor = '#4a6549',
  iconBg = '#F5F7F2',
  iconColor = '#8ba888',
  valueColor = '#1a1c1a',
}: {
  icon: string
  label: string
  value: string | number
  badge?: string
  badgeColor?: string
  iconBg?: string
  iconColor?: string
  valueColor?: string
}) => (
  <div
    className="bg-white rounded-xl p-6 hover:shadow-sm transition-all"
    style={{ border: '1px solid #E2E8DE' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: iconBg }}>
        <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
      </div>
      {badge && (
        <span className="text-xs font-bold" style={{ color: badgeColor }}>{badge}</span>
      )}
    </div>
    <div
      className="text-xs font-semibold uppercase tracking-widest mb-1"
      style={{ color: '#737970' }}
    >
      {label}
    </div>
    <div className="text-2xl font-bold" style={{ color: valueColor, fontFamily: 'Manrope, sans-serif' }}>
      {value}
    </div>
  </div>
)

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: pendingFoods } = useAdminPendingFoods(1)
  const { data: pendingBlogs } = useAdminBlogs(1, 'pending')

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}
        >
          Dashboard Overview
        </h1>
        <p className="text-sm" style={{ color: '#737970' }}>
          Welcome back. Here's what's happening with VitaFlow today.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon="person"
          label="Total Users"
          value={statsLoading ? '—' : (stats?.totalUsers ?? 0)}
          badge="+12%"
        />
        <StatCard
          icon="bolt"
          label="Active Users"
          value={statsLoading ? '—' : (stats?.activeUsers ?? 0)}
          badge="Live"
        />
        <StatCard
          icon="restaurant_menu"
          label="Total Foods"
          value={statsLoading ? '—' : (stats?.totalFoods ?? 0)}
        />
        <StatCard
          icon="pending_actions"
          label="Pending Foods"
          value={statsLoading ? '—' : (stats?.pendingFoods ?? 0)}
          badge={stats?.pendingFoods ? 'Action Needed' : undefined}
          badgeColor="#ba1a1a"
          iconBg="#ffdad6"
          iconColor="#ba1a1a"
          valueColor={stats?.pendingFoods ? '#ba1a1a' : '#1a1c1a'}
        />
        <StatCard
          icon="edit_note"
          label="Total Blogs"
          value={statsLoading ? '—' : (stats?.totalBlogs ?? 0)}
        />
        <StatCard
          icon="fitness_center"
          label="Exercises"
          value={statsLoading ? '—' : (stats?.totalExercises ?? 0)}
        />
        <StatCard
          icon="lightbulb"
          label="Expert Tips"
          value={statsLoading ? '—' : (stats?.totalSportTips ?? 0)}
          iconBg="#fef9c3"
          iconColor="#ca8a04"
        />
      </section>

      {/* Analytics + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Bar chart mock */}
        <div
          className="lg:col-span-8 bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #E2E8DE' }}
        >
          <div
            className="px-6 py-5 flex items-center justify-between border-b border-[#E2E8DE]"
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}
            >
              User Activity Trends
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8ba888' }} />
              <span className="text-xs font-medium" style={{ color: '#737970' }}>Active Daily</span>
            </div>
          </div>
          <div className="p-6 h-64 flex flex-col justify-end">
            <div className="flex items-end justify-between h-full gap-2">
              {[40, 65, 55, 85, 70, 45, 60, 80, 95, 50, 35, 65].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-lg transition-colors cursor-pointer"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i === 3 ? '#8ba888' : '#efeeea',
                  }}
                  onMouseEnter={(e) => {
                    if (i !== 3) (e.target as HTMLElement).style.backgroundColor = '#c9ecc6'
                  }}
                  onMouseLeave={(e) => {
                    if (i !== 3) (e.target as HTMLElement).style.backgroundColor = '#efeeea'
                  }}
                />
              ))}
            </div>
            <div
              className="flex justify-between mt-4 px-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: '#737970' }}
            >
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Platform health card */}
          <div
            className="text-white p-8 rounded-xl relative overflow-hidden"
            style={{ backgroundColor: '#4a6549' }}
          >
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Platform Health
              </h3>
              <p className="text-sm opacity-80 mb-6">
                Organic growth is up this month. Keep maintaining high content standards.
              </p>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                style={{ backgroundColor: '#fff', color: '#4a6549' }}
                onClick={() => navigate('/admin/users')}
              >
                <span>View Users</span>
                <span className="material-symbols-outlined text-sm">trending_up</span>
              </button>
            </div>
            <div
              className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            />
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E2E8DE' }}>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}
            >
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/foods')}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
                style={{ backgroundColor: '#F5F7F2' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#E2E8DE')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F5F7F2')}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: '#4a6549' }}>check_circle</span>
                  <span className="font-medium text-sm" style={{ color: '#1a1c1a' }}>Approve Foods</span>
                </div>
                {!!stats?.pendingFoods && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                    style={{ backgroundColor: '#8ba888' }}
                  >
                    {stats.pendingFoods}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/admin/blogs')}
                className="w-full flex items-center gap-3 p-4 rounded-lg border transition-colors text-left"
                style={{ border: '1px solid #E2E8DE' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#8ba888'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#F5F7F2'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E2E8DE'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#4a6549' }}>article</span>
                <span className="font-medium text-sm" style={{ color: '#1a1c1a' }}>Review Blogs</span>
                {!!pendingBlogs?.total && (
                  <span
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                    style={{ backgroundColor: '#8ba888' }}
                  >
                    {pendingBlogs.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/admin/exercises')}
                className="w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left"
                style={{ border: '1px solid #E2E8DE' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#8ba888'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#F5F7F2'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E2E8DE'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#4a6549' }}>fitness_center</span>
                <span className="font-medium text-sm" style={{ color: '#1a1c1a' }}>Manage Exercises</span>
              </button>
              <button
                onClick={() => navigate('/admin/sport-tips')}
                className="w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left"
                style={{ border: '1px solid #E2E8DE' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#8ba888'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#F5F7F2'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E2E8DE'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#ca8a04' }}>lightbulb</span>
                <span className="font-medium text-sm" style={{ color: '#1a1c1a' }}>Manage Sport Tips</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Foods Table */}
      <section className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8DE' }}>
        <div
          className="px-8 py-6 flex items-center justify-between border-b border-[#E2E8DE]"
        >
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}
            >
              Pending Food Submissions
            </h3>
            <p className="text-sm mt-0.5" style={{ color: '#737970' }}>
              Items awaiting your review
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/foods')}
            className="text-sm font-bold hover:underline"
            style={{ color: '#8ba888' }}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: '#F9FAF7' }}>
              <tr>
                {['Food Name', 'Category', 'Calories/100g', 'Date Submitted', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: '#737970' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #E2E8DE' }}>
              {pendingFoods?.foods.slice(0, 5).map((food) => (
                <tr
                  key={food.id}
                  className="transition-colors border-b border-[#E2E8DE]"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAF7')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                >
                  <td className="px-8 py-5 font-semibold text-sm" style={{ color: '#1a1c1a' }}>
                    {food.name}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: '#c9ecc6', color: '#243d24' }}
                    >
                      {food.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm" style={{ color: '#1a1c1a' }}>
                    {food.calories_per_100g} kcal
                  </td>
                  <td className="px-8 py-5 text-sm" style={{ color: '#737970' }}>
                    {new Date(food.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => navigate('/admin/foods')}
                      className="text-sm font-bold hover:underline"
                      style={{ color: '#8ba888' }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {!pendingFoods?.foods.length && (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-sm" style={{ color: '#737970' }}>
                    No pending submissions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
