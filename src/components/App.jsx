/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useCallback, useEffect} from 'react'
import {useStore} from '../lib/store'
import {THEMES} from '../lib/modes'
import Header from './common/Header'
import CameraView from './Camera/CameraView'
import GalleryView from './Gallery/GalleryView'
import ChatBotPanel from './Chat/ChatBotPanel'
import Disclaimer from './modals/Disclaimer'
import Tutorial from './modals/Tutorial'
import ErrorToast from './modals/ErrorToast'
import FocusedPhotoModal from './modals/FocusedPhotoModal'
import StickerQueueModal from './modals/StickerQueueModal'
import ConfirmClearModal from './modals/ConfirmClearModal'
import {PixelCloseButton} from './common/PixelUI'
import './App.css'

export default function App() {
  const currentView = useStore.useCurrentView()
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const showDisclaimer = useStore.useShowDisclaimer()
  const showTutorial = useStore.useShowTutorial()
  const showThemeModal = useStore.useShowThemeModal()
  const showLensDrawer = useStore.useShowLensDrawer()
  const focusedPhotoId = useStore.useFocusedPhotoId()
  const toastInfo = useStore.useToastInfo()
  const confirmModal = useStore.useConfirmModal()

  const {
    setShowThemeModal,
    setShowLensDrawer,
    setFocusedPhotoId,
    closeConfirmModal,
    setTheme,
    clearToast
  } = useStore.getState()

  const [showStickerQueue, setShowStickerQueue] = useState(false)
  const [showChatHelper, setShowChatHelper] = useState(false)

  const isModalOpen =
    !!confirmModal ||
    !!focusedPhotoId ||
    showStickerQueue ||
    showThemeModal ||
    showLensDrawer ||
    showChatHelper

  const closeModal = useCallback(() => {
    if (confirmModal) {
      closeConfirmModal()
      return
    }
    setFocusedPhotoId(null)
    setShowStickerQueue(false)
    setShowThemeModal(false)
    setShowLensDrawer(false)
    setShowChatHelper(false)
  }, [
    confirmModal,
    closeConfirmModal,
    setFocusedPhotoId,
    setShowThemeModal,
    setShowLensDrawer
  ])

  const handlePhotoClick = useCallback(
    id => {
      setFocusedPhotoId(id)
    },
    [setFocusedPhotoId]
  )

  const handleShowStickerQueue = useCallback(() => {
    setShowStickerQueue(true)
  }, [])

  // Protect against accidental browser Refresh / Reload when images exist
  useEffect(() => {
    const hasUnsavedImages = photos.length > 0 || stickerQueue.length > 0
    if (!hasUnsavedImages) return

    const handleBeforeUnload = e => {
      e.preventDefault()
      e.returnValue =
        'Are you sure you want to refresh? Your snapped photos and stickers will be erased!'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [photos.length, stickerQueue.length])

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen, closeModal])

  useEffect(() => {
    if (toastInfo) {
      const timer = setTimeout(() => {
        clearToast()
      }, 4200)
      return () => clearTimeout(timer)
    }
  }, [toastInfo, clearToast])

  return (
    <main className="h-dvh w-full overflow-hidden flex flex-col bg-[#0b0e17] text-[#f8fafc]">
      {/* Global Modals & Toasts */}
      {showDisclaimer && <Disclaimer />}
      {showTutorial && <Tutorial />}
      <ErrorToast />

      {/* Main Photobooth Container (Full-bleed on mobile, wide arcade frame on desktop) */}
      <div className="flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto bg-[#0b0e17] sm:border-x-2 border-[#252d44] shadow-2xl overflow-hidden">
        <Header onOpenStickerQueue={handleShowStickerQueue} />

        {currentView === 'camera' ? (
          <CameraView
            onPhotoClick={handlePhotoClick}
            onOpenChatHelper={() => setShowChatHelper(true)}
          />
        ) : (
          <GalleryView
            onPhotoClick={handlePhotoClick}
            onShowStickerQueue={handleShowStickerQueue}
          />
        )}
      </div>

      {/* LARGE STICKER RESULT / FOCUSED PHOTO MODAL */}
      {focusedPhotoId && (
        <FocusedPhotoModal
          photoId={focusedPhotoId}
          onClose={() => setFocusedPhotoId(null)}
          onOpenStickerQueue={handleShowStickerQueue}
        />
      )}

      {/* STICKER QUEUE MODAL */}
      {showStickerQueue && (
        <StickerQueueModal onClose={() => setShowStickerQueue(false)} />
      )}

      {/* UNIVERSAL 'ARE YOU SURE?' VALIDATOR MODAL BEFORE CLEARING IMAGES */}
      <ConfirmClearModal
        onOpenStickerQueue={handleShowStickerQueue}
        onConfirmedReset={() => setShowStickerQueue(false)}
      />

      {/* PIXELBOT PROMPT HELPER MODAL (Accessible from Custom Prompt mode) */}
      {showChatHelper && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowChatHelper(false)}
        >
          <div
            className="pixel-box bg-[#151928] border-[#facc15] max-w-2xl w-full h-[82dvh] flex flex-col relative overflow-hidden rounded-t-2xl sm:rounded-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-2.5 right-2.5 z-20">
              <PixelCloseButton
                size="sm"
                onClick={() => setShowChatHelper(false)}
                ariaLabel="Close PixelBot"
              />
            </div>
            <ChatBotPanel
              onNavigateToStudio={id => {
                setShowChatHelper(false)
                setFocusedPhotoId(id)
              }}
            />
          </div>
        </div>
      )}

      {/* FULL THEME SELECTOR MODAL */}
      {showThemeModal && (
        <div
          id="modal-themes"
          className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowThemeModal(false)}
        >
          <div
            className="pixel-box bg-[#151928] border-[#facc15] max-w-xl w-full p-4 sm:p-5 relative max-h-[90dvh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="pixel-font text-xs sm:text-sm text-[#facc15]">
                  SELECT LENS CATEGORY DECK
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Pick a category deck for your pixel transformation!
                </p>
              </div>
              <PixelCloseButton
                id="btn-close-themes"
                onClick={() => setShowThemeModal(false)}
                ariaLabel="Close themes"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTheme(key)
                    setShowThemeModal(false)
                  }}
                  className="pixel-box bg-[#0f1320] border-[#334155] hover:border-[#facc15] p-3 min-h-[88px] text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="pixel-font text-[9px] text-[#facc15]">
                    {t.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastInfo && (
        <div
          id="toast-box"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pixel-box px-4 py-3 text-xs font-bold flex items-center gap-3 max-w-md w-[92%] ${
            toastInfo.type === 'error'
              ? 'bg-rose-800 text-white border-rose-300'
              : 'bg-emerald-800 text-white border-[#facc15]'
          }`}
        >
          <span className="flex-1 leading-snug">{toastInfo.message}</span>
          <PixelCloseButton
            size="sm"
            onClick={clearToast}
            ariaLabel="Dismiss notification"
          />
        </div>
      )}
    </main>
  )
}
