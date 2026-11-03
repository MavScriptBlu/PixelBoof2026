/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useMemo} from 'react'
import QRCode from 'qrcode'

export const DEFAULT_BOOTH_QR_URL = 'https://pixelboof.mavscript.blue/mstc26'
export const CLOUD_RUN_ROOT_URL = 'https://pixelboof.cloud.run'
export const CLOUD_RUN_PASS_URL = 'https://pixelboof.cloud.run/mstc26'
export const CLOUD_RUN_FALLBACK_URL =
  'https://pixelbooth-784690008259.us-central1.run.app/?pass=TECHCON26'

/**
 * Generates a real, scannable Reed-Solomon QR code SVG string (Error Correction Level H)
 * styled after the official PixelBoof QR badge (midnight navy #031019, teal finder eyes #1f6f78,
 * aqua data modules #9be7f2, center < caliper > emblem, and "PixelBoof" label).
 */
export function buildPixelBoofQrSvgMarkup(
  rawUrl = DEFAULT_BOOTH_QR_URL,
  {includeTitle = true} = {}
) {
  const targetUrl = (rawUrl || DEFAULT_BOOTH_QR_URL).trim() || DEFAULT_BOOTH_QR_URL

  let qr
  try {
    qr = QRCode.create(targetUrl, {
      errorCorrectionLevel: 'H'
    })
  } catch {
    qr = QRCode.create(DEFAULT_BOOTH_QR_URL, {
      errorCorrectionLevel: 'H'
    })
  }

  const count = qr.modules.size
  const pad = 2.5
  const matrixWidth = count + pad * 2
  const titleSpace = includeTitle ? 6.5 : 0
  const totalHeight = matrixWidth + titleSpace

  // Center logo cutout region (safe under Level H 30% Reed-Solomon error correction)
  const centerIdx = (count - 1) / 2
  const logoRadius = count * 0.145

  const isInFinderPattern = (r, c) => {
    if (r < 7 && c < 7) return true
    if (r < 7 && c >= count - 7) return true
    if (r >= count - 7 && c < 7) return true
    return false
  }

  const isInCenterCutout = (r, c) => {
    const dr = Math.abs(r - centerIdx)
    const dc = Math.abs(c - centerIdx)
    return dr <= logoRadius && dc <= logoRadius
  }

  let dataRects = ''
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isInFinderPattern(r, c) || isInCenterCutout(r, c)) continue
      if (qr.modules.get(r, c)) {
        const x = (pad + c).toFixed(2)
        const y = (pad + r).toFixed(2)
        dataRects += `<rect x="${x}" y="${y}" width="0.94" height="0.94" rx="0.28" fill="#9be7f2"/>`
      }
    }
  }

  const renderFinderEye = (r0, c0) => {
    const x = pad + c0
    const y = pad + r0
    return `
      <rect x="${x}" y="${y}" width="7" height="7" rx="1.35" fill="#1f6f78"/>
      <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="0.85" fill="#031019"/>
      <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.55" fill="#1f6f78"/>
    `
  }

  const finderEyes =
    renderFinderEye(0, 0) +
    renderFinderEye(0, count - 7) +
    renderFinderEye(count - 7, 0)

  const cx = (pad + count / 2).toFixed(2)
  const cy = (pad + count / 2).toFixed(2)
  const badgeScale = (count * 0.25) / 100

  // Center < Caliper > Emblem matching QR_https___pixelboof.mavscript.blue_mstc26.png
  const centerEmblem = `
    <g transform="translate(${cx}, ${cy}) scale(${badgeScale.toFixed(4)})">
      <rect x="-54" y="-54" width="108" height="108" rx="18" fill="#031019"/>
      <!-- Left '<' Code Bracket -->
      <path d="M -22 -14 L -42 0 L -22 14" fill="none" stroke="#2dd4bf" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Right '>' Code Bracket -->
      <path d="M 22 -14 L 42 0 L 22 14" fill="none" stroke="#0ea5e9" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Diagonal Vernier Caliper -->
      <g transform="rotate(30)">
        <rect x="-3.5" y="-44" width="7" height="88" rx="1.5" fill="#031019" stroke="#38bdf8" stroke-width="3.2"/>
        <path d="M -3.5 -40 L -22 -28 L -3.5 -20 Z" fill="#031019" stroke="#2dd4bf" stroke-width="3"/>
        <path d="M 3.5 -36 L 15 -28 L 3.5 -22 Z" fill="#031019" stroke="#38bdf8" stroke-width="2.8"/>
        <path d="M -3.5 -12 L -20 -2 L -3.5 4 Z" fill="#031019" stroke="#2dd4bf" stroke-width="3"/>
        <rect x="-6.5" y="-14" width="13" height="16" rx="2" fill="#071f2e" stroke="#38bdf8" stroke-width="3"/>
        <line x1="-1" y1="-26" x2="2.5" y2="-26" stroke="#9be7f2" stroke-width="2"/>
        <line x1="-1" y1="8" x2="2.5" y2="8" stroke="#9be7f2" stroke-width="2"/>
        <line x1="-1" y1="16" x2="2.5" y2="16" stroke="#9be7f2" stroke-width="2"/>
        <line x1="-1" y1="24" x2="2.5" y2="24" stroke="#9be7f2" stroke-width="2"/>
        <line x1="-1" y1="32" x2="2.5" y2="32" stroke="#9be7f2" stroke-width="2"/>
      </g>
    </g>
  `

  const titleMarkup = includeTitle
    ? `<text x="${(matrixWidth / 2).toFixed(2)}" y="${(
        matrixWidth + 3.9
      ).toFixed(
        2
      )}" text-anchor="middle" fill="#9be7f2" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-weight="800" font-size="3.9" letter-spacing="0.06">PixelBoof</text>`
    : ''

  return `<svg viewBox="0 0 ${matrixWidth.toFixed(2)} ${totalHeight.toFixed(
    2
  )}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PixelBoof QR Code for ${targetUrl.replace(
    /"/g,
    '&quot;'
  )}">
    <rect width="${matrixWidth.toFixed(2)}" height="${totalHeight.toFixed(
    2
  )}" rx="1.6" fill="#031019"/>
    ${finderEyes}
    ${dataRects}
    ${centerEmblem}
    ${titleMarkup}
  </svg>`
}

/**
 * Downloads the high-resolution PNG of the PixelBoof QR badge.
 */
export async function downloadPixelBoofQrPng(
  url = DEFAULT_BOOTH_QR_URL,
  fileName = 'QR_https___pixelboof.mavscript.blue_mstc26.png'
) {
  const svgString = buildPixelBoofQrSvgMarkup(url, {includeTitle: true})
  const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'})
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = objectUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 1060
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#031019'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export default function PixelBoofQrCard({
  url = DEFAULT_BOOTH_QR_URL,
  size = 180,
  includeTitle = true,
  className = ''
}) {
  const svgMarkup = useMemo(
    () => buildPixelBoofQrSvgMarkup(url, {includeTitle}),
    [url, includeTitle]
  )

  const height = includeTitle ? Math.round(size * 1.17) : size

  return (
    <div
      className={`inline-flex flex-col items-center justify-center bg-[#031019] p-2.5 border-2 border-[#1f6f78] shadow-[4px_4px_0_#000] select-none ${className}`}
      style={{width: size + 20}}
    >
      <div
        className="w-full flex items-center justify-center"
        style={{width: size, height}}
        dangerouslySetInnerHTML={{__html: svgMarkup}}
      />
    </div>
  )
}
