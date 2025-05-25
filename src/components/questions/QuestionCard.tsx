import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Question, Answer } from '@/types/database'

interface QuestionCardProps {
  question: Question & { answers: Answer[] }
  onAnswer: (answerId: string) => void
  showExplanation?: boolean
  selectedAnswerId?: string
}

export function QuestionCard({ question, onAnswer, showExplanation = false, selectedAnswerId }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(selectedAnswerId || null)
  const [showAnswer, setShowAnswer] = useState(showExplanation)

  useEffect(() => {
    setSelectedAnswer(selectedAnswerId || null)
  }, [selectedAnswerId])

  const handleAnswerClick = (answerId: string) => {
    if (showExplanation) return
    setSelectedAnswer(answerId)
    onAnswer(answerId)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{question.question_text}</h3>
        {question.image_url && (
          <div className="relative w-full h-64">
            <Image
              src={question.image_url}
              alt="Question image"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleAnswerClick(answer.id)}
            disabled={selectedAnswer !== null}
            className={`w-full text-left p-3 rounded-lg border ${
              selectedAnswer === answer.id
                ? answer.is_correct
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-blue-500'
            }`}
          >
            {answer.answer_text}
          </button>
        ))}
      </div>

      {showAnswer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
          <p className="text-gray-700">{question.explanation}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Difficulty: {question.difficulty}</span>
        <span>Category: {question.category}</span>
        <span>Type: {question.type}</span>
      </div>
    </div>
  )
} 