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
            className="flex items-center px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
            aria-label="Settings"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 2.25c.966 0 1.75.784 1.75 1.75v.5a7.5 7.5 0 0 1 2.25.938l.354-.354a1.75 1.75 0 1 1 2.475 2.475l-.354.354A7.5 7.5 0 0 1 19.5 11h.5a1.75 1.75 0 1 1 0 3.5h-.5a7.5 7.5 0 0 1-.938 2.25l.354.354a1.75 1.75 0 1 1-2.475 2.475l-.354-.354A7.5 7.5 0 0 1 13 19.5v.5a1.75 1.75 0 1 1-3.5 0v-.5a7.5 7.5 0 0 1-2.25-.938l-.354.354a1.75 1.75 0 1 1-2.475-2.475l.354-.354A7.5 7.5 0 0 1 4.5 13h-.5a1.75 1.75 0 1 1 0-3.5h.5a7.5 7.5 0 0 1 .938-2.25l-.354-.354a1.75 1.75 0 1 1 2.475-2.475l.354.354A7.5 7.5 0 0 1 11 4.5v-.5c0-.966.784-1.75 1.75-1.75z" /></svg>
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
              <Link href="/auth">
                <span className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">Sign In Page</span>
              </Link>
              <Link href="/dashboard">
                <span className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">User Dashboard</span>
              </Link>
            </div>
          )}
        </div>
      </div>
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