import React, { useState } from 'react'
import { Copy, Check, Sparkles, ShieldCheck } from 'lucide-react'
import { ReviewSection } from '../types'

interface ReviewViewerProps {
  fullText: string
  sections: ReviewSection[]
  isStreaming: boolean
  bookTitle: string
  bookAuthor: string
  modelUsed?: string
}

export const ReviewViewer: React.FC<ReviewViewerProps> = ({
  fullText,
  sections,
  isStreaming,
  bookTitle,
  bookAuthor,
  modelUsed = 'Gemini 3.5 Flash Lite',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Falha ao copiar:', e)
    }
  }

  if (!fullText && !isStreaming) {
    return null
  }

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-sm mt-6">
      {/* Header of the Review */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Resenha Crítica Gerada
            </span>
            {isStreaming && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 animate-pulse font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Gerando em tempo real...
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
            Análise Crítica: {bookTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Autor: {bookAuthor} • Modelo: {modelUsed}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!fullText}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-brand-600 hover:bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar Resenha'}</span>
          </button>
        </div>
      </div>

      {/* Structured Sections or Raw Streaming View */}
      <div className="mt-6 space-y-6">
        {sections.length > 0 && !isStreaming ? (
          sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-slate-900/40 p-5 sm:p-6 rounded-xl border border-slate-700/40 hover:border-slate-600/60 transition"
            >
              <h4 className="text-base sm:text-lg font-bold text-brand-300 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center text-xs font-bold border border-brand-500/30">
                  {idx + 1}
                </span>
                {section.title.replace(/^\d+\.\s*/, '')}
              </h4>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-serif">
                {section.content}
              </div>
            </div>
          ))
        ) : (
          <div className="prose prose-invert max-w-none text-slate-200 font-serif leading-relaxed text-sm sm:text-base whitespace-pre-line bg-slate-900/50 p-6 rounded-xl border border-slate-700/40">
            {fullText}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-brand-400 ml-1 animate-pulse align-middle"></span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
          Análise literária gerada e pronta para cópia
        </span>
        <button
          onClick={handleCopy}
          disabled={!fullText}
          className="text-brand-400 hover:text-brand-300 hover:underline"
        >
          Copiar texto completo
        </button>
      </div>
    </div>
  )
}
