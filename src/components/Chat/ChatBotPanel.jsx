/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useRef, useEffect} from 'react'
import {useStore, CHAT_PERSONAS} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'
import {playClickSound, playSelectSound} from '../../lib/sound'
import {MstcBadge, PixelIcon} from '../common/PixelUI'

const MODEL_OPTIONS = [
  {
    id: 'gemini-3.1-flash-lite',
    icon: 'bolt',
    label: 'Flash Lite (Default · Lowest Cost)',
    sub: 'gemini-3.1-flash-lite',
    desc: 'Ultra-fast & budget-friendly for all-day Tech-Con use'
  },
  {
    id: 'gemini-3.8-flash',
    icon: 'sparkle',
    label: 'Flash (Standard)',
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

function formatInlineText(text, isUser = false) {
  if (!text) return null
  // Match **bold**, `code`, "quoted prompt", or *italic*
  const tokenRegex = /(\*\*[^*\n]+\*\*|`[^`\n]+`|"[^"\n]{8,240}"|\*[^*\n]+\*)/g
  const parts = text.split(tokenRegex)

  return parts.map((part, idx) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={idx}
          className={
            isUser
              ? 'font-bold text-white underline decoration-[#facc15]/60'
              : 'font-bold text-[#fde68a]'
          }
        >
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 bg-[#0b0e17] border border-[#334155] text-[#67e8f9] font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('"') && part.endsWith('"') && part.length > 9) {
      return (
        <span
          key={idx}
          className={
            isUser
              ? 'font-semibold text-[#fde68a]'
              : 'inline-block px-1.5 py-0.5 my-0.5 bg-[#0b0e17]/90 border border-[#facc15]/50 text-[#facc15] font-medium'
          }
        >
          &ldquo;{part.slice(1, -1)}&rdquo;
        </span>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-sky-200">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

function renderFormattedMessage(text, isUser = false) {
  if (!text) return null
  const lines = text.split(/\r?\n/)
  const blocks = []
  let currentList = null

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList)
      currentList = null
    }
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      return
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      flushList()
      blocks.push({
        type: 'heading',
        key: `h-${idx}`,
        content: headingMatch[2]
      })
      return
    }

    const bulletMatch = line.match(/^[-*•]\s+(.*)$/)
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = {type: 'ul', key: `ul-${idx}`, items: []}
      }
      currentList.items.push(bulletMatch[1])
      return
    }

    const orderedMatch = line.match(/^(\d+)[.)]\s+(.*)$/)
    if (orderedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = {type: 'ol', key: `ol-${idx}`, items: []}
      }
      currentList.items.push({
        num: orderedMatch[1],
        text: orderedMatch[2]
      })
      return
    }

    flushList()
    blocks.push({
      type: 'p',
      key: `p-${idx}`,
      content: line
    })
  })

  flushList()

  return blocks.map(block => {
    if (block.type === 'heading') {
      return (
        <div
          key={block.key}
          className="pixel-font text-[9px] sm:text-[10px] text-[#facc15] tracking-wider uppercase pt-1 border-b border-white/10 pb-1"
        >
          {formatInlineText(block.content, isUser)}
        </div>
      )
    }
    if (block.type === 'ul') {
      return (
        <ul key={block.key} className="space-y-1.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span
                className="inline-block w-1.5 h-1.5 mt-1.5 bg-[#facc15] shrink-0"
                aria-hidden="true"
              />
              <span className="flex-1">{formatInlineText(item, isUser)}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (block.type === 'ol') {
      return (
        <ol key={block.key} className="space-y-1.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="pixel-font text-[8px] text-[#facc15] bg-[#0b0e17] border border-[#334155] px-1.5 py-0.5 mt-0.5 shrink-0">
                {item.num}
              </span>
              <span className="flex-1">
                {formatInlineText(item.text, isUser)}
              </span>
            </li>
          ))}
        </ol>
      )
    }
    return (
      <p key={block.key} className="leading-relaxed">
        {formatInlineText(block.content, isUser)}
      </p>
    )
  })
}

export default function ChatBotPanel({onNavigateToStudio}) {
  const chatMessages = useStore.useChatMessages()
  const chatModel = useStore.useChatModel()
  const chatPersona = useStore.useChatPersona()
  const chatLoading = useStore.useChatLoading()
  const photos = useStore.usePhotos()

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
  const [attachedImage, setAttachedImage] = useState(null)
  const [attachedLabel, setAttachedLabel] = useState('')
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  const scrollEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const readyPhotos = photos.filter(p => !p.isBusy)

  // Find the most recent image attached in the conversation as a fallback for 1-click edits
  const latestConversationImage =
    attachedImage ||
    [...chatMessages]
      .reverse()
      .find(m => m.image || m.sourceImage)?.image ||
    [...chatMessages]
      .reverse()
      .find(m => m.image || m.sourceImage)?.sourceImage ||
    null

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [chatMessages, chatLoading])

  const handleFileUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result
      if (typeof dataUrl === 'string') {
        playSelectSound()
        setAttachedImage(dataUrl)
        setAttachedLabel(file.name || 'Uploaded Image')
        setShowStickerPicker(false)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSelectBoothPhoto = photo => {
    const b64 = imageData.outputs[photo.id] || imageData.inputs[photo.id]
    if (!b64) return
    playSelectSound()
    const modeLabel =
      photo.mode === 'custom'
        ? 'Custom Sticker'
        : modes[photo.mode]?.name || 'Booth Sticker'
    setAttachedImage(b64)
    setAttachedLabel(modeLabel)
    setShowStickerPicker(false)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if ((!input.trim() && !attachedImage) || chatLoading) return
    const msg = input
    const imgToSend = attachedImage
    setInput('')
    setAttachedImage(null)
    setAttachedLabel('')
    setShowStickerPicker(false)
    sendChatMessage(msg, imgToSend)
  }

  const handleQuickGenerate = async (promptText, sourceImg = null) => {
    const effectiveSource = sourceImg || latestConversationImage || null
    const id = await createOrEditImageWithGemini({
      prompt: promptText,
      sourceImage: effectiveSource,
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

  const handleDirectEditAttached = async () => {
    if (!attachedImage || chatLoading) return
    const editPrompt =
      input.trim() ||
      'Transform this character into a 16-bit pixel art arcade hero die-cut sticker'
    setInput('')
    await handleQuickGenerate(editPrompt, attachedImage)
  }

  return (
    <section className="flex-1 min-h-0 flex flex-col max-w-4xl w-full mx-auto bg-[#0b0e17] sm:border-x-2 border-[#334155] shadow-2xl overflow-hidden">
      {/* Top Chat Control Header */}
      <div
        className="px-3 sm:px-4 py-2.5 border-b-2 border-[#facc15] flex flex-col gap-2 shrink-0"
        style={{
          background: 'linear-gradient(90deg, #131829 0%, #7f1030 55%, #131829 100%)'
        }}
      >
        <div className="flex items-center justify-between gap-2 pr-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <MstcBadge size="sm" />
            <div className="min-w-0">
              <h2 className="pixel-font text-xs sm:text-sm text-[#facc15] truncate">
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
            className="pixel-btn text-[8px] px-2.5 py-1.5 min-h-[36px] bg-[#0f1320] text-rose-300 border-rose-400 shrink-0"
            title="Clear conversation history"
          >
            <PixelIcon name="trash" size={11} />
            <span>Reset</span>
          </button>
        </div>

        {/* Model Selector & Role Persona Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/15">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#facc15] mr-1">
              Model:
            </span>
            {MODEL_OPTIONS.map(m => {
              const isAct = chatModel === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChatModel(m.id)}
                  className={`px-2 py-1 rounded text-[11px] font-bold border transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isAct
                      ? 'bg-[#facc15] text-[#0b0e17] border-white shadow-sm'
                      : 'bg-[#0f1320]/90 text-slate-200 border-slate-600 hover:border-[#facc15]'
                  }`}
                  title={`${m.sub} — ${m.desc}`}
                >
                  <PixelIcon name={m.icon} size={11} />
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
              className="text-[10px] font-bold uppercase tracking-wider text-sky-300 shrink-0"
            >
              Role:
            </label>
            <select
              id="chat-persona-select"
              value={chatPersona}
              onChange={e => setChatPersona(e.target.value)}
              className="bg-[#0f1320] border border-sky-400/70 text-white text-xs font-semibold rounded px-2 py-1 cursor-pointer"
            >
              {Object.values(CHAT_PERSONAS).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#0b0e17]">
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
                    ? 'bg-[#9f1239] text-white border-[#facc15]'
                    : 'bg-[#151928] text-slate-100 border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-slate-300">
                  <span className="font-bold text-[#facc15] inline-flex items-center gap-1.5">
                    <PixelIcon
                      name={
                        isUser
                          ? 'star'
                          : CHAT_PERSONAS[chatPersona]?.icon || 'bot'
                      }
                      size={11}
                    />
                    <span>
                      {isUser
                        ? 'You'
                        : CHAT_PERSONAS[chatPersona]?.name || 'PixelBot'}
                    </span>
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed space-y-2 break-words">
                  {msg.image && (
                    <div className="mb-2 p-1.5 bg-[#0b0e17] border border-[#facc15] inline-flex items-center gap-2.5 max-w-full">
                      <img
                        src={msg.image}
                        alt="Attached reference"
                        className="w-14 h-14 object-contain bg-black border border-[#334155] shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <span className="pixel-font text-[7px] text-[#facc15] block">
                          ATTACHED IMAGE
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playSelectSound()
                            setAttachedImage(msg.image)
                            setAttachedLabel('Re-attached Image')
                          }}
                          className="mt-1 pixel-btn text-[7px] px-2 py-1 bg-[#1e2538] text-sky-300 border-sky-400"
                        >
                          <PixelIcon name="edit" size={9} />
                          <span>Use for Edit</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {renderFormattedMessage(msg.text, isUser)}
                </div>

                {suggestedPrompts.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/15 space-y-1.5">
                    <span className="pixel-font text-[8px] text-sky-300 block">
                      {msg.sourceImage || latestConversationImage
                        ? '1-CLICK EDIT ATTACHED IMAGE:'
                        : '1-CLICK GENERATE STICKER:'}
                    </span>
                    {suggestedPrompts.map((pText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          handleQuickGenerate(
                            pText,
                            msg.sourceImage || latestConversationImage
                          )
                        }
                        className="w-full text-left p-2 bg-[#0b0e17] hover:bg-[#1e2538] border border-[#facc15] text-xs text-[#facc15] flex items-center justify-between gap-2 transition cursor-pointer"
                      >
                        <span className="truncate">&ldquo;{pText}&rdquo;</span>
                        <span className="pixel-font text-[8px] bg-[#9f1239] text-white px-2 py-1 shrink-0 inline-flex items-center gap-1">
                          <PixelIcon name="sparkle" size={10} />
                          <span>
                            {msg.sourceImage || latestConversationImage
                              ? 'Edit Image'
                              : 'Create'}
                          </span>
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
            <div className="pixel-box bg-[#151928] border-sky-400 px-4 py-3 text-xs text-sky-300 flex items-center gap-2">
              <span className="caret-blink pixel-font text-[10px]">▋</span>
              <span>PixelBot is thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Quick Starter Chips */}
      <div className="px-2.5 py-1.5 bg-[#131826] border-t border-[#334155] flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_STARTERS.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={chatLoading}
            onClick={() => sendChatMessage(q, attachedImage)}
            className="px-2.5 py-1.5 bg-[#1e2538] hover:bg-[#9f1239] text-slate-200 hover:text-white border border-[#334155] hover:border-[#facc15] text-[10px] sm:text-[11px] font-medium transition cursor-pointer whitespace-nowrap sm:whitespace-normal shrink-0 inline-flex items-center gap-1.5"
          >
            <PixelIcon name="chat" size={11} className="text-[#facc15]" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Message Input Form with Image Upload & Booth Sticker Picker */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:p-2.5 bg-[#151928] border-t-2 border-[#334155] flex flex-col gap-2 shrink-0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Booth Sticker Picker Drawer inside Form */}
        {showStickerPicker && (
          <div className="p-2 bg-[#0b0e17] border border-sky-400/70 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="pixel-font text-[8px] text-sky-300">
                SELECT A BOOTH STICKER TO INSERT IN CHAT:
              </span>
              <button
                type="button"
                onClick={() => setShowStickerPicker(false)}
                className="text-[10px] text-slate-400 hover:text-white px-1 cursor-pointer"
              >
                Close
              </button>
            </div>
            {readyPhotos.length === 0 ? (
              <p className="text-[11px] text-slate-300">
                No booth stickers snapped yet. Tap <strong>UPLOAD</strong> below
                to insert any image from your device, or snap a photo in the
                booth first!
              </p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {readyPhotos.map(p => {
                  const thumb = imageData.outputs[p.id] || imageData.inputs[p.id]
                  if (!thumb) return null
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectBoothPhoto(p)}
                      className="shrink-0 w-14 h-14 bg-[#151928] border-2 border-[#334155] hover:border-[#facc15] p-0.5 transition cursor-pointer"
                      title="Insert this sticker into chat"
                    >
                      <img
                        src={thumb}
                        alt="Booth sticker"
                        className="w-full h-full object-contain bg-black"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Attached Image Preview Banner */}
        {attachedImage && (
          <div className="p-2 bg-[#0b0e17] border border-[#facc15] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={attachedImage}
                alt="Attached for AI"
                className="w-11 h-11 object-contain bg-black border border-[#334155] shrink-0"
              />
              <div className="min-w-0">
                <span className="pixel-font text-[8px] text-[#facc15] block truncate">
                  IMAGE ATTACHED: {attachedLabel || 'READY'}
                </span>
                <span className="text-[11px] text-slate-300 block truncate">
                  Send to ask PixelBot for ideas, or type an edit &amp; click
                  Edit Sticker
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={chatLoading}
                onClick={handleDirectEditAttached}
                className="pixel-btn text-[8px] px-2.5 py-1.5 min-h-[34px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300"
                title="Directly edit this attached image with Gemini using your prompt"
              >
                <PixelIcon name="sparkle" size={10} />
                <span>Edit Sticker</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAttachedImage(null)
                  setAttachedLabel('')
                }}
                className="pixel-btn text-[8px] px-2 py-1.5 min-h-[34px] bg-[#1e2538] text-rose-300 border-rose-400"
                title="Remove attached image"
              >
                <PixelIcon name="trash" size={10} />
              </button>
            </div>
          </div>
        )}

        {/* Main Composer Controls Row */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            disabled={chatLoading}
            onClick={() => {
              playClickSound()
              fileInputRef.current?.click()
            }}
            className="pixel-btn text-[8px] px-2.5 py-2 min-h-[42px] bg-[#1e2538] hover:bg-[#283149] text-sky-300 border-sky-400/80 shrink-0"
            title="Upload an image from your device to ask AI or edit"
          >
            <PixelIcon name="upload" size={12} />
            <span className="hidden sm:inline">UPLOAD</span>
          </button>

          <button
            type="button"
            disabled={chatLoading}
            onClick={() => {
              playClickSound()
              setShowStickerPicker(prev => !prev)
            }}
            className={`pixel-btn text-[8px] px-2.5 py-2 min-h-[42px] shrink-0 ${
              showStickerPicker
                ? 'bg-[#facc15] text-[#0b0e17] border-white'
                : 'bg-[#1e2538] hover:bg-[#283149] text-[#facc15] border-[#475569]'
            }`}
            title="Insert one of your snapped booth stickers"
          >
            <PixelIcon name="image" size={12} />
            <span className="hidden sm:inline">
              STICKERS{readyPhotos.length > 0 ? ` (${readyPhotos.length})` : ''}
            </span>
          </button>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              attachedImage
                ? 'Ask PixelBot about this image or type an edit instruction...'
                : 'Ask PixelBot or attach an image to edit...'
            }
            className="flex-1 min-w-0 bg-[#0b0e17] border-2 border-[#334155] focus:border-[#facc15] px-3 py-2 min-h-[42px] text-base sm:text-sm text-white outline-none"
          />

          <button
            type="submit"
            disabled={chatLoading || (!input.trim() && !attachedImage)}
            className="pixel-btn text-[9px] px-3 sm:px-3.5 py-2 min-h-[42px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] shrink-0"
          >
            {chatLoading ? (
              <span>...</span>
            ) : (
              <>
                <span>SEND</span>
                <PixelIcon name="play" size={10} />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
