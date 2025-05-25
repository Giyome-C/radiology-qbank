'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ValidatePage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    if (!email) {
      setMessage('Please enter your email address.')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Confirmation email resent! Please check your inbox.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Please Check Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We have sent a confirmation link to your email address. Please check your inbox and follow the instructions to complete your registration.
          </p>
        </div>
        <form onSubmit={handleResend} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email to resend"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Resending...' : 'Resend Confirmation Email'}
          </button>
        </form>
        {message && <div className="text-center text-sm mt-2 text-blue-600">{message}</div>}
        <div className="mt-6 flex justify-center">
          <Link href="/auth">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-medium">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
} 