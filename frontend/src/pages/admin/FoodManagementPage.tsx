import { useState } from 'react'
import {
  useAdminFoods,
  useAdminPendingFoods,
  useCreateFood,
  useUpdateFood,
  useVerifyFood,
  useRejectFood,
  useDeleteFood,
} from '@/features/admin/hooks/useAdmin'
import type { AdminFood, CreateFoodDto } from '@/features/admin/services/adminService'

type TabType = 'all' | 'pending'

const EMPTY_FORM: CreateFoodDto = {
  name: '',
  nameEn: '',
  brand: '',
  category: '',
  foodType: 'ingredient',
  servingSizeG: 100,
  caloriesPer100g: 0,
  proteinPer100g: 0,
  fatPer100g: 0,
  carbsPer100g: 0,
  isVerified: true,
}

export default function FoodManagementPage() {
  const [tab, setTab] = useState<TabType>('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedFood, setSelectedFood] = useState<AdminFood | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<CreateFoodDto>(EMPTY_FORM)

  const { data: allFoods, isLoading: loadingAll } = useAdminFoods(page, search || undefined)
  const { data: pendingFoods, isLoading: loadingPending } = useAdminPendingFoods(page)
  const createMutation = useCreateFood()
  const updateMutation = useUpdateFood()
  const verifyMutation = useVerifyFood()
  const rejectMutation = useRejectFood()
  const deleteMutation = useDeleteFood()

  const isLoading = tab === 'all' ? loadingAll : loadingPending
  const foods: AdminFood[] = tab === 'all'
    ? (allFoods?.foods ?? [])
    : (pendingFoods?.foods ?? [])
  const total = tab === 'all' ? (allFoods?.total ?? 0) : (pendingFoods?.total ?? 0)
  const totalPages = Math.ceil(total / 20)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setIsEditing(false)
    setShowModal(true)
  }

  const openEdit = (food: AdminFood) => {
    setForm({
      name: food.name,
      nameEn: food.name_en || '',
      brand: food.brand || '',
      category: food.category,
      foodType: food.food_type,
      servingSizeG: food.serving_size_g,
      caloriesPer100g: food.calories_per_100g,
      proteinPer100g: food.protein_per_100g,
      fatPer100g: food.fat_per_100g,
      carbsPer100g: food.carbs_per_100g,
      isVerified: food.is_verified,
    })
    setSelectedFood(food)
    setIsEditing(true)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && selectedFood) {
      await updateMutation.mutateAsync({ id: selectedFood.id, dto: form })
    } else {
      await createMutation.mutateAsync(form)
    }
    setShowModal(false)
    setForm(EMPTY_FORM)
    setSelectedFood(null)
  }

  const tabStyle = (active: boolean) => ({
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 700,
    color: active ? '#4a6549' : '#737970',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: '3px',
    borderBottomStyle: 'solid' as const,
    borderBottomColor: active ? '#4a6549' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
            Food Management
          </h1>
          <p className="text-base" style={{ color: '#737970' }}>
            Curate and maintain the central nutritional database with precision.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-green-100"
          style={{ backgroundColor: '#8ba888' }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Food
        </button>
      </div>

      {/* Tabs & Search box */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8DE] overflow-hidden">
        <div className="flex items-center border-b border-[#E2E8DE] px-4">
          <button style={tabStyle(tab === 'all')} onClick={() => { setTab('all'); setPage(1) }}>
            All Database
          </button>
          <button style={tabStyle(tab === 'pending')} onClick={() => { setTab('pending'); setPage(1) }}>
            Review ({pendingFoods?.total ?? 0})
          </button>

          {tab === 'all' && (
            <form onSubmit={handleSearch} className="ml-auto flex items-center gap-3 py-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: '#737970' }}>search</span>
                <input
                  className="pl-10 pr-4 py-2 rounded-xl text-sm outline-none w-[280px] transition-all bg-[#faf9f5] border border-[#c3c8bf]"
                  placeholder="Search database..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = '#8ba888'; e.target.style.backgroundColor = '#fff' }}
                  onBlur={(e) => { e.target.style.borderColor = '#c3c8bf'; e.target.style.backgroundColor = '#faf9f5' }}
                />
              </div>
            </form>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: 'rgba(244,244,239,0.5)' }}>
                {['Name', 'Category', 'Calories/100g', 'Macros (P/C/F)', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(195,200,191,0.3)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-sm" style={{ color: '#737970' }}>
                    Loading database...
                  </td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-sm" style={{ color: '#737970' }}>
                    No food entries found.
                  </td>
                </tr>
              ) : (
                foods.map((food) => (
                  <FoodRow
                    key={food.id}
                    food={food}
                    isPending={tab === 'pending'}
                    onEdit={() => openEdit(food)}
                    onVerify={() => verifyMutation.mutate(food.id)}
                    onReject={() => rejectMutation.mutate(food.id)}
                    onDelete={() => deleteMutation.mutate(food.id)}
                    onView={() => setSelectedFood(food)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 flex items-center justify-between" style={{ backgroundColor: 'rgba(244,244,239,0.3)' }}>
          <p className="text-sm font-medium" style={{ color: '#737970' }}>
            Showing <strong>{foods.length}</strong> of <strong>{total}</strong> entries
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
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{ border: '1px solid #E2E8DE' }}
          >
            <div className="px-8 py-6 flex justify-between items-center border-b border-[#E2E8DE] bg-[#F9FAF7]">
              <h3 className="text-2xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
                {isEditing ? 'Update Food Profile' : 'New Food Entry'}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E2E8DE] transition-colors" style={{ color: '#737970' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Food Name (VN) *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] focus:bg-white focus:border-[#8ba888]"
                    placeholder="e.g. Hạt Chia Hữu Cơ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Food Name (EN)</label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                    placeholder="e.g. Organic Chia Seeds"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Brand / Producer</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                    placeholder="e.g. Vinamilk"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Category *</label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Type</label>
                  <select
                    value={form.foodType}
                    onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#c3c8bf] bg-[#faf9f5] appearance-none"
                  >
                    <option value="ingredient">Ingredient</option>
                    <option value="packaged">Packaged Product</option>
                    <option value="meal">Complete Meal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-3xl bg-[#F9FAF7] border border-[#E2E8DE]">
                <div className="col-span-2 lg:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Calories/100g *</label>
                  <input
                    required
                    type="number"
                    value={form.caloriesPer100g || ''}
                    onChange={(e) => setForm({ ...form, caloriesPer100g: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-b-2 border-[#c3c8bf] bg-transparent text-lg font-bold outline-none focus:border-[#4a6549]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4a6549' }}>Protein (g)</label>
                  <input
                    type="number"
                    value={form.proteinPer100g || ''}
                    onChange={(e) => setForm({ ...form, proteinPer100g: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-b-2 border-[rgba(139,168,136,0.3)] bg-transparent text-base outline-none focus:border-[#4a6549]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d48d00' }}>Carbs (g)</label>
                  <input
                    type="number"
                    value={form.carbsPer100g || ''}
                    onChange={(e) => setForm({ ...form, carbsPer100g: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-b-2 border-amber-100 bg-transparent text-base outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ba1a1a' }}>Fat (g)</label>
                  <input
                    type="number"
                    value={form.fatPer100g || ''}
                    onChange={(e) => setForm({ ...form, fatPer100g: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-b-2 border-red-500/10 bg-transparent text-base outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 rounded-2xl text-sm font-bold transition-all" style={{ color: '#737970' }}>
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-10 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-green-100" style={{ backgroundColor: '#4a6549' }}>
                  {isEditing ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedFood && !showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(47,49,46,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedFood(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid #E2E8DE' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#c9ecc6] text-[#243d24] mb-3 inline-block">
                    {selectedFood.category}
                  </span>
                  <h2 className="text-3xl font-extrabold mb-1" style={{ color: '#1a1c1a' }}>{selectedFood.name}</h2>
                  <p className="text-lg opacity-60 italic">{selectedFood.name_en || '—'}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#F5F7F2] flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#4a6549' }}>restaurant</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailBox label="Energy" value={`${selectedFood.calories_per_100g} kcal`} />
                <DetailBox label="Serving" value={`${selectedFood.serving_size_g}g`} />
                <DetailBox label="Protein" value={`${selectedFood.protein_per_100g}g`} color="#4a6549" />
                <DetailBox label="Carbohydrates" value={`${selectedFood.carbs_per_100g}g`} color="#d48d00" />
                <DetailBox label="Total Fat" value={`${selectedFood.fat_per_100g}g`} color="#ba1a1a" />
                <DetailBox label="Status" value={selectedFood.is_verified ? 'Verified' : 'Pending'} />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => openEdit(selectedFood)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-[#faf9f5] hover:bg-[#E2E8DE] transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-[#1a1c1a] text-white hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4 rounded-2xl border border-[#E2E8DE] bg-[#F9FAF7]">
      <p className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-50">{label}</p>
      <p className="text-xl font-extrabold" style={{ color: color || '#1a1c1a' }}>{value}</p>
    </div>
  )
}

function FoodRow({
  food,
  isPending,
  onEdit,
  onVerify,
  onReject,
  onDelete,
  onView,
}: {
  food: AdminFood
  isPending: boolean
  onEdit: () => void
  onVerify: () => void
  onReject: () => void
  onDelete: () => void
  onView: () => void
}) {
  return (
    <tr
      className="transition-all cursor-pointer group"
      onClick={onView}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAF7')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F5F7F2] group-hover:bg-[#E2E8DE] transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ color: '#4a6549' }}>restaurant</span>
          </div>
          <div>
            <p className="font-bold text-sm group-hover:text-[#4a6549] transition-colors" style={{ color: '#1a1c1a' }}>{food.name}</p>
            <p className="text-xs opacity-50">{food.brand || 'No brand'}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(139,168,136,0.1)] text-[#4a6549]">
          {food.category}
        </span>
      </td>
      <td className="px-8 py-5 font-extrabold text-sm" style={{ color: '#1a1c1a' }}>{food.calories_per_100g} kcal</td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="text-[#4a6549]">{food.protein_per_100g}</span>
          <span className="text-[#E2E8DE]">/</span>
          <span className="text-amber-600">{food.carbs_per_100g}</span>
          <span className="text-[#E2E8DE]">/</span>
          <span className="text-red-600">{food.fat_per_100g}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: food.is_verified ? '#ccebc7' : '#fff3cd',
            color: food.is_verified ? '#243d24' : '#856404',
          }}
        >
          {food.is_verified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-xl transition-all hover:bg-[#E2E8DE] text-[#737970]"
            title="Edit Food"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          {isPending && (
            <>
              <button
                onClick={onVerify}
                className="p-2 rounded-xl transition-all hover:bg-[#c9ecc6] text-[#4a6549]"
                title="Verify Food"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </button>
              <button
                onClick={onReject}
                className="p-2 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]"
                title="Reject Food"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
              </button>
            </>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]"
            title="Delete Food"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
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
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: active ? 700 : 500,
        boxShadow: active ? '0 4px 12px rgba(139,168,136,0.2)' : 'none',
      }}
    >
      {children}
    </button>
  )
}
