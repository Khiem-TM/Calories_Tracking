import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  totalCalories: number
  calorieGoal: number
  protein: number
  carbs: number
  fat: number
}

const COLORS = ['#3a8f67', '#f4a62a', '#e05c5c']

export function CalorieSummaryCard({ totalCalories, calorieGoal, protein, carbs, fat }: Props) {
  const remaining = Math.max(0, calorieGoal - totalCalories)
  const pct = Math.min(100, Math.round((totalCalories / calorieGoal) * 100)) || 0

  const macroData = [
    { name: 'Protein', value: protein, color: '#3a8f67' },
    { name: 'Carbs', value: carbs, color: '#f4a62a' },
    { name: 'Fat', value: fat, color: '#e05c5c' },
  ]

  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
      <p className="text-sm font-medium mb-1" style={{ color: '#7a9080' }}>Today&apos;s Calories</p>
      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: totalCalories }, { value: Math.max(0, remaining) }]}
                cx="50%" cy="50%"
                innerRadius={36} outerRadius={50}
                startAngle={90} endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="#1e4d35" />
                <Cell fill="#d4eddf" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a3829', lineHeight: 1.1 }}>
              {pct}%
            </span>
            <span className="text-[10px]" style={{ color: '#7a9080' }}>of goal</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a3829' }}>
            {totalCalories.toLocaleString()}
          </p>
          <p className="text-xs mb-3" style={{ color: '#7a9080' }}>
            {remaining > 0 ? `${remaining} kcal remaining` : 'Goal reached 🎉'}
          </p>
          {macroData.map((m) => (
            <div key={m.name} className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <span className="text-xs flex-1" style={{ color: '#7a9080' }}>{m.name}</span>
              <span className="text-xs font-semibold" style={{ color: '#3d4d44' }}>{m.value}g</span>
            </div>
          ))}
        </div>
      </div>

      {/* Macro bars */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t" style={{ borderColor: '#c9e4d4' }}>
        {macroData.map((m) => (
          <div key={m.name} className="text-center">
            <p className="text-xs font-medium mb-1" style={{ color: '#3d4d44' }}>{m.value}g</p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#d4eddf' }}>
              <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: m.color }} />
            </div>
            <p className="text-[10px] mt-1" style={{ color: '#7a9080' }}>{m.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Suppress unused import warning
void Tooltip
void COLORS
