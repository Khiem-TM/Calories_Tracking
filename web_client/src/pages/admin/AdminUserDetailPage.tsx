import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { getAdminUser } from '../../services/adminService'

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => getAdminUser(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const hp = user.healthProfile

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-on-surface font-newsreader">User Detail</h2>
          <p className="text-sm text-on-surface-variant">ID: {user.id}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} className="w-16 h-16 rounded-2xl object-cover" alt="" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user.display_name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-on-surface">{user.display_name}</h3>
            <p className="text-sm text-on-surface-variant">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-highest text-on-surface-variant'
              }`}>
                {user.role}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                user.is_active ? 'bg-[#22c55e]/10 text-[#16a34a]' : 'bg-error/10 text-error'
              }`}>
                {user.is_active ? 'Active' : 'Banned'}
              </span>
              {user.is_verified && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#3b82f6]/10 text-[#2563eb]">
                  Verified
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-on-surface-variant">
            <p>Joined</p>
            <p className="font-medium text-on-surface">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Health Profile */}
      {hp && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Health Profile</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Birth Date', value: hp.birthDate },
              { label: 'Gender', value: hp.gender },
              { label: 'Height', value: `${hp.heightCm} cm` },
              { label: 'Initial Weight', value: `${hp.initialWeightKg} kg` },
              { label: 'Goal Weight', value: hp.weightGoalKg ? `${hp.weightGoalKg} kg` : '—' },
              { label: 'Activity Level', value: hp.activityLevel },
              { label: 'Diet Type', value: hp.dietType || '—' },
              { label: 'Water Goal', value: `${hp.waterGoalMl} ml` },
              { label: 'Calories Goal', value: hp.caloriesGoal ? `${hp.caloriesGoal} kcal` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-xl p-3">
                <p className="text-xs text-on-surface-variant mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-on-surface capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="text-sm font-semibold text-on-surface mb-4">Recent Workouts</h3>
        {!user.recentWorkouts?.length ? (
          <p className="text-sm text-on-surface-variant">No workout history.</p>
        ) : (
          <div className="space-y-3">
            {user.recentWorkouts.map((w) => (
              <div key={w.id} className="flex items-center gap-3 bg-surface rounded-xl p-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {w.exercise?.name ?? 'Unknown exercise'}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(w.sessionDate).toLocaleDateString()} · {w.durationMinutes} min
                    {w.sets > 0 && ` · ${w.sets} sets × ${w.repsPerSet} reps`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-on-surface data-value">
                  {Number(w.caloriesBurnedSnapshot).toFixed(0)} kcal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
