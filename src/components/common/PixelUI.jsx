/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Retro 8-bit "MSTC IT" arcade badge emblem used across the Header and Modals.
 */
export function MstcBadge({size = 'md'}) {
  const isSm = size === 'sm'
  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-[#121629] border-2 border-[#facc15] shadow-[2px_2px_0_#05070f] shrink-0 select-none ${
        isSm ? 'px-1.5 py-0.5' : 'px-2 py-1'
      }`}
    >
      {/* Crisp 8-Bit Pixel Robot / Terminal Emblem SVG */}
      <svg
        width={isSm ? 13 : 15}
        height={isSm ? 13 : 15}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{imageRendering: 'pixelated'}}
        aria-hidden="true"
      >
        {/* Antenna */}
        <rect x="5" y="0" width="2" height="2" fill="#facc15" />
        {/* Head Frame */}
        <rect x="2" y="2" width="8" height="7" fill="#9f1239" />
        <rect x="3" y="3" width="6" height="5" fill="#1e293b" />
        {/* Glowing Cyan Pixel Eyes */}
        <rect x="4" y="4" width="1.5" height="2" fill="#38bdf8" />
        <rect x="6.5" y="4" width="1.5" height="2" fill="#38bdf8" />
        {/* Smile / Visor Bar */}
        <rect x="4" y="7" width="4" height="1" fill="#facc15" />
        {/* Side Ears */}
        <rect x="1" y="4" width="1" height="3" fill="#facc15" />
        <rect x="10" y="4" width="1" height="3" fill="#facc15" />
        {/* Base */}
        <rect x="3" y="9" width="6" height="2" fill="#64748b" />
      </svg>
      <span
        className={`pixel-font text-[#facc15] tracking-tight leading-none ${
          isSm ? 'text-[7px]' : 'text-[8px] sm:text-[9px]'
        }`}
      >
        MSTC IT
      </span>
    </div>
  )
}

/**
 * Tactile 16-bit Arcade Close Button with a crisp, symmetrical stepped-pixel SVG 'X'
 * instead of a system fallback glyph.
 */
export function PixelCloseButton({
  id,
  onClick,
  ariaLabel = 'Close modal',
  size = 'md',
  className = ''
}) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const svgSize = size === 'sm' ? 12 : 14

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`pixel-close-btn ${sizeClasses} flex items-center justify-center shrink-0 group ${className}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-100 group-hover:scale-110"
        style={{imageRendering: 'pixelated'}}
        aria-hidden="true"
      >
        {/* Stepped 8-bit Pixel X */}
        <rect x="1" y="1" width="2" height="2" fill="currentColor" />
        <rect x="11" y="1" width="2" height="2" fill="currentColor" />
        <rect x="3" y="3" width="2" height="2" fill="currentColor" />
        <rect x="9" y="3" width="2" height="2" fill="currentColor" />
        <rect x="5" y="5" width="4" height="4" fill="currentColor" />
        <rect x="3" y="9" width="2" height="2" fill="currentColor" />
        <rect x="9" y="9" width="2" height="2" fill="currentColor" />
        <rect x="1" y="11" width="2" height="2" fill="currentColor" />
        <rect x="11" y="11" width="2" height="2" fill="currentColor" />
      </svg>
    </button>
  )
}
