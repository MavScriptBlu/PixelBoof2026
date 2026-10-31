/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {limitFunction} from 'p-limit'
import modes from './modes'

const timeoutMs = 120_000

/**
 * Post-processes any generated sticker image into a 100% Cricut-ready transparent PNG:
 * 1. Strips the flat black/solid background from the outside edges using flood-fill.
 * 2. Keeps ONLY the main central character/sticker island (eliminating any corner watermarks or stray specks).
 * 3. Fills all interior holes so dark hair, eyes, or inner outlines inside the sticker are never lost.
 * 4. Adds a smooth, continuous solid white (#FFFFFF) die-cut contour border around the sticker with a 100% transparent exterior.
 */
export async function makeCricutReadyTransparentSticker(inputDataUrl) {
  if (!inputDataUrl) return inputDataUrl

  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = inputDataUrl
    })

    const size = 640
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', {willReadFrequently: true})

    // Draw image centered inside a safe margin so the die-cut border never clips the canvas edge
    const pad = 20
    const drawSize = size - pad * 2
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, pad, pad, drawSize, drawSize)

    const imgData = ctx.getImageData(0, 0, size, size)
    const data = imgData.data
    const totalPixels = size * size

    // Sample perimeter inside the padded frame to detect primary background color
    const borderSamples = []
    for (let i = pad; i < size - pad; i += 4) {
      const topIdx = (pad * size + i) * 4
      const leftIdx = (i * size + pad) * 4
      const topLeftBottomIdx = ((size - pad - 1) * size + i) * 4
      if (data[topIdx + 3] > 20) {
        borderSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]])
      }
      if (data[leftIdx + 3] > 20) {
        borderSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]])
      }
      if (i < size * 0.8 && data[topLeftBottomIdx + 3] > 20) {
        borderSamples.push([
          data[topLeftBottomIdx],
          data[topLeftBottomIdx + 1],
          data[topLeftBottomIdx + 2]
        ])
      }
    }

    let bgR = 0
    let bgG = 0
    let bgB = 0
    if (borderSamples.length > 0) {
      borderSamples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))
      const mid = borderSamples[Math.floor(borderSamples.length / 2)]
      bgR = mid[0]
      bgG = mid[1]
      bgB = mid[2]
    }
    const isDarkBg = bgR < 75 && bgG < 75 && bgB < 75

    // Helper: is pixel at index pIdx part of the outer background?
    const isBackgroundColor = pIdx => {
      const i4 = pIdx * 4
      const a = data[i4 + 3]
      if (a < 40) return true
      const r = data[i4]
      const g = data[i4 + 1]
      const b = data[i4 + 2]

      // Never treat bright white sticker border pixels as background
      if (r > 210 && g > 210 && b > 210) return false

      if (isDarkBg) {
        const maxCh = Math.max(r, g, b)
        if (maxCh < 68) return true
      }

      const dr = r - bgR
      const dg = g - bgG
      const db = b - bgB
      const distSq = dr * dr + dg * dg + db * db
      return distSq < 3800 // ~61.6 RGB distance
    }

    // 1. Flood-fill background from edges (and mask out the bottom-right corner watermark region if it's detached/faint)
    const isBg = new Uint8Array(totalPixels)
    const queue = new Int32Array(totalPixels)
    let head = 0
    let tail = 0

    const pushBg = idx => {
      if (!isBg[idx]) {
        isBg[idx] = 1
        queue[tail++] = idx
      }
    }

    // Seed outer padding frame & image perimeter
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isOuterPad =
          x <= pad || x >= size - pad - 1 || y <= pad || y >= size - pad - 1
        // Also strip potential AI watermark in extreme bottom-right corner of the raw image
        const isCornerWatermarkZone =
          x > size - pad - Math.round(drawSize * 0.14) &&
          y > size - pad - Math.round(drawSize * 0.09)

        if (isOuterPad || isCornerWatermarkZone) {
          const idx = y * size + x
          if (isOuterPad || isBackgroundColor(idx) || y > size - pad - 28) {
            pushBg(idx)
          }
        }
      }
    }

    while (head < tail) {
      const curr = queue[head++]
      const cx = curr % size
      const cy = (curr - cx) / size

      if (cx > 0) {
        const n = curr - 1
        if (!isBg[n] && isBackgroundColor(n)) pushBg(n)
      }
      if (cx < size - 1) {
        const n = curr + 1
        if (!isBg[n] && isBackgroundColor(n)) pushBg(n)
      }
      if (cy > 0) {
        const n = curr - size
        if (!isBg[n] && isBackgroundColor(n)) pushBg(n)
      }
      if (cy < size - 1) {
        const n = curr + size
        if (!isBg[n] && isBackgroundColor(n)) pushBg(n)
      }
    }

    // 2. Keep ONLY the largest central foreground connected component (removes any floating watermarks or stray islands)
    const fgMask = new Uint8Array(totalPixels)
    for (let i = 0; i < totalPixels; i++) {
      if (!isBg[i]) fgMask[i] = 1
    }

    const visited = new Uint8Array(totalPixels)
    let bestComp = null
    let bestScore = -1

    for (let i = 0; i < totalPixels; i++) {
      if (fgMask[i] && !visited[i]) {
        const comp = []
        let cHead = 0
        visited[i] = 1
        comp.push(i)

        while (cHead < comp.length) {
          const curr = comp[cHead++]
          const cx = curr % size
          const cy = (curr - cx) / size

          if (cx > 0) {
            const n = curr - 1
            if (fgMask[n] && !visited[n]) {
              visited[n] = 1
              comp.push(n)
            }
          }
          if (cx < size - 1) {
            const n = curr + 1
            if (fgMask[n] && !visited[n]) {
              visited[n] = 1
              comp.push(n)
            }
          }
          if (cy > 0) {
            const n = curr - size
            if (fgMask[n] && !visited[n]) {
              visited[n] = 1
              comp.push(n)
            }
          }
          if (cy < size - 1) {
            const n = curr + size
            if (fgMask[n] && !visited[n]) {
              visited[n] = 1
              comp.push(n)
            }
          }
        }

        if (comp.length > bestScore) {
          bestScore = comp.length
          bestComp = comp
        }
      }
    }

    const mainFg = new Uint8Array(totalPixels)
    if (bestComp && bestComp.length > 200) {
      for (let i = 0; i < bestComp.length; i++) {
        mainFg[bestComp[i]] = 1
      }
    } else {
      for (let i = 0; i < totalPixels; i++) {
        mainFg[i] = fgMask[i]
      }
    }

    // 3. Fill all interior holes inside the main sticker silhouette so dark eyes/hair/outlines are 100% solid
    const extBg = new Uint8Array(totalPixels)
    head = 0
    tail = 0
    extBg[0] = 1
    queue[tail++] = 0

    while (head < tail) {
      const curr = queue[head++]
      const cx = curr % size
      const cy = (curr - cx) / size

      if (cx > 0) {
        const n = curr - 1
        if (!extBg[n] && !mainFg[n]) {
          extBg[n] = 1
          queue[tail++] = n
        }
      }
      if (cx < size - 1) {
        const n = curr + 1
        if (!extBg[n] && !mainFg[n]) {
          extBg[n] = 1
          queue[tail++] = n
        }
      }
      if (cy > 0) {
        const n = curr - size
        if (!extBg[n] && !mainFg[n]) {
          extBg[n] = 1
          queue[tail++] = n
        }
      }
      if (cy < size - 1) {
        const n = curr + size
        if (!extBg[n] && !mainFg[n]) {
          extBg[n] = 1
          queue[tail++] = n
        }
      }
    }

    // solidMask = 1 for every pixel inside the sticker silhouette
    const solidMask = new Uint8Array(totalPixels)
    for (let i = 0; i < totalPixels; i++) {
      if (!extBg[i]) solidMask[i] = 1
    }

    // Erode by 2px to trim any dark edge halo from the original black background
    const erodedMask = new Uint8Array(totalPixels)
    const erodeR = 2
    for (let y = erodeR; y < size - erodeR; y++) {
      for (let x = erodeR; x < size - erodeR; x++) {
        const idx = y * size + x
        if (!solidMask[idx]) continue
        if (
          solidMask[idx - erodeR] &&
          solidMask[idx + erodeR] &&
          solidMask[idx - erodeR * size] &&
          solidMask[idx + erodeR * size]
        ) {
          erodedMask[idx] = 1
        }
      }
    }

    // 4. Dilate outward by 12px to guarantee a thick, continuous white die-cut border (#FFFFFF) for Cricut Design Space
    const borderMask = new Uint8Array(totalPixels)
    const borderRadius = 12
    const rSq = borderRadius * borderRadius
    const offsets = []
    for (let dy = -borderRadius; dy <= borderRadius; dy++) {
      for (let dx = -borderRadius; dx <= borderRadius; dx++) {
        if (dx * dx + dy * dy <= rSq) {
          offsets.push(dy * size + dx)
        }
      }
    }

    for (let y = borderRadius; y < size - borderRadius; y++) {
      for (let x = borderRadius; x < size - borderRadius; x++) {
        const idx = y * size + x
        if (!erodedMask[idx]) continue
        // Only dilate from boundary pixels for speed
        if (
          erodedMask[idx - 1] &&
          erodedMask[idx + 1] &&
          erodedMask[idx - size] &&
          erodedMask[idx + size]
        ) {
          borderMask[idx] = 1
          continue
        }
        for (let k = 0; k < offsets.length; k++) {
          borderMask[idx + offsets[k]] = 1
        }
      }
    }

    // Composite final PNG:
    // - Outside borderMask -> 100% Transparent (rgba(0,0,0,0))
    // - Inside borderMask but outside erodedMask -> Solid White Die-Cut Border (#FFFFFF)
    // - Inside erodedMask -> Original Crisp Artwork (alpha = 255)
    for (let i = 0; i < totalPixels; i++) {
      const i4 = i * 4
      if (erodedMask[i]) {
        data[i4 + 3] = 255
      } else if (borderMask[i]) {
        data[i4] = 255
        data[i4 + 1] = 255
        data[i4 + 2] = 255
        data[i4 + 3] = 255
      } else {
        data[i4] = 0
        data[i4 + 1] = 0
        data[i4 + 2] = 0
        data[i4 + 3] = 0
      }
    }

    ctx.putImageData(imgData, 0, 0)
    return canvas.toDataURL('image/png')
  } catch (err) {
    console.warn('Sticker transparency post-processing skipped:', err)
    return inputDataUrl
  }
}

