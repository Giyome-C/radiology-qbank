'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'curaudeaug@gmail.com' // Change this to your admin email

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    if (user.email !== ADMIN_EMAIL) {
      router.replace('/auth')
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-email': user?.email || '' },
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      setUsers([])
    }
    setLoading(false)
  }

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user?.email || '',
        },
        body: JSON.stringify({ id: userId }),
      })
      if (!res.ok) throw new Error('Failed to delete user')
      await fetchUsers()
    } catch (err: any) {
      setActionError(err.message || 'Error deleting user')
    }
    setActionLoading(false)
  }

  const handleChangePassword = async (userId: string) => {
    const newPassword = window.prompt('Enter new password for this user:')
    if (!newPassword) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user?.email || '',
        },
        body: JSON.stringify({ id: userId, newPassword }),
      })
      if (!res.ok) throw new Error('Failed to change password')
      await fetchUsers()
    } catch (err: any) {
      setActionError(err.message || 'Error changing password')
    }
    setActionLoading(false)
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name && u.first_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.last_name && u.last_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.job_title && u.job_title.toLowerCase().includes(search.toLowerCase()))
  )

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {actionError && <div className="text-red-600 text-center mb-2">{actionError}</div>}
        {loading || actionLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Job Title</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Product/Package</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-4">No users found.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="py-2 px-4">{u.first_name} {u.last_name}</td>
                  <td className="py-2 px-4">{u.job_title}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">{u.product}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button onClick={() => handleChangePassword(u.id)} className="text-blue-600 hover:underline">Change Password</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
} 