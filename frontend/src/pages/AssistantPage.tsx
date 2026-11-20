
import React, { useState } from 'react'
import {
  Bot,
  Send,
  Database,
  ShieldCheck,
  Globe,
  Sparkles,
  Terminal,
  User,
  AlertCircle
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

interface Message {
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  sources?: string[]
  verifiedData?: any
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'SHIKHAR Tactical Logistics Assistant online. Ready to analyze inventory records, mountain pass transit conditions, and Challenger AI verification directives. How may I advise command?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['Database Ground Truth: inventory, warehouses, corridors'],
      verifiedData: { status: 'TACTICAL_SYNC_NOMINAL' }
    }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputMsg('')
    setIsLoading(true)

    try {
      const res = await shikharApi.queryAssistant({
        message: text,
        language
      })

      const botMessage: Message = {
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.data_sources_consulted,
        verifiedData: res.verified_numerical_data
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Tactical comms error: Unable to reach central logistics query service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const promptPresets = [
    { label: 'Critical Low Stock', query: 'What supply lines are currently running critically low across depots?' },
    { label: 'Leh Forward & Passes', query: 'Report status of Leh Forward Depot and mountain pass corridor reliability.' },
    { label: 'Zojila Pass Intel', query: 'What is the operational status and weather blockage risk for Zojila Pass?' },
    { label: 'Rations & Food Stock', query: 'What military food rations and MRE combat meals are available in storage?' },
    { label: 'Cold-Chain Plasma Status', query: 'Check cold-chain medical plasma batches and Arrhenius thermal risk.' },
    { label: 'Arrhenius Equation', query: 'Explain the Arrhenius thermal spoilage equation and parameters used in Shikhar.' },
    { label: 'JWT Security Architecture', query: 'Explain how JWT authentication and SHA-256 tamper-evident security works in Shikhar.' }
  ]

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 12: AI TACTICAL LOGISTICS ASSISTANT • VERIFIED RAG
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Database Grounded Reasoning • Anti-Hallucination Safe Execution • Multilingual Defense Decision Support
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1.5 bg-tactical-card border border-tactical-border p-1 rounded font-mono text-xs">
          <Globe className="w-3.5 h-3.5 text-tactical-khaki ml-1" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors ${
              language === 'en' ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded transition-colors ${
              language === 'hi' ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* Preset Prompts Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-tactical-muted text-[10px] uppercase font-bold shrink-0">Preset Directives:</span>
        {promptPresets.map((p) => (
          <button
            key={p.label}
            onClick={() => handleSend(p.query)}
            className="px-2.5 py-1 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive text-tactical-text hover:text-white whitespace-nowrap transition-colors shrink-0 text-[11px]"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Terminal Box */}
      <div className="tactical-panel p-4 flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded bg-tactical-olive/20 border border-tactical-olive flex items-center justify-center shrink-0 mt-0.5 shadow">
                  <Bot className="w-4 h-4 text-tactical-oliveLight" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded p-3 font-mono text-xs border ${
                  m.sender === 'user'
                    ? 'bg-tactical-card border-tactical-olive/60 text-tactical-text'
                    : 'bg-tactical-surface border-tactical-border text-tactical-text'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-tactical-muted mb-1 pb-1 border-b border-tactical-border/40">
                  <span className="font-bold text-tactical-khaki">
                    {m.sender === 'user' ? 'TACTICAL OPERATOR' : 'SHIKHAR ADVISORY CORE'}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                {/* Grounding Provenance Footer */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-tactical-border/50 text-[10px] space-y-1">
                    <div className="flex items-center space-x-1.5 text-tactical-oliveLight font-bold">
                      <Database className="w-3 h-3" />
                      <span>Verified Numerical Sources:</span>
                    </div>
                    <div className="text-tactical-muted pl-4">
                      {m.sources.map((s, i) => (
                        <div key={i}>• {s}</div>
                      ))}
                    </div>

                    {m.verifiedData && (
                      <div className="mt-1.5 p-1.5 rounded bg-tactical-card/70 border border-tactical-border text-[9px] text-tactical-khaki">
                        Verified Ledger Data: {JSON.stringify(m.verifiedData)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded bg-tactical-card border border-tactical-border flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-tactical-khaki" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs font-mono text-tactical-muted pl-10">
              <span className="w-2 h-2 rounded-full bg-tactical-olive pulse-live" />
              <span>Querying verified relational database tables & computing RAG...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-3 pt-3 border-t border-tactical-border flex items-center space-x-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type tactical query for inventory, weather disruptions, or forecast..."
            className="flex-1 bg-tactical-card border border-tactical-border rounded p-2.5 text-xs font-mono text-tactical-text focus:outline-none focus:border-tactical-olive placeholder:text-tactical-muted/60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMsg.trim()}
            className="px-4 py-2.5 bg-tactical-olive hover:bg-tactical-oliveLight disabled:opacity-50 text-white font-mono font-bold rounded flex items-center space-x-1.5 shadow transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Dispatch Query</span>
          </button>
        </form>
      </div>
    </div>
  )
}
