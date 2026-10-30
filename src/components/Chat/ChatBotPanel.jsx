/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useRef, useEffect} from 'react'
import {useStore, CHAT_PERSONAS} from '../../lib/store'

const MODEL_OPTIONS = [
  {
    id: 'gemini-3.1-flash-lite',
    label: '⚡ Flash Lite (Default · Lowest Cost)',
    sub: 'gemini-3.1-flash-lite',
    desc: 'Ultra-fast & budget-friendly for all-day Tech-Con use'
  },
  {
    id: 'gemini-3.8-flash',
    label: '✨ Flash (Standard)',
    sub: 'gemini-3.8-flash',
    desc: 'Balanced creative prompt coaching'
  }
]

const QUICK_STARTERS = [
  'Suggest 3 cool 16-bit RPG sticker prompts!',
  'How do I edit my sticker with a wizard hat?',
  'Which Fursona or Card lens should I try?',
  'How does the 3-sticker Cricut queue work?'
]

function extractQuotedPrompts(text) {
  if (!text) return []
  const matches = [...text.matchAll(/"([^"]{15,220})"/g)]
  return matches.map(m => m[1])
}

export default function ChatBotPanel({onNavigateToStudio}) {
  const chatMessages = useStore.useChatMessages()
  const chatModel = useStore.useChatModel()
  const chatPersona = useStore.useChatPersona()
  const chatLoading = useStore.useChatLoading()

  const {
    sendChatMessage,
    clearChatHistory,
    setChatModel,
    setChatPersona,
    createOrEditImageWithGemini,
    setActiveTopTab,
    setView
  } = useStore.getState()

  const [input, setInput] = useState('')
  const scrollEndRef = useRef(null)

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [chatMessages, chatLoading])

  const handleSubmit = e => {
    e.preventDefault()
    if (!input.trim() || chatLoading) return
    const msg = input
    setInput('')
    sendChatMessage(msg)
  }

  const handleQuickGenerate = async promptText => {
    const id = await createOrEditImageWithGemini({
      prompt: promptText,
      asDieCutSticker: true
    })
    if (id) {
      if (onNavigateToStudio) {
        onNavigateToStudio(id)
      } else {
        setActiveTopTab('app')
        setView('gallery')
      }
    }
  }

  return (
    <section className="flex-1 min-h-0 flex flex-col max-w-4xl w-full mx-auto bg-[#140f1d] sm:border-x-2 border-[#3b2032] shadow-2xl overflow-hidden">
      {/* Top Chat Control Header */}
      <div
        className="px-3 sm:px-4 py-2.5 border-b-2 border-[#ffcc00] flex flex-col gap-2 shrink-0"
        style={{
          background: 'linear-gradient(90deg, #5e112b 0%, #8B1E41 55%, #2b0f26 100%)'
        }}
      >
        <div className="flex items-center justify-between gap-2 pr-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">🤖</span>
            <div className="min-w-0">
              <h2 className="pixel-font text-xs sm:text-sm text-[#ffcc00] truncate">
                PIXELBOT AI COACH
              </h2>
              <p className="text-[11px] text-slate-200 truncate">
                Multi-Turn Gemini Assistant · Prompt Crafter &amp; Booth Guide
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearChatHistory}
            className="pixel-btn text-[8px] px-2.5 py-1.5 bg-[#120d18] text-rose-300 border-rose-400 shrink-0"
            title="Clear conversation history"
          >
            🗑️ Reset
          </button>
        </div>

        {/* Model Selector & Role Persona Selector (Wraps cleanly without horizontal scrollbar) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/15">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffcc00] mr-1">
              Model:
            </span>
            {MODEL_OPTIONS.map(m => {
              const isAct = chatModel === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChatModel(m.id)}
                  className={`px-2 py-1 rounded text-[11px] font-bold border transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    isAct
                      ? 'bg-[#ffcc00] text-[#140f1d] border-white shadow-sm'
                      : 'bg-[#120d18]/90 text-slate-200 border-slate-600 hover:border-[#ffcc00]'
                  }`}
                  title={`${m.sub} — ${m.desc}`}
                >
                  <span>{m.label}</span>
                  <span className="hidden lg:inline text-[10px] opacity-80 font-mono">
                    ({m.sub})
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="chat-persona-select"
              className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 shrink-0"
            >
              Role:
            </label>
            <select
              id="chat-persona-select"
              value={chatPersona}
              onChange={e => setChatPersona(e.target.value)}
              className="bg-[#120d18] border border-cyan-400/70 text-white text-xs font-semibold rounded px-2 py-1 cursor-pointer"
            >
              {Object.values(CHAT_PERSONAS).map(p => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#110c19]">
        {chatMessages.map(msg => {
          const isUser = msg.role === 'user'
          const suggestedPrompts = !isUser ? extractQuotedPrompts(msg.text) : []

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] p-3 pixel-box ${
                  isUser
                    ? 'bg-[#8B1E41] text-white border-[#ffcc00]'
                    : 'bg-[#1d1526] text-slate-100 border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-slate-300">
                  <span className="font-bold text-[#ffcc00]">
                    {isUser
                      ? '🧑 You'
                      : `${CHAT_PERSONAS[chatPersona]?.emoji || '🤖'} ${
                          CHAT_PERSONAS[chatPersona]?.name || 'PixelBot'
                        }`}
                  </span>
                  {!isUser && msg.modelUsed && (
                    <span className="font-mono text-[9px] text-cyan-300">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {suggestedPrompts.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/15 space-y-1.5">
                    <span className="pixel-font text-[8px] text-[#06b6d4] block">
                      1-CLICK GENERATE WITH GEMINI-NANO-BANANA-2.1:
                    </span>
                    {suggestedPrompts.map((pText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickGenerate(pText)}
                        className="w-full text-left p-2 bg-[#120d18] hover:bg-[#261a34] border border-[#ffcc00] text-xs text-[#ffcc00] flex items-center justify-between gap-2 transition cursor-pointer"
                      >
                        <span className="truncate">&ldquo;{pText}&rdquo;</span>
                        <span className="pixel-font text-[8px] bg-[#8B1E41] text-white px-2 py-1 shrink-0">
                          ✨ Create
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {chatLoading && (
          <div className="flex items-start">
            <div className="pixel-box bg-[#1d1526] border-[#06b6d4] px-4 py-3 text-xs text-cyan-300 flex items-center gap-2">
              <span className="caret-blink pixel-font text-[10px]">▋</span>
              <span>
                PixelBot is thinking with <strong>{chatModel}</strong>...
              </span>
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Quick Starter Chips (Wrapped, zero horizontal scrollbar) */}
      <div className="px-2.5 py-1.5 bg-[#161020] border-t border-[#3b2032] flex flex-wrap items-center gap-1.5 shrink-0">
        {QUICK_STARTERS.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={chatLoading}
            onClick={() => sendChatMessage(q)}
            className="px-2 py-1 bg-[#23192d] hover:bg-[#8B1E41] text-slate-200 hover:text-white border border-[#4d3352] hover:border-[#ffcc00] text-[10px] sm:text-[11px] font-medium transition cursor-pointer"
          >
            💬 {q}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-[#1d1526] border-t-2 border-[#f7f7f7] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask PixelBot for sticker prompts, image edits, or booth help..."
          className="flex-1 bg-[#120d18] border-2 border-slate-500 focus:border-[#ffcc00] px-3 py-2 min-h-[42px] text-xs sm:text-sm text-white outline-none"
        />
        <button
          type="submit"
          disabled={chatLoading || !input.trim()}
          className="pixel-btn text-[9px] px-3.5 py-2 min-h-[42px] bg-[#8B1E41] hover:bg-[#a6244d] text-[#ffcc00] shrink-0"
        >
          {chatLoading ? '...' : 'SEND ➤'}
        </button>
      </form>
    </section>
  )
}
