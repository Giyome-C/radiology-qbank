export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionCategory = 'brain' | 'head_and_neck' | 'spine' | 'peds'
export type QuestionType = 'infection' | 'inflammation' | 'tumor' | 'congenital' | 'other'

export interface Question {
  id: string
  question_text: string
  explanation: string
  difficulty: QuestionDifficulty
  category: QuestionCategory
  type: QuestionType
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  question_id: string
  answer_text: string
  is_correct: boolean
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  question_id: string
  is_correct: boolean
  last_attempted_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  start_time: string
  end_time?: string
  score?: number
  total_questions: number
  is_timed: boolean
  time_limit?: number
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_id: string
  user_answer_id?: string
  is_correct?: boolean
  created_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface QuestionTag {
  question_id: string
  tag_id: string
} 