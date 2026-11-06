import React, { useState } from 'react'
import { BookReview } from '../types'
import { Search, Book as BookIcon, Calendar, Trash2, ArrowUpRight, BookOpen } from 'lucide-react'

interface HistoryListProps {
  reviews: BookReview[]
  onSelectReview: (review: BookReview) => void
  onDeleteReview: (id: string) => void
}

export const HistoryList: React.FC<HistoryListProps> = ({
  reviews,
  onSelectReview,
  onDeleteReview,
}) => {
  const [filter, setFilter] = useState('')

  const filtered = reviews.filter((r) => {
    const term = filter.toLowerCase()
    return (
      r.bookTitle.toLowerCase().includes(term) ||
      r.bookAuthors.some((a) => a.toLowerCase().includes(term))
    )
  })

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 max-w-xl mx-auto my-8">
        <div className="w-14 h-14 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Nenhuma resenha salva ainda</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Busque um livro na aba "Nova Resenha" e acione o agente para gerar sua primeira análise literária.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-6">
      {/* Search Bar in History */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Histórico de Resenhas</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {reviews.length} resenha{reviews.length > 1 ? 's' : ''} persistida{reviews.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por título ou autor..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Grid of Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-brand-500/40 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-lg shadow-black/20"
          >
            <div className="flex items-start gap-3.5">
              {rev.bookCover ? (
                <img
                  src={rev.bookCover}
                  alt={rev.bookTitle}
                  className="w-14 h-20 object-cover rounded-md flex-shrink-0 shadow-md border border-slate-600/30"
                />
              ) : (
                <div className="w-14 h-20 bg-slate-700/60 rounded-md flex items-center justify-center flex-shrink-0 text-slate-400 border border-slate-600/30">
                  <BookIcon className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-100 group-hover:text-brand-300 transition line-clamp-1">
                  {rev.bookTitle}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {rev.bookAuthors.join(', ')}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString('pt-BR')
                      : 'Data desconhecida'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700/50">
              <button
                onClick={() => onSelectReview(rev)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
              >
                <span>Ler Resenha Completa</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Deseja remover a resenha de "${rev.bookTitle}"?`)) {
                    onDeleteReview(rev.id)
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition"
                title="Excluir resenha"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
