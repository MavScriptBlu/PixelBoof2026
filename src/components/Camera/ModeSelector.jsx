/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import {THEMES} from '../../lib/modes'
import {PixelCloseButton} from '../common/PixelUI'

export default function ModeSelector({
  customPrompt,
  onCustomPromptChange,
  onOpenChatHelper,
  onClose
}) {
  const activeTheme = useStore.useActiveTheme()
  const activeMode = useStore.useActiveMode()
  const {setTheme, setMode} = useStore.getState()

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
        className="pixel-box bg-[#151928] border-[#facc15] max-w-2xl w-full p-3.5 sm:p-5 max-h-[88dvh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 border-b-2 border-[#334155] shrink-0">
          <div>
            <h2 className="pixel-font text-[10px] sm:text-xs text-[#facc15]">
              🎨 CHOOSE PIXEL LENS OR CUSTOM PROMPT
            </h2>
            <p className="text-[11px] text-slate-300 mt-1">
              Tap a category deck below, then pick any character lens!
            </p>
          </div>
          <PixelCloseButton
            onClick={onClose}
            ariaLabel="Close lens drawer"
          />
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-0.5">
          {/* Category Deck Tabs + Random + Custom */}
          <div>
            <span className="pixel-font text-[8px] text-sky-300 block mb-2">
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
                        ? 'bg-[#9f1239] text-[#facc15] border-[#facc15]'
                        : 'bg-[#0f1320] text-slate-200 border-[#334155] hover:border-[#facc15]'
                    }`}
                  >
                    <span className="text-base">{theme.emoji}</span>
                    <span className="truncate">{theme.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Special Modes: Random & Custom Prompt */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <button
                id="btn-mode-random"
                type="button"
                onClick={() => handleSelectLens('random')}
                className={`pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 ${
                  activeMode === 'random'
                    ? 'bg-[#facc15] text-[#0b0e17] border-white'
                    : 'bg-[#1e2538] text-slate-100 border-[#475569] hover:border-[#facc15]'
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
                    ? 'bg-[#facc15] text-[#0b0e17] border-white'
                    : 'bg-[#1e2538] text-slate-100 border-[#475569] hover:border-[#facc15]'
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
              className="bg-[#0b0e17] border-2 border-[#facc15] p-3 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="pixel-font text-[8px] text-[#facc15]">
                  ✏️ WRITE YOUR CUSTOM STICKER PROMPT:
                </span>
                {onOpenChatHelper && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose()
                      onOpenChatHelper()
                    }}
                    className="pixel-btn text-[8px] px-2.5 py-1.5 bg-[#1e2538] text-sky-300 border-sky-400"
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
                className="w-full bg-[#151928] border-2 border-[#334155] focus:border-[#facc15] text-white text-xs p-2.5 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="pixel-btn w-full py-2.5 min-h-[42px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] text-[9px] justify-center"
              >
                ✅ USE THIS CUSTOM PROMPT
              </button>
            </div>
          ) : (
            /* Preset Lenses Grid for Active Category */
            <div>
              <span className="pixel-font text-[8px] text-[#facc15] block mb-2">
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
                            ? 'bg-[#9f1239] text-[#facc15] border-[#facc15]'
                            : 'bg-[#1a2033] text-slate-100 border-[#334155] hover:border-[#94a3b8]'
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
      </div>
    </div>
  )
}