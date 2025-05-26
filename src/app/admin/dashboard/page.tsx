'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'curaudeaug@gmail.com' // Change this to your admin email

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Price map for each product/package
  const PRODUCT_PRICES: Record<string, number> = {
    'Basic Neuro Anatomy':99,
    'Basic Neuro cases': 299,
    'Advanced Neuro cases': 499,
    // Add more as needed
  }

  // Calculate total revenue
  const totalRevenue = users.reduce((sum, u) => sum + (PRODUCT_PRICES[u.product] || 0), 0)

  useEffect(() => {
    if (!user) return
    if (user.email !== ADMIN_EMAIL) {
      router.replace('/auth')
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    console.log('Fetching users...')
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="relative">
          <button
            onClick={() => setSettingsOpen((open) => !open)}
            className="flex items-center px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none text-lg font-medium"
            aria-label="Settings"
          >
            Settings
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <Link href="/dashboard">
                <span className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">User Dashboard</span>
              </Link>
              <Link href="/admin/dashboard">
                <span className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Admin Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  router.push('/auth')
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <span className="text-lg font-semibold">Users:</span>
          <span className="text-2xl font-bold">{users.length}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <span className="text-lg font-semibold">Total Revenue:</span>
          <span className="text-2xl font-bold">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* User list */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-64"
          />
          {actionError && <div className="text-red-600 text-sm mt-2 md:mt-0">{actionError}</div>}
        </div>
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4">First Name</th>
                <th className="py-2 px-4">Last Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Job Title</th>
                <th className="py-2 px-4">Product</th>
                <th className="py-2 px-4">Product Price Paid</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="py-2 px-4">{u.first_name || '-'}</td>
                  <td className="py-2 px-4">{u.last_name || '-'}</td>
                  <td className="py-2 px-4">{u.email || '-'}</td>
                  <td className="py-2 px-4">{u.job_title || '-'}</td>
                  <td className="py-2 px-4">{u.product}</td>
                  <td className="py-2 px-4">${PRODUCT_PRICES[u.product] ? PRODUCT_PRICES[u.product].toLocaleString() : '-'}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => handleChangePassword(u.id)}
                      className="text-blue-600 hover:underline"
                      disabled={actionLoading}
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline"
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
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