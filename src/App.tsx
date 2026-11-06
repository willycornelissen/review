import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { BookSearch } from './components/BookSearch'
import { BookCard } from './components/BookCard'
import { ReviewViewer } from './components/ReviewViewer'
import { HistoryList } from './components/HistoryList'
import { SettingsModal } from './components/SettingsModal'
import { Book, BookReview, ReviewSection } from './types'
import {
  generateReviewStream,
  parseReviewSections,
  getStoredApiKey,
} from './services/reviewAgent'
import {
  saveReview,
  getReviews,
  deleteReview,
  isFirebaseConfigured,
  initFirebase,
} from './services/firebase'
import { Sparkles, AlertCircle } from 'lucide-react'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedTone, setSelectedTone] = useState<string>('analitico')

  // Review Generation State
  const [streamingText, setStreamingText] = useState('')
  const [sections, setSections] = useState<ReviewSection[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [viewingSavedDate, setViewingSavedDate] = useState<string | undefined>()

  // Persistence State
  const [savedReviews, setSavedReviews] = useState<BookReview[]>([])
  const [isFirebaseActive, setIsFirebaseActive] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Initialize and load saved reviews
  useEffect(() => {
    initFirebase()
    setIsFirebaseActive(isFirebaseConfigured())
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const data = await getReviews()
      setSavedReviews(data)
    } catch (e) {
      console.warn('Erro ao carregar resenhas:', e)
    }
  }

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book)
    setStreamingText('')
    setSections([])
    setErrorMessage(null)
    setViewingSavedDate(undefined)
  }

  const handleClearBook = () => {
    setSelectedBook(null)
    setStreamingText('')
    setSections([])
    setErrorMessage(null)
    setViewingSavedDate(undefined)
  }

  const handleGenerate = async (tone: string) => {
    if (!selectedBook) return

    const apiKey = getStoredApiKey()
    if (!apiKey) {
      setIsSettingsOpen(true)
      setErrorMessage(
        'Por favor, insira sua chave da API do Google Gemini para que o Agente possa gerar resenhas.'
      )
      return
    }

    setStreamingText('')
    setSections([])
    setErrorMessage(null)
    setIsStreaming(true)
    setViewingSavedDate(undefined)

    try {
      await generateReviewStream(
        selectedBook,
        tone,
        (chunk) => {
          setStreamingText((prev) => prev + chunk)
        },
        async (full) => {
          setIsStreaming(false)
          const parsed = parseReviewSections(full)
          setSections(parsed)

          // Persiste no Firebase / LocalStorage
          const newReview: BookReview = {
            id: 'rev_' + Date.now(),
            bookId: selectedBook.id,
            bookTitle: selectedBook.title,
            bookAuthors: selectedBook.authors,
            bookCover: selectedBook.thumbnail,
            publishedYear: selectedBook.publishedYear,
            fullText: full,
            sections: parsed,
            createdAt: new Date().toISOString(),
            modelUsed: 'Gemini 2.5 Flash',
          }

          try {
            await saveReview(newReview)
            setViewingSavedDate(newReview.createdAt)
            await loadReviews()
          } catch (e) {
            console.warn('Resenha salva no cache local, falha no Firebase:', e)
          }
        },
        (error) => {
          setIsStreaming(false)
          setErrorMessage(error.message)
        }
      )
    } catch (err: any) {
      setIsStreaming(false)
      setErrorMessage(err.message || 'Erro inesperado ao gerar resenha.')
    }
  }

  const handleSelectHistoryReview = (rev: BookReview) => {
    setSelectedBook({
      id: rev.bookId,
      title: rev.bookTitle,
      authors: rev.bookAuthors,
      publishedYear: rev.publishedYear || 'N/D',
      thumbnail: rev.bookCover,
      description: 'Resenha carregada do histórico persistido.',
      categories: [],
    })
    setStreamingText(rev.fullText)
    setSections(rev.sections && rev.sections.length > 0 ? rev.sections : parseReviewSections(rev.fullText))
    setViewingSavedDate(rev.createdAt)
    setActiveTab('generator')
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleDeleteHistoryReview = async (id: string) => {
    await deleteReview(id)
    await loadReviews()
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedReviews.length}
        isFirebaseActive={isFirebaseActive}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'generator' ? (
          <div>
            {/* Hero Banner when no book is selected */}
            {!selectedBook && (
              <div className="text-center py-10 sm:py-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold border border-brand-500/20 mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Agente de Crítica Literária (AaaS)
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
                  Enriqueça suas resenhas com análise crítica de IA.
                </h2>

                <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mt-3">
                  Identifique qualquer livro instantaneamente via APIs públicas e obtenha uma
                  resenha profunda em 5 dimensões analíticas estruturadas.
                </p>

                {/* Search Bar */}
                <div className="mt-8">
                  <BookSearch onSelectBook={handleSelectBook} />
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Atenção ao gerar a resenha</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition"
                >
                  Abrir Configurações
                </button>
              </div>
            )}

            {/* Selected Book View */}
            {selectedBook && (
              <div className="space-y-6">
                <div className="mb-4">
                  <BookSearch onSelectBook={handleSelectBook} disabled={isStreaming} />
                </div>

                <BookCard
                  book={selectedBook}
                  onGenerate={handleGenerate}
                  onClear={handleClearBook}
                  isGenerating={isStreaming}
                  selectedTone={selectedTone}
                  setSelectedTone={setSelectedTone}
                />

                {/* Review Presentation */}
                {(streamingText || isStreaming) && (
                  <ReviewViewer
                    fullText={streamingText}
                    sections={sections}
                    isStreaming={isStreaming}
                    bookTitle={selectedBook.title}
                    bookAuthor={selectedBook.authors.join(', ')}
                    savedAt={viewingSavedDate}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <HistoryList
            reviews={savedReviews}
            onSelectReview={handleSelectHistoryReview}
            onDeleteReview={handleDeleteHistoryReview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Book Review Agent • Pronto para GitHub Pages & Firebase</span>
          <span>Desenvolvido sob a esteira ECC</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          setIsFirebaseActive(isFirebaseConfigured())
          loadReviews()
        }}
      />
    </div>
  )
}
