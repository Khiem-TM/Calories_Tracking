import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, Ban, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminUsers, banUser, unbanUser } from '../../services/adminService'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const LIMIT = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, search }],
    queryFn: () => getAdminUsers(page, LIMIT, search || undefined),
  })

  const banMutation = useMutation({
    mutationFn: banUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface font-newsreader">Users</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{data?.total ?? 0} total users</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email…"
              className="pl-9 pr-4 py-2 rounded-xl border border-surface-highest bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-highest">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highest">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {user.display_name?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-on-surface">{user.display_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-highest text-on-surface-variant'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-[#22c55e]/10 text-[#16a34a]'
                          : 'bg-error/10 text-error'
                      }`}>
                        {user.is_active ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
                          title="View detail"
                        >
                          <Eye size={15} />
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => banMutation.mutate(user.id)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                            title="Ban user"
                          >
                            <Ban size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => unbanMutation.mutate(user.id)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-[#22c55e]/10 hover:text-[#16a34a] transition-colors"
                            title="Unban user"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-highest">
            <span className="text-xs text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
