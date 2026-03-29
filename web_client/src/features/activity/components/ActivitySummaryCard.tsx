import { Card } from '@/components/ui/Card'

interface ActivitySummaryCardProps {
  steps: number
  caloriesBurned: number
  activeMinutes: number
  waterMl: number
}

interface StatProps {
  icon: string
  label: string
  value: string
  sub?: string
}

function Stat({ icon, label, value, sub }: StatProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xl mb-1">{icon}</span>
      <p className="text-lg font-bold text-on-surface data-value">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant/60">{sub}</p>}
      <p className="text-xs text-on-surface-variant mt-0.5 font-manrope">{label}</p>
    </div>
  )
}

export function ActivitySummaryCard({
  steps,
  caloriesBurned,
  activeMinutes,
  waterMl,
}: ActivitySummaryCardProps) {
  return (
    <Card header="Activity Today">
      <div className="grid grid-cols-4 gap-2 py-2">
        <Stat
          icon="👟"
          label="Steps"
          value={steps.toLocaleString()}
        />
        <Stat
          icon="🔥"
          label="Burned"
          value={`${Math.round(caloriesBurned)}`}
          sub="kcal"
        />
        <Stat
          icon="⚡"
          label="Active"
          value={`${activeMinutes}`}
          sub="min"
        />
        <Stat
          icon="💧"
          label="Water"
          value={waterMl >= 1000 ? `${(waterMl / 1000).toFixed(1)}L` : `${waterMl}ml`}
        />
      </div>
    </Card>
  )
}
