'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { getQuestions, updateUserProgress } from '@/lib/supabase/database'
import type { Question, Answer } from '@/types/database'

export default function QuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<(Question & { answers: Answer[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    type: '',
  })

  useEffect(() => {
    loadQuestions()
  }, [filters])

  const loadQuestions = async () => {
    try {
      const data = await getQuestions(filters)
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (questionId: string, answerId: string) => {
    if (!user) return

    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const answer = question.answers.find((a) => a.id === answerId)
    if (!answer) return

    try {
      await updateUserProgress({
        userId: user.id,
        questionId,
        isCorrect: answer.is_correct,
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Question Bank</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-lg border-gray-300"
          >
            <option value="">All Categories</option>
            <option value="brain">Brain</option>
            <option value="head_and_neck">Head and Neck</option>
            <option value="spine">Spine</option>
            <option value="peds">Pediatrics</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="rounded-lg border-gray-300"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="rounded-lg border-gray-300"
          >
            <option value="">All Types</option>
            <option value="infection">Infection</option>
            <option value="inflammation">Inflammation</option>
            <option value="tumor">Tumor</option>
            <option value="congenital">Congenital</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={(answerId) => handleAnswer(question.id, answerId)}
            showExplanation={true}
          />
        ))}
      </div>
    </div>
  )
} 