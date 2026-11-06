export interface Book {
  id: string
  title: string
  authors: string[]
  publishedYear: string
  description: string
  thumbnail?: string
  categories?: string[]
  pageCount?: number
  publisher?: string
  language?: string
}

export interface ReviewSection {
  title: string
  content: string
}

export interface AppSettings {
  geminiApiKey: string
  reviewTone: 'critico' | 'analitico' | 'academico' | 'casual'
}
