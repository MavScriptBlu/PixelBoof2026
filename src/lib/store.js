/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'
import {createSelectorHooks} from 'auto-zustand-selectors-hook'
import JSZip from 'jszip'
import shuffle from 'lodash.shuffle'

import modes, {THEMES} from './modes'
import imageData from './imageData'
import gen, {transformPhotoToPixelSticker} from './gemini'
import {
  playSuccessSound,
  playSelectSound,
  playQueueSound,
  playClickSound,
  isSoundEnabled,
  setSoundEnabledStorage
} from './sound'

export const MAX_STICKERS = 3
export const IMAGE_MODEL = 'gemini-nano-banana-2.1'
export const ORGANIZER_EMAIL = 'mavscriptblue@gmail.com'
const modeKeys = Object.keys(modes)

const stickerPromptSuffix =
  'The final image MUST be a single die-cut sticker of the character with a thick solid white sticker border (#FFFFFF) surrounding the entire subject, isolated on a flat pure black (#000000) background, with no drop shadow, no watermarks, no text, and no logos.'

export const CHAT_PERSONAS = {
  coach: {
    id: 'coach',
    name: 'PixelBot Prompt Coach',
    icon: 'arcade',
    instruction:
      'You are PixelBot, the official AI Arcade Coach & Tech-Con Booth Assistant for PixelBoof at Mid-State Technical College (MSTC). Help attendees craft vivid pixel-art and sticker prompts for gemini-nano-banana-2.1, suggest lens categories, and explain the 3-sticker Cricut Joy Xtra queue workflow. Users can attach a photo or pick one of their booth stickers directly in the chat bar below to ask for edit ideas or run a 1-click edit. When suggesting a sticker creation or edit prompt, always wrap the exact prompt in double quotes so the user can click to generate or edit it.'
  },
  artDirector: {
    id: 'artDirector',
    name: 'Retro Sprite Art Director',
    icon: 'sparkle',
    instruction:
      'You are a veteran 16-bit & 90s arcade pixel art director. Help users design original game characters, fursonas, holographic trading cards, and image-editing instructions for gemini-nano-banana-2.1. Users can insert an image in the chat input bar below for you to inspect and edit. Focus on color palettes, silhouettes, lighting, and die-cut sticker composition. Wrap any suggested image generation or editing prompt in double quotes.'
  },
  techConGuide: {
    id: 'techConGuide',
    name: 'MSTC Tech-Con Helper',
    icon: 'shield',
    instruction:
      'You are the Mid-State Technical College (MSTC) IT & Software Development Booth Guide. Answer questions about how PixelBoof works with Gemini AI, how to attach a sticker or photo in the chat bar for AI edits, how the Cricut Joy Xtra vinyl sticker queue works (strictly 3 stickers per student, submit 35 mins before bus departure), and encourage students interested in coding, AI, and IT careers.'
  }
}

const blobToBase64 = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

let activeToastTimer = null
let activeErrorTimer = null
let activeEmailBannerTimer = null

