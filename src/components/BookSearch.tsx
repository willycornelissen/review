import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Loader2,
  Book as BookIcon,
  X,
  Sparkles,
  Barcode,
  Globe,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  FileText,
} from 'lucide-react'
import { Book } from '../types'
import { searchBooks, identifyBookWithAI, searchBookByIsbn, normalizeIsbn } from '../services/bookCatalog'
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

const POPULAR_ISBNS = [
  { label: 'A Ditadura Envergonhada', isbn: '978-85-359-0277-8' },
  { label: '1984 (George Orwell)', isbn: '978-0-451-52493-5' },
  { label: 'O Alquimista (Paulo Coelho)', isbn: '978-0-06-112241-5' },
]

export const BookSearch: React.FC<BookSearchProps> = ({ onSelectBook, disabled }) => {
  const [mode, setMode] = useState<'catalog' | 'isbn'>('catalog')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const searchIdRef = useRef(0)

  // ISBN Search State
  const [isbnInput, setIsbnInput] = useState('')
  const [isbnResult, setIsbnResult] = useState<Book | null>(null)
  const [isSearchingIsbn, setIsSearchingIsbn] = useState(false)
  const [isbnSearched, setIsbnSearched] = useState(false)
  const [isbnError, setIsbnError] = useState<string | null>(null)
  const [isbnImageFailed, setIsbnImageFailed] = useState(false)
  const isbnSearchIdRef = useRef(0)

  // Executa busca ativa no catálogo sem travar o campo de digitação
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
      if (currentId === searchIdRef.current) {
        setResults(books)
      }
    } finally {
      if (currentId === searchIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  // Debounce confortável (650ms) e apenas para 3+ caracteres no catálogo
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
        alert('A IA não conseguiu identificar a obra com clareza. Tente pesquisar pelo número ISBN.')
        setMode('isbn')
      }
    } finally {
      setIsAiLoading(false)
    }
  }

  // Executa busca segura por ISBN com controle de concorrência
  const executeIsbnSearch = async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    const normalized = normalizeIsbn(trimmed)
    if (!normalized) {
      setIsbnError('Código ISBN inválido. Digite um número de 10 ou 13 dígitos (hífens são aceitos).')
      setIsbnResult(null)
      setIsbnSearched(true)
      return
    }

    const currentId = ++isbnSearchIdRef.current
    setIsbnError(null)
    setIsSearchingIsbn(true)
    setIsbnSearched(true)
    setIsbnResult(null)
    setIsbnImageFailed(false)

    try {
      const book = await searchBookByIsbn(normalized)
      if (currentId === isbnSearchIdRef.current) {
        setIsbnResult(book)
        if (!book) {
          setIsbnError(`Nenhum livro foi localizado para o ISBN ${trimmed}. Verifique os dígitos e tente novamente.`)
        }
      }
    } catch (err) {
      if (currentId === isbnSearchIdRef.current) {
        setIsbnError('Erro ao consultar bases de dados para este ISBN. Tente novamente.')
      }
    } finally {
      if (currentId === isbnSearchIdRef.current) {
        setIsSearchingIsbn(false)
      }
    }
  }

  const handleIsbnSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    executeIsbnSearch(isbnInput)
  }

  const handleIsbnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeIsbnSearch(isbnInput)
    }
  }

  const handleIsbnExampleClick = (isbn: string) => {
    setIsbnInput(isbn)
    executeIsbnSearch(isbn)
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
          onClick={() => setMode('isbn')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
            mode === 'isbn'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" />
          <span>Pesquisar por ISBN</span>
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
                  onClick={() => setMode('isbn')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition border border-slate-600"
                >
                  <Barcode className="w-4 h-4" />
                  <span>Pesquisar por ISBN</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ISBN Search Mode */
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Pesquisa Exclusiva por ISBN</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Localize a edição exata da obra informando o código ISBN de 10 ou 13 dígitos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode('catalog')}
              className="text-xs text-brand-400 hover:underline"
            >
              Voltar ao catálogo geral
            </button>
          </div>

          {/* Form ISBN */}
          <form onSubmit={handleIsbnSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-200">
              Número do Código ISBN *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Barcode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={isbnInput}
                  disabled={disabled || isSearchingIsbn}
                  onChange={(e) => {
                    // Permite estritamente dígitos numéricos, hífens, espaços e 'X' (válido no ISBN-10)
                    const sanitized = e.target.value.replace(/[^0-9xX-\s]/g, '')
                    setIsbnInput(sanitized)
                    if (isbnError) setIsbnError(null)
                  }}
                  onKeyDown={handleIsbnKeyDown}
                  placeholder="Ex.: 978-85-359-0277-8 ou 8535902775..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {isbnInput && !isSearchingIsbn && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsbnInput('')
                      setIsbnResult(null)
                      setIsbnSearched(false)
                      setIsbnError(null)
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={disabled || !isbnInput.trim() || isSearchingIsbn}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-brand-500/20"
              >
                {isSearchingIsbn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Buscar ISBN</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Aceita formatos com ou sem traços (ex: 978-85-359-0277-8 ou 9788535902778).
            </p>
          </form>

          {/* Quick Example ISBNs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-slate-400 text-[11px] mr-1">Exemplos para testar:</span>
            {POPULAR_ISBNS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleIsbnExampleClick(item.isbn)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition text-[11px] font-mono"
              >
                {item.isbn} <span className="font-sans text-slate-500 text-[10px]">({item.label})</span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isSearchingIsbn && (
            <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2 bg-slate-900/40 rounded-xl border border-slate-700/40">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
              <span>Consultando acervos bibliográficos pelo ISBN...</span>
            </div>
          )}

          {/* Error / Not Found Message */}
          {!isSearchingIsbn && isbnSearched && isbnError && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isbnError}</p>
                <p className="text-[11px] text-amber-400/80 mt-1">
                  Certifique-se de que os números foram digitados corretamente ou tente pesquisar pelo título na aba de Catálogo Global.
                </p>
              </div>
            </div>
          )}

          {/* Found Book Result Card */}
          {!isSearchingIsbn && isbnResult && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-brand-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-brand-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Obra Localizada com Sucesso!
                </span>
                {isbnResult.isbn && (
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    ISBN: {isbnResult.isbn}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {isbnResult.thumbnail && !isbnImageFailed ? (
                  <img
                    src={isbnResult.thumbnail}
                    alt={isbnResult.title}
                    onError={() => setIsbnImageFailed(true)}
                    className="w-20 h-28 object-cover rounded-lg shadow-md border border-slate-700/80 flex-shrink-0 mx-auto sm:mx-0"
                  />
                ) : (
                  <div className="w-20 h-28 bg-slate-800 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-slate-500 border border-slate-700 mx-auto sm:mx-0">
                    <BookIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[9px] uppercase font-semibold">Sem Capa</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    {isbnResult.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    {isbnResult.authors.join(', ')}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {isbnResult.publishedYear}
                    </span>

                    {isbnResult.publisher && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <Building className="w-3 h-3 text-slate-500" />
                        {isbnResult.publisher}
                      </span>
                    )}

                    {isbnResult.pageCount && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <FileText className="w-3 h-3 text-slate-500" />
                        {isbnResult.pageCount} págs.
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {isbnResult.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectBook(isbnResult)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selecionar Livro e Avançar para Resenha</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
