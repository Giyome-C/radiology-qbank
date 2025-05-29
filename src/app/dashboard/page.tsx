'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { getUserProgress, getRecentQuizAttempts, createQuizAttempt } from '@/lib/supabase/database'
import type { UserProgress, QuestionCategory, QuestionDifficulty } from '@/types/database'
import { supabase } from '@/lib/supabase/client'

interface DashboardStats {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  byCategory: Record<string, { total: number; correct: number }>
  byDifficulty: Record<string, { total: number; correct: number }>
}

const CATEGORY_OPTIONS = ['brain', 'spine', 'head_and_neck', 'peds', 'physics'] as const
const DIFFICULTY_OPTIONS = ['easy', 'advanced'] as const

type Category = typeof CATEGORY_OPTIONS[number]
type Difficulty = typeof DIFFICULTY_OPTIONS[number]

type QuizMode = 'timed' | 'exam' | 'tutorial'

type QuizSettings = {
  numQuestions: number
  mode: QuizMode
  categories: Category[]
  difficulty: Difficulty | ''
  usage: 'unused' | 'all'
  history: 'all' | 'incorrect'
}

const DEFAULT_SETTINGS: QuizSettings = {
  numQuestions: 10,
  mode: 'timed',
  categories: [],
  difficulty: '',
  usage: 'all',
  history: 'all',
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    byCategory: {},
    byDifficulty: {},
  })
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([])
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [difficulties, setDifficulties] = useState<Difficulty[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadUserProgress()
      loadRecentQuizzes()
    }
  }, [user])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setCategories([...CATEGORY_OPTIONS])
    setDifficulties([...DIFFICULTY_OPTIONS])
  }, [])

  const loadUserProgress = async () => {
    try {
      const progress = await getUserProgress(user!.id)
      
      // Calculate statistics
      const totalQuestions = progress.length
      const correctAnswers = progress.filter(p => p.is_correct).length
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

      // Group by category
      const byCategory: Record<string, { total: number; correct: number }> = {}
      progress.forEach(p => {
        if (!byCategory[p.category]) {
          byCategory[p.category] = { total: 0, correct: 0 }
        }
        byCategory[p.category].total++
        if (p.is_correct) {
          byCategory[p.category].correct++
        }
      })

      // Group by difficulty
      const byDifficulty: Record<string, { total: number; correct: number }> = {}
      progress.forEach(p => {
        if (!byDifficulty[p.difficulty]) {
          byDifficulty[p.difficulty] = { total: 0, correct: 0 }
        }
        byDifficulty[p.difficulty].total++
        if (p.is_correct) {
          byDifficulty[p.difficulty].correct++
        }
      })

      setStats({
        totalQuestions,
        correctAnswers,
        accuracy,
        byCategory,
        byDifficulty,
      })
    } catch (error) {
      console.error('Error loading user progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentQuizzes = async () => {
    try {
      const quizzes = await getRecentQuizAttempts(user!.id, 5)
      setRecentQuizzes(quizzes)
    } catch (error) {
      console.error('Error loading recent quizzes:', error)
    }
  }

  function handleOpenModal() {
    setShowQuizModal(true)
  }

  function handleCloseModal() {
    setShowQuizModal(false)
    setQuizSettings(DEFAULT_SETTINGS)
  }

  function handleChange<K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) {
    setQuizSettings(prev => ({ ...prev, [key]: value }))
  }

  function handleSaveSettings() {
    setIsSaving(true)
    localStorage.setItem('quizSettings', JSON.stringify(quizSettings))
    setTimeout(() => setIsSaving(false), 500)
  }

  async function handleStartQuiz() {
    // TODO: Implement quiz creation logic
    setShowQuizModal(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleAdmin = () => {
    router.push('/admin/dashboard')
  }

  useEffect(() => {
    // If all categories are unchecked, default to 'All Categories'
    if (quizSettings.categories.length === 0) return
    // If all categories are selected, treat as 'All Categories'
    if (quizSettings.categories.length === categories.length) {
      setQuizSettings(prev => ({ ...prev, categories: [] }))
    }
  }, [quizSettings.categories, categories.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-green-700 transition"
              onClick={handleOpenModal}
              aria-label="Start Quiz"
            >
              Start Quiz
            </button>
          </div>
          <div className="relative flex-1 flex justify-center">
            {user && (
              <span className="text-xl font-semibold text-gray-700">
                Hi, {user.user_metadata?.firstName || user.user_metadata?.first_name || user.email?.split('@')[0] || 'there'}
              </span>
            )}
          </div>
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((open) => !open)}
              className="flex items-center px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none text-lg font-medium"
              aria-label="Settings"
            >
              Settings
            </button>
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Sign Out
                </button>
                <button
                  onClick={handleAdmin}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Start Quiz</h2>
              <form className="space-y-4 mt-4" onSubmit={e => e.preventDefault()}>
                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quizSettings.numQuestions}
                    onChange={e => handleChange('numQuestions', Number(e.target.value))}
                    className="w-24 border rounded px-2 py-1"
                  />
                </div>
                {/* Mode */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quiz Mode</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={quizSettings.mode}
                    onChange={e => handleChange('mode', e.target.value as QuizMode)}
                  >
                    <option value="timed">Timed Exam Mode (1 min/question, answers at end)</option>
                    <option value="exam">Untimed Exam Mode (answers at end)</option>
                    <option value="tutorial">Untimed Tutorial Mode (answers after each question)</option>
                  </select>
                </div>
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium mb-1">Categories</label>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={quizSettings.categories.length === 0}
                        onChange={() => handleChange('categories', [])}
                      />
                      All Categories
                    </label>
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={quizSettings.categories.includes(cat)}
                          onChange={() => {
                            let newCategories: Category[]
                            if (quizSettings.categories.includes(cat)) {
                              newCategories = quizSettings.categories.filter(c => c !== cat)
                            } else {
                              newCategories = [...quizSettings.categories, cat]
                            }
                            // If any category is selected, 'All Categories' should be unchecked
                            handleChange('categories', newCategories)
                          }}
                        />
                        {cat.replace(/_/g, ' ')}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={quizSettings.difficulty}
                    onChange={e => handleChange('difficulty', e.target.value as Difficulty | '')}
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {/* Usage */}
                <div>
                  <label className="block text-sm font-medium mb-1">Question Usage</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={quizSettings.usage}
                    onChange={e => handleChange('usage', e.target.value as 'unused' | 'all')}
                  >
                    <option value="unused">Unused Only</option>
                    <option value="all">Used and Unused</option>
                  </select>
                </div>
                {/* History */}
                <div>
                  <label className="block text-sm font-medium mb-1">Question History</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={quizSettings.history}
                    onChange={e => handleChange('history', e.target.value as 'all' | 'incorrect')}
                  >
                    <option value="all">All Questions</option>
                    <option value="incorrect">Only Previously Incorrect and Never Correct</option>
                  </select>
                </div>
              </form>
              {/* Footer */}
              <div className="flex items-center gap-2 mt-8">
                <button
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  aria-label="Save Settings"
                  type="button"
                >
                  Save Settings
                </button>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-green-700 transition"
                  onClick={handleStartQuiz}
                  aria-label="Start Quiz"
                  type="button"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Questions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Correct Answers</h3>
            <p className="text-3xl font-bold text-green-600">{stats.correctAnswers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accuracy</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.accuracy.toFixed(1)}%</p>
          </div>
        </div>

        {/* Progress by Category */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Progress by Category</h2>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([category, data]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="text-sm text-gray-600">
                    {data.correct}/{data.total} correct
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(data.correct / data.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress by Difficulty */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Progress by Difficulty</h2>
          <div className="space-y-4">
            {Object.entries(stats.byDifficulty).map(([difficulty, data]) => (
              <div key={difficulty}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium capitalize">{difficulty}</span>
                  <span className="text-sm text-gray-600">
                    {data.correct}/{data.total} correct
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(data.correct / data.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Attempts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Quiz Attempts</h2>
          {recentQuizzes.length === 0 ? (
            <div className="text-gray-500">No recent quiz attempts.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Score</th>
                  <th className="py-2 px-4">Questions</th>
                  <th className="py-2 px-4">Review</th>
                </tr>
              </thead>
              <tbody>
                {recentQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-t">
                    <td className="py-2 px-4">{new Date(quiz.created_at).toLocaleString()}</td>
                    <td className="py-2 px-4">{quiz.score.toFixed(1)}%</td>
                    <td className="py-2 px-4">{quiz.correctAnswers}/{quiz.totalQuestions}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => router.push(`/quiz/${quiz.id}/results`)}
                        className="text-blue-600 hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/quiz/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start New Quiz
          </button>
          <button
            onClick={() => router.push('/questions')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Browse Questions
          </button>
        </div>
      </div>
    </div>
  )
} 