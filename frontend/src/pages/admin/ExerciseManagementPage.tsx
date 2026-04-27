import { useState } from 'react'
import {
  useAdminExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '@/features/admin/hooks/useAdmin'
import type { AdminExercise, CreateExerciseDto } from '@/features/admin/services/adminService'

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio', 'glutes', 'calves']
const INTENSITIES = ['low', 'medium', 'high']

const INTENSITY_COLORS: Record<string, string> = {
  low: '#4ade80',
  medium: '#f59e0b',
  high: '#f97316',
}

const EMPTY_FORM: CreateExerciseDto = {
  name: '',
  primaryMuscleGroup: '',
  intensity: '',
  metValue: 0,
  description: '',
  instructions: '',
  videoUrl: '',
}

export default function ExerciseManagementPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminExercise | null>(null)
  const [form, setForm] = useState<CreateExerciseDto>(EMPTY_FORM)
  const [filterMuscle, setFilterMuscle] = useState('')
  const [filterIntensity, setFilterIntensity] = useState('')

  const { data, isLoading } = useAdminExercises(page, search || undefined)
  const createMutation = useCreateExercise()
  const updateMutation = useUpdateExercise()
  const deleteMutation = useDeleteExercise()

  const exercises: AdminExercise[] = (data?.exercises ?? []).filter((ex) => {
    if (filterMuscle && ex.primaryMuscleGroup !== filterMuscle) return false
    if (filterIntensity && ex.intensity !== filterIntensity) return false
    return true
  })
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (ex: AdminExercise) => {
    setEditTarget(ex)
    setForm({
      name: ex.name,
      primaryMuscleGroup: ex.primaryMuscleGroup,
      intensity: ex.intensity,
      metValue: ex.metValue,
      description: ex.description ?? '',
      instructions: ex.instructions ?? '',
      videoUrl: ex.videoUrl ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget.id, dto: form })
    } else {
      await createMutation.mutateAsync(form)
    }
    setShowModal(false)
    setForm(EMPTY_FORM)
    setEditTarget(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
            Exercise Library
          </h1>
          <p className="text-base" style={{ color: '#737970' }}>
            Curate and maintain the organic movement database.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-green-100"
          style={{ backgroundColor: '#8ba888' }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New Exercise
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Exercises', value: total, icon: 'inventory_2' },
          { label: 'Avg MET Value', value: exercises.length ? (exercises.reduce((a, e) => a + e.metValue, 0) / exercises.length).toFixed(1) : '—', icon: 'bolt' },
          { label: 'Muscle Groups', value: new Set(exercises.map((e) => e.primaryMuscleGroup)).size, icon: 'fitness_center' },
          { label: 'With Videos', value: exercises.filter((e) => e.videoUrl).length, icon: 'videocam' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-6 flex flex-col justify-between h-32 shadow-sm" style={{ border: '1px solid #E2E8DE' }}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>{c.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F7F2' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#4a6549' }}>{c.icon}</span>
              </div>
            </div>
            <span className="text-3xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>{c.value}</span>
          </div>
        ))}
      </div>

      {/* Table container */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8DE' }}>
        {/* Toolbar */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b border-[#E2E8DE]"
          style={{ backgroundColor: 'rgba(244,244,239,0.5)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Filters:</span>
            <select
              value={filterMuscle}
              onChange={(e) => setFilterMuscle(e.target.value)}
              className="bg-white rounded-xl text-xs font-medium px-4 py-2 outline-none appearance-none cursor-pointer transition-all"
              style={{ border: '1px solid #E2E8DE', color: '#434841', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">All Muscle Groups</option>
              {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
            <select
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(e.target.value)}
              className="bg-white rounded-xl text-xs font-medium px-4 py-2 outline-none appearance-none cursor-pointer transition-all"
              style={{ border: '1px solid #E2E8DE', color: '#434841', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">All Intensities</option>
              {INTENSITIES.map((i) => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
            </select>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: '#737970' }}>search</span>
              <input
                className="pl-9 pr-4 py-2 rounded-xl text-xs font-medium outline-none bg-[#faf9f5] transition-all"
                style={{ border: '1px solid #E2E8DE', width: '220px', color: '#1a1c1a', fontFamily: 'Inter, sans-serif' }}
                placeholder="Search exercises..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = '#8ba888'; e.target.style.backgroundColor = '#fff' }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8DE'; e.target.style.backgroundColor = '#faf9f5' }}
              />
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: 'rgba(244,244,239,0.5)' }}>
              <tr>
                {['Exercise Name', 'Muscle Group', 'Intensity', 'MET Value', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#737970' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid rgba(195,200,191,0.3)' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#737970' }}>Loading...</td>
                </tr>
              ) : exercises.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#737970' }}>No exercises found</td>
                </tr>
              ) : (
                exercises.map((ex) => (
                  <tr
                    key={ex.id}
                    className="transition-colors border-b border-[rgba(195,200,191,0.3)]"
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#faf9f5')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e3e3de' }}>
                          <span className="material-symbols-outlined text-[20px]" style={{ color: '#4a6549' }}>fitness_center</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#1a1c1a' }}>{ex.name}</p>
                          {ex.description && (
                            <p className="text-xs line-clamp-1" style={{ color: '#737970' }}>{ex.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#c9ecc6', color: '#243d24' }}>
                        {ex.primaryMuscleGroup.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: INTENSITY_COLORS[ex.intensity] ?? '#737970' }} />
                        <span className="text-sm capitalize" style={{ color: '#1a1c1a' }}>{ex.intensity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-center" style={{ color: '#4a6549' }}>
                      {ex.metValue}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(ex)}
                        className="p-2 rounded-lg transition-colors"
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f4f4ef')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#737970' }}>edit</span>
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(ex.id)}
                        className="p-2 rounded-lg transition-colors"
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffdad6')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#ba1a1a' }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(244,244,239,0.3)', borderTop: '1px solid #E2E8DE' }}>
          <p className="text-sm font-medium" style={{ color: '#737970' }}>
            Showing <strong>{exercises.length}</strong> of <strong>{total}</strong> exercises
          </p>
          <div className="flex gap-2">
            <PagBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </PagBtn>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
              <PagBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PagBtn>
            ))}
            <PagBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </PagBtn>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(47,49,46,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            style={{ border: '1px solid #E2E8DE' }}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-[#F9FAF7] px-8 py-6 flex justify-between items-center z-10 border-b border-[#E2E8DE]">
              <div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
                  {editTarget ? 'Edit Exercise' : 'Create New Exercise'}
                </h2>
                <p className="text-xs mt-1 font-medium" style={{ color: '#737970' }}>
                  {editTarget ? 'Update the exercise parameters.' : 'Define parameters for a new movement pattern.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E2E8DE] transition-colors" style={{ color: '#737970' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Exercise Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#E2E8DE] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="e.g. Barbell Squat"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>MET Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.metValue || ''}
                    onChange={(e) => setForm({ ...form, metValue: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#E2E8DE] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="4.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Primary Muscle Group *</label>
                  <select
                    required
                    value={form.primaryMuscleGroup}
                    onChange={(e) => setForm({ ...form, primaryMuscleGroup: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none bg-[#faf9f5] border border-[#E2E8DE] focus:bg-white focus:border-[#8ba888] transition-all cursor-pointer"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Select Muscle...</option>
                    {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Intensity Level *</label>
                  <select
                    required
                    value={form.intensity}
                    onChange={(e) => setForm({ ...form, intensity: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none bg-[#faf9f5] border border-[#E2E8DE] focus:bg-white focus:border-[#8ba888] transition-all cursor-pointer"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Select Intensity...</option>
                    <option value="low">Low (Restorative)</option>
                    <option value="medium">Medium (Active)</option>
                    <option value="high">High (Intense)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none border border-[#E2E8DE] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="A brief overview of the exercise's purpose..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Instructions</label>
                <textarea
                  rows={4}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none border border-[#E2E8DE] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Step-by-step guidance for perfect execution..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Video Tutorial URL</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 material-symbols-outlined text-[18px]" style={{ color: '#737970' }}>link</span>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none border border-[#E2E8DE] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 rounded-2xl text-sm font-bold transition-all"
                  style={{ color: '#737970' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-10 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-green-100"
                  style={{ backgroundColor: '#4a6549' }}
                >
                  {editTarget ? 'Update Exercise' : 'Save Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PagBtn({ children, active, disabled, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-all"
      style={{
        backgroundColor: active ? '#8ba888' : '#fff',
        color: active ? '#fff' : '#434841',
        border: active ? 'none' : '1px solid #E2E8DE',
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: active ? 700 : 500,
        boxShadow: active ? '0 4px 12px rgba(139,168,136,0.2)' : 'none',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {children}
    </button>
  )
}
