/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import {THEMES} from '../../lib/modes'

export default function ModeSelector({
  customPrompt,
  onCustomPromptChange,
  onOpenChatHelper,
  onClose
}) {
  const activeTheme = useStore.useActiveTheme()
  const activeMode = useStore.useActiveMode()
  const instantTransform = useStore.useInstantTransform()
  const {setTheme, setMode, setInstantTransform} = useStore.getState()

  const currentModes = THEMES[activeTheme]?.modes || []

  const handleSelectLens = modeKey => {
    setMode(modeKey)
    if (modeKey !== 'custom' && onClose) {
      onClose()
    }
  }

  return (
    <div
      id="modal-lens-drawer"
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="pixel-box bg-[#1d1526] border-[#ffcc00] max-w-2xl w-full p-3.5 sm:p-5 max-h-[88dvh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b-2 border-[#8B1E41] shrink-0">
          <div>
            <h2 className="pixel-font text-[10px] sm:text-xs text-[#ffcc00]">
              🎨 CHOOSE PIXEL LENS OR CUSTOM PROMPT
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Tap a category deck below, then pick any character lens!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pixel-btn w-9 h-9 bg-[#120d18] text-white flex items-center justify-center text-xs shrink-0"
            aria-label="Close lens drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
          {/* Category Deck Tabs + Random + Custom */}
          <div>
            <span className="pixel-font text-[8px] text-cyan-300 block mb-1.5">
              1. LENS CATEGORY DECKS:
            </span>
            <div
              id="category-tabs-container"
              className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
              role="tablist"
            >
              {Object.entries(THEMES).map(([key, theme]) => {
                const isAct =
                  activeTheme === key &&
                  activeMode !== 'custom' &&
                  activeMode !== 'random'
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isAct}
                    onClick={() => setTheme(key)}
                    className={`pixel-btn text-[8px] sm:text-[9px] px-2.5 py-2.5 min-h-[42px] flex items-center justify-start gap-2 ${
                      isAct
                        ? 'bg-[#8B1E41] text-[#ffcc00] border-[#ffcc00]'
                        : 'bg-[#120d18] text-slate-200 border-[#4a304d] hover:border-[#ffcc00]'
                    }`}
                  >
                    <span className="text-base">{theme.emoji}</span>
                    <span className="truncate">{theme.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Special Modes: Random & Custom Prompt */}
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              <button
                id="btn-mode-random"
                type="button"
                onClick={() => handleSelectLens('random')}
                className={`pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 ${
                  activeMode === 'random'
                    ? 'bg-[#ffcc00] text-[#120d18] border-white'
                    : 'bg-[#2b1d38] text-white border-[#6b4c70] hover:border-[#ffcc00]'
                }`}
              >
                <span>❓</span>
                <span>SURPRISE RANDOM LENS</span>
              </button>
              <button
                id="btn-mode-custom"
                type="button"
                onClick={() => setMode('custom')}
                className={`pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 ${
                  activeMode === 'custom'
                    ? 'bg-[#ffcc00] text-[#120d18] border-white'
                    : 'bg-[#2b1d38] text-white border-[#6b4c70] hover:border-[#ffcc00]'
                }`}
              >
                <span>✏️</span>
                <span>CUSTOM PROMPT</span>
              </button>
            </div>
          </div>

          {/* Custom Prompt Input Box (When Custom is selected) */}
          {activeMode === 'custom' ? (
            <div
              id="custom-prompt-box"
              className="bg-[#120d18] border-2 border-[#ffcc00] p-3 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="pixel-font text-[8px] text-[#ffcc00]">
                  ✏️ WRITE YOUR CUSTOM STICKER PROMPT:
                </span>
                {onOpenChatHelper && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose()
                      onOpenChatHelper()
                    }}
                    className="pixel-btn text-[8px] px-2.5 py-1.5 bg-[#23192d] text-cyan-300 border-cyan-400"
                  >
                    🤖 Ask PixelBot for Ideas
                  </button>
                )}
              </div>
              <textarea
                id="custom-prompt-input"
                rows={3}
                value={customPrompt}
                onChange={e => onCustomPromptChange(e.target.value)}
                placeholder="e.g. Turn me into a 16-bit pixel art cyberpunk knight holding a neon laser sword..."
                className="w-full bg-[#1d1526] border border-slate-500 focus:border-[#ffcc00] text-white text-xs p-2.5 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="pixel-btn w-full py-2.5 min-h-[42px] bg-[#8B1E41] text-[#ffcc00] border-[#ffcc00] text-[9px] justify-center"
              >
                ✅ USE THIS CUSTOM PROMPT
              </button>
            </div>
          ) : (
            /* Preset Lenses Grid for Active Category */
            <div>
              <span className="pixel-font text-[8px] text-[#ffcc00] block mb-1.5">
                2. PICK A {THEMES[activeTheme]?.shortName?.toUpperCase() || 'LENS'}{' '}
                STYLE:
              </span>
              <ul
                id="lens-chips-grid"
                className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
              >
                {currentModes.map(m => {
                  const isSel = activeMode === m.key
                  return (
                    <li key={m.key}>
                      <button
                        type="button"
                        onClick={() => handleSelectLens(m.key)}
                        aria-pressed={isSel}
                        className={`pixel-btn w-full text-[8px] sm:text-[9px] px-2.5 py-2.5 min-h-[44px] flex items-center justify-start gap-1.5 ${
                          isSel
                            ? 'bg-[#8B1E41] text-[#ffcc00] border-[#ffcc00]'
                            : 'bg-[#261b30] text-slate-100 border-[#4d3352] hover:border-white'
                        }`}
                      >
                        <span className="text-base shrink-0">{m.emoji}</span>
                        <span className="truncate">{m.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Drawer Footer: Instant vs Preview Toggle */}
        <div className="pt-2.5 mt-2.5 border-t border-[#3b2032] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-300">
            Shutter Behavior:
          </span>
          <button
            type="button"
            onClick={() => setInstantTransform(!instantTransform)}
            className={`pixel-btn text-[8px] px-3 py-1.5 min-h-[34px] ${
              instantTransform
                ? 'bg-emerald-800 text-white border-emerald-400'
                : 'bg-[#120d18] text-amber-300 border-amber-400'
            }`}
          >
            {instantTransform
              ? '⚡ Instant Large Sticker (Default)'
              : '👁️ Preview Before Transform'}
          </button>
        </div>
      </div>
    </div>
  )
}