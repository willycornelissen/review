import React, { useState, useEffect } from 'react'
import { X, Key, Database, Check, Eye, EyeOff, Save, Trash2, HelpCircle } from 'lucide-react'
import { FirebaseConfig } from '../types'
import {
  getStoredApiKey,
  saveStoredApiKey,
} from '../services/reviewAgent'
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
} from '../services/firebase'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfigSaved: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [jsonConfig, setJsonConfig] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey())
      const fb = getStoredFirebaseConfig()
      if (fb) {
        setJsonConfig(JSON.stringify(fb, null, 2))
      } else {
        setJsonConfig('')
      }
      setStatusMessage(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    // Salva ou remove API key
    saveStoredApiKey(apiKey)

    // Salva Firebase se informado
    if (jsonConfig.trim()) {
      try {
        const parsed = JSON.parse(jsonConfig) as FirebaseConfig
        if (!parsed.projectId || !parsed.apiKey) {
          throw new Error('A configuração deve conter ao menos apiKey e projectId.')
        }
        saveStoredFirebaseConfig(parsed)
      } catch (err: any) {
        setStatusMessage(`Erro no JSON do Firebase: ${err.message}`)
        return
      }
    }

    setStatusMessage('Configurações salvas com sucesso!')
    onConfigSaved()
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  const handleClearFirebase = () => {
    clearStoredFirebaseConfig()
    setJsonConfig('')
    setStatusMessage('Configurações do Firebase removidas. Usando cache local.')
    onConfigSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/60 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Configurações & Chaves</h3>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Gemini API Key */}
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
                className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
              >
                Obter chave gratuita no Google AI Studio
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Necessária para o Agente gerar a resenha em streaming direto no GitHub Pages.
            </p>
          </div>

          {/* Firebase Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Firebase Config (Firestore)
              </label>
              {jsonConfig && (
                <button
                  type="button"
                  onClick={handleClearFirebase}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Desconectar
                </button>
              )}
            </div>

            <textarea
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              rows={6}
              placeholder={`Cole o objeto firebaseConfig do Console do Firebase:\n{\n  "apiKey": "...",\n  "projectId": "...",\n  "authDomain": "..."\n}`}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>
                Opcional. Se não configurado, a aplicação utilizará automaticamente o
                armazenamento local (LocalStorage) com funcionalidade completa.
              </span>
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.includes('Erro')
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3">
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
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  )
}
