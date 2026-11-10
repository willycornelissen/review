import React from 'react'
import { BookOpen, Settings, Sparkles } from 'lucide-react'

interface NavbarProps {
  onOpenSettings: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Agente de Resenhas</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AaaS
              </span>
            </div>
            <p className="text-xs text-slate-400">Resenhas Críticas Guiadas por IA</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700/80">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Geração Direta em Streaming</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Configurações (Chave da API do Gemini)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700 text-xs font-medium"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Chave Gemini</span>
          </button>
        </div>
      </div>
    </header>
  )
}
