/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {limitFunction} from 'p-limit'
import modes from './modes'

const timeoutMs = 120_000

/**
 * Generates a real pixel-transformed die-cut sticker from the captured photo on an HTML5 canvas.
 * Used both for instant pixel preview and as a resilient fallback when the server API key is unavailable.
 */
export async function transformPhotoToPixelSticker(
  inputFile,
  modeKey = '8bit',
  customText = ''
) {
  const modeObj = modes[modeKey] ||
    modes['8bit'] || {
      name: '8-bit',
      emoji: '🎮',
      color: '#06b6d4'
    }

  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 480
  const ctx = canvas.getContext('2d')

  // Outer transparent canvas with crisp white die-cut sticker border
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(28, 28, 424, 424, 48)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
  ctx.shadowBlur = 16
  ctx.fill()
  ctx.restore()

  // Inner sticker card background with MSTC Burgundy + Mode Accent gradient
  const grad = ctx.createLinearGradient(42, 42, 438, 438)
  grad.addColorStop(0, '#8B1E41')
  grad.addColorStop(0.55, '#1d1526')
  grad.addColorStop(1, modeObj.color || '#06b6d4')
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(42, 42, 396, 396, 36)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.clip()

  if (inputFile) {
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = inputFile
      })

      const pixelSize = 56
      const offCanvas = document.createElement('canvas')
      offCanvas.width = pixelSize
      offCanvas.height = pixelSize
      const offCtx = offCanvas.getContext('2d')
      offCtx.imageSmoothingEnabled = false

      const minDim = Math.min(img.width, img.height)
      const sx = (img.width - minDim) / 2
      const sy = (img.height - minDim) / 2
      offCtx.drawImage(img, sx, sy, minDim, minDim, 0, 0, pixelSize, pixelSize)

      const imgData = offCtx.getImageData(0, 0, pixelSize, pixelSize)
      const data = imgData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.round(data[i] / 42) * 42 + 12)
        data[i + 1] = Math.min(255, Math.round(data[i + 1] / 42) * 42 + 8)
        data[i + 2] = Math.min(255, Math.round(data[i + 2] / 42) * 42 + 16)
      }
      offCtx.putImageData(imgData, 0, 0)

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(offCanvas, 0, 0, pixelSize, pixelSize, 58, 54, 364, 310)

      ctx.fillStyle = 'rgba(20, 15, 29, 0.16)'
      for (let y = 54; y < 364; y += 6) {
        ctx.fillRect(58, y, 364, 2)
      }

      ctx.strokeStyle = '#ffcc00'
      ctx.lineWidth = 4
      ctx.strokeRect(58, 54, 364, 310)
    } catch {
      ctx.fillStyle = '#ffcc00'
      ctx.font = 'bold 96px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(modeObj.emoji || '🎮', 240, 195)
    }
  } else {
    ctx.fillStyle = '#ffcc00'
    ctx.font = 'bold 96px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(modeObj.emoji || '🎮', 240, 195)
  }

  // Corner emoji badge
  ctx.fillStyle = '#120d18'
  ctx.beginPath()
  ctx.arc(392, 86, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#ffcc00'
  ctx.stroke()
  ctx.font = '26px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(modeObj.emoji || '🎮', 392, 88)

  // Bottom Arcade Sticker Nameplate Banner
  ctx.fillStyle = '#120d18'
  ctx.fillRect(58, 372, 364, 52)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.strokeRect(58, 372, 364, 52)

  ctx.fillStyle = '#ffcc00'
  ctx.font = 'bold 16px "Press Start 2P", monospace'
  ctx.textAlign = 'center'
  const label = (
    customText ? customText.slice(0, 18) : modeObj.name
  ).toUpperCase()
  ctx.fillText(label, 240, 393)

  ctx.fillStyle = '#06b6d4'
  ctx.font = 'bold 11px monospace'
  ctx.fillText('MSTC TECH-CON EDITION · PIXEL BOOF', 240, 413)

  ctx.restore()

  ctx.beginPath()
  ctx.roundRect(42, 42, 396, 396, 36)
  ctx.lineWidth = 4
  ctx.strokeStyle = '#ffcc00'
  ctx.stroke()

  return canvas.toDataURL('image/png')
}

export default limitFunction(
  async ({
    model = 'gemini-nano-banana-2.1',
    prompt,
    inputFile,
    aspectRatio = '1:1',
    imageSize = '1K',
    modeKey,
    customPrompt,
    signal
  }) => {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      if (signal) {
        signal.addEventListener('abort', () => controller.abort())
      }

      const response = await fetch('/api/generate-sticker', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model,
          prompt,
          inputFile,
          aspectRatio,
          imageSize
        }),
        signal: controller.signal
      })

      clearTimeout(timer)

      if (response.ok) {
        const data = await response.json()
        if (data?.imageUrl) {
          return data.imageUrl
        }
      }

      return await transformPhotoToPixelSticker(
        inputFile,
        modeKey,
        customPrompt
      )
    } catch (error) {
      if (signal?.aborted) {
        return undefined
      }
      console.warn(
        'Using local canvas pixel sticker transformation fallback:',
        error
      )
      return await transformPhotoToPixelSticker(
        inputFile,
        modeKey,
        customPrompt
      )
    }
  },
  {concurrency: 1}
)
