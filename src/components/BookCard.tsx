import React from 'react'
import { Book as BookIcon, Sparkles, RefreshCw, Calendar, Tag, FileText, ChevronRight } from 'lucide-react'
import { Book } from '../types'

interface BookCardProps {
  book: Book
  onGenerate: (tone: string) => void
  onClear: () => void
  isGenerating: boolean
  selectedTone: string
  setSelectedTone: (tone: string) => void
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onGenerate,
  onClear,
  isGenerating,
  selectedTone,
  setSelectedTone,
}) => {
  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/30 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Cover Thumbnail */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-28 sm:w-32 h-40 sm:h-48 object-cover rounded-xl shadow-xl shadow-black/50 border border-slate-600/40"
            />
          ) : (
            <div className="w-28 sm:w-32 h-40 sm:h-48 bg-slate-700/60 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-600/40">
              <BookIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Sem Capa</span>
            </div>
          )}
        </div>

        {/* Content & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">
                Livro Selecionado
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5 tracking-tight">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-slate-300 mt-1">
                Por {book.authors.join(', ')}
              </p>
            </div>

            <button
              onClick={onClear}
              disabled={isGenerating}
              className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 bg-slate-700/50 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-600/40"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Trocar</span>
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/60 text-slate-300 text-xs font-medium border border-slate-600/40">
              <Calendar className="w-3 h-3 text-slate-400" />
              {book.publishedYear}
            </span>

            {book.pageCount && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/60 text-slate-300 text-xs font-medium border border-slate-600/40">
                <FileText className="w-3 h-3 text-slate-400" />
                {book.pageCount} páginas
              </span>
            )}

            {book.categories && book.categories.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-300 text-xs font-medium border border-brand-500/20">
                <Tag className="w-3 h-3 text-brand-400" />
                {book.categories[0]}
              </span>
            )}
          </div>

          {/* Synopsis */}
          <div className="mt-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/40">
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {book.description}
            </p>
          </div>

          {/* Controls: Tone & Trigger */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-700/60">
            <div className="flex items-center gap-2">
              <label htmlFor="tone-select" className="text-xs text-slate-400 whitespace-nowrap">
                Tom da Análise:
              </label>
              <select
                id="tone-select"
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                disabled={isGenerating}
                className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="analitico">Analítico & Equilibrado</option>
                <option value="critico">Crítico Rigoroso</option>
                <option value="academico">Acadêmico / Ensaístico</option>
                <option value="casual">Leitor Entusiasta</option>
              </select>
            </div>

            <button
              onClick={() => onGenerate(selectedTone)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Sparkles className="w-4 h-4 text-brand-200 group-hover:rotate-12 transition-transform" />
              <span>{isGenerating ? 'Gerando Resenha...' : 'Gerar Resenha com Agente'}</span>
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
