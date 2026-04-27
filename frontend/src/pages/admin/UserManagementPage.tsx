import { useState } from 'react'
import {
  useAdminUsers,
  useAdminUser,
  useBanUser,
  useUnbanUser,
} from '@/features/admin/hooks/useAdmin'
import type { AdminUser } from '@/features/admin/services/adminService'

type FilterTab = 'all' | 'active' | 'banned'

export default function UserManagementPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data, isLoading } = useAdminUsers(page, search || undefined)
  const { data: userDetail, isLoading: loadingDetail } = useAdminUser(selectedUserId || undefined)
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const users = data?.users ?? []
  const filteredUsers = users.filter((u) => {
    if (tab === 'active') return u.is_active
    if (tab === 'banned') return !u.is_active
    return true
  })
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: active ? 600 : 500,
    backgroundColor: active ? '#fff' : 'transparent',
    color: active ? '#4a6549' : '#737970',
    boxShadow: active ? '0 2px 8px rgba(74, 101, 73, 0.08)' : 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
            User Management
          </h1>
          <p className="text-base" style={{ color: '#737970' }}>
            Review and manage VitaFlow platform members with granular controls.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div
        className="bg-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-6 shadow-sm"
        style={{ border: '1px solid #E2E8DE' }}
      >
        <div
          className="flex items-center p-1.5 rounded-xl gap-1"
          style={{ backgroundColor: '#f4f4ef', border: '1px solid rgba(195,200,191,0.3)' }}
        >
          {(['all', 'active', 'banned'] as FilterTab[]).map((t) => (
            <button key={t} style={tabStyle(tab === t)} onClick={() => { setTab(t); setPage(1) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px]"
              style={{ color: '#737970' }}
            >
              search
            </span>
            <input
              className="pl-12 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all w-[320px]"
              style={{ border: '1px solid #c3c8bf', color: '#1a1c1a', background: '#faf9f5' }}
              placeholder="Search by name or email address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#8ba888'
                e.target.style.backgroundColor = '#fff'
                e.target.style.boxShadow = '0 0 0 4px rgba(139,168,136,0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#c3c8bf'
                e.target.style.backgroundColor = '#faf9f5'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-95 active:scale-95"
            style={{ border: '1px solid #c3c8bf', color: '#434841', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8DE' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#E2E8DE]" style={{ backgroundColor: 'rgba(244,244,239,0.5)' }}>
              <tr>
                {['Name', 'Email', 'Status', 'Verified', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: '#737970', fontFamily: 'Inter, sans-serif' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(195,200,191,0.3)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-sm" style={{ color: '#737970' }}>
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined animate-spin text-3xl">motion_photos_on</span>
                      Loading members...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-sm" style={{ color: '#737970' }}>
                    No members found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: AdminUser) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onOpenDetail={() => setSelectedUserId(user.id)}
                    onBan={() => banMutation.mutate(user.id)}
                    onUnban={() => unbanMutation.mutate(user.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="px-8 py-5 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(244,244,239,0.3)', borderTop: '1px solid #E2E8DE' }}
        >
          <p className="text-sm font-medium" style={{ color: '#737970' }}>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{total}</strong> users
          </p>
          <div className="flex items-center gap-1.5">
            <PagBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </PagBtn>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <PagBtn key={p} active={p === page} onClick={() => setPage(p)}>
                {p}
              </PagBtn>
            ))}
            <PagBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </PagBtn>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(47,49,46,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedUserId(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ border: '1px solid #E2E8DE' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-[#E2E8DE] flex justify-between items-center bg-[#F9FAF7]">
              <div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#1a1c1a', fontFamily: 'Manrope, sans-serif' }}>
                  Member Profile
                </h2>
                <p className="text-xs uppercase tracking-widest font-bold mt-1" style={{ color: '#737970' }}>
                  User ID: {selectedUserId.split('-')[0]}...
                </p>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E2E8DE] transition-colors"
                style={{ color: '#737970' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 flex-1 overflow-y-auto space-y-10">
              {loadingDetail ? (
                <div className="py-20 text-center text-sm" style={{ color: '#737970' }}>
                  Fetching profile details...
                </div>
              ) : userDetail ? (
                <>
                  <div className="flex items-center gap-8">
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-sm"
                      style={{
                        backgroundColor: userDetail.is_active ? '#ccebc7' : '#ffdad6',
                        color: userDetail.is_active ? '#243d24' : '#93000a',
                      }}
                    >
                      {(userDetail.display_name || userDetail.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-3xl font-bold" style={{ color: '#1a1c1a' }}>
                        {userDetail.display_name || 'Anonymous User'}
                      </h3>
                      <p className="text-lg" style={{ color: '#737970' }}>{userDetail.email}</p>
                      <div className="flex gap-2 pt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${userDetail.is_active ? 'bg-[#ccebc7] text-[#243d24]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                          {userDetail.is_active ? 'Active' : 'Banned'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${userDetail.is_verified ? 'bg-[#ccebc7] text-[#243d24]' : 'bg-[#efeeea] text-[#737970]'}`}>
                          {userDetail.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Platform Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span style={{ color: '#737970' }}>Joined On</span>
                          <span className="font-semibold">{new Date(userDetail.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span style={{ color: '#737970' }}>Workouts Logged</span>
                          <span className="font-semibold">{userDetail.recentWorkouts?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    {userDetail.healthProfile && (
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#737970' }}>Health Profile</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: '#737970' }}>Gender</span>
                            <span className="font-semibold capitalize">{userDetail.healthProfile.gender || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: '#737970' }}>Height / Weight</span>
                            <span className="font-semibold">
                              {userDetail.healthProfile.height ? `${userDetail.healthProfile.height}cm` : '—'} /
                              {userDetail.healthProfile.weight ? ` ${userDetail.healthProfile.weight}kg` : ' —'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: '#737970' }}>Goal</span>
                            <span className="font-semibold capitalize">{userDetail.healthProfile.goal?.replace('_', ' ') || '—'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    {userDetail.is_active ? (
                      <button
                        onClick={() => { banMutation.mutate(userDetail.id); setSelectedUserId(null) }}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-red-100"
                        style={{ backgroundColor: '#ba1a1a' }}
                      >
                        <span className="material-symbols-outlined text-[20px]">block</span>
                        Restrict Account
                      </button>
                    ) : (
                      <button
                        onClick={() => { unbanMutation.mutate(userDetail.id); setSelectedUserId(null) }}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-green-100"
                        style={{ backgroundColor: '#4a6549' }}
                      >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Restore Account
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserRow({
  user,
  onOpenDetail,
  onBan,
  onUnban,
}: {
  user: AdminUser
  onOpenDetail: () => void
  onBan: () => void
  onUnban: () => void
}) {
  return (
    <tr
      className="transition-all cursor-pointer group"
      onClick={onOpenDetail}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f9faf7')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shadow-sm"
            style={{
              backgroundColor: user.is_active ? '#c9ecc6' : '#e3e3de',
              color: user.is_active ? '#243d24' : '#737970',
            }}
          >
            {(user.display_name || user.email).charAt(0).toUpperCase()}
          </div>
          <span
            className="font-bold text-sm group-hover:text-[#4a6549] transition-colors"
            style={{ color: user.is_active ? '#1a1c1a' : '#737970' }}
          >
            {user.display_name || '—'}
          </span>
        </div>
      </td>
      <td className="px-8 py-5 text-sm" style={{ color: '#434841', opacity: user.is_active ? 1 : 0.6 }}>
        {user.email}
      </td>
      <td className="px-8 py-5">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: user.is_active ? '#ccebc7' : '#ffdad6',
            color: user.is_active ? '#243d24' : '#93000a',
          }}
        >
          {user.is_active ? 'Active' : 'Banned'}
        </span>
      </td>
      <td className="px-8 py-5">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: user.is_verified ? '#ccebc7' : '#efeeea',
            color: user.is_verified ? '#243d24' : '#737970',
          }}
        >
          {user.is_verified ? 'Verified' : 'Unverified'}
        </span>
      </td>
      <td className="px-8 py-5 text-sm font-medium" style={{ color: '#737970' }}>
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {user.is_active ? (
            <button
              onClick={onBan}
              className="p-2 rounded-xl transition-all hover:bg-[#ffdad6] text-[#ba1a1a]"
              title="Ban user"
            >
              <span className="material-symbols-outlined text-[20px]">block</span>
            </button>
          ) : (
            <button
              onClick={onUnban}
              className="p-2 rounded-xl transition-all hover:bg-[#c9ecc6] text-[#4a6549]"
              title="Unban user"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function PagBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-all"
      style={{
        backgroundColor: active ? '#8ba888' : '#fff',
        color: active ? '#fff' : '#737970',
        border: active ? 'none' : '1px solid #c3c8bf',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  )
}
