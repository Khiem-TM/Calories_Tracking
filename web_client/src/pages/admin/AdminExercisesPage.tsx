import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminExercises, deleteAdminExercise } from '../../services/adminService'
import type { AdminExercise } from '../../types/admin'
import { AdminExerciseModal } from '../../features/admin/components/AdminExerciseModal'

const intensityColor: Record<string, string> = {
  light: 'bg-[#22c55e]/10 text-[#16a34a]',
  moderate: 'bg-[#f59e0b]/10 text-[#b45309]',
  heavy: 'bg-error/10 text-error',
}

export default function AdminExercisesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editExercise, setEditExercise] = useState<AdminExercise | null>(null)
  const qc = useQueryClient()
  const LIMIT = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'exercises', { page, search }],
    queryFn: () => getAdminExercises(page, LIMIT, search || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'exercises'] }),
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function openCreate() { setEditExercise(null); setModalOpen(true) }
  function openEdit(ex: AdminExercise) { setEditExercise(ex); setModalOpen(true) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-newsreader">Exercises</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{data?.total ?? 0} exercises</p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search exercises…"
                className="pl-9 pr-4 py-2 rounded-xl border border-surface-highest bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-52"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl bg-surface-highest text-sm text-on-surface font-medium hover:bg-surface-low transition-colors">
              Search
            </button>
          </form>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            Add Exercise
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-highest">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Muscle Group</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Intensity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">MET</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highest">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : data?.exercises.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant text-sm">No exercises found</td></tr>
              ) : (
                data?.exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-on-surface">{ex.name}</p>
                        {ex.description && <p className="text-xs text-on-surface-variant line-clamp-1 max-w-xs">{ex.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {ex.primaryMuscleGroup.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${intensityColor[ex.intensity] ?? 'bg-surface-highest text-on-surface-variant'}`}>
                        {ex.intensity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-on-surface data-value">
                      {Number(ex.metValue).toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(ex)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this exercise?')) deleteMutation.mutate(ex.id) }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-highest">
            <span className="text-xs text-on-surface-variant">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-40 transition-colors"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-40 transition-colors"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      <AdminExerciseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditExercise(null) }}
        exercise={editExercise ?? undefined}
      />
    </div>
  )
}
