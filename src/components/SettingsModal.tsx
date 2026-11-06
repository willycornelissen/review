import React, { useState, useEffect } from 'react'
import { X, Key, Check, Eye, EyeOff, Save, Trash2 } from 'lucide-react'
import { getStoredApiKey, saveStoredApiKey } from '../services/reviewAgent'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey())
      setStatusMessage(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    saveStoredApiKey(apiKey)
    setStatusMessage('Chave da API salva com sucesso!')
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const handleClear = () => {
    saveStoredApiKey('')
    setApiKey('')
    setStatusMessage('Chave da API removida do navegador.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/60 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chave da API do Gemini</h3>
              <p className="text-xs text-slate-400">Armazenamento local seguro no seu navegador</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-brand-400 hover:underline"
              >
                Obter chave gratuita
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Sua chave é gravada exclusivamente no <code className="text-brand-300">localStorage</code> do seu navegador e utilizada para gerar as resenhas diretamente via streaming. Nenhuma informação é enviada a servidores intermediários.
            </p>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <Check className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover chave</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition shadow-lg shadow-brand-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Chave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
