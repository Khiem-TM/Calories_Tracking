import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardData } from '@/types/api'

interface Props {
  days: DashboardData[]
}

export function WeeklyChart({ days }: Props) {
  const data = days.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    calories: d.totalCalories,
    goal: d.calorieGoal,
  }))

  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
      <p className="text-sm font-medium mb-4" style={{ color: '#7a9080' }}>Weekly Calories</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={12}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f2" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#7a9080' }} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
            cursor={{ fill: '#f0f4f2' }}
          />
          <Bar dataKey="calories" fill="#1e4d35" radius={[6, 6, 0, 0]} name="Calories" />
          <Bar dataKey="goal" fill="#d4eddf" radius={[6, 6, 0, 0]} name="Goal" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
