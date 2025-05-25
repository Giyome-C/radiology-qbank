'use client'

import { useState } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignIn ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        {isSignIn ? <SignInForm /> : <SignUpForm />}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
} 