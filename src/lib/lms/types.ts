export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface LmsLesson {
  id: string
  title: string
  description: string
  duration: number
  content: string
  quiz: QuizQuestion[]
}

export interface LmsTrilha {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  xpReward: number
  lessons: LmsLesson[]
  area?: 'vendas' | 'skincare'
}
