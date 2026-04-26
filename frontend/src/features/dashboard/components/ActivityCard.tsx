import { Footprints, Droplets, Flame } from 'lucide-react'

interface Props {
  steps?: number
  stepsGoal?: number
  water?: number
  waterGoal?: number
  caloriesBurned?: number
}

function StatItem({ icon: Icon, label, value, unit, goal, color }: {
  icon: typeof Footprints
  label: string
  value?: number
  unit: string
  goal?: number
  color: string
}) {
  const pct = goal && value ? Math.min(100, Math.round((value / goal) * 100)) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <p className="text-xs" style={{ color: '#7a9080' }}>{label}</p>
          <p className="text-sm font-semibold" style={{ color: '#1a3829' }}>
            {(value ?? 0).toLocaleString()} <span className="text-xs font-normal" style={{ color: '#7a9080' }}>{unit}</span>
          </p>
        </div>
        {goal && (
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#d4eddf' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
        )}
      </div>
    </div>
  )
}

export function ActivityCard({ steps, stepsGoal, water, waterGoal, caloriesBurned }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 2px 16px rgba(30,77,53,0.07)' }}>
      <p className="text-sm font-medium" style={{ color: '#7a9080' }}>Today&apos;s Activity</p>
      <StatItem icon={Footprints} label="Steps" value={steps} unit="steps" goal={stepsGoal ?? 10000} color="#3a8f67" />
      <StatItem icon={Droplets} label="Water" value={water} unit="ml" goal={waterGoal ?? 2000} color="#2563eb" />
      <StatItem icon={Flame} label="Calories Burned" value={caloriesBurned} unit="kcal" color="#f4a62a" />
    </div>
  )
}
