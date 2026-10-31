/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react'
import {useStore} from '../../lib/store'

/**
 * Social Media Sharing component next to the sticker display.
 * Allows users to share their generated pixel art directly to Twitter (X) or Instagram,
 * copy the sticker PNG to clipboard, or invoke the native mobile share sheet.
 */
export default function Share({
  url,
  fileName = 'pixelboof-sticker.png',
  modeName = 'Pixel Sticker',
  onShared,
  compact = false
}) {
  const {showToast} = useStore.getState()
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [showSocialMenu, setShowSocialMenu] = useState(false)

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      typeof navigator.canShare === 'function'
    ) {
      try {
        const dummyFile = new File([''], 'dummy.png', {type: 'image/png'})
        if (navigator.canShare({files: [dummyFile]})) {
          setCanNativeShare(true)
        }
      } catch {
        setCanNativeShare(false)
      }
    }
  }, [])

  const shareText = `Check out my custom ${modeName} pixel sticker made with #PixelBoof at Mid-State Tech-Con! 🕹️✨ #MSTC #PixelArt`
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`

  const getStickerBlobAndFile = async () => {
    const response = await fetch(url)
    const blob = await response.blob()
    const file = new File([blob], fileName, {type: blob.type || 'image/png'})
    return {blob, file}
  }

  const copyStickerToClipboardAndDownload = async () => {
    if (!url) return false
    try {
      const {blob} = await getStickerBlobAndFile()
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof ClipboardItem !== 'undefined'
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({[blob.type || 'image/png']: blob})
        ])
        return 'copied'
      }
    } catch {
      // Fallback to downloading the PNG if clipboard image write is unsupported
    }

    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return 'downloaded'
  }

  // Share to Twitter / X: copies sticker image to clipboard (or triggers native file share on mobile) so it's ready to attach/paste into the tweet
  const handleTwitterShare = async () => {
    if (!url) return
    try {
      if (canNativeShare) {
        const {file} = await getStickerBlobAndFile()
        await navigator.share({
          title: 'PixelBoof Sticker',
          text: shareText,
          files: [file]
        })
        if (onShared) onShared()
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }

    const status = await copyStickerToClipboardAndDownload()
    if (status === 'copied') {
      showToast(
        '🐦 Sticker copied to clipboard! Press Ctrl+V / Paste in your Tweet!'
      )
    } else {
      showToast('🐦 Sticker PNG downloaded! Attach it to your Tweet!')
    }
  }

  // Share to Instagram: triggers native mobile share sheet (Instagram Stories/Feed) or saves & copies PNG before opening Instagram
  const handleInstagramShare = async e => {
    if (!url) return
    if (canNativeShare) {
      e.preventDefault()
      try {
        const {file} = await getStickerBlobAndFile()
        await navigator.share({
          title: 'PixelBoof Sticker',
          text: shareText,
          files: [file]
        })
        if (onShared) onShared()
        return
      } catch (err) {
        if (err?.name === 'AbortError') return
      }
    }

    // Also download the PNG so desktop/mobile web users can select it in Instagram upload
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    await copyStickerToClipboardAndDownload()
    showToast('📸 Sticker saved to device! Upload it directly on Instagram!')
  }

  const handleCopyOnly = async () => {
    const status = await copyStickerToClipboardAndDownload()
    if (status === 'copied') {
      showToast('📋 Sticker image copied to clipboard!')
    } else {
      showToast('⬇️ Sticker PNG saved to device!')
    }
    setShowSocialMenu(false)
  }

  if (!url) return null

  if (compact) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setShowSocialMenu(prev => !prev)
          }}
          className="pixel-btn text-[8px] px-2 py-1.5 min-h-[34px] bg-[#23192d] text-cyan-300 border-cyan-400/80"
          title="Share to Twitter or Instagram"
        >
          📲 Share
        </button>

        {showSocialMenu && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute bottom-full right-0 mb-1.5 w-44 pixel-box bg-[#120d18] border-[#ffcc00] p-2 z-30 flex flex-col gap-1.5"
          >
            <a
              href={twitterIntentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                handleTwitterShare()
                setShowSocialMenu(false)
              }}
              className="pixel-btn text-[8px] px-2.5 py-2 bg-[#1d9bf0] text-white border-white w-full justify-start no-underline"
            >
              <span>𝕏</span>
              <span>Share to Twitter</span>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => {
                handleInstagramShare(e)
                setShowSocialMenu(false)
              }}
              className="pixel-btn text-[8px] px-2.5 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white border-white w-full justify-start no-underline"
            >
              <span>📸</span>
              <span>Instagram</span>
            </a>
            <button
              type="button"
              onClick={handleCopyOnly}
              className="pixel-btn text-[8px] px-2.5 py-1.5 bg-[#23192d] text-slate-200 w-full justify-start"
            >
              <span>📋</span>
              <span>Copy Image</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Direct Twitter / X Share Button */}
      <a
        id="btn-share-twitter"
        href={twitterIntentUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleTwitterShare}
        className="pixel-btn text-[8px] sm:text-[9px] px-2.5 py-2.5 min-h-[44px] bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white border-white flex items-center gap-1.5 no-underline"
        title="Copy/Share sticker and post to Twitter / X"
      >
        <span className="font-sans font-black text-xs leading-none">𝕏</span>
        <span>TWITTER</span>
      </a>

      {/* Direct Instagram Share Button */}
      <a
        id="btn-share-instagram"
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleInstagramShare}
        className="pixel-btn text-[8px] sm:text-[9px] px-2.5 py-2.5 min-h-[44px] bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white border-white flex items-center gap-1.5 no-underline"
        title="Share sticker to Instagram Stories or Feed"
      >
        <span>📸</span>
        <span>INSTAGRAM</span>
      </a>
    </div>
  )
}
