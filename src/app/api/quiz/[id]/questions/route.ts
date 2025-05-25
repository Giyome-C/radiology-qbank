import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get quiz questions
    const { data: quizQuestions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(quizQuestions)
  } catch (error) {
    console.error('Error fetching quiz questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    )
  }
} 