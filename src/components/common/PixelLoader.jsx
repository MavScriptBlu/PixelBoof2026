/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Retro 8-bit / 16-bit stepped pixel loading spinner & sprite animation.
 * Replaces generic loading text while Gemini AI generates or edits stickers.
 */
export default function PixelLoader({size = 'sm'}) {
  const isLarge = size === 'lg'
  const isMedium = size === 'md'

  if (isLarge) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 p-4 select-none pointer-events-none"
        role="status"
        aria-label="Generating pixel sticker"
      >
        {/* 8-Bit 3x3 Pixel Matrix Spinner */}
        <div className="pixel-spinner-grid-lg bg-[#120d18]/90 p-2.5 border-2 border-[#ffcc00] shadow-[4px_4px_0_#000]">
          <span className="pixel-cell c1" />
          <span className="pixel-cell c2" />
          <span className="pixel-cell c3" />
          <span className="pixel-cell c8" />
          <span className="pixel-cell-center" />
          <span className="pixel-cell c4" />
          <span className="pixel-cell c7" />
          <span className="pixel-cell c6" />
          <span className="pixel-cell c5" />
        </div>

        {/* Stepped 8-bit Arcade Progress Bar */}
        <div className="w-28 h-3.5 bg-[#120d18] border-2 border-[#f7f7f7] p-0.5 shadow-[2px_2px_0_#000]">
          <div className="h-full pixel-progress-fill" />
        </div>
      </div>
    )
  }

  if (isMedium) {
    return (
      <div
        className="flex items-center justify-center gap-1 select-none"
        role="status"
        aria-label="Processing"
      >
        <span className="w-2 h-2 bg-[#ffcc00] pixel-bounce-1" />
        <span className="w-2 h-2 bg-[#06b6d4] pixel-bounce-2" />
        <span className="w-2 h-2 bg-[#8B1E41] border border-[#ffcc00] pixel-bounce-3" />
      </div>
    )
  }

  // Small ('sm') — Fits right inside the bottom-corner PhotoBar thumbnail
  return (
    <div
      className="flex flex-col items-center justify-center gap-1.5 select-none pointer-events-none"
      role="status"
      aria-label="Generating pixel sticker"
    >
      <div className="pixel-spinner-grid-sm bg-[#120d18]/90 p-1 border border-[#ffcc00] shadow-[2px_2px_0_#000]">
        <span className="pixel-cell c1" />
        <span className="pixel-cell c2" />
        <span className="pixel-cell c3" />
        <span className="pixel-cell c8" />
        <span className="pixel-cell-center" />
        <span className="pixel-cell c4" />
        <span className="pixel-cell c7" />
        <span className="pixel-cell c6" />
        <span className="pixel-cell c5" />
      </div>
      <div className="w-8 h-1.5 bg-[#120d18] border border-[#f7f7f7] p-[1px]">
        <div className="h-full pixel-progress-fill" />
      </div>
    </div>
  )
}
