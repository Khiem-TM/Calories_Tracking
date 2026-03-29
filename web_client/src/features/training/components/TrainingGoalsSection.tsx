import { useState } from 'react'
import { clsx } from 'clsx'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useTrainingGoals } from '../hooks/useTrainingGoals'
import { useUpdateGoal } from '../hooks/useUpdateGoal'
import { CreateGoalModal } from './CreateGoalModal'
import type { TrainingGoal, TrainingGoalStatus } from '@/types'

const GOAL_TYPE_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
  improve_endurance: 'Improve Endurance',
  maintain: 'Maintain',
}

const STATUS_STYLES: Record<TrainingGoalStatus, string> = {
  ACTIVE: 'bg-brand/10 text-brand',
  COMPLETED: 'bg-green-100 text-green-700',
  ABANDONED: 'bg-slate-100 text-slate-500',
}

function GoalCard({ goal }: { goal: TrainingGoal }) {
  const { mutate: updateGoal, isPending } = useUpdateGoal()

  const handleStatus = (status: TrainingGoalStatus) => {
    updateGoal({ id: goal.id, dto: { status } })
  }

  return (
    <div className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-slate-800">
            {GOAL_TYPE_LABELS[goal.goalType] ?? goal.goalType}
          </p>
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[goal.status])}>
            {goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
          </span>
        </div>
        {goal.targetValue != null && (
          <p className="text-xs text-slate-500">
            Target: {goal.targetValue} {goal.goalType.includes('weight') ? 'kg' : ''}
          </p>
        )}
        {goal.deadline && (
          <p className="text-xs text-slate-400">
            Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
      {goal.status === 'ACTIVE' && (
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={() => handleStatus('COMPLETED')}
            disabled={isPending}
            className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            Done
          </button>
          <button
            onClick={() => handleStatus('ABANDONED')}
            disabled={isPending}
            className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Abandon
          </button>
        </div>
      )}
    </div>
  )
}

export function TrainingGoalsSection() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: goals = [], isLoading } = useTrainingGoals()

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE')
  const otherGoals = goals.filter((g) => g.status !== 'ACTIVE')

  return (
    <>
      <Card
        header={
          <div className="flex items-center justify-between">
            <span>Training Goals</span>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              + New Goal
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No training goals yet</p>
            <p className="text-xs text-slate-400 mt-1">Set a goal to stay on track</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            {activeGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
            {otherGoals.length > 0 && activeGoals.length > 0 && (
              <p className="text-xs text-slate-400 pt-1 pb-0.5 font-medium">Past Goals</p>
            )}
            {otherGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
          </div>
        )}
      </Card>

      <CreateGoalModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}