/**
 * Generates a clean, watermark-free, Cricut-ready die-cut pixel sticker on a 100% transparent background
 * with a thick solid white border and zero drop shadows.
 */
export async function transformPhotoToPixelSticker(
  inputFile,
  modeKey = 'mario',
  customText = ''
) {
  const modeObj = modes[modeKey] ||
    modes['mario'] || {
      name: 'Pipe Panic',
      color: '#ef4444'
    }

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Clear entire canvas to 100% transparent (NO drop shadows so Cricut cuts cleanly!)
  ctx.clearRect(0, 0, 512, 512)

  // Outer thick solid white die-cut sticker border (#FFFFFF)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(28, 28, 456, 456, 52)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()

  // Inner dark outline inside the white sticker border
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(46, 46, 420, 420, 38)
  ctx.fillStyle = '#0f172a'
  ctx.fill()
  ctx.restore()

  // Inner sticker artwork canvas (no text watermarks or logos)
  const grad = ctx.createLinearGradient(52, 52, 460, 460)
  grad.addColorStop(0, '#9f1239')
  grad.addColorStop(0.55, '#151928')
  grad.addColorStop(1, modeObj.color || '#ef4444')
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(52, 52, 408, 408, 32)
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

      const pixelSize = 64
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
        data[i] = Math.min(255, Math.round(data[i] / 36) * 36 + 10)
        data[i + 1] = Math.min(255, Math.round(data[i + 1] / 36) * 36 + 8)
        data[i + 2] = Math.min(255, Math.round(data[i + 2] / 36) * 36 + 14)
      }
      offCtx.putImageData(imgData, 0, 0)

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(offCanvas, 0, 0, pixelSize, pixelSize, 52, 52, 408, 408)
    } catch {
      ctx.fillStyle = '#facc15'
      ctx.fillRect(216, 216, 80, 80)
    }
  } else {
    ctx.fillStyle = '#facc15'
    ctx.fillRect(216, 216, 80, 80)
  }

  ctx.restore()

  return canvas.toDataURL('image/png')
}

export default limitFunction(
  async ({
    model = 'gemini-nano-banana-2.1',
    prompt,
    inputFile,
    aspectRatio = '1:1',
    imageSize = '1K',
    signal
  }) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    if (signal) {
      signal.addEventListener('abort', () => controller.abort())
    }

    try {
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

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Sticker generation failed (${response.status}). Check your server GEMINI_API_KEY configuration.`
        )
      }

      if (!data?.imageUrl) {
        throw new Error(
          data?.error || 'Gemini did not return an image. Please try again.'
        )
      }

      return await makeCricutReadyTransparentSticker(data.imageUrl)
    } catch (error) {
      clearTimeout(timer)
      if (signal?.aborted) {
        return undefined
      }
      throw error
    }
  },
  {concurrency: 1}
)
