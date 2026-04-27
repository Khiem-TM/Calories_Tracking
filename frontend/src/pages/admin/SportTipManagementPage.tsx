import { useState } from 'react'
import {
  useAdminSportTips,
  useCreateSportTip,
  useAdminExercises,
} from '@/features/admin/hooks/useAdmin'
import type { AdminSportTip, CreateSportTipDto } from '@/features/admin/services/adminService'

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio', 'glutes', 'calves']

const EMPTY_TIP: CreateSportTipDto = {
  title: '',
  content: '',
  sport_category: '',
  muscle_group: '',
  exercise_id: '',
  author: 'Admin',
}

export default function SportTipManagementPage() {
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateSportTipDto>(EMPTY_TIP)

  const { data: tipsData, isLoading: loadingTips } = useAdminSportTips(page)
  const { data: exercisesData } = useAdminExercises(1, '') // Get some exercises for selection
  const createMutation = useCreateSportTip()

  const tips = tipsData?.tips ?? []
  const total = tipsData?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync(form)
    setShowModal(false)
    setForm(EMPTY_TIP)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
            Sport Tips
          </h1>
          <p className="text-base" style={{ color: '#737970' }}>
            Provide expert guidance and performance hacks for specific movements.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-green-100"
          style={{ backgroundColor: '#8ba888' }}
        >
          <span className="material-symbols-outlined text-[20px]">lightbulb</span>
          Create New Tip
        </button>
      </div>

      {/* Grid */}
      {loadingTips ? (
        <div className="py-24 text-center text-sm" style={{ color: '#737970' }}>
           <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl">motion_photos_on</span>
              Loading expert tips...
            </div>
        </div>
      ) : tips.length === 0 ? (
        <div
          className="py-24 text-center rounded-3xl"
          style={{ border: '1px solid #E2E8DE', backgroundColor: '#fff', color: '#737970' }}
        >
          <span className="material-symbols-outlined text-6xl block mb-4" style={{ color: '#c3c8bf' }}>lightbulb</span>
          <p className="text-sm font-medium">No sport tips found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <p className="text-sm font-medium" style={{ color: '#737970' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </p>
          <div className="flex gap-2">
            <PagBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </PagBtn>
            <PagBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </PagBtn>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(47,49,46,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{ border: '1px solid #E2E8DE' }}
          >
            <div className="px-8 py-6 border-b border-[#E2E8DE] bg-[#F9FAF7] flex justify-between items-center">
              <h2 className="text-2xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
                New Expert Tip
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E2E8DE] transition-colors"
                style={{ color: '#737970' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Tip Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl text-lg font-bold outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888]"
                  placeholder="e.g. Master the Barbell Squat Depth"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Linked Exercise (Optional)</label>
                  <select
                    value={form.exercise_id || ''}
                    onChange={(e) => setForm({ ...form, exercise_id: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] appearance-none"
                  >
                    <option value="">No linked exercise</option>
                    {exercisesData?.exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Muscle Group</label>
                  <select
                    value={form.muscle_group || ''}
                    onChange={(e) => setForm({ ...form, muscle_group: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] appearance-none"
                  >
                    <option value="">Generic</option>
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>{m.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Tip Content *</label>
                <textarea
                  required
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888] resize-none"
                  placeholder="Detailed explanation, steps, or secrets..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 rounded-2xl text-sm font-bold transition-all" style={{ color: '#737970' }}>
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="px-10 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-green-100" style={{ backgroundColor: '#4a6549' }}>
                  {createMutation.isPending ? 'Saving...' : 'Add Expert Tip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TipCard({ tip }: { tip: AdminSportTip }) {
  return (
    <div
      className="bg-white rounded-3xl p-8 flex flex-col transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1"
      style={{ border: '1px solid #E2E8DE' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F7F2] flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]" style={{ color: '#4a6549' }}>lightbulb</span>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#E2E8DE] text-[#434841]">
          {tip.muscle_group || 'Generic'}
        </span>
      </div>
      <h3
        className="font-extrabold text-xl mb-4 leading-tight"
        style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}
      >
        {tip.title}
      </h3>
      <p className="text-sm opacity-60 line-clamp-3 mb-6 flex-1 italic" style={{ color: '#1a1c1a' }}>
        "{tip.content}"
      </p>
      
      <div className="pt-6 border-t border-[rgba(226,232,222,0.4)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#c9ecc6] flex items-center justify-center text-[10px] font-bold text-[#243d24]">
            { tip.author.charAt(0) }
          </div>
          <span className="text-xs font-bold" style={{ color: '#434841' }}>{tip.author}</span>
        </div>
        <span className="material-symbols-outlined text-[20px] opacity-30">more_horiz</span>
      </div>
    </div>
  )
}

function PagBtn({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-all border border-[#c3c8bf] bg-white text-[#434841] hover:bg-[#faf9f5] disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
