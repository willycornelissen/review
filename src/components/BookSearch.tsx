import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Book as BookIcon, X } from 'lucide-react'
import { Book } from '../types'
import { searchBooks } from '../services/googleBooks'

interface BookSearchProps {
  onSelectBook: (book: Book) => void
  disabled?: boolean
}

export const BookSearch: React.FC<BookSearchProps> = ({ onSelectBook, disabled }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      const books = await searchBooks(query)
      setResults(books)
      setIsLoading(false)
      setIsOpen(books.length > 0)
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (book: Book) => {
    onSelectBook(book)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o título do livro ou autor (ex.: Dom Casmurro, 1984, Duna)..."
          className="w-full pl-11 pr-12 py-3.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition shadow-lg shadow-black/20"
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
          {isLoading && <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />}
          {!isLoading && query && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
                setIsOpen(false)
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-700/40">
          <div className="px-4 py-2 bg-slate-800/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-md">
            Livros Encontrados ({results.length})
          </div>

          {results.map((book) => (
            <button
              key={book.id}
              onClick={() => handleSelect(book)}
              className="w-full text-left px-4 py-3 flex items-start gap-3.5 hover:bg-slate-700/60 transition group"
            >
              {book.thumbnail ? (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-11 h-16 object-cover rounded-md shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-11 h-16 bg-slate-700/80 rounded-md flex items-center justify-center flex-shrink-0 text-slate-400 border border-slate-600/50">
                  <BookIcon className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-100 group-hover:text-brand-300 transition line-clamp-1">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {book.authors.join(', ')} • {book.publishedYear}
                </p>
                {book.description && (
                  <p className="text-[11px] text-slate-400/80 mt-1 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
