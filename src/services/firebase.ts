import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore'
import { BookReview, FirebaseConfig } from '../types'

const LOCAL_STORAGE_KEY = 'book_reviews_cache'
const FIREBASE_CONFIG_KEY = 'firebase_user_config'

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY)
    if (raw) {
      return JSON.parse(raw) as FirebaseConfig
    }
  } catch (e) {
    console.warn('Erro ao ler configuração do Firebase do localStorage:', e)
  }

  // Fallback para variáveis de ambiente Vite (caso configuradas no deploy)
  if (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  ) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }

  return null
}

export function saveStoredFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config))
  initFirebase(config)
}

export function clearStoredFirebaseConfig(): void {
  localStorage.removeItem(FIREBASE_CONFIG_KEY)
  app = null
  db = null
}

export function initFirebase(customConfig?: FirebaseConfig): boolean {
  const config = customConfig || getStoredFirebaseConfig()
  if (!config || !config.apiKey || !config.projectId) {
    return false
  }

  try {
    const existingApps = getApps()
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(config)
    db = getFirestore(app)
    return true
  } catch (error) {
    console.error('Falha ao inicializar o Firebase:', error)
    app = null
    db = null
    return false
  }
}

export function isFirebaseConfigured(): boolean {
  if (!db) {
    initFirebase()
  }
  return db !== null
}

// Operações de CRUD com Fallback Gracioso no LocalStorage

export async function saveReview(review: BookReview): Promise<void> {
  // Salva no LocalStorage (garantia imediata)
  try {
    const current = getLocalReviews()
    const filtered = current.filter((r) => r.id !== review.id)
    filtered.unshift(review)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.warn('Erro ao salvar no cache local:', e)
  }

  // Salva no Firestore se configurado
  if (isFirebaseConfigured() && db) {
    try {
      const reviewRef = doc(db, 'reviews', review.id)
      await setDoc(reviewRef, {
        ...review,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erro ao persistir resenha no Firestore:', error)
      throw error
    }
  }
}

export async function getReviews(): Promise<BookReview[]> {
  // Se o Firebase estiver ativo, busca do Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const reviewsRef = collection(db, 'reviews')
      const q = query(reviewsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const reviews: BookReview[] = []

      snapshot.forEach((docSnap) => {
        reviews.push(docSnap.data() as BookReview)
      })

      if (reviews.length > 0) {
        // Atualiza cache local
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews))
        return reviews
      }
    } catch (error) {
      console.warn('Erro ao buscar do Firestore, usando fallback local:', error)
    }
  }

  // Fallback do cache local
  return getLocalReviews()
}

export async function deleteReview(id: string): Promise<void> {
  // Remove do local
  try {
    const current = getLocalReviews()
    const updated = current.filter((r) => r.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Erro ao deletar do cache local:', e)
  }

  // Remove do Firestore se configurado
  if (isFirebaseConfigured() && db) {
    try {
      const reviewRef = doc(db, 'reviews', id)
      await deleteDoc(reviewRef)
    } catch (error) {
      console.error('Erro ao deletar do Firestore:', error)
    }
  }
}

function getLocalReviews(): BookReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as BookReview[]
    }
  } catch (e) {
    console.warn('Erro ao ler resenhas do localStorage:', e)
  }
  return []
}
