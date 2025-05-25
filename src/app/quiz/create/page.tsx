'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { createQuizAttempt } from '@/lib/supabase/database'

export default function CreateQuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [quizConfig, setQuizConfig] = useState({
    totalQuestions: 10,
    isTimed: false,
    timeLimit: 60,
    category: '',
    difficulty: '',
    type: '',
    includePreviouslyCorrect: true,
    includePreviouslyIncorrect: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const quiz = await createQuizAttempt({
        userId: user.id,
        totalQuestions: quizConfig.totalQuestions,
        isTimed: quizConfig.isTimed,
        timeLimit: quizConfig.isTimed ? quizConfig.timeLimit : undefined,
      })

      // Navigate to the quiz page with the configuration
      router.push(`/quiz/${quiz.id}?config=${encodeURIComponent(JSON.stringify(quizConfig))}`)
    } catch (error) {
      console.error('Error creating quiz:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Quiz</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={quizConfig.totalQuestions}
              onChange={(e) => setQuizConfig({ ...quizConfig, totalQuestions: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="isTimed"
              checked={quizConfig.isTimed}
              onChange={(e) => setQuizConfig({ ...quizConfig, isTimed: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isTimed" className="text-sm font-medium text-gray-700">
              Timed Quiz
            </label>
          </div>

          {quizConfig.isTimed && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={quizConfig.timeLimit}
                onChange={(e) => setQuizConfig({ ...quizConfig, timeLimit: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={quizConfig.category}
              onChange={(e) => setQuizConfig({ ...quizConfig, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="brain">Brain</option>
              <option value="head_and_neck">Head and Neck</option>
              <option value="spine">Spine</option>
              <option value="peds">Pediatrics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              value={quizConfig.difficulty}
              onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={quizConfig.type}
              onChange={(e) => setQuizConfig({ ...quizConfig, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="infection">Infection</option>
              <option value="inflammation">Inflammation</option>
              <option value="tumor">Tumor</option>
              <option value="congenital">Congenital</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="includePreviouslyCorrect"
                checked={quizConfig.includePreviouslyCorrect}
                onChange={(e) => setQuizConfig({ ...quizConfig, includePreviouslyCorrect: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includePreviouslyCorrect" className="text-sm font-medium text-gray-700">
                Include Previously Correct Questions
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="includePreviouslyIncorrect"
                checked={quizConfig.includePreviouslyIncorrect}
                onChange={(e) => setQuizConfig({ ...quizConfig, includePreviouslyIncorrect: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includePreviouslyIncorrect" className="text-sm font-medium text-gray-700">
                Include Previously Incorrect Questions
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Start Quiz
        </button>
      </form>
    </div>
  )
} 