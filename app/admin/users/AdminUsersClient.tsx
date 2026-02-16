'use client'

import { useState, useEffect } from 'react'
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
  
  // State untuk Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  // Fungsi untuk menampilkan Toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type })
    // Hilangkan toast setelah 3 detik
    setTimeout(() => setToast(null), 3000)
  }

  // Fungsi Helper untuk navigasi ke profil user
  const handleViewProfile = (user: User) => {
    if (user.username) {
      window.location.href = `/user/${user.username}`
    } else {
      showToast(`User "${user.name || 'Unknown'}" belum mengatur username.`, 'warning')
    }
  }

  const handleBan = async (userId: string, currentlyBanned: boolean) => {
    if (userId === currentAdminId) {
      showToast('Tidak dapat ban diri sendiri!', 'error')
      return
    }
    setLoading(userId)
    const result = await toggleBanUser(userId, !currentlyBanned)
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentlyBanned } : u))
      showToast(currentlyBanned ? 'User berhasil di-unban!' : 'User berhasil di-ban!', 'success')
    }
    setLoading(null)
  }

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    if (userId === currentAdminId) {
      showToast('Tidak dapat mengubah role diri sendiri!', 'error')
      return
    }
    setLoading(userId)
    const result = await changeUserRole(userId, newRole)
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      showToast('Role user berhasil diubah!', 'success')
    }
    setLoading(null)
  }

  const handleVerified = async (userId: string, currentlyVerified: boolean) => {
    setLoading(userId)
    const result = await toggleVerified(userId, !currentlyVerified)
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentlyVerified } : u))
      showToast('Status verifikasi diubah!', 'success')
    }
    setLoading(null)
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  return (
    <>
      {/* ===== COMPONENT TOAST NOTIFICATION ===== */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] animate-in slide-in-from-top fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border font-bold text-sm ${
            toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' :
            toast.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
            'bg-yellow-500/10 border-yellow-500 text-yellow-600'
          }`}>
            {/* Icon Sesuai Tipe */}
            {toast.type === 'success' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            )}
            {toast.type === 'error' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
            {toast.type === 'warning' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ===== LIST USER ===== */}
      <div className="space-y-4">
        {users.map((user) => {
          const isAdmin = user.role === 'ADMIN';
          const isCurrentAdmin = user.id === currentAdminId;

          return (
            <div 
              key={user.id} 
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[#3B82F6]/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                
                {/* Kiri: Avatar & Info */}
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-[var(--text-muted)]">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  {/* Nama & Email */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[var(--text-main)] truncate">
                        {user.name || 'No Name'}
                      </h3>
                      {user.isVerified && <VerifiedBadge size="sm" />}
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        isAdmin 
                          ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30' 
                          : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]'
                      }`}>
                        {user.role}
                      </span>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        user.isBanned 
                          ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                          : 'bg-green-500/20 text-green-500 border border-green-500/30'
                      }`}>
                        {user.isBanned ? 'BANNED' : 'ACTIVE'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mt-1">
                      <span className="text-xs text-[var(--text-muted)] truncate">
                        @{user.username || 'no-username'}
                      </span>
                      <span className="hidden md:inline text-[var(--text-muted)]">•</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kanan: Aksi */}
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-3 md:pt-0 md:pl-4 md:ml-2">
                  
                  {/* Verified Button */}
                  <button
                    onClick={() => handleVerified(user.id, user.isVerified)}
                    disabled={loading === user.id}
                    className={`p-2 rounded-lg transition-colors ${
                      user.isVerified 
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30' 
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10'
                    }`}
                    title={user.isVerified ? 'Hapus Verified' : 'Beri Verified'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L14.09 8.26L21 9.27L16.18 13.97L17.18 21L12 17.77L6.82 21L7.82 13.97L3 9.27L9.91 8.26L12 2Z" /></svg>
                  </button>

                  {/* Role Selector */}
                  {!isCurrentAdmin && (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                      disabled={loading === user.id}
                      className="bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold rounded-lg px-2 py-2 outline-none focus:border-[#3B82F6] cursor-pointer"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}

                  {/* Ban Button */}
                  {!isCurrentAdmin && (
                    <button
                      onClick={() => handleBan(user.id, user.isBanned)}
                      disabled={loading === user.id}
                      className={`p-2 rounded-lg transition-colors ${
                        user.isBanned 
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                          : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      }`}
                      title={user.isBanned ? 'Unban User' : 'Ban User'}
                    >
                      {user.isBanned ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                      )}
                    </button>
                  )}

                  {/* Detail Button */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    title="Lihat Detail"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Detail User */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center overflow-hidden mb-3 shadow-lg">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[var(--text-muted)]">
                    {selectedUser.name?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{selectedUser.name || 'No Name'}</h3>
                {selectedUser.isVerified && <VerifiedBadge size="md" />}
              </div>
              <p className="text-sm text-[#3B82F6]">@{selectedUser.username || 'no-username'}</p>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Email</span>
                <span className="font-mono text-xs text-[var(--text-main)]">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Role</span>
                <span className={`font-bold ${selectedUser.role === 'ADMIN' ? 'text-[#3B82F6]' : ''}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className={`font-bold ${selectedUser.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                  {selectedUser.isBanned ? 'BANNED' : 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Bergabung</span>
                <span className="text-[var(--text-main)]">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            {/* Tombol Aksi di Modal */}
            <div className="flex flex-col gap-2">
               <button
                onClick={() => handleViewProfile(selectedUser)}
                className="w-full py-2.5 bg-[#3B82F6] text-white rounded-lg font-bold text-sm hover:bg-[#2563EB] transition-colors"
              >
                Lihat Profil Publik
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg font-bold text-sm hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}