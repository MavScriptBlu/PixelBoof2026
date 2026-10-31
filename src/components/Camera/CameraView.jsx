/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect, useRef, useCallback} from 'react'
import {useStore} from '../../lib/store'
import modes, {THEMES} from '../../lib/modes'
import {transformPhotoToPixelSticker} from '../../lib/gemini'
import ModeSelector from './ModeSelector'
import PhotoBar from './PhotoBar'
import PixelLoader from '../common/PixelLoader'
import {PixelIcon} from '../common/PixelUI'
import {playShutterSound, playSuccessSound, playClickSound} from '../../lib/sound'

const captureCanvas = document.createElement('canvas')
const captureCtx = captureCanvas.getContext('2d')

export default function CameraView({onPhotoClick, onOpenChatHelper}) {
  const activeMode = useStore.useActiveMode()
  const activeTheme = useStore.useActiveTheme()
  const showTutorial = useStore.useShowTutorial()
  const showDisclaimer = useStore.useShowDisclaimer()
  const capturedPreview = useStore.useCapturedPreview()
  const instantTransform = useStore.useInstantTransform()
  const showLensDrawer = useStore.useShowLensDrawer()
  const cameraSessionKey = useStore.useCameraSessionKey()

  const {
    snapPhoto,
    setCapturedPreview,
    setShowLensDrawer,
    openConfirmModal,
    showToast
  } = useStore.getState()

  const [videoActive, setVideoActive] = useState(false)
  const [didInitVideo, setDidInitVideo] = useState(false)
  const [isInitializingCamera, setIsInitializingCamera] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [didJustSnap, setDidJustSnap] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [pixelPreviewUrl, setPixelPreviewUrl] = useState(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const stopVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setVideoActive(false)
    setDidInitVideo(false)
  }, [])

  // Whenever Next Attendee is clicked (cameraSessionKey increments), stop the camera and return to the Homepage!
  useEffect(() => {
    if (cameraSessionKey > 0) {
      stopVideo()
    }
  }, [cameraSessionKey, stopVideo])

  const startVideo = useCallback(
    async (requestedFacingMode = facingMode) => {
      setDidInitVideo(true)
      setIsInitializingCamera(true)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: {ideal: 1920},
            height: {ideal: 1080},
            facingMode: {ideal: requestedFacingMode}
          },
          audio: false
        })

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setVideoActive(true)

        const trackSettings = stream.getVideoTracks()[0]?.getSettings?.() || {}
        const squareSize = Math.min(
          trackSettings.width || 720,
          trackSettings.height || 720
        )
        captureCanvas.width = squareSize || 640
        captureCanvas.height = squareSize || 640
      } catch (err) {
        console.error('Failed to get user media:', err)
        setVideoActive(false)
        showToast(
          'Could not access camera. Check camera permissions or tap Upload Photo!',
          'error'
        )
      } finally {
        setIsInitializingCamera(false)
      }
    },
    [facingMode, showToast]
  )

  useEffect(() => {
    if (
      didInitVideo &&
      !showDisclaimer &&
      !showTutorial &&
      !videoActive &&
      !streamRef.current
    ) {
      startVideo(facingMode)
    }
  }, [didInitVideo, showDisclaimer, showTutorial, videoActive, facingMode, startVideo])

  useEffect(() => {
    return () => stopVideo()
  }, [stopVideo])

  useEffect(() => {
    let cancelled = false
    if (!capturedPreview?.rawDataUrl) {
      setPixelPreviewUrl(null)
      return
    }

    setIsGeneratingPreview(true)
    const themeModes = THEMES[activeTheme]?.modes || THEMES.arcade.modes
    const previewModeKey =
      activeMode === 'random'
        ? themeModes[0]?.key || 'mario'
        : activeMode

    transformPhotoToPixelSticker(
      capturedPreview.rawDataUrl,
      previewModeKey,
      activeMode === 'custom' ? customPrompt : ''
    )
      .then(url => {
        if (!cancelled) {
          setPixelPreviewUrl(url)
          setIsGeneratingPreview(false)
          playSuccessSound()
        }
      })
      .catch(() => {
        if (!cancelled) setIsGeneratingPreview(false)
      })

    return () => {
      cancelled = true
    }
  }, [capturedPreview, activeMode, activeTheme, customPrompt])

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(nextMode)
    startVideo(nextMode)
  }

  const handleFileUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result
      if (typeof dataUrl === 'string') {
        playShutterSound()
        setDidJustSnap(true)
        setTimeout(() => setDidJustSnap(false), 380)
        if (instantTransform) {
          snapPhoto(dataUrl, activeMode === 'custom' ? customPrompt : null)
        } else {
          setCapturedPreview({
            rawDataUrl: dataUrl,
            timestamp: Date.now()
          })
        }
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const takePhoto = () => {
    if (activeMode === 'custom' && !customPrompt.trim()) {
      playClickSound()
      setShowLensDrawer(true)
      showToast('Enter a custom prompt in the Lens Drawer first!', 'error')
      return
    }

    const video = videoRef.current
    if (!video || !videoActive) {
      playClickSound()
      showToast('Press Start to enable the camera or upload a photo first!', 'error')
      return
    }

    const {videoWidth, videoHeight} = video
    const squareSize =
      captureCanvas.width || Math.min(videoWidth, videoHeight) || 640
    captureCanvas.width = squareSize
    captureCanvas.height = squareSize

    const sourceSize = Math.min(videoWidth, videoHeight)
    const sourceX = (videoWidth - sourceSize) / 2
    const sourceY = (videoHeight - sourceSize) / 2

    captureCtx.clearRect(0, 0, squareSize, squareSize)
    captureCtx.setTransform(1, 0, 0, 1, 0, 0)
    if (facingMode === 'user') {
      captureCtx.scale(-1, 1)
      captureCtx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        -squareSize,
        0,
        squareSize,
        squareSize
      )
    } else {
      captureCtx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        squareSize,
        squareSize
      )
    }

    const capturedDataUrl = captureCanvas.toDataURL('image/jpeg', 0.92)

    playShutterSound()
    setDidJustSnap(true)
    setTimeout(() => setDidJustSnap(false), 380)

    if (instantTransform) {
      snapPhoto(capturedDataUrl, activeMode === 'custom' ? customPrompt : null)
    } else {
      setCapturedPreview({
        rawDataUrl: capturedDataUrl,
        timestamp: Date.now()
      })
    }
  }

  const handleConfirmTransform = () => {
    if (!capturedPreview?.rawDataUrl) return
    snapPhoto(
      capturedPreview.rawDataUrl,
      activeMode === 'custom' ? customPrompt : null
    )
  }

  const handleRetake = () => {
    openConfirmModal({type: 'retake_preview'})
  }

  const curModeObj =
    activeMode === 'random'
      ? {name: 'Random', icon: 'question'}
      : activeMode === 'custom'
        ? {name: 'Custom', icon: 'pencil'}
        : modes[activeMode] || modes['mario'] || modes['8bit']

  const isDuoMode = ['shipcouple', 'fantasymates', 'moonlightpair'].includes(
    activeMode
  )

  return (
    <div
      id="subview-camera"
      className="flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* FULL-BLEED CAMERA / HOMEPAGE / CAPTURED PREVIEW VIEWPORT */}
      <div className="relative flex-1 min-h-0 arcade-grid-bg flex items-center justify-center overflow-hidden">
        {/* Live Webcam Video Element */}
        <video
          id="webcam-video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          disablePictureInPicture
          className={`${
            videoActive && !capturedPreview ? 'block' : 'hidden'
          } w-full h-full object-cover transition-transform duration-150`}
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        />

        {/* HOMEPAGE / PRESS START SCREEN (Shown on initial refresh & whenever Next Attendee is hit) */}
        {!videoActive && !capturedPreview && (
          <div
            id="homepage-screen"
            className="absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-6 text-center z-10"
          >
            <div />

            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => startVideo(facingMode)}
                disabled={isInitializingCamera}
                className="flex flex-col items-center justify-center gap-6 p-6 cursor-pointer group"
              >
                <h1 className="pixel-font text-2xl sm:text-4xl md:text-5xl text-[#facc15] drop-shadow-[4px_4px_0_#9f1239] group-hover:scale-105 transition-transform">
                  PIXEL BOOF
                </h1>
                <span className="pixel-btn text-xs sm:text-sm px-8 py-4 min-h-[52px] bg-gradient-to-b from-[#be123c] to-[#881337] text-[#facc15] border-[#facc15] inline-flex items-center justify-center gap-2.5 leading-none">
                  {isInitializingCamera ? (
                    <span className="leading-none">LOADING CAMERA...</span>
                  ) : (
                    <>
                      <PixelIcon name="play" size={14} className="shrink-0 block" />
                      <span className="leading-none">PRESS START</span>
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Stylish Retro Pixel-Font Privacy Box (Strictly on the Homepage) */}
            <div
              id="homepage-privacy-note"
              className="w-full max-w-xl pixel-box bg-[#131826]/95 border-[#334155] px-3.5 py-2.5 sm:px-5 sm:py-3 text-center"
            >
              <p className="pixel-font text-[8px] sm:text-[9px] leading-relaxed text-amber-300">
                Note: No images are saved; data is erased immediately upon page refresh.
              </p>
            </div>
          </div>
        )}

        {/* OPTIONAL MANUAL PREVIEW STAGE */}
        {capturedPreview && (
          <div className="w-full h-full bg-[#0b0e17]/95 p-3 sm:p-5 flex flex-col items-center justify-center z-15 animate-[fadeIn_0.2s_ease-out] overflow-hidden">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center justify-center w-full max-w-2xl flex-1 min-h-0 max-h-[62dvh]">
              {/* Raw Captured Frame */}
              <div className="flex flex-col items-center h-full justify-center">
                <span className="pixel-font text-[8px] text-slate-300 mb-1.5">
                  1. ORIGINAL PHOTO
                </span>
                <div className="w-full aspect-square max-h-[48dvh] pixel-box bg-[#0b0e17] border-[#475569] overflow-hidden">
                  <img
                    src={capturedPreview.rawDataUrl}
                    alt="Captured camera preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Live Pixel Sticker Preview */}
              <div className="flex flex-col items-center h-full justify-center">
                <span className="pixel-font text-[8px] text-[#facc15] mb-1.5 truncate max-w-full">
                  2. {curModeObj.name.toUpperCase()} PREVIEW
                </span>
                <div
                  className="w-full aspect-square max-h-[48dvh] pixel-box bg-[#0b0e17] border-[#facc15] overflow-hidden relative flex items-center justify-center p-2"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #131826 25%, transparent 25%), linear-gradient(-45deg, #131826 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #131826 75%), linear-gradient(-45deg, transparent 75%, #131826 75%)',
                    backgroundSize: '18px 18px',
                    backgroundPosition: '0 0, 0 9px, 9px -9px, -9px 0'
                  }}
                >
                  {pixelPreviewUrl ? (
                    <img
                      src={pixelPreviewUrl}
                      alt="Pixel transformation preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <PixelLoader size="lg" />
                  )}
                  {isGeneratingPreview && (
                    <div className="absolute inset-0 bg-[#0b0e17]/75 flex items-center justify-center">
                      <PixelLoader size="lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mt-2.5 sm:mt-3 w-full max-w-md shrink-0">
              <button
                type="button"
                onClick={handleConfirmTransform}
                className="pixel-btn text-[9px] px-4 py-3 min-h-[44px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 flex-1 justify-center gap-2"
              >
                <PixelIcon name="sparkle" size={13} />
                <span>CREATE STICKER ({curModeObj.name})</span>
              </button>
              <button
                type="button"
                onClick={handleRetake}
                className="pixel-btn text-[9px] px-4 py-3 min-h-[44px] bg-[#1e2538] text-rose-300 border-rose-400 justify-center gap-2"
              >
                <PixelIcon name="reset" size={13} />
                <span>RETAKE</span>
              </button>
            </div>
          </div>
        )}

        {/* Duo Mode Banner */}
        {isDuoMode && videoActive && !capturedPreview && (
          <div
            id="ship-banner"
            className="absolute top-14 sm:top-2.5 left-1/2 -translate-x-1/2 bg-[#0b0e17]/90 border-2 border-[#facc15] text-[#facc15] pixel-font text-[8px] px-2.5 py-1.5 z-10 whitespace-nowrap max-w-[92%] truncate inline-flex items-center gap-2"
          >
            <PixelIcon name="heart" size={12} />
            <span>DUO MODE: GET 2 PEOPLE IN FRAME!</span>
          </div>
        )}

        {/* Floating Top-Right Camera Utility Controls */}
        {videoActive && !capturedPreview && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="pixel-btn text-[8px] px-3 sm:px-2.5 py-2 min-h-[44px] sm:min-h-[40px] bg-[#0b0e17]/85 text-white border-[#475569] hover:border-[#facc15]"
              title="Flip Front/Rear Camera"
            >
              <PixelIcon name="flip" size={12} />
              <span>Flip</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="pixel-btn text-[8px] px-3 sm:px-2.5 py-2 min-h-[44px] sm:min-h-[40px] bg-[#0b0e17]/85 text-sky-300 border-sky-400/80"
              title="Upload Photo from Device"
            >
              <PixelIcon name="upload" size={12} />
              <span>Upload</span>
            </button>
          </div>
        )}

        {/* Camera Shutter Flash Overlay */}
        {didJustSnap && (
          <div
            id="flash-overlay"
            className="camera-flash absolute inset-0 bg-white pointer-events-none z-20"
          />
        )}
      </div>

      {/* SINGLE-ROW COMPACT BOTTOM CAMERA DOCK */}
      {(videoActive || capturedPreview) && (
        <div className="bg-[#131826] border-t-2 border-[#334155] px-2 sm:px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:py-2 shrink-0">
          <div className="grid grid-cols-3 items-center gap-1.5 sm:gap-2 max-w-4xl mx-auto">
            {/* Left Slot: Active Lens Button -> Opens Pop-Up Lens Drawer */}
            <div className="flex items-center justify-start min-w-0">
              <button
                id="btn-open-lens-drawer"
                type="button"
                onClick={() => setShowLensDrawer(true)}
                className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-2 min-h-[46px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] flex items-center gap-2 max-w-full truncate"
                title="Tap to change lens or enter a custom prompt"
              >
                <PixelIcon name={curModeObj.icon || 'star'} size={15} />
                <div className="flex flex-col items-start min-w-0 text-left gap-0.5">
                  <span className="text-[7px] text-amber-200/90 uppercase font-sans font-bold tracking-wider inline-flex items-center gap-1 leading-none">
                    <span>Lens</span>
                    <PixelIcon name="chevron-up" size={8} />
                  </span>
                  <span className="truncate max-w-[74px] sm:max-w-[140px] leading-none">
                    {curModeObj.name}
                  </span>
                </div>
              </button>
            </div>

            {/* Center Slot: Primary Tactile Arcade Shutter Button */}
            <div className="flex items-center justify-center">
              <button
                id="btn-shutter"
                type="button"
                onClick={takePhoto}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#be123c] to-[#881337] hover:from-[#e11d48] hover:to-[#9f1239] border-3 border-[#facc15] shadow-[4px_4px_0_#04060b] flex items-center justify-center transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
                title="Snap Photo & Generate Sticker!"
              >
                <PixelIcon name="camera" size={24} className="text-white" />
              </button>
            </div>

            {/* Right Slot: Single Compact Inline Row of Recent Snaps */}
            <div className="flex items-center justify-end min-w-0">
              <PhotoBar onPhotoClick={onPhotoClick} />
            </div>
          </div>
        </div>
      )}

      {/* POP-UP LENS DRAWER MODAL */}
      {showLensDrawer && (
        <ModeSelector
          customPrompt={customPrompt}
          onCustomPromptChange={setCustomPrompt}
          onOpenChatHelper={onOpenChatHelper}
          onClose={() => setShowLensDrawer(false)}
        />
      )}
    </div>
  )
}