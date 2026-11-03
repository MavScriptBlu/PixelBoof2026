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
import StationHubModal, {StationGuideContent} from './modals/StationHubModal'
import OrganizerAuthModal from './modals/OrganizerAuthModal'
import {PixelCloseButton, PixelIcon} from './common/PixelUI'
import {playClickSound} from '../lib/sound'
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
  const isLockedSim = useStore.useIsLockedSim()
  const boothQrUrl = useStore.useBoothQrUrl()

  const {
    setShowThemeModal,
    setShowLensDrawer,
    setFocusedPhotoId,
    closeConfirmModal,
    setTheme,
    setIsLockedSim,
    unlockBoothWithPasscode,
    clearToast
  } = useStore.getState()

  const [showStickerQueue, setShowStickerQueue] = useState(false)
  const [showChatHelper, setShowChatHelper] = useState(false)
  const [showStationHub, setShowStationHub] = useState(false)
  const [showOrganizerAuth, setShowOrganizerAuth] = useState(false)
  const [pendingStationTab, setPendingStationTab] = useState('cloud')
  const [stationHubTab, setStationHubTab] = useState('cloud')
  const [unlockPassInput, setUnlockPassInput] = useState('')

  const handleOpenStationHub = useCallback((tab = 'cloud') => {
    const unlocked = useStore.getState().isOrganizerUnlocked
    if (unlocked) {
      setStationHubTab(tab)
      setShowStationHub(true)
    } else {
      setPendingStationTab(tab)
      setShowOrganizerAuth(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pathLower = (window.location.pathname || '').toLowerCase()
    const params = new URLSearchParams(window.location.search)
    const tabParam = (params.get('tab') || '').toLowerCase()
    if (pathLower.includes('/guide') || tabParam === 'guide') {
      handleOpenStationHub('guide')
    } else if (tabParam === 'cloud' || tabParam === 'qr') {
      handleOpenStationHub('cloud')
    }

    // Secret Organizer Keyboard Shortcut: Shift + Alt + O
    const handleKeyDown = e => {
      if (e.shiftKey && e.altKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault()
        handleOpenStationHub('cloud')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleOpenStationHub])

  const isModalOpen =
    !!confirmModal ||
    !!focusedPhotoId ||
    showStickerQueue ||
    showThemeModal ||
    showLensDrawer ||
    showChatHelper ||
    showOrganizerAuth ||
    showStationHub

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
    setShowOrganizerAuth(false)
    setShowStationHub(false)
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

  const handleUnlockSubmit = e => {
    e.preventDefault()
    if (unlockBoothWithPasscode(unlockPassInput)) {
      setUnlockPassInput('')
    }
  }

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

  // Global delegated retro 8-bit click sound for interactive buttons
  useEffect(() => {
    const handleGlobalButtonClick = e => {
      const target = e.target?.closest?.(
        'button, a.pixel-btn, [role="button"], [role="tab"]'
      )
      if (!target || target.disabled) return
      // Camera shutter and sound toggle handle their own audio cues
      if (target.id === 'btn-shutter' || target.id === 'btn-toggle-sound') return
      playClickSound()
    }

    document.addEventListener('click', handleGlobalButtonClick)
    return () => {
      document.removeEventListener('click', handleGlobalButtonClick)
    }
  }, [])

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
    if (!toastInfo) return
    const duration = toastInfo.type === 'error' ? 2800 : 2300
    const timer = setTimeout(() => {
      clearToast()
    }, duration)
    return () => clearTimeout(timer)
  }, [toastInfo, clearToast])

  return (
    <main className="h-dvh w-full overflow-hidden flex flex-col bg-[#0b0e17] text-[#f8fafc]">
      {/* Global Modals & Toasts */}
      {showDisclaimer && <Disclaimer />}
      {showTutorial && <Tutorial />}
      <ErrorToast />

      {/* Main Photobooth Container (Full-bleed on mobile, wide arcade frame on desktop) */}
      <div className="no-print flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto bg-[#0b0e17] sm:border-x-2 border-[#252d44] shadow-2xl overflow-hidden">
        <Header
          onOpenStickerQueue={handleShowStickerQueue}
          onOpenStationHub={handleOpenStationHub}
        />

        {isLockedSim ? (
          /* EVENT LOCKED OVERLAY (Shown when outside event hours or pass locked) */
          <div
            id="booth-locked-screen"
            className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-[#0b0e17] overflow-y-auto"
          >
            <div className="pixel-box bg-[#151928] border-[#9f1239] p-5 sm:p-6 max-w-md w-full">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#9f1239]/30 border-2 border-[#facc15] text-[#facc15] mb-3">
                <PixelIcon name="lock" size={24} />
              </div>
              <h2 className="pixel-font text-xs sm:text-sm text-[#facc15] mb-3 leading-relaxed">
                BOOTH CLOSED OUTSIDE EVENT HOURS
              </h2>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Thanks for checking out <strong>PixelBoof</strong> at Mid-State Technical College&rsquo;s Tech-Con! Mobile QR access and AI sticker generation are only unlocked during live convention hours so our student dev doesn&rsquo;t get hit with surprise Cloud Run bills.
              </p>
              <form
                onSubmit={handleUnlockSubmit}
                className="bg-[#0b0e17] border-2 border-[#334155] p-3 mb-4 text-left"
              >
                <label
                  htmlFor="unlock-pass-input"
                  className="pixel-font text-[8px] text-sky-300 block mb-1.5"
                >
                  HAVE TODAY&rsquo;S BOOTH PASSCODE?
                </label>
                <div className="flex gap-2">
                  <input
                    id="unlock-pass-input"
                    type="text"
                    value={unlockPassInput}
                    onChange={e => setUnlockPassInput(e.target.value)}
                    placeholder="Enter MSTC26 or TECHCON26"
                    className="flex-1 bg-[#151928] border border-slate-600 focus:border-[#facc15] px-2.5 py-2 min-h-[40px] text-xs text-white font-mono uppercase outline-none"
                  />
                  <button
                    id="btn-unlock-pass"
                    type="submit"
                    className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2 min-h-[40px] bg-[#9f1239] text-[#facc15] border-[#facc15]"
                  >
                    UNLOCK
                  </button>
                </div>
              </form>
              <button
                id="btn-resume-live-demo"
                type="button"
                onClick={() => setIsLockedSim(false)}
                className="pixel-btn text-[8px] sm:text-[9px] px-4 py-2.5 min-h-[42px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 w-full justify-center"
              >
                <PixelIcon name="unlock" size={13} />
                <span>RE-OPEN BOOTH (LIVE DEMO MODE)</span>
              </button>
            </div>
          </div>
        ) : currentView === 'camera' ? (
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

      {/* ORGANIZER AUTH / PASSWORD WALL MODAL */}
      <OrganizerAuthModal
        isOpen={showOrganizerAuth}
        onSuccess={() => {
          setShowOrganizerAuth(false)
          setStationHubTab(pendingStationTab)
          setShowStationHub(true)
        }}
        onClose={() => setShowOrganizerAuth(false)}
      />

      {/* STATION HUB MODAL (QR & CLOUD RUN COST GUARD + 3-PAGE MASTER GUIDE) */}
      {showStationHub && (
        <StationHubModal
          initialTab={stationHubTab}
          onClose={() => setShowStationHub(false)}
        />
      )}

      {/* Dedicated Print Target so Ctrl+P or Print Button always prints the 2-Page Station & Helper Guide */}
      <div className="hidden print:block">
        <StationGuideContent qrUrl={boothQrUrl} />
      </div>

      {/* UNIVERSAL 'ARE YOU SURE?' VALIDATOR MODAL BEFORE CLEARING IMAGES */}
      <ConfirmClearModal
        onOpenStickerQueue={handleShowStickerQueue}
        onConfirmedReset={() => setShowStickerQueue(false)}
      />

      {/* PIXELBOT PROMPT HELPER MODAL (Accessible from Custom Prompt mode) */}
      {showChatHelper && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
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
          className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
          onClick={() => setShowThemeModal(false)}
        >
          <div
            className="pixel-box bg-[#151928] border-[#facc15] max-w-xl w-full p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5 relative max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-2.5 sm:hidden" />
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
                  className="pixel-box bg-[#0f1320] border-[#334155] hover:border-[#facc15] p-3 min-h-[88px] text-center flex flex-col items-center justify-center gap-2 cursor-pointer text-[#facc15]"
                >
                  <PixelIcon name={t.icon || 'star'} size={22} />
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

      {/* AUTO-DISMISSING TOAST NOTIFICATION */}
      {toastInfo && (
        <div
          id="toast-box"
          role="status"
          aria-live="polite"
          onClick={clearToast}
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] pixel-box px-3.5 py-2.5 text-xs font-bold flex items-center gap-2.5 max-w-md w-auto max-w-[92%] cursor-pointer transition-opacity duration-200 no-print ${
            toastInfo.type === 'error'
              ? 'bg-rose-800 text-white border-rose-300'
              : 'bg-emerald-800 text-white border-[#facc15]'
          }`}
        >
          <PixelIcon
            name={toastInfo.type === 'error' ? 'warning' : 'check'}
            size={14}
            className={
              toastInfo.type === 'error' ? 'text-rose-200' : 'text-[#facc15]'
            }
          />
          <span className="leading-snug">{toastInfo.message}</span>
        </div>
      )}
    </main>
  )
}
