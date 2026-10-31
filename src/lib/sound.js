/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Retro 8-Bit Arcade Sound Synthesizer using the Web Audio API.
 * Produces clean chiptune sound effects for:
 * 1. Button clicks (playClickSound)
 * 2. Lens / category selection (playSelectSound)
 * 3. Camera shutter action (playShutterSound)
 * 4. Queueing a sticker (playQueueSound)
 * 5. Successful image generation completion (playSuccessSound)
 */

let audioCtx = null
const SOUND_STORAGE_KEY = 'pixelBoofSoundEnabled'

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true
  try {
    const saved = window.localStorage.getItem(SOUND_STORAGE_KEY)
    return saved === null ? true : saved === 'true'
  } catch {
    return true
  }
}

export function setSoundEnabledStorage(enabled) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    // Ignore storage errors
  }
}

function getAudioContext() {
  if (typeof window === 'undefined' || !isSoundEnabled()) return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass()
      } catch {
        return null
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * Subtle 8-bit menu blip for button clicks.
 */
export function playClickSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(540, now)
    osc.frequency.setValueAtTime(760, now + 0.018)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.042, now + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.042)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.045)
  } catch {
    // Ignore audio context errors if blocked by browser autoplay policy
  }
}

/**
 * Crisp 2-step 8-bit select tone for choosing a lens or theme category.
 */
export function playSelectSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(659.25, now) // E5
    osc.frequency.setValueAtTime(880, now + 0.035) // A5

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.032, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.085)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.09)
  } catch {
    // Ignore audio errors
  }
}

/**
 * Classic arcade coin/ticket chime when adding a sticker to the 3-sticker queue.
 */
export function playQueueSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(987.77, now) // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.055) // E6

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.038, now + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.19)
  } catch {
    // Ignore audio errors
  }
}

/**
 * Retro 8-bit camera shutter snap sound.
 * Combines a short filtered noise burst (mechanical shutter click) with a
 * 2-step chiptune pitch drop.
 */
export function playShutterSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // 1. Short filtered white-noise burst for mechanical arcade snap
    const bufferSize = Math.floor(ctx.sampleRate * 0.055)
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.Q.setValueAtTime(1.5, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.065, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055)

    whiteNoise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    whiteNoise.start(now)
    whiteNoise.stop(now + 0.055)

    // 2. Stepped 8-bit square-wave shutter blip
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(920, now)
    osc.frequency.setValueAtTime(520, now + 0.025)
    osc.frequency.setValueAtTime(280, now + 0.055)

    oscGain.gain.setValueAtTime(0.001, now)
    oscGain.gain.linearRampToValueAtTime(0.045, now + 0.005)
    oscGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.095)
  } catch {
    // Ignore audio errors
  }
}

/**
 * Nostalgic 8-bit power-up / level-complete arpeggio chime
 * triggered when AI sticker generation finishes.
 */
export function playSuccessSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    // Classic 8-bit C-major upward arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5]
    const stepDuration = 0.065

    notes.forEach((freq, idx) => {
      const startTime = now + idx * stepDuration
      const isLast = idx === notes.length - 1
      const noteLength = isLast ? 0.16 : stepDuration * 0.92

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = isLast ? 'square' : 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      const peakGain = isLast ? 0.036 : 0.05
      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0008, startTime + noteLength)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + noteLength + 0.01)
    })
  } catch {
    // Ignore audio errors
  }
}
