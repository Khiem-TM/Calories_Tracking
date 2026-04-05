import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminFoods, deleteAdminFood, verifyAdminFood, rejectAdminFood } from '../../services/adminService'
import type { AdminFood } from '../../types/admin'
import { AdminFoodModal } from '../../features/admin/components/AdminFoodModal'

export default function AdminFoodsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editFood, setEditFood] = useState<AdminFood | null>(null)
  const qc = useQueryClient()
  const LIMIT = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'foods', { page, search }],
    queryFn: () => getAdminFoods(page, LIMIT, search || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'foods'] }),
  })
  const verifyMutation = useMutation({
    mutationFn: verifyAdminFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'foods'] }),
  })
  const rejectMutation = useMutation({
    mutationFn: rejectAdminFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'foods'] }),
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function openCreate() {
    setEditFood(null)
    setModalOpen(true)
  }

  function openEdit(food: AdminFood) {
    setEditFood(food)
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-newsreader">Foods</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{data?.total ?? 0} total entries</p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search foods…"
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
            Add Food
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-highest">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">kcal/100g</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highest">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : data?.foods.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant text-sm">No foods found</td></tr>
              ) : (
                data?.foods.map((food) => (
                  <tr key={food.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-on-surface">{food.name}</p>
                        {food.brand && <p className="text-xs text-on-surface-variant">{food.brand}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{food.category ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-surface-highest text-on-surface-variant capitalize">
                        {food.food_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-on-surface data-value">
                      {Number(food.calories_per_100g).toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        food.is_verified
                          ? 'bg-[#22c55e]/10 text-[#16a34a]'
                          : 'bg-[#f59e0b]/10 text-[#b45309]'
                      }`}>
                        {food.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!food.is_verified && (
                          <button onClick={() => verifyMutation.mutate(food.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-[#22c55e]/10 hover:text-[#16a34a] transition-colors" title="Verify">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {food.is_active && food.is_verified && (
                          <button onClick={() => rejectMutation.mutate(food.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-[#f59e0b]/10 hover:text-[#b45309] transition-colors" title="Reject">
                            <XCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => openEdit(food)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this food?')) deleteMutation.mutate(food.id) }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors" title="Delete">
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

      <AdminFoodModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditFood(null) }}
        food={editFood ?? undefined}
      />
    </div>
  )
}
