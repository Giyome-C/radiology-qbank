'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { getQuestions, saveQuizQuestion, updateUserProgress } from '@/lib/supabase/database'
import type { Question, Answer } from '@/types/database'

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [questions, setQuestions] = useState<(Question & { answers: Answer[] })[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [quizConfig, setQuizConfig] = useState<any>(null)

  useEffect(() => {
    const config = searchParams.get('config')
    if (config) {
      setQuizConfig(JSON.parse(decodeURIComponent(config)))
    }
  }, [searchParams])

  useEffect(() => {
    if (quizConfig) {
      loadQuestions()
    }
  }, [quizConfig])

  useEffect(() => {
    if (quizConfig?.isTimed && quizConfig?.timeLimit) {
      setTimeLeft(quizConfig.timeLimit * 60) // Convert minutes to seconds
    }
  }, [quizConfig])

  useEffect(() => {
    if (timeLeft === null) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          handleQuizComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const loadQuestions = async () => {
    try {
      const data = await getQuestions({
        category: quizConfig.category,
        difficulty: quizConfig.difficulty,
        type: quizConfig.type,
      })
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (answerId: string) => {
    if (!user) return

    const currentQuestion = questions[currentQuestionIndex]
    const answer = currentQuestion.answers.find((a) => a.id === answerId)
    if (!answer) return

    try {
      // Save the answer to the quiz
      await saveQuizQuestion({
        quizId: params.id,
        questionId: currentQuestion.id,
        userAnswerId: answerId,
        isCorrect: answer.is_correct,
      })

      // Update user progress
      await updateUserProgress({
        userId: user.id,
        questionId: currentQuestion.id,
        isCorrect: answer.is_correct,
      })

      // Move to next question or complete quiz
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        handleQuizComplete()
      }
    } catch (error) {
      console.error('Error saving answer:', error)
    }
  }

  const handleQuizComplete = () => {
    router.push(`/quiz/${params.id}/results`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          {timeLeft !== null && (
            <div className="text-lg font-medium">
              Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            showExplanation={false}
          />
        )}
      </div>
    </div>
  )
} 