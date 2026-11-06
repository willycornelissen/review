import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Loader2,
  Book as BookIcon,
  X,
  Sparkles,
  Edit3,
  Globe,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Book } from '../types'
import { searchBooks, identifyBookWithAI } from '../services/bookCatalog'
import { getStoredApiKey } from '../services/reviewAgent'

interface BookSearchProps {
  onSelectBook: (book: Book) => void
  disabled?: boolean
}

const POPULAR_SUGGESTIONS = [
  { title: 'Dom Casmurro', author: 'Machado de Assis' },
  { title: '1984', author: 'George Orwell' },
  { title: 'Duna', author: 'Frank Herbert' },
  { title: 'A Metamorfose', author: 'Franz Kafka' },
  { title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry' },
  { title: 'Ensaio sobre a Cegueira', author: 'José Saramago' },
]

export const BookSearch: React.FC<BookSearchProps> = ({ onSelectBook, disabled }) => {
  const [mode, setMode] = useState<'catalog' | 'manual'>('catalog')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const searchIdRef = useRef(0)

  // Manual Form State
  const [manualTitle, setManualTitle] = useState('')
  const [manualAuthor, setManualAuthor] = useState('')
  const [manualYear, setManualYear] = useState('')
  const [manualNotes, setManualNotes] = useState('')

  // Executa busca ativa sem travar o campo de digitação
  const executeSearch = async (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      return
    }

    const currentId = ++searchIdRef.current
    setIsLoading(true)
    setHasSearched(true)

    try {
      const books = await searchBooks(trimmed)
      // Só atualiza se for a requisição mais recente
      if (currentId === searchIdRef.current) {
        setResults(books)
      }
    } finally {
      if (currentId === searchIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  // Debounce confortável (650ms) e apenas para 3+ caracteres
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      if (trimmed.length === 0) {
        setResults([])
        setHasSearched(false)
      }
      return
    }

    const timer = setTimeout(() => {
      executeSearch(trimmed)
    }, 650)

    return () => clearTimeout(timer)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeSearch(query)
    }
  }

  const handleSuggestionClick = (title: string) => {
    setQuery(title)
    executeSearch(title)
  }

  const handleAiIdentify = async () => {
    const apiKey = getStoredApiKey()
    if (!apiKey) {
      alert('Por favor, configure sua chave da API do Google Gemini para usar a busca por IA.')
      return
    }

    setIsAiLoading(true)
    try {
      const identified = await identifyBookWithAI(query, apiKey)
      if (identified) {
        onSelectBook(identified)
      } else {
        alert('A IA não conseguiu identificar a obra com clareza. Tente preencher manualmente.')
        setMode('manual')
        setManualTitle(query)
      }
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTitle.trim()) return

    const manualBook: Book = {
      id: 'manual_' + Date.now(),
      title: manualTitle.trim(),
      authors: manualAuthor.trim() ? [manualAuthor.trim()] : ['Autor a especificar'],
      publishedYear: manualYear.trim() || 'N/D',
      description: manualNotes.trim() || `Livro ${manualTitle.trim()} inserido para análise crítica.`,
      categories: ['Literatura'],
    }

    onSelectBook(manualBook)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 w-fit mx-auto">
        <button
          type="button"
          onClick={() => setMode('catalog')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
            mode === 'catalog'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Pesquisa no Catálogo Global</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
            mode === 'manual'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Inserir Manualmente</span>
        </button>
      </div>

      {mode === 'catalog' ? (
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>

              <input
                type="text"
                value={query}
                disabled={disabled || isAiLoading}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite o título do livro ou autor (ex: Dom Casmurro, 1984, Duna)..."
                className="w-full pl-11 pr-10 py-3.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition shadow-lg shadow-black/20"
              />

              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                )}
                {query && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setResults([])
                      setHasSearched(false)
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => executeSearch(query)}
              disabled={disabled || !query.trim()}
              className="px-5 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Buscar</span>
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Sugestões rápidas:</span>
            {POPULAR_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(sug.title)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition text-[11px]"
              >
                {sug.title}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
              <span>Consultando acervo aberto da Open Library & Google...</span>
            </div>
          )}

          {/* Search Results Grid */}
          {!isLoading && results.length > 0 && (
            <div className="mt-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
                <span className="text-xs font-semibold text-slate-300">
                  Resultados Encontrados ({results.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Clique para selecionar o livro desejado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {results.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 hover:border-brand-500/50 cursor-pointer transition group"
                  >
                    {book.thumbnail ? (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-14 h-20 object-cover rounded-md flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-14 h-20 bg-slate-700/60 rounded-md flex items-center justify-center flex-shrink-0 text-slate-400 border border-slate-600/40">
                        <BookIcon className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-brand-300 transition line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {book.authors.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Publicado: {book.publishedYear}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 mt-2 group-hover:translate-x-1 transition-transform">
                        <span>Selecionar</span>
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Fallback Options */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  Nenhum livro localizado para "{query}"
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  A obra pode ter grafia diferente no acervo ou ser muito recente. Escolha como prefere prosseguir:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAiIdentify}
                  disabled={isAiLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600/90 hover:bg-brand-600 text-white text-xs font-semibold transition shadow-md"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-brand-200" />
                  )}
                  <span>Identificar com IA (Gemini)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('manual')
                    setManualTitle(query)
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition border border-slate-600"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Inserir Título & Autor Manualmente</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry Mode */
        <form
          onSubmit={handleManualSubmit}
          className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="text-sm font-bold text-white">Inserir Dados do Livro Manualmente</h3>
              <p className="text-xs text-slate-400">
                Ideal para livros raros, teses, manuscritos ou obras independentes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode('catalog')}
              className="text-xs text-brand-400 hover:underline"
            >
              Voltar ao catálogo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Título do Livro *
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ex.: Grande Sertão: Veredas"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Autor(es)
              </label>
              <input
                type="text"
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                placeholder="Ex.: João Guimarães Rosa"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Ano de Publicação
              </label>
              <input
                type="text"
                value={manualYear}
                onChange={(e) => setManualYear(e.target.value)}
                placeholder="Ex.: 1956"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Notas ou Resumo Prévio (Opcional)
              </label>
              <textarea
                rows={2}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Destaques, premissa ou contexto específico que você queira que o agente considere..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!manualTitle.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-brand-500/20"
            >
              Confirmar Livro e Avançar para Resenha
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
