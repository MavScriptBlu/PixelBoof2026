/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Crisp 8-bit stepped pixel & geometric SVG icon registry.
 * Replaces all OS/Unicode emojis across the photobooth so every icon aligns
 * cleanly with Press Start 2P typography and scales without baseline shift.
 */
export function PixelIcon({name = 'star', size = 14, className = ''}) {
  const renderPaths = () => {
    switch (name) {
      case 'play':
        return (
          <>
            <rect x="4" y="2" width="2" height="12" fill="currentColor" />
            <rect x="6" y="3" width="2" height="10" fill="currentColor" />
            <rect x="8" y="4" width="2" height="8" fill="currentColor" />
            <rect x="10" y="5" width="2" height="6" fill="currentColor" />
            <rect x="12" y="6" width="2" height="4" fill="currentColor" />
            <rect x="14" y="7" width="1" height="2" fill="currentColor" />
          </>
        )
      case 'chevron-up':
        return (
          <>
            <rect x="7" y="4" width="2" height="2" fill="currentColor" />
            <rect x="5" y="6" width="6" height="2" fill="currentColor" />
            <rect x="3" y="8" width="10" height="2" fill="currentColor" />
            <rect x="1" y="10" width="14" height="2" fill="currentColor" />
          </>
        )
      case 'camera':
        return (
          <>
            <rect x="5" y="2" width="6" height="2" fill="currentColor" />
            <rect x="1" y="4" width="14" height="10" fill="currentColor" />
            <rect x="3" y="6" width="2" height="1" fill="#0b0e17" />
            <rect x="6" y="6" width="4" height="6" fill="#0b0e17" />
            <rect x="5" y="7" width="6" height="4" fill="#0b0e17" />
            <rect x="7" y="7" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'gallery':
      case 'image':
        return (
          <>
            <rect x="1" y="2" width="14" height="2" fill="currentColor" />
            <rect x="1" y="12" width="14" height="2" fill="currentColor" />
            <rect x="1" y="4" width="2" height="8" fill="currentColor" />
            <rect x="13" y="4" width="2" height="8" fill="currentColor" />
            <rect x="4" y="5" width="2" height="2" fill="currentColor" />
            <rect x="8" y="7" width="2" height="2" fill="currentColor" />
            <rect x="6" y="9" width="6" height="2" fill="currentColor" />
            <rect x="4" y="10" width="9" height="1" fill="currentColor" />
          </>
        )
      case 'ticket':
      case 'sticker':
        return (
          <>
            <rect x="1" y="3" width="14" height="2" fill="currentColor" />
            <rect x="1" y="11" width="14" height="2" fill="currentColor" />
            <rect x="1" y="5" width="2" height="2" fill="currentColor" />
            <rect x="1" y="9" width="2" height="2" fill="currentColor" />
            <rect x="13" y="5" width="2" height="2" fill="currentColor" />
            <rect x="13" y="9" width="2" height="2" fill="currentColor" />
            <rect x="7" y="6" width="2" height="4" fill="currentColor" />
            <rect x="6" y="7" width="4" height="2" fill="currentColor" />
          </>
        )
      case 'download':
        return (
          <>
            <rect x="7" y="2" width="2" height="7" fill="currentColor" />
            <rect x="4" y="6" width="2" height="2" fill="currentColor" />
            <rect x="10" y="6" width="2" height="2" fill="currentColor" />
            <rect x="5" y="8" width="6" height="2" fill="currentColor" />
            <rect x="7" y="10" width="2" height="1" fill="currentColor" />
            <rect x="2" y="11" width="2" height="3" fill="currentColor" />
            <rect x="12" y="11" width="2" height="3" fill="currentColor" />
            <rect x="2" y="13" width="12" height="2" fill="currentColor" />
          </>
        )
      case 'upload':
      case 'folder':
        return (
          <>
            <rect x="1" y="3" width="6" height="2" fill="currentColor" />
            <rect x="1" y="5" width="14" height="9" fill="currentColor" />
            <rect x="3" y="7" width="10" height="5" fill="#0b0e17" />
            <rect x="7" y="8" width="2" height="3" fill="currentColor" />
            <rect x="6" y="9" width="4" height="1" fill="currentColor" />
          </>
        )
      case 'flip':
      case 'reset':
        return (
          <>
            <rect x="4" y="2" width="8" height="2" fill="currentColor" />
            <rect x="2" y="4" width="2" height="4" fill="currentColor" />
            <rect x="12" y="2" width="2" height="4" fill="currentColor" />
            <rect x="10" y="5" width="4" height="2" fill="currentColor" />
            <rect x="12" y="8" width="2" height="4" fill="currentColor" />
            <rect x="4" y="12" width="8" height="2" fill="currentColor" />
            <rect x="2" y="10" width="2" height="4" fill="currentColor" />
            <rect x="2" y="9" width="4" height="2" fill="currentColor" />
          </>
        )
      case 'sparkle':
      case 'magic':
        return (
          <>
            <rect x="7" y="1" width="2" height="14" fill="currentColor" />
            <rect x="1" y="7" width="14" height="2" fill="currentColor" />
            <rect x="5" y="5" width="6" height="6" fill="currentColor" />
            <rect x="3" y="3" width="2" height="2" fill="currentColor" />
            <rect x="11" y="3" width="2" height="2" fill="currentColor" />
            <rect x="3" y="11" width="2" height="2" fill="currentColor" />
            <rect x="11" y="11" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'pencil':
      case 'edit':
        return (
          <>
            <rect x="11" y="2" width="3" height="3" fill="currentColor" />
            <rect x="9" y="4" width="3" height="3" fill="currentColor" />
            <rect x="7" y="6" width="3" height="3" fill="currentColor" />
            <rect x="5" y="8" width="3" height="3" fill="currentColor" />
            <rect x="3" y="10" width="3" height="3" fill="currentColor" />
            <rect x="2" y="12" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'check':
        return (
          <>
            <rect x="12" y="3" width="2" height="2" fill="currentColor" />
            <rect x="10" y="5" width="2" height="2" fill="currentColor" />
            <rect x="8" y="7" width="2" height="2" fill="currentColor" />
            <rect x="6" y="9" width="2" height="2" fill="currentColor" />
            <rect x="4" y="11" width="2" height="2" fill="currentColor" />
            <rect x="2" y="9" width="2" height="2" fill="currentColor" />
            <rect x="1" y="7" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'trash':
        return (
          <>
            <rect x="5" y="1" width="6" height="2" fill="currentColor" />
            <rect x="2" y="3" width="12" height="2" fill="currentColor" />
            <rect x="3" y="5" width="10" height="10" fill="currentColor" />
            <rect x="5" y="7" width="2" height="6" fill="#0b0e17" />
            <rect x="9" y="7" width="2" height="6" fill="#0b0e17" />
          </>
        )
      case 'mail':
      case 'send':
        return (
          <>
            <rect x="1" y="3" width="14" height="10" fill="currentColor" />
            <rect x="3" y="5" width="2" height="2" fill="#0b0e17" />
            <rect x="11" y="5" width="2" height="2" fill="#0b0e17" />
            <rect x="5" y="7" width="2" height="2" fill="#0b0e17" />
            <rect x="9" y="7" width="2" height="2" fill="#0b0e17" />
            <rect x="7" y="8" width="2" height="2" fill="#0b0e17" />
          </>
        )
      case 'warning':
        return (
          <>
            <rect x="7" y="2" width="2" height="2" fill="currentColor" />
            <rect x="5" y="4" width="6" height="3" fill="currentColor" />
            <rect x="3" y="7" width="10" height="3" fill="currentColor" />
            <rect x="1" y="10" width="14" height="4" fill="currentColor" />
            <rect x="7" y="5" width="2" height="4" fill="#0b0e17" />
            <rect x="7" y="11" width="2" height="2" fill="#0b0e17" />
          </>
        )
      case 'question':
      case 'random':
        return (
          <>
            <rect x="2" y="2" width="12" height="12" fill="currentColor" />
            <rect x="6" y="4" width="4" height="2" fill="#0b0e17" />
            <rect x="8" y="6" width="2" height="2" fill="#0b0e17" />
            <rect x="7" y="8" width="2" height="2" fill="#0b0e17" />
            <rect x="7" y="11" width="2" height="2" fill="#0b0e17" />
          </>
        )
      case 'bot':
      case 'chat':
        return (
          <>
            <rect x="1" y="2" width="14" height="10" fill="currentColor" />
            <rect x="4" y="12" width="3" height="2" fill="currentColor" />
            <rect x="3" y="14" width="2" height="1" fill="currentColor" />
            <rect x="4" y="5" width="2" height="2" fill="#0b0e17" />
            <rect x="6" y="7" width="2" height="2" fill="#0b0e17" />
            <rect x="4" y="9" width="2" height="1" fill="#0b0e17" />
            <rect x="9" y="9" width="3" height="1" fill="#0b0e17" />
          </>
        )
      case 'sound-on':
        return (
          <>
            <rect x="2" y="6" width="3" height="4" fill="currentColor" />
            <rect x="5" y="4" width="2" height="8" fill="currentColor" />
            <rect x="7" y="2" width="2" height="12" fill="currentColor" />
            <rect x="11" y="5" width="1" height="2" fill="currentColor" />
            <rect x="12" y="7" width="1" height="2" fill="currentColor" />
            <rect x="11" y="9" width="1" height="2" fill="currentColor" />
            <rect x="13" y="3" width="1" height="2" fill="currentColor" />
            <rect x="14" y="5" width="1" height="6" fill="currentColor" />
            <rect x="13" y="11" width="1" height="2" fill="currentColor" />
          </>
        )
      case 'sound-off':
        return (
          <>
            <rect x="2" y="6" width="3" height="4" fill="currentColor" />
            <rect x="5" y="4" width="2" height="8" fill="currentColor" />
            <rect x="7" y="2" width="2" height="12" fill="currentColor" />
            <rect x="10" y="5" width="2" height="2" fill="currentColor" />
            <rect x="14" y="5" width="2" height="2" fill="currentColor" />
            <rect x="12" y="7" width="2" height="2" fill="currentColor" />
            <rect x="10" y="9" width="2" height="2" fill="currentColor" />
            <rect x="14" y="9" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'eye':
        return (
          <>
            <rect x="4" y="4" width="8" height="2" fill="currentColor" />
            <rect x="2" y="6" width="12" height="4" fill="currentColor" />
            <rect x="4" y="10" width="8" height="2" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="#0b0e17" />
            <rect x="7" y="7" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'share':
        return (
          <>
            <rect x="10" y="2" width="4" height="4" fill="currentColor" />
            <rect x="2" y="6" width="4" height="4" fill="currentColor" />
            <rect x="10" y="10" width="4" height="4" fill="currentColor" />
            <rect x="6" y="5" width="4" height="2" fill="currentColor" />
            <rect x="6" y="9" width="4" height="2" fill="currentColor" />
          </>
        )
      case 'copy':
        return (
          <>
            <rect x="2" y="2" width="8" height="8" fill="currentColor" />
            <rect x="4" y="4" width="4" height="4" fill="#0b0e17" />
            <rect x="6" y="6" width="8" height="8" fill="currentColor" />
          </>
        )
      case 'arcade':
        return (
          <>
            <rect x="1" y="4" width="14" height="8" fill="currentColor" />
            <rect x="4" y="6" width="2" height="4" fill="#0b0e17" />
            <rect x="3" y="7" width="4" height="2" fill="#0b0e17" />
            <rect x="10" y="8" width="2" height="2" fill="#0b0e17" />
            <rect x="12" y="6" width="2" height="2" fill="#0b0e17" />
          </>
        )
      case 'sword':
        return (
          <>
            <rect x="12" y="2" width="2" height="2" fill="currentColor" />
            <rect x="10" y="4" width="2" height="2" fill="currentColor" />
            <rect x="8" y="6" width="2" height="2" fill="currentColor" />
            <rect x="6" y="8" width="2" height="2" fill="currentColor" />
            <rect x="3" y="8" width="3" height="2" fill="currentColor" />
            <rect x="6" y="10" width="2" height="3" fill="currentColor" />
            <rect x="2" y="12" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'shield':
        return (
          <>
            <rect x="2" y="2" width="12" height="6" fill="currentColor" />
            <rect x="3" y="8" width="10" height="3" fill="currentColor" />
            <rect x="5" y="11" width="6" height="2" fill="currentColor" />
            <rect x="7" y="13" width="2" height="2" fill="currentColor" />
            <rect x="7" y="4" width="2" height="6" fill="#0b0e17" />
            <rect x="5" y="6" width="6" height="2" fill="#0b0e17" />
          </>
        )
      case 'bolt':
        return (
          <>
            <rect x="8" y="1" width="4" height="3" fill="currentColor" />
            <rect x="6" y="4" width="4" height="3" fill="currentColor" />
            <rect x="4" y="7" width="8" height="2" fill="currentColor" />
            <rect x="6" y="9" width="4" height="3" fill="currentColor" />
            <rect x="4" y="12" width="3" height="3" fill="currentColor" />
          </>
        )
      case 'paw':
        return (
          <>
            <rect x="2" y="4" width="2" height="3" fill="currentColor" />
            <rect x="5" y="2" width="2" height="3" fill="currentColor" />
            <rect x="9" y="2" width="2" height="3" fill="currentColor" />
            <rect x="12" y="4" width="2" height="3" fill="currentColor" />
            <rect x="4" y="7" width="8" height="5" fill="currentColor" />
            <rect x="3" y="9" width="10" height="4" fill="currentColor" />
          </>
        )
      case 'card':
        return (
          <>
            <rect x="3" y="1" width="10" height="14" fill="currentColor" />
            <rect x="5" y="3" width="6" height="5" fill="#0b0e17" />
            <rect x="5" y="10" width="6" height="2" fill="#0b0e17" />
          </>
        )
      case 'heart':
        return (
          <>
            <rect x="2" y="3" width="4" height="2" fill="currentColor" />
            <rect x="10" y="3" width="4" height="2" fill="currentColor" />
            <rect x="1" y="5" width="14" height="4" fill="currentColor" />
            <rect x="3" y="9" width="10" height="2" fill="currentColor" />
            <rect x="5" y="11" width="6" height="2" fill="currentColor" />
            <rect x="7" y="13" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'trophy':
        return (
          <>
            <rect x="4" y="2" width="8" height="6" fill="currentColor" />
            <rect x="2" y="3" width="2" height="3" fill="currentColor" />
            <rect x="12" y="3" width="2" height="3" fill="currentColor" />
            <rect x="6" y="8" width="4" height="2" fill="currentColor" />
            <rect x="7" y="10" width="2" height="2" fill="currentColor" />
            <rect x="4" y="12" width="8" height="2" fill="currentColor" />
          </>
        )
      case 'crown':
        return (
          <>
            <rect x="1" y="4" width="2" height="8" fill="currentColor" />
            <rect x="7" y="3" width="2" height="9" fill="currentColor" />
            <rect x="13" y="4" width="2" height="8" fill="currentColor" />
            <rect x="3" y="7" width="4" height="5" fill="currentColor" />
            <rect x="9" y="7" width="4" height="5" fill="currentColor" />
            <rect x="1" y="12" width="14" height="2" fill="currentColor" />
          </>
        )
      case 'moon':
        return (
          <>
            <rect x="6" y="2" width="6" height="2" fill="currentColor" />
            <rect x="4" y="4" width="4" height="2" fill="currentColor" />
            <rect x="3" y="6" width="4" height="4" fill="currentColor" />
            <rect x="4" y="10" width="4" height="2" fill="currentColor" />
            <rect x="6" y="12" width="6" height="2" fill="currentColor" />
          </>
        )
      case 'qr':
      case 'phone':
        return (
          <>
            <rect x="1" y="1" width="6" height="6" fill="currentColor" />
            <rect x="2" y="2" width="4" height="4" fill="#0b0e17" />
            <rect x="3" y="3" width="2" height="2" fill="currentColor" />
            <rect x="9" y="1" width="6" height="6" fill="currentColor" />
            <rect x="10" y="2" width="4" height="4" fill="#0b0e17" />
            <rect x="11" y="3" width="2" height="2" fill="currentColor" />
            <rect x="1" y="9" width="6" height="6" fill="currentColor" />
            <rect x="2" y="10" width="4" height="4" fill="#0b0e17" />
            <rect x="3" y="11" width="2" height="2" fill="currentColor" />
            <rect x="9" y="9" width="2" height="2" fill="currentColor" />
            <rect x="13" y="9" width="2" height="2" fill="currentColor" />
            <rect x="11" y="11" width="2" height="2" fill="currentColor" />
            <rect x="9" y="13" width="2" height="2" fill="currentColor" />
            <rect x="13" y="13" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'guide':
      case 'clipboard':
        return (
          <>
            <rect x="5" y="1" width="6" height="2" fill="currentColor" />
            <rect x="2" y="2" width="12" height="13" fill="currentColor" />
            <rect x="4" y="4" width="8" height="9" fill="#0b0e17" />
            <rect x="5" y="6" width="6" height="1" fill="currentColor" />
            <rect x="5" y="8" width="6" height="1" fill="currentColor" />
            <rect x="5" y="10" width="4" height="1" fill="currentColor" />
          </>
        )
      case 'lock':
        return (
          <>
            <rect x="5" y="2" width="6" height="2" fill="currentColor" />
            <rect x="4" y="4" width="2" height="3" fill="currentColor" />
            <rect x="10" y="4" width="2" height="3" fill="currentColor" />
            <rect x="2" y="7" width="12" height="8" fill="currentColor" />
            <rect x="7" y="9" width="2" height="3" fill="#0b0e17" />
          </>
        )
      case 'unlock':
        return (
          <>
            <rect x="5" y="1" width="6" height="2" fill="currentColor" />
            <rect x="10" y="3" width="2" height="4" fill="currentColor" />
            <rect x="2" y="7" width="12" height="8" fill="currentColor" />
            <rect x="7" y="9" width="2" height="3" fill="#0b0e17" />
          </>
        )
      case 'print':
        return (
          <>
            <rect x="4" y="1" width="8" height="3" fill="currentColor" />
            <rect x="1" y="4" width="14" height="7" fill="currentColor" />
            <rect x="11" y="6" width="2" height="2" fill="#0b0e17" />
            <rect x="4" y="9" width="8" height="6" fill="currentColor" />
            <rect x="5" y="10" width="6" height="4" fill="#0b0e17" />
          </>
        )
      case 'terminal':
      case 'code':
        return (
          <>
            <rect x="1" y="2" width="14" height="12" fill="currentColor" />
            <rect x="3" y="4" width="10" height="8" fill="#0b0e17" />
            <rect x="4" y="5" width="2" height="2" fill="currentColor" />
            <rect x="6" y="7" width="2" height="2" fill="currentColor" />
            <rect x="4" y="9" width="2" height="2" fill="currentColor" />
            <rect x="8" y="9" width="4" height="2" fill="currentColor" />
          </>
        )
      case 'star':
      default:
        return (
          <>
            <rect x="7" y="1" width="2" height="3" fill="currentColor" />
            <rect x="6" y="4" width="4" height="2" fill="currentColor" />
            <rect x="2" y="6" width="12" height="2" fill="currentColor" />
            <rect x="4" y="8" width="8" height="2" fill="currentColor" />
            <rect x="3" y="10" width="4" height="2" fill="currentColor" />
            <rect x="9" y="10" width="4" height="2" fill="currentColor" />
            <rect x="2" y="12" width="3" height="2" fill="currentColor" />
            <rect x="11" y="12" width="3" height="2" fill="currentColor" />
          </>
        )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`shrink-0 inline-block align-middle ${className}`}
      style={{imageRendering: 'pixelated'}}
      aria-hidden="true"
    >
      {renderPaths()}
    </svg>
  )
}

/**
 * Clean, geometric 8-bit "MSTC IT" arcade badge used across the Header and Modals.
 * Features a sharp geometric diamond crest (no cartoon robot face or emoji).
 */
export function MstcBadge({size = 'md'}) {
  const isSm = size === 'sm'
  return (
    <div
      className={`inline-flex items-center bg-[#121629] border-2 border-[#facc15] shadow-[2px_2px_0_#05070f] shrink-0 select-none ${
        isSm
          ? 'gap-1.5 px-1.5 py-0.5'
          : 'gap-1.5 sm:gap-2 px-2 py-1 sm:px-2.5 sm:py-1'
      }`}
    >
      {/* Crisp Geometric Pixel Diamond / Chevron Crest SVG */}
      <svg
        width={isSm ? 10 : 12}
        height={isSm ? 10 : 12}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="shrink-0 block"
        style={{imageRendering: 'pixelated'}}
        aria-hidden="true"
      >
        <rect x="5" y="1" width="2" height="2" fill="#facc15" />
        <rect x="3" y="3" width="6" height="2" fill="#9f1239" />
        <rect x="1" y="5" width="10" height="2" fill="#facc15" />
        <rect x="3" y="7" width="6" height="2" fill="#9f1239" />
        <rect x="5" y="9" width="2" height="2" fill="#facc15" />
        <rect x="5" y="5" width="2" height="2" fill="#0b0e17" />
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
        shapeRendering="crispEdges"
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
