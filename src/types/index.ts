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

export interface BookReview {
  id: string
  bookId: string
  bookTitle: string
  bookAuthors: string[]
  bookCover?: string
  publishedYear?: string
  fullText: string
  sections: ReviewSection[]
  createdAt: string
  modelUsed?: string
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export interface AppSettings {
  geminiApiKey: string
  firebaseConfig?: FirebaseConfig
  reviewTone: 'critico' | 'analitico' | 'academico' | 'casual'
}