const useStoreBase = create(
  immer((set, get) => ({
    // --- INITIAL STATE --- //
    didInit: false,
    photos: [],
    activeTheme: 'arcade',
    activeMode: 'mario',
    lensesCollapsed: false,
    showLensDrawer: false,
    focusedPhotoId: null,
    cameraSessionKey: 0,
    currentView: 'camera', // 'camera' | 'gallery'
    activeTopTab: 'app',
    isLockedSim: false,
    boothQrUrl:
      (typeof window !== 'undefined' &&
        localStorage.getItem('pixelBoofQrUrl')) ||
      'https://pixelboof.cloud.run/mstc26',
    zoom: 1,
    aspectRatio: '1:1',
    imageSize: '1K',
    showTutorial: false,
    showDisclaimer: false,
    showThemeModal: false,
    isOrganizerUnlocked:
      typeof window !== 'undefined' &&
      sessionStorage.getItem('pixelBoofOrganizerUnlocked') === 'true',
    stickerQueue: [],
    stickerQueueDownloading: false,
    emailSending: false,
    lastEmailResult: null,
    attendeeName: '',
    attendeeSchool: '',
    capturedPreview: null,
    instantTransform: true,
    soundEnabled: isSoundEnabled(),
    errorMessage: null,
    toastInfo: null,
    confirmModal: null,

    // --- MULTI-TURN CHATBOT STATE (Budget-Protected Flash Lite Default) --- //
    chatModel: 'gemini-3.1-flash-lite',
    chatPersona: 'coach',
    chatLoading: false,
    chatMessages: [
      {
        id: 'welcome-1',
        role: 'model',
        text: 'Welcome to **PixelBoof** at **Mid-State Tech-Con (Nov 13)**! I am **PixelBot**, running on ultra-fast, budget-friendly **Gemini Flash Lite**. You can attach a photo or pick one of your booth stickers using the buttons in the chat bar below to get custom edit prompts or run a **1-click sticker edit**!',
        modelUsed: 'gemini-3.1-flash-lite',
        timestamp: Date.now()
      }
    ],

    // --- ACTIONS --- //
    init: () => {
      if (get().didInit) {
        return
      }
      let shouldLock = false
      if (typeof window !== 'undefined') {
        const pathLower = (window.location.pathname || '').toLowerCase()
        const hostLower = (window.location.hostname || '').toLowerCase()
        const hashLower = (window.location.hash || '').toLowerCase()
        const params = new URLSearchParams(window.location.search)
        const passParam = (
          params.get('pass') ||
          params.get('code') ||
          ''
        )
          .trim()
          .toUpperCase()

        const refLower = (document.referrer || '').toLowerCase()
        const hasUrlPass =
          pathLower.includes('/mstc26') ||
          pathLower.includes('/techcon26') ||
          hashLower.includes('mstc26') ||
          hashLower.includes('techcon26') ||
          hostLower.includes('mavscript.blue') ||
          refLower.includes('mavscript.blue') ||
          refLower.includes('short.io') ||
          ['2165', 'MSTC26', 'TECHCON26', 'PIXELBOOF'].includes(passParam)

        if (hasUrlPass) {
          sessionStorage.setItem('pixelBoofUnlocked', 'true')
          if (passParam === '2165') {
            sessionStorage.setItem('pixelBoofOrganizerUnlocked', 'true')
            set({isOrganizerUnlocked: true})
          }
        }

        const alreadyUnlocked =
          sessionStorage.getItem('pixelBoofUnlocked') === 'true'
        const envRequiresPass =
          import.meta.env.VITE_BOOTH_LOCKED === 'true' ||
          import.meta.env.VITE_REQUIRE_EVENT_PASS === 'true'

        const startHour = Number(import.meta.env.VITE_EVENT_START_HOUR)
        const endHour = Number(import.meta.env.VITE_EVENT_END_HOUR)
        const hasHourGate =
          !Number.isNaN(startHour) &&
          !Number.isNaN(endHour) &&
          import.meta.env.VITE_EVENT_START_HOUR !== undefined &&
          import.meta.env.VITE_EVENT_START_HOUR !== ''

        if (hasHourGate) {
          const currentHour = new Date().getHours()
          if (
            (currentHour < startHour || currentHour >= endHour) &&
            !alreadyUnlocked
          ) {
            shouldLock = true
          }
        }

        if (envRequiresPass && !alreadyUnlocked) {
          shouldLock = true
        }
      }
      set({didInit: true, isLockedSim: shouldLock})
    },

    checkTutorial: () => {
      const tutorialDismissed = localStorage.getItem('pixelBoothTutorialDismissed')
      if (!tutorialDismissed) {
        set({showTutorial: true})
      }
    },

    dismissTutorial: () => {
      localStorage.setItem('pixelBoothTutorialDismissed', 'true')
      set({showTutorial: false})
    },

    acceptDisclaimer: () => {
      localStorage.setItem('pixelBoothDisclaimerAccepted', 'true')
      set({showDisclaimer: false})
    },

    showToast: (message, type = 'info') => {
      if (activeToastTimer) {
        clearTimeout(activeToastTimer)
        activeToastTimer = null
      }
      if (!message) {
        set({toastInfo: null})
        return
      }
      const id = Date.now() + Math.random()
      set({toastInfo: {message, type, id}})
      const duration = type === 'error' ? 2800 : 2300
      activeToastTimer = setTimeout(() => {
        set(state => {
          if (state.toastInfo?.id === id) {
            state.toastInfo = null
          }
        })
        activeToastTimer = null
      }, duration)
    },

    clearToast: () => {
      if (activeToastTimer) {
        clearTimeout(activeToastTimer)
        activeToastTimer = null
      }
      set({toastInfo: null})
    },

    setCapturedPreview: preview => {
      set({capturedPreview: preview})
    },

    setInstantTransform: val => {
      set({instantTransform: val})
    },

    setShowLensDrawer: show => {
      set({showLensDrawer: show})
    },

    setFocusedPhotoId: id => {
      set({focusedPhotoId: id})
    },

    setAspectRatio: ratio => {
      set({aspectRatio: ratio})
    },

    setImageSize: size => {
      set({imageSize: size})
    },

    toggleSound: () => {
      const next = !get().soundEnabled
      setSoundEnabledStorage(next)
      set({soundEnabled: next})
      if (next) {
        playClickSound()
      }
    },

    snapPhoto: async (b64, customPrompt) => {
      const {activeMode, activeTheme, isLockedSim, aspectRatio, imageSize} = get()
      if (isLockedSim) {
        get().showToast('Booth is locked outside event hours! Unlock first.', 'error')
        return
      }

      if (activeMode === 'custom' && !customPrompt?.trim()) {
        get().setErrorMessage('Custom prompt cannot be empty! Type a prompt first.')
        get().showToast('Custom prompt cannot be empty! Type a prompt first.', 'error')
        return
      }

      const id = crypto.randomUUID()
      const themeModes = THEMES[activeTheme]?.modes || THEMES.arcade.modes
      const modeKeysWithoutCustom = modeKeys.filter(key => key !== 'custom')
      const effectiveMode =
        activeMode === 'random'
          ? (themeModes.length > 0
              ? themeModes[Math.floor(Math.random() * themeModes.length)].key
              : shuffle(modeKeysWithoutCustom)[0])
          : activeMode

      const initialPreview =
        b64 || (await transformPhotoToPixelSticker(null, effectiveMode, customPrompt))
      imageData.inputs[id] = initialPreview

      set(state => {
        state.photos.unshift({
          id,
          mode: effectiveMode,
          isBusy: true,
          promptUsed: customPrompt || ''
        })
        state.capturedPreview = null
        state.showLensDrawer = false
      })

      try {
        const promptText =
          effectiveMode === 'custom'
            ? customPrompt
            : modes[effectiveMode]?.prompt || modes['mario'].prompt

        const result = await gen({
          model: IMAGE_MODEL,
          prompt: `${promptText} ${stickerPromptSuffix}`,
          inputFile: b64,
          aspectRatio,
          imageSize,
          modeKey: effectiveMode,
          customPrompt
        })

        if (!result) {
          throw new Error('Image generation failed or was aborted.')
        }

        imageData.outputs[id] = result
        set(state => {
          const photo = state.photos.find(p => p.id === id)
          if (photo) {
            photo.isBusy = false
          }
        })
        playSuccessSound()
        const modeName = modes[effectiveMode]?.name || 'Custom'
        get().showToast(`Generated ${modeName} sticker!`)
      } catch (error) {
        console.error('Photo generation failed:', error)
        get().setErrorMessage(
          error?.message || 'Oh no! The pixels got crossed. Please try again.'
        )
        get().confirmDeletePhoto(id)
      }
    },

    createOrEditImageWithGemini: async ({
      prompt,
      sourceImage = null,
      aspectRatio = '1:1',
      imageSize = '1K',
      asDieCutSticker = true
    }) => {
      const {isLockedSim} = get()
      if (isLockedSim) {
        get().showToast('Booth is locked outside event hours! Unlock first.', 'error')
        return null
      }
      if (!prompt?.trim()) {
        get().showToast('Please enter a text prompt to create or edit an image!', 'error')
        return null
      }

      const id = crypto.randomUUID()
      const previewImg =
        sourceImage || (await transformPhotoToPixelSticker(null, 'custom', prompt))
      imageData.inputs[id] = previewImg

      set(state => {
        state.photos.unshift({
          id,
          mode: 'custom',
          isBusy: true,
          promptUsed: prompt
        })
        state.focusedPhotoId = id
      })

      try {
        const finalPrompt = asDieCutSticker
          ? `${prompt.trim()} ${stickerPromptSuffix}`
          : prompt.trim()

        const result = await gen({
          model: IMAGE_MODEL,
          prompt: finalPrompt,
          inputFile: sourceImage,
          aspectRatio,
          imageSize,
          modeKey: 'custom',
          customPrompt: prompt
        })

        if (!result) {
          throw new Error('Image generation failed.')
        }

        imageData.outputs[id] = result
        set(state => {
          const photo = state.photos.find(p => p.id === id)
          if (photo) {
            photo.isBusy = false
          }
        })
        playSuccessSound()
        get().showToast(
          sourceImage
            ? 'Edited sticker with gemini-nano-banana-2.1!'
            : 'Created new sticker with gemini-nano-banana-2.1!'
        )
        return id
      } catch (error) {
        console.error('Create/Edit image failed:', error)
        get().setErrorMessage(
          error?.message || 'Could not generate or edit image. Please try again.'
        )
        get().confirmDeletePhoto(id)
        return null
      }
    },

    editExistingPhoto: async (photoId, editInstruction) => {
      if (!editInstruction?.trim()) {
        get().showToast('Enter an edit instruction first!', 'error')
        return false
      }
      const currentImg = imageData.outputs[photoId] || imageData.inputs[photoId]
      if (!currentImg) return false

      set(state => {
        const p = state.photos.find(item => item.id === photoId)
        if (p) p.isBusy = true
      })

      try {
        const {aspectRatio, imageSize} = get()
        const result = await gen({
          model: IMAGE_MODEL,
          prompt: `${editInstruction.trim()}. Keep the die-cut sticker style with a thick solid white border isolated on a flat pure black background, with no watermarks, no text, and no drop shadow.`,
          inputFile: currentImg,
          aspectRatio,
          imageSize,
          modeKey: 'custom',
          customPrompt: editInstruction
        })

        if (result) {
          imageData.outputs[photoId] = result
          playSuccessSound()
          get().showToast('Sticker updated with gemini-nano-banana-2.1!')
        }
        set(state => {
          const p = state.photos.find(item => item.id === photoId)
          if (p) p.isBusy = false
        })
        return true
      } catch (err) {
        console.error('Edit existing photo error:', err)
        set(state => {
          const p = state.photos.find(item => item.id === photoId)
          if (p) p.isBusy = false
        })
        get().showToast('Could not edit sticker. Please try again.', 'error')
        return false
      }
    },

    sendChatMessage: async (userText, attachedImage = null) => {
      const trimmed = (userText || '').trim()
      if ((!trimmed && !attachedImage) || get().chatLoading) return

      const effectiveText =
        trimmed ||
        'Analyze this attached image and suggest 3 creative pixel sticker edit prompts in double quotes!'

      const {chatModel, chatPersona, chatMessages} = get()
      const personaObj = CHAT_PERSONAS[chatPersona] || CHAT_PERSONAS.coach

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: effectiveText,
        image: attachedImage || null,
        timestamp: Date.now()
      }

      const historyPayload = chatMessages.map(m => ({
        role: m.role,
        text: m.text
      }))

      set(state => {
        state.chatMessages.push(userMsg)
        state.chatLoading = true
      })

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            message: effectiveText,
            image: attachedImage || null,
            history: historyPayload,
            model: chatModel,
            systemInstruction: personaObj.instruction
          })
        })

        const data = await res.json()
        const replyText =
          res.ok && data?.reply
            ? data.reply
            : attachedImage
              ? `Awesome image! Click any of these prompts to edit your attached image into a die-cut sticker:\n- "Add a glowing 16-bit wizard hat and arcane sparkles around the character"\n- "Transform into a retro 90s arcade boss sprite with neon cyber visors"`
              : `Here's a fun sticker prompt idea you can try right now: "A retro 16-bit pixel art arcade hero wearing neon visors and a burgundy Mid-State jacket holding a glowing power-up crystal"`

        set(state => {
          state.chatMessages.push({
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
            sourceImage: attachedImage || null,
            modelUsed: data?.modelUsed || chatModel,
            timestamp: Date.now()
          })
          state.chatLoading = false
        })
      } catch (err) {
        console.error('Chat error:', err)
        set(state => {
          state.chatMessages.push({
            id: `model-${Date.now()}`,
            role: 'model',
            text: attachedImage
              ? `Here are custom edit prompts for your attached image:\n- "Add a 16-bit pixel wizard hat and glowing magical staff"\n- "Give the character holographic retro arcade sunglasses and neon armor"`
              : `Here is a custom prompt suggestion for **gemini-nano-banana-2.1**: "Transform the character into a 16-bit synthwave pixel knight with holographic armor and a glowing shield"`,
            sourceImage: attachedImage || null,
            modelUsed: chatModel,
            timestamp: Date.now()
          })
          state.chatLoading = false
        })
      }
    },

    clearChatHistory: () => {
      set({
        chatMessages: [
          {
            id: `welcome-${Date.now()}`,
            role: 'model',
            text: 'Chat history cleared! Ready to brainstorm new pixel stickers, edit prompts, or answer Tech-Con questions.',
            modelUsed: get().chatModel,
            timestamp: Date.now()
          }
        ]
      })
    },

    setChatModel: modelName => set({chatModel: modelName}),
    setChatPersona: personaKey => set({chatPersona: personaKey}),

    openConfirmModal: payload => set({confirmModal: payload}),
    closeConfirmModal: () => set({confirmModal: null}),

    deletePhoto: id => {
      set({confirmModal: {type: 'delete_photo', photoId: id}})
    },

    confirmDeletePhoto: id => {
      set(state => {
        state.photos = state.photos.filter(photo => photo.id !== id)
        state.stickerQueue = state.stickerQueue.filter(stickerId => stickerId !== id)
        if (state.focusedPhotoId === id) {
          state.focusedPhotoId = null
        }
        state.confirmModal = null
      })
      delete imageData.inputs[id]
      delete imageData.outputs[id]
    },

    setTheme: themeKey => {
      playSelectSound()
      set(state => {
        state.activeTheme = themeKey
        state.lensesCollapsed = false
        const themeModes = THEMES[themeKey]?.modes || []
        if (themeModes.length > 0) {
          state.activeMode = themeModes[0].key
        }
      })
    },
    setMode: mode => {
      playSelectSound()
      set({activeMode: mode})
    },
    setLensesCollapsed: collapsed => set({lensesCollapsed: collapsed}),
    setView: view => set({currentView: view}),
    setActiveTopTab: tab => set({activeTopTab: tab}),
    setIsLockedSim: locked => set({isLockedSim: locked}),
    setBoothQrUrl: url => {
      const cleaned =
        (url || '').trim() || 'https://pixelboof.cloud.run/mstc26'
      if (typeof window !== 'undefined') {
        localStorage.setItem('pixelBoofQrUrl', cleaned)
      }
      set({boothQrUrl: cleaned})
    },
    unlockBoothWithPasscode: rawPass => {
      const cleaned = (rawPass || '').trim().toUpperCase()
      if (['2165', 'MSTC26', 'TECHCON26', 'PIXELBOOF'].includes(cleaned)) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pixelBoofUnlocked', 'true')
          sessionStorage.setItem('pixelBoofPasscode', cleaned)
        }
        set({isLockedSim: false})
        playSuccessSound()
        get().showToast(`Passcode accepted! Booth unlocked.`)
        return true
      }
      get().showToast('Invalid passcode! Try MSTC26 or TECHCON26.', 'error')
      return false
    },
    unlockOrganizerWithPin: rawPin => {
      const cleaned = (rawPin || '').trim().toUpperCase()
      if (['2165', 'MSTC26', 'TECHCON26', 'PIXELBOOF'].includes(cleaned)) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pixelBoofOrganizerUnlocked', 'true')
          sessionStorage.setItem('pixelBoofPasscode', cleaned)
        }
        set({isOrganizerUnlocked: true})
        playSuccessSound()
        get().showToast('Admin access granted! Station Hub unlocked.')
        return true
      }
      get().showToast('Invalid Admin Password! Please try again.', 'error')
      return false
    },
    lockOrganizer: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pixelBoofOrganizerUnlocked')
      }
      set({isOrganizerUnlocked: false})
      get().showToast('Organizer access locked.')
    },
    setShowThemeModal: show => set({showThemeModal: show}),
    setZoom: zoom => set({zoom}),
    setErrorMessage: message => {
      if (activeErrorTimer) {
        clearTimeout(activeErrorTimer)
        activeErrorTimer = null
      }
      if (!message) {
        set({errorMessage: null})
        return
      }
      set({errorMessage: message})
      get().showToast(message, 'error')
      activeErrorTimer = setTimeout(() => {
        set({errorMessage: null})
        activeErrorTimer = null
      }, 2800)
    },
    setAttendeeName: name => set({attendeeName: name}),
    setAttendeeSchool: school => set({attendeeSchool: school}),

    addToStickerQueue: id => {
      const {stickerQueue} = get()
      if (stickerQueue.includes(id)) {
        return
      }
      if (stickerQueue.length >= MAX_STICKERS) {
        const msg = `${MAX_STICKERS}-Sticker Limit Reached (${MAX_STICKERS}/${MAX_STICKERS})! Remove one from your Sticker Queue if you want to swap.`
        get().setErrorMessage(msg)
        get().showToast(msg, 'error')
        return
      }
      set(state => {
        state.stickerQueue.push(id)
      })
      playQueueSound()
      get().showToast(`Saved to Sticker Queue (${get().stickerQueue.length}/${MAX_STICKERS})!`)
    },

    toggleStickerQueue: id => {
      const {stickerQueue} = get()
      if (stickerQueue.includes(id)) {
        get().removeFromStickerQueue(id)
      } else {
        get().addToStickerQueue(id)
      }
    },

    removeFromStickerQueue: id => {
      set(state => {
        state.stickerQueue = state.stickerQueue.filter(stickerId => stickerId !== id)
      })
      get().showToast('Removed sticker from queue.')
    },

    clearStickerQueue: () => {
      if (get().stickerQueue.length === 0) {
        get().showToast('Sticker queue is already empty (0/3).')
        return
      }
      set({confirmModal: {type: 'clear_queue'}})
    },

    confirmClearStickerQueue: () => {
      set({stickerQueue: [], confirmModal: null})
      get().showToast('Cleared sticker queue (0/3).')
    },

    resetStationForNextAttendee: () => {
      set({confirmModal: {type: 'reset_station'}})
    },

    confirmResetStationForNextAttendee: () => {
      const currentPhotos = get().photos
      currentPhotos.forEach(p => {
        delete imageData.inputs[p.id]
        delete imageData.outputs[p.id]
      })
      set(state => {
        state.photos = []
        state.stickerQueue = []
        state.attendeeName = ''
        state.attendeeSchool = ''
        state.capturedPreview = null
        state.focusedPhotoId = null
        state.showLensDrawer = false
        state.lastEmailResult = null
        state.confirmModal = null
        state.currentView = 'camera'
        state.cameraSessionKey += 1
      })
      get().showToast('Booth reset! Returned to Homepage for next attendee.')
    },

    /*
     * Packages the attendee's queued stickers into a ZIP in memory,
     * sends it to mavscriptblue@gmail.com via the backend /api/email-sticker-batch endpoint,
     * and optionally downloads the ZIP locally on kiosk computers.
     */
    processStickerBatch: async ({
      downloadLocal = false,
      autoEmail = true
    } = {}) => {
      const {stickerQueue, photos, attendeeName, attendeeSchool} = get()

      // Use explicitly queued stickers first (strictly capped at 3); if none are queued yet, aggregate up to 3 finished stickers
      let targetIds = [...stickerQueue].slice(0, MAX_STICKERS)
      if (targetIds.length === 0) {
        const readyPhotos = photos.filter(p => !p.isBusy).slice(0, MAX_STICKERS)
        targetIds = readyPhotos.map(p => p.id)
      }

      if (targetIds.length === 0) {
        get().showToast(
          'Snap or queue at least 1 sticker before downloading or sending a batch!',
          'error'
        )
        return {ok: false}
      }

      const rawName = (attendeeName || '').trim()
      const rawSchool = (attendeeSchool || '').trim()

      if (!rawName || !rawSchool) {
        get().showToast(
          'Please fill out both your Full Name and High School before sending!',
          'error'
        )
        return {ok: false}
      }

      const prefix = `${rawName.replace(/\s+/g, '_')}-${rawSchool.replace(/\s+/g, '_')}`
      const zipFileName = `${prefix}_PixelBoof_${targetIds.length}stickers.zip`

      set({
        stickerQueueDownloading: downloadLocal,
        emailSending: autoEmail
      })

      try {
        const zip = new JSZip()

        for (let i = 0; i < targetIds.length; i++) {
          const id = targetIds[i]
          const b64 = imageData.outputs[id] || imageData.inputs[id]
          if (b64) {
            const response = await fetch(b64)
            const blob = await response.blob()
            const pngName = `${prefix}_sticker_${i + 1}.png`
            zip.file(pngName, blob)
          }
        }

        const zipBlob = await zip.generateAsync({type: 'blob'})

        // 1. Local Kiosk ZIP download if requested
        if (downloadLocal) {
          const url = URL.createObjectURL(zipBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = zipFileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        // 2. Auto-send the ZIP batch directly to mavscriptblue@gmail.com via backend (no extra OS share popups)
        if (autoEmail) {
          const zipBase64 = await blobToBase64(zipBlob)
          const res = await fetch('/api/email-sticker-batch', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              attendeeName: rawName,
              attendeeSchool: rawSchool,
              zipBase64,
              fileName: zipFileName,
              stickerCount: targetIds.length
            })
          })
          const data = await res.json().catch(() => ({}))

          if (!res.ok || !data?.ok) {
            throw new Error(
              data?.error || 'Could not email sticker batch from server.'
            )
          }

          if (activeEmailBannerTimer) {
            clearTimeout(activeEmailBannerTimer)
          }
          set({
            lastEmailResult: {
              ok: true,
              recipientEmail: data?.recipientEmail || ORGANIZER_EMAIL,
              transport: data?.transport || 'gmail-smtp',
              previewUrl: data?.previewUrl || null,
              fileName: zipFileName,
              timestamp: Date.now()
            }
          })
          activeEmailBannerTimer = setTimeout(() => {
            set({lastEmailResult: null})
            activeEmailBannerTimer = null
          }, 3000)
        }

        if (downloadLocal && autoEmail) {
          playSuccessSound()
          get().showToast(
            `Downloaded "${zipFileName}" & emailed via Gmail to ${ORGANIZER_EMAIL}!`
          )
        } else if (autoEmail) {
          playSuccessSound()
          get().showToast(
            `Emailed "${zipFileName}" (${targetIds.length} stickers) via Gmail to ${ORGANIZER_EMAIL}!`
          )
        } else if (downloadLocal) {
          playSuccessSound()
          get().showToast(
            `Downloaded "${zipFileName}" (${targetIds.length} sticker${
              targetIds.length === 1 ? '' : 's'
            })!`
          )
        }
        return {ok: true}
      } catch (error) {
        console.error('Error processing sticker batch:', error)
        get().setErrorMessage(
          error?.message || 'Could not process sticker batch. Please try again.'
        )
        return {ok: false, error: error?.message}
      } finally {
        set({
          stickerQueueDownloading: false,
          emailSending: false
        })
      }
    },

    downloadStickerQueue: async () => {
      await get().processStickerBatch({downloadLocal: true, autoEmail: false})
    }
  }))
)

export const useStore = createSelectorHooks(useStoreBase)
useStore.getState().init()
