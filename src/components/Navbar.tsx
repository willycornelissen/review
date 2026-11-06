import React from 'react'
import { BookOpen, History, Settings, Database, Sparkles } from 'lucide-react'

interface NavbarProps {
  activeTab: 'generator' | 'history'
  setActiveTab: (tab: 'generator' | 'history') => void
  savedCount: number
  isFirebaseActive: boolean
  onOpenSettings: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  isFirebaseActive,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Book Review Agent</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AaaS
              </span>
            </div>
            <p className="text-xs text-slate-400">Resenhas Críticas Guiadas por IA</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'generator'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nova Resenha</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico</span>
            {savedCount > 0 && (
              <span className="bg-slate-900/60 text-brand-300 text-[10px] px-1.5 py-0.2 rounded-full border border-brand-400/20">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* Status & Settings */}
        <div className="flex items-center gap-2">
          {/* Firebase Connection Pill */}
          <div
            title={
              isFirebaseActive
                ? 'Conectado ao Firebase Firestore'
                : 'Modo Local / Cache (Configure o Firebase nas Configurações)'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
              isFirebaseActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Database className="w-3 h-3" />
            <span className="text-[11px] font-medium">
              {isFirebaseActive ? 'Firestore Ativo' : 'Cache Local'}
            </span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Configurações (API Keys e Firebase)"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
