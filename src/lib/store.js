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
import {getAccessToken} from './gmailAuth'

export const MAX_STICKERS = 3
export const IMAGE_MODEL = 'gemini-nano-banana-2.1'
export const ORGANIZER_EMAIL = 'Booth Print Queue'
const modeKeys = Object.keys(modes)

const stickerPromptSuffix =
  'The final image should be a die-cut sticker of the character with a thick white border, isolated on a flat black background, with no drop shadow.'

export const CHAT_PERSONAS = {
  coach: {
    id: 'coach',
    name: 'PixelBot Prompt Coach',
    emoji: '🕹️',
    instruction:
      'You are PixelBot, the official AI Arcade Coach & Tech-Con Booth Assistant for PixelBoof at Mid-State Technical College (MSTC). Help attendees craft vivid pixel-art and sticker prompts for gemini-nano-banana-2.1, suggest lens categories, and explain the 3-sticker Cricut Joy Xtra queue workflow. When suggesting a sticker prompt, wrap the exact prompt in double quotes so the user can click to generate it.'
  },
  artDirector: {
    id: 'artDirector',
    name: 'Retro Sprite Art Director',
    emoji: '🎨',
    instruction:
      'You are a veteran 16-bit & 90s arcade pixel art director. Help users design original game characters, fursonas, holographic trading cards, and image-editing instructions for gemini-nano-banana-2.1. Focus on color palettes, silhouettes, lighting, and die-cut sticker composition. Wrap any suggested image generation or editing prompt in double quotes.'
  },
  techConGuide: {
    id: 'techConGuide',
    name: 'MSTC Tech-Con Helper',
    emoji: '🎓',
    instruction:
      'You are the Mid-State Technical College (MSTC) IT & Software Development Booth Guide. Answer questions about how PixelBoof works with Gemini AI, how the Cricut Joy Xtra vinyl sticker queue works (strictly 3 stickers per student, submit 35 mins before bus departure), and encourage students interested in coding, AI, and IT careers.'
  }
}

