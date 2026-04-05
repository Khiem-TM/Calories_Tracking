import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Users, UtensilsCrossed, FileText, Dumbbell, UserCheck, AlertCircle } from 'lucide-react'
import { getAdminStats } from '../../services/adminService'

const COLORS = ['#006d3a', '#3dae6b', '#8af9ae', '#f97316', '#3b82f6', '#f59e0b']

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-on-surface-variant font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-on-surface data-value">{value.toLocaleString()}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  })

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const barData = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Foods', value: stats.totalFoods },
    { name: 'Blogs', value: stats.totalBlogs },
    { name: 'Exercises', value: stats.totalExercises },
  ]

  const pieData = [
    { name: 'Verified Foods', value: stats.totalFoods - stats.pendingFoods },
    { name: 'Pending Foods', value: stats.pendingFoods },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface font-newsreader">Overview</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Platform statistics at a glance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-primary" />
        <StatCard label="Active Users" value={stats.activeUsers} icon={UserCheck} color="bg-primary-container" />
        <StatCard label="Total Foods" value={stats.totalFoods} icon={UtensilsCrossed} color="bg-tertiary" />
        <StatCard label="Pending Foods" value={stats.pendingFoods} icon={AlertCircle} color="bg-error" />
        <StatCard label="Blog Posts" value={stats.totalBlogs} icon={FileText} color="bg-secondary" />
        <StatCard label="Exercises" value={stats.totalExercises} icon={Dumbbell} color="bg-[#3b82f6]" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Content Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4f9e7" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#3e4a40' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#3e4a40' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Food Verification Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
