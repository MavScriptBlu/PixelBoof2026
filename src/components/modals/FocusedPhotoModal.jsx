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
import {PixelCloseButton, PixelIcon} from '../common/PixelUI'

export default function FocusedPhotoModal({
  photoId,
  onClose,
  onOpenStickerQueue
}) {
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const {toggleStickerQueue, editExistingPhoto, showToast} = useStore.getState()

  const [editPrompt, setEditPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  const photo = photos.find(p => p.id === photoId)
  const m =
    (photo && modes[photo.mode]) ||
    modes['mario'] ||
    modes['8bit'] || {name: 'Custom', icon: 'pencil'}
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
    showToast('Downloaded transparent Cricut-ready sticker PNG!')
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!editPrompt.trim() || isBusy) return
    setIsEditing(true)
    await editExistingPhoto(photoId, editPrompt)
    setEditPrompt('')
    setIsEditing(false)
  }

  let queueBtnIcon = 'ticket'
  let queueBtnText = `SAVE FOR STICKER (${qLen}/${MAX_STICKERS})`
  let queueBtnClass =
    'bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15]'
  if (inQ) {
    queueBtnIcon = 'check'
    queueBtnText = `IN STICKER QUEUE (${qLen}/${MAX_STICKERS})`
    queueBtnClass = 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300'
  } else if (qLen >= MAX_STICKERS) {
    queueBtnIcon = 'warning'
    queueBtnText = `MAX ${MAX_STICKERS} STICKERS QUEUED`
    queueBtnClass = 'bg-rose-900 text-rose-200 border-rose-400'
  }

  return (
    <div
      id="modal-focused"
      className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
      onClick={onClose}
    >
      <div
        className="pixel-box bg-[#151928] border-[#facc15] max-w-xl w-full p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:p-5 relative flex flex-col items-center max-h-[94dvh] overflow-y-auto rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-2 sm:hidden shrink-0" />
        {/* Compact Modal Header */}
        <div className="w-full flex items-center justify-between gap-2 pb-2.5 mb-3 border-b-2 border-[#334155] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="pixel-font text-[9px] sm:text-xs text-[#facc15] truncate inline-flex items-center gap-1.5">
              <PixelIcon name={m.icon || 'star'} size={13} />
              <span>{m.name}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5">
              <PixelIcon name="check" size={10} />
              <span>Transparent PNG · Cricut Ready</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {inputSrc && outputSrc && (
              <button
                type="button"
                onClick={() => setShowOriginal(!showOriginal)}
                className="pixel-btn text-[8px] px-2.5 py-1.5 min-h-[38px] bg-[#0f1320] text-sky-300 border-sky-400/80"
              >
                <PixelIcon name={showOriginal ? 'sparkle' : 'eye'} size={12} />
                <span>{showOriginal ? 'Show Sticker' : 'Compare Photo'}</span>
              </button>
            )}
            <PixelCloseButton
              id="btn-close-focused"
              onClick={onClose}
              ariaLabel="Close modal"
            />
          </div>
        </div>

        {/* LARGE HERO STICKER CANVAS (Transparent Studio Checkerboard + Zero Watermarks) */}
        <div
          className="w-full max-w-[380px] sm:max-w-[440px] aspect-square max-h-[38dvh] sm:max-h-[54dvh] bg-[#0b0e17] border-2 border-[#475569] flex items-center justify-center p-3 sm:p-4 mb-3 relative overflow-hidden shrink-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #131826 25%, transparent 25%), linear-gradient(-45deg, #131826 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #131826 75%), linear-gradient(-45deg, transparent 75%, #131826 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0'
          }}
        >
          {imgSrc && (
            <img
              id="focused-img"
              src={imgSrc}
              alt="Generated Sticker"
              draggable={false}
              className={`w-full h-full object-contain ${
                isBusy ? 'opacity-25' : ''
              }`}
            />
          )}
          {isBusy && (
            <div className="absolute inset-0 bg-[#0b0e17]/80 flex items-center justify-center">
              <PixelLoader size="lg" />
            </div>
          )}
        </div>

        {/* Conversational Image Editing Input */}
        <form onSubmit={handleEditSubmit} className="w-full mb-3 shrink-0">
          <label
            htmlFor="focused-edit-input"
            className="pixel-font text-[7px] text-sky-300 inline-flex items-center gap-1.5 mb-1.5"
          >
            <PixelIcon name="sparkle" size={10} />
            <span>EDIT THIS STICKER:</span>
          </label>
          <div className="flex gap-1.5">
            <input
              id="focused-edit-input"
              type="text"
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              disabled={isBusy}
              placeholder="e.g. Add pixel sunglasses or a wizard hat..."
              className="flex-1 bg-[#0b0e17] border-2 border-[#334155] focus:border-[#facc15] px-3 py-2 min-h-[42px] text-base sm:text-xs text-white outline-none"
            />
            <button
              type="submit"
              disabled={isBusy || !editPrompt.trim()}
              className="pixel-btn text-[8px] px-3.5 py-2 min-h-[42px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] shrink-0"
            >
              {isBusy ? (
                <PixelLoader size="md" />
              ) : (
                <>
                  <PixelIcon name="pencil" size={12} />
                  <span>EDIT</span>
                </>
              )}
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
            className={`pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[44px] w-full sm:w-auto sm:flex-1 justify-center ${queueBtnClass}`}
          >
            <PixelIcon name={queueBtnIcon} size={13} />
            <span>{queueBtnText}</span>
          </button>

          {qLen > 0 && onOpenStickerQueue && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenStickerQueue()
              }}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[44px] bg-[#0f1320] text-sky-300 border-sky-400"
              title="Open Sticker Queue to Email or Download Batch"
            >
              <PixelIcon name="ticket" size={13} />
              <span>
                QUEUE ({qLen}/{MAX_STICKERS})
              </span>
            </button>
          )}

          <Share
            url={outputSrc || inputSrc}
            fileName={`pixelboof-${photoId}.png`}
            modeName={m.name}
            onShared={onClose}
          />
          <button
            id="btn-focused-download"
            type="button"
            disabled={isBusy}
            onClick={downloadImage}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[44px] bg-[#1e2538] hover:bg-[#283149] text-white border-[#64748b]"
          >
            <PixelIcon name="download" size={12} />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </div>
  )
}
