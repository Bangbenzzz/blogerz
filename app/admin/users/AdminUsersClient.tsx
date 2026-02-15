'use client'

import { useState } from 'react'
import { toggleBanUser, changeUserRole, toggleVerified } from '@/app/actions'
import VerifiedBadge from '@/components/VerifiedBadge'

interface User {
  id: string
  name: string | null
  email: string
  username: string | null
  bio: string | null
  avatarUrl: string | null
  isBanned: boolean
  isVerified: boolean
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export default function AdminUsersClient({ 
  initialUsers, 
  currentAdminId 
}: { 
  initialUsers: User[]
  currentAdminId: string 
}) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleBan = async (userId: string, currentlyBanned: boolean) => {
    if (userId === currentAdminId) {
      alert('Tidak dapat ban diri sendiri!')
      return
    }
    setLoading(userId)
    const result = await toggleBanUser(userId, !currentlyBanned)
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentlyBanned } : u))
    }
    setLoading(null)
  }

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    if (userId === currentAdminId) {
      alert('Tidak dapat mengubah role diri sendiri!')
      return
    }
    setLoading(userId)
    const result = await changeUserRole(userId, newRole)
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
    setLoading(null)
  }

  const handleVerified = async (userId: string, currentlyVerified: boolean) => {
    setLoading(userId)
    const result = await toggleVerified(userId, !currentlyVerified)
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentlyVerified } : u))
    }
    setLoading(null)
  }

  // PERBAIKAN HYDRATION: Gunakan format tanggal manual UTC
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  return (
    <div>
      {/* User Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
              <tr>
                <th className="text-left p-4 font-mono text-xs uppercase text-[var(--text-muted)]">User</th>
                <th className="text-left p-4 font-mono text-xs uppercase text-[var(--text-muted)]">Email</th>
                <th className="text-center p-4 font-mono text-xs uppercase text-[var(--text-muted)]">Role</th>
                <th className="text-center p-4 font-mono text-xs uppercase text-[var(--text-muted)]">Status</th>
                <th className="text-center p-4 font-mono text-xs uppercase text-[var(--text-muted)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-main)]/50"
                >
                  {/* User Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-[var(--text-muted)]">
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[var(--text-main)]">
                            {user.name || 'No Name'}
                          </span>
                          {user.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          @{user.username || 'no-username'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4 text-[var(--text-muted)]">
                    {user.email}
                  </td>

                  {/* Role - Warna Biru untuk Admin */}
                  <td className="p-4 text-center">
                    {user.id === currentAdminId ? (
                      <span className="px-2 py-1 text-[10px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] rounded">
                        ADMIN
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                        disabled={loading === user.id}
                        className={`px-2 py-1 text-xs font-bold rounded border ${
                          user.role === 'ADMIN' 
                            ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30' 
                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)]'
                        }`}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    {user.isBanned ? (
                      <span className="px-2 py-1 text-[10px] font-bold bg-red-500/20 text-red-500 rounded">
                        BANNED
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-500 rounded">
                        ACTIVE
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      {/* Verified Button - Biru */}
                      <button
                        onClick={() => handleVerified(user.id, user.isVerified)}
                        disabled={loading === user.id}
                        className={`p-2 rounded transition-colors ${
                          user.isVerified 
                            ? 'bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30' 
                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
                        }`}
                        title={user.isVerified ? 'Hapus verified' : 'Beri verified'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L14.09 8.26L21 9.27L16.18 13.97L17.18 21L12 17.77L6.82 21L7.82 13.97L3 9.27L9.91 8.26L12 2Z" />
                        </svg>
                      </button>

                      {/* Ban/Unban Button */}
                      {user.id !== currentAdminId && (
                        <button
                          onClick={() => handleBan(user.id, user.isBanned)}
                          disabled={loading === user.id}
                          className={`p-2 rounded transition-colors ${
                            user.isBanned 
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                          }`}
                          title={user.isBanned ? 'Unban user' : 'Ban user'}
                        >
                          {user.isBanned ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                            </svg>
                          )}
                        </button>
                      )}

                      {/* Detail Button */}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
                        title="Lihat detail"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-10 text-center text-[var(--text-muted)]">
            Belum ada user terdaftar.
          </div>
        )}
      </div>

      {/* User Detail Modal - Complete Code */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[var(--text-muted)]">
                    {selectedUser.name?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[var(--text-main)]">
                    {selectedUser.name || 'No Name'}
                  </h3>
                  {selectedUser.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-sm text-[var(--text-muted)]">@{selectedUser.username || 'no-username'}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Email</span>
                <span className="text-[var(--text-main)] font-mono text-xs">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Role</span>
                <span className={`font-bold ${selectedUser.role === 'ADMIN' ? 'text-[#3B82F6]' : 'text-[var(--text-main)]'}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className={`font-bold ${selectedUser.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                  {selectedUser.isBanned ? 'BANNED' : 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Bergabung</span>
                <span className="text-[var(--text-main)]">{formatDate(selectedUser.createdAt)}</span>
              </div>
              {selectedUser.bio && (
                <div className="pt-2">
                  <span className="text-[var(--text-muted)] block mb-1">Bio</span>
                  <p className="text-[var(--text-main)] bg-[var(--bg-card)] p-3 rounded-lg text-xs">
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-6 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-main)] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}