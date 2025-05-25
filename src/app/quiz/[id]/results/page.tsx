'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { getQuestions } from '@/lib/supabase/database'
import type { Question, Answer, QuizQuestion } from '@/types/database'

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [questions, setQuestions] = useState<(Question & { answers: Answer[] })[]>([])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    score: 0,
  })

  useEffect(() => {
    loadQuizResults()
  }, [])

  const loadQuizResults = async () => {
    try {
      // Fetch quiz questions with user answers
      const response = await fetch(`/api/quiz/${params.id}/questions`)
      const data = await response.json()
      setQuizQuestions(data)

      // Calculate statistics
      const total = data.length
      const correct = data.filter((q: QuizQuestion) => q.is_correct).length
      const incorrect = total - correct
      const score = Math.round((correct / total) * 100)

      setStats({ total, correct, incorrect, score })

      // Fetch full question details
      const questionIds = data.map((q: QuizQuestion) => q.question_id)
      const questionsData = await getQuestions({ ids: questionIds })
      setQuestions(questionsData)
    } catch (error) {
      console.error('Error loading quiz results:', error)
    } finally {
      setLoading(false)
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
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
          <div className="text-6xl font-bold text-blue-600 mb-4">{stats.score}%</div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-4">Question Review</h2>
          {questions.map((question, index) => {
            const quizQuestion = quizQuestions.find((q) => q.question_id === question.id)
            return (
              <div key={question.id} className="border rounded-lg p-6">
                <QuestionCard
                  question={question}
                  onAnswer={() => {}}
                  showExplanation={true}
                  selectedAnswerId={quizQuestion?.user_answer_id}
                />
                <div className="mt-4 text-sm">
                  <span className="font-medium">Your answer: </span>
                  <span className={quizQuestion?.is_correct ? 'text-green-600' : 'text-red-600'}>
                    {quizQuestion?.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/quiz/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start New Quiz
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
} 