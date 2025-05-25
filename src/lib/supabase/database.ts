import { supabase } from './client'
import type { Question, Answer, UserProgress, QuizAttempt, QuizQuestion, Tag } from '@/types/database'

interface QuestionFilters {
  category?: string
  difficulty?: string
  type?: string
  ids?: string[]
}

export async function getQuestions(filters?: QuestionFilters) {
  try {
    let query = supabase
      .from('questions')
      .select(`
        *,
        answers (*)
      `)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.ids) {
      query = query.in('id', filters.ids)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching questions:', error)
    throw error
  }
}

export async function getUserProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`*, question:question_id (category, difficulty)`)
    .eq('user_id', userId)

  if (error) throw error
  return data.map((p) => ({
    ...p,
    category: p.question?.category,
    difficulty: p.question?.difficulty,
  }))
}

export async function createQuizAttempt(quizData: {
  userId: string
  totalQuestions: number
  isTimed: boolean
  timeLimit?: number
  category?: string
  difficulty?: string
}) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: quizData.userId,
      total_questions: quizData.totalQuestions,
      is_timed: quizData.isTimed,
      time_limit: quizData.timeLimit,
      category: quizData.category,
      difficulty: quizData.difficulty,
    })
    .select()
    .single()

  if (error) throw error
  return data as QuizAttempt
}

export async function saveQuizQuestion(quizQuestionData: {
  quizId: string
  questionId: string
  userAnswerId?: string
  isCorrect?: boolean
}) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({
      quiz_id: quizQuestionData.quizId,
      question_id: quizQuestionData.questionId,
      user_answer_id: quizQuestionData.userAnswerId,
      is_correct: quizQuestionData.isCorrect,
    })
    .select()
    .single()

  if (error) throw error
  return data as QuizQuestion
}

export async function updateUserProgress(progressData: {
  userId: string
  questionId: string
  isCorrect: boolean
}) {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: progressData.userId,
      question_id: progressData.questionId,
      is_correct: progressData.isCorrect,
      last_attempted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as UserProgress
}

export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')

  if (error) throw error
  return data as Tag[]
}

export async function getQuestionsByTags(tagIds: string[]) {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      answers (*),
      question_tags!inner (tag_id)
    `)
    .in('question_tags.tag_id', tagIds)

  if (error) throw error
  return data as (Question & { answers: Answer[] })[]
}

export async function getRecentQuizAttempts(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz_questions (is_correct)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Calculate score for each attempt
  return data.map((attempt) => {
    const totalQuestions = attempt.quiz_questions.length
    const correctAnswers = attempt.quiz_questions.filter((q: { is_correct: boolean }) => q.is_correct).length
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    return {
      id: attempt.id,
      created_at: attempt.created_at,
      totalQuestions,
      correctAnswers,
      score,
      isTimed: attempt.is_timed,
      timeLimit: attempt.time_limit,
    }
  })
} 