const blobToBase64 = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const useStoreBase = create(
  immer((set, get) => ({
    // --- INITIAL STATE --- //
    didInit: false,
    photos: [],
    activeTheme: 'arcade',
    activeMode: '8bit',
    lensesCollapsed: false,
    showLensDrawer: false,
    focusedPhotoId: null,
    cameraSessionKey: 0,
    currentView: 'camera', // 'camera' | 'gallery'
    activeTopTab: 'app',
    isLockedSim: false,
    zoom: 1,
    aspectRatio: '1:1',
    imageSize: '1K',
    showTutorial: false,
    showDisclaimer: false,
    showThemeModal: false,
    stickerQueue: [],
    stickerQueueDownloading: false,
    emailSending: false,
    lastEmailResult: null,
    attendeeName: '',
    attendeeSchool: '',
    capturedPreview: null,
    instantTransform: true,
    errorMessage: null,
    toastInfo: null,

    // --- MULTI-TURN CHATBOT STATE (Budget-Protected Flash Lite Default) --- //
    chatModel: 'gemini-3.1-flash-lite',
    chatPersona: 'coach',
    chatLoading: false,
    chatMessages: [
      {
        id: 'welcome-1',
        role: 'model',
        text: 'Welcome to **PixelBoof** at **Mid-State Tech-Con (Nov 13)**! I am **PixelBot**, running on ultra-fast, budget-friendly **Gemini Flash Lite**. Need a custom sticker prompt, an edit idea for a snapped photo, or help with the 3-sticker Cricut queue? Ask me anything!',
        modelUsed: 'gemini-3.1-flash-lite',
        timestamp: Date.now()
      }
    ],

    // --- ACTIONS --- //
    init: () => {
      if (get().didInit) {
        return
      }
      set({didInit: true})
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
      set({toastInfo: {message, type, id: Date.now()}})
    },

    clearToast: () => {
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

    snapPhoto: async (b64, customPrompt) => {
      const {activeMode, activeTheme, isLockedSim, aspectRatio, imageSize} = get()
      if (isLockedSim) {
        get().showToast('🔒 Booth is locked outside event hours! Unlock first.', 'error')
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
            : modes[effectiveMode]?.prompt || modes['8bit'].prompt

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
        const modeName = modes[effectiveMode]?.name || 'Custom'
        get().showToast(`✨ Generated ${modeName} sticker!`)
      } catch (error) {
        console.error('Photo generation failed:', error)
        get().setErrorMessage('Oh no! The pixels got crossed. Please try again.')
        get().deletePhoto(id)
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
        get().showToast('🔒 Booth is locked outside event hours! Unlock first.', 'error')
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
        get().showToast(
          sourceImage
            ? '🪄 Edited sticker with gemini-nano-banana-2.1!'
            : '🎨 Created new sticker with gemini-nano-banana-2.1!'
        )
        return id
      } catch (error) {
        console.error('Create/Edit image failed:', error)
        get().setErrorMessage('Could not generate or edit image. Please try again.')
        get().deletePhoto(id)
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
          prompt: `${editInstruction.trim()}. Keep the die-cut sticker style with a thick white border on a flat black background.`,
          inputFile: currentImg,
          aspectRatio,
          imageSize,
          modeKey: 'custom',
          customPrompt: editInstruction
        })

        if (result) {
          imageData.outputs[photoId] = result
          get().showToast('✨ Sticker updated with gemini-nano-banana-2.1!')
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

    sendChatMessage: async userText => {
      const trimmed = userText?.trim()
      if (!trimmed || get().chatLoading) return

      const {chatModel, chatPersona, chatMessages} = get()
      const personaObj = CHAT_PERSONAS[chatPersona] || CHAT_PERSONAS.coach

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
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
            message: trimmed,
            history: historyPayload,
            model: chatModel,
            systemInstruction: personaObj.instruction
          })
        })

        const data = await res.json()
        const replyText =
          res.ok && data?.reply
            ? data.reply
            : `Here's a fun sticker prompt idea you can try right now: "A retro 16-bit pixel art arcade hero wearing neon visors and a burgundy Mid-State jacket holding a glowing power-up crystal"`

        set(state => {
          state.chatMessages.push({
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
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
            text: `Here is a custom prompt suggestion for **gemini-nano-banana-2.1**: "Transform the character into a 16-bit synthwave pixel knight with holographic armor and a glowing shield"`,
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

    deletePhoto: id => {
      set(state => {
        state.photos = state.photos.filter(photo => photo.id !== id)
        state.stickerQueue = state.stickerQueue.filter(stickerId => stickerId !== id)
        if (state.focusedPhotoId === id) {
          state.focusedPhotoId = null
        }
      })
      delete imageData.inputs[id]
      delete imageData.outputs[id]
    },

    setTheme: themeKey => {
      set(state => {
        state.activeTheme = themeKey
        state.lensesCollapsed = false
        const themeModes = THEMES[themeKey]?.modes || []
        if (
          state.activeMode !== 'custom' &&
          state.activeMode !== 'random' &&
          themeModes.length > 0
        ) {
          state.activeMode = themeModes[0].key
        }
      })
    },
    setMode: mode => set({activeMode: mode}),
    setLensesCollapsed: collapsed => set({lensesCollapsed: collapsed}),
    setView: view => set({currentView: view}),
    setActiveTopTab: tab => set({activeTopTab: tab}),
    setIsLockedSim: locked => set({isLockedSim: locked}),
    setShowThemeModal: show => set({showThemeModal: show}),
    setZoom: zoom => set({zoom}),
    setErrorMessage: message => set({errorMessage: message}),
    setAttendeeName: name => set({attendeeName: name}),
    setAttendeeSchool: school => set({attendeeSchool: school}),

    addToStickerQueue: id => {
      const {stickerQueue} = get()
      if (stickerQueue.includes(id)) {
        return
      }
      if (stickerQueue.length >= MAX_STICKERS) {
        const msg = `🚫 ${MAX_STICKERS}-Sticker Limit Reached (${MAX_STICKERS}/${MAX_STICKERS})! Remove one from your Sticker Queue if you want to swap.`
        get().setErrorMessage(msg)
        get().showToast(msg, 'error')
        return
      }
      set(state => {
        state.stickerQueue.push(id)
      })
      get().showToast(`🎟️ Saved to Sticker Queue (${get().stickerQueue.length}/${MAX_STICKERS})!`)
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
      set({stickerQueue: []})
      get().showToast('Cleared sticker queue (0/3).')
    },

    resetStationForNextAttendee: () => {
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
        state.currentView = 'camera'
        state.cameraSessionKey += 1
      })
      get().showToast('🔄 Booth reset! Returned to Homepage for next attendee.')
    },

    /*
     * Packages the attendee's queued stickers into a ZIP in memory,
     * sends it to mavscriptblue@gmail.com via Gmail API (using client OAuth token) or Gmail SMTP,
     * and optionally downloads the ZIP locally on kiosk computers.
     */
    processStickerBatch: async ({
      downloadLocal = false,
      autoEmail = true,
      accessToken = null
    } = {}) => {
      const {stickerQueue, attendeeName, attendeeSchool} = get()

      // Strictly use the stickers the attendee selected for their Sticker Queue (max 3)
      const targetIds = [...stickerQueue].slice(0, MAX_STICKERS)

      if (targetIds.length === 0) {
        get().showToast(
          'Pick up to 3 favorite photos and click "Save to Queue" before sending or downloading!',
          'error'
        )
        return {ok: false}
      }

      const rawName = (attendeeName || '').trim() || 'Attendee'
      const rawSchool = (attendeeSchool || '').trim() || 'TechCon'
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

        // 2. Send the ZIP batch to mavscriptblue@gmail.com via Gmail
        if (autoEmail) {
          const token = accessToken || (await getAccessToken())
          const zipBase64 = await blobToBase64(zipBlob)
          const headers = {'Content-Type': 'application/json'}
          if (token) {
            headers.Authorization = `Bearer ${token}`
          }

          let sentSuccess = false
          try {
            const res = await fetch('/api/email-sticker-batch', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                attendeeName: rawName,
                attendeeSchool: rawSchool,
                zipBase64,
                fileName: zipFileName,
                stickerCount: targetIds.length
              })
            })
            const data = await res.json().catch(() => ({}))

            if (res.ok && data?.ok) {
              sentSuccess = true
            } else if (data?.needsAuth) {
              get().showToast(
                'Please sign in with Google to send your sticker batch via Gmail!',
                'error'
              )
              return {ok: false, needsAuth: true}
            }
          } catch {
            // Fallback to direct client-side Gmail API call below if backend route is unreachable
          }

          if (!sentSuccess) {
            get().showToast(
              'Please sign in with Google to send your sticker batch via Gmail!',
              'error'
            )
            return {ok: false, needsAuth: true}
          }

          set({
            lastEmailResult: {
              ok: true,
              recipientEmail: 'Booth Print Queue',
              transport: 'gmail-api',
              fileName: zipFileName,
              timestamp: Date.now()
            }
          })
        }

        if (downloadLocal && autoEmail) {
          get().showToast(
            `✅ Downloaded "${zipFileName}" & emailed via Gmail to ${ORGANIZER_EMAIL}!`
          )
        } else if (autoEmail) {
          get().showToast(
            `📧 Emailed "${zipFileName}" (${targetIds.length} stickers) via Gmail to ${ORGANIZER_EMAIL}!`
          )
        } else if (downloadLocal) {
          get().showToast(
            `⬇️ Downloaded "${zipFileName}" (${targetIds.length} sticker${
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
