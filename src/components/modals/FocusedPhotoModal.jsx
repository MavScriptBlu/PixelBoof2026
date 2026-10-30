/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState} from 'react'
import {useStore, MAX_STICKERS} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'
import Share from '../common/Share'
import PixelLoader from '../common/PixelLoader'

export default function FocusedPhotoModal({
  photoId,
  onClose,
  onOpenStickerQueue
}) {
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const {toggleStickerQueue, editExistingPhoto, showToast} = useStore.getState()

  const [zoom, setZoom] = useState(1)
  const [transformOrigin, setTransformOrigin] = useState('center center')
  const [editPrompt, setEditPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  const photo = photos.find(p => p.id === photoId)
  const m =
    (photo && modes[photo.mode]) ||
    modes['8bit'] || {name: 'Custom', emoji: '✏️'}
  const outputSrc = imageData.outputs[photoId]
  const inputSrc = imageData.inputs[photoId]
  const imgSrc = showOriginal ? inputSrc || outputSrc : outputSrc || inputSrc
  const isBusy = photo?.isBusy || isEditing

  const inQ = stickerQueue.includes(photoId)
  const qLen = stickerQueue.length

  const downloadImage = () => {
    const targetSrc = outputSrc || inputSrc
    if (!targetSrc) return
    const a = document.createElement('a')
    a.href = targetSrc
    a.download = `pixelboof-${photoId}.png`
    a.click()
    showToast('⬇️ Downloaded sticker PNG!')
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!editPrompt.trim() || isBusy) return
    setIsEditing(true)
    await editExistingPhoto(photoId, editPrompt)
    setEditPrompt('')
    setIsEditing(false)
  }

  const handleWheel = e => {
    e.preventDefault()
    setZoom(prev => Math.max(1, Math.min(prev - e.deltaY * 0.01, 4)))
  }

  const handleMouseMove = e => {
    const {left, top, width, height} = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setTransformOrigin(`${x}% ${y}%`)
  }

  let queueBtnText = `🏷️ SAVE FOR STICKER (${qLen}/${MAX_STICKERS})`
  let queueBtnClass = 'bg-[#8B1E41] text-[#ffcc00] border-[#ffcc00]'
  if (inQ) {
    queueBtnText = `✅ IN STICKER QUEUE (${qLen}/${MAX_STICKERS})`
    queueBtnClass = 'bg-emerald-700 text-white border-white'
  } else if (qLen >= MAX_STICKERS) {
    queueBtnText = `🚫 MAX ${MAX_STICKERS} STICKERS QUEUED`
    queueBtnClass = 'bg-rose-900 text-rose-200 border-rose-400'
  }

  return (
    <div
      id="modal-focused"
      className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
      onClick={onClose}
    >
      <div
        className="pixel-box bg-[#1d1526] border-[#ffcc00] max-w-xl w-full p-3.5 sm:p-5 relative flex flex-col items-center max-h-[94dvh] overflow-y-auto rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Compact Modal Header */}
        <div className="w-full flex items-center justify-between gap-2 mb-2.5 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="pixel-font text-[9px] sm:text-xs text-[#ffcc00] truncate">
              {m.emoji} {m.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {inputSrc && outputSrc && (
              <button
                type="button"
                onClick={() => setShowOriginal(!showOriginal)}
                className="pixel-btn text-[8px] px-2.5 py-1.5 min-h-[36px] bg-[#120d18] text-cyan-300 border-cyan-400"
              >
                {showOriginal ? '✨ Show Sticker' : '👁️ Compare Photo'}
              </button>
            )}
            <button
              id="btn-close-focused"
              type="button"
              onClick={onClose}
              className="pixel-btn w-9 h-9 bg-[#120d18] text-white flex items-center justify-center text-xs"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* LARGE HERO STICKER CANVAS */}
        <div
          className="w-full max-w-[380px] sm:max-w-[440px] aspect-square max-h-[48dvh] sm:max-h-[54dvh] bg-[#120d18] border-2 border-[#ffcc00] flex items-center justify-center p-2 sm:p-3 mb-3 relative overflow-hidden shrink-0"
          style={{
            backgroundImage: 'radial-gradient(#2d1f3d 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTransformOrigin('center center')}
        >
          {imgSrc && (
            <img
              id="focused-img"
              src={imgSrc}
              alt="Generated Sticker"
              draggable={false}
              className={`w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)] transition-transform duration-75 ${
                isBusy ? 'opacity-25' : ''
              }`}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin
              }}
            />
          )}
          {isBusy && (
            <div className="absolute inset-0 bg-[#120d18]/75 flex items-center justify-center">
              <PixelLoader size="lg" />
            </div>
          )}
        </div>

        {/* Compact 1-Line AI Edit Input */}
        <form onSubmit={handleEditSubmit} className="w-full mb-2.5 shrink-0">
          <div className="flex gap-1.5">
            <input
              id="focused-edit-input"
              type="text"
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              disabled={isBusy}
              placeholder="🪄 Edit sticker (e.g. Add pixel sunglasses or wizard hat)..."
              className="flex-1 bg-[#120d18] border border-slate-500 focus:border-[#ffcc00] px-3 py-2 min-h-[42px] text-xs text-white outline-none"
            />
            <button
              type="submit"
              disabled={isBusy || !editPrompt.trim()}
              className="pixel-btn text-[8px] px-3 py-2 min-h-[42px] bg-[#8B1E41] text-[#ffcc00] shrink-0"
            >
              {isBusy ? <PixelLoader size="md" /> : '🪄 EDIT'}
            </button>
          </div>
        </form>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full shrink-0">
          <button
            id="btn-focused-queue"
            type="button"
            disabled={isBusy}
            onClick={() => toggleStickerQueue(photoId)}
            className={`pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[44px] flex-1 justify-center ${queueBtnClass}`}
          >
            {queueBtnText}
          </button>

          {qLen > 0 && onOpenStickerQueue && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenStickerQueue()
              }}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[44px] bg-[#120d18] text-[#06b6d4] border-[#06b6d4]"
              title="Open Sticker Queue to Email or Download Batch"
            >
              🎟️ QUEUE ({qLen}/{MAX_STICKERS})
            </button>
          )}

          <Share
            url={outputSrc || inputSrc}
            fileName={`pixelboof-${photoId}.png`}
            onShared={onClose}
          />
          <button
            id="btn-focused-download"
            type="button"
            disabled={isBusy}
            onClick={downloadImage}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[44px] bg-[#23192d] text-white"
          >
            ⬇️ PNG
          </button>
        </div>
      </div>
    </div>
  )
}
