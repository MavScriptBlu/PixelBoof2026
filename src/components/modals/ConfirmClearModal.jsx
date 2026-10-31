/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS} from '../../lib/store'
import imageData from '../../lib/imageData'
import {MstcBadge, PixelCloseButton} from '../common/PixelUI'

export default function ConfirmClearModal({
  onOpenStickerQueue,
  onConfirmedReset
}) {
  const confirmModal = useStore.useConfirmModal()
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const stickerQueueDownloading = useStore.useStickerQueueDownloading()

  const {
    closeConfirmModal,
    confirmResetStationForNextAttendee,
    confirmDeletePhoto,
    confirmClearStickerQueue,
    setCapturedPreview,
    downloadStickerQueue,
    setView,
    showToast
  } = useStore.getState()

  if (!confirmModal) return null

  const {type, photoId} = confirmModal
  const photoCount = photos.length
  const queueCount = stickerQueue.length
  const readyCount = photos.filter(p => !p.isBusy).length

  const targetPhotoSrc =
    photoId && (imageData.outputs[photoId] || imageData.inputs[photoId])

  const handleDownloadSingleBeforeDelete = () => {
    if (!targetPhotoSrc || !photoId) return
    const a = document.createElement('a')
    a.href = targetPhotoSrc
    a.download = `pixelboof-${photoId}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast('⬇️ Downloaded sticker PNG!')
  }

  const handleConfirm = () => {
    if (type === 'reset_station') {
      confirmResetStationForNextAttendee()
      if (onConfirmedReset) onConfirmedReset()
    } else if (type === 'delete_photo' && photoId) {
      confirmDeletePhoto(photoId)
    } else if (type === 'clear_queue') {
      confirmClearStickerQueue()
    } else if (type === 'retake_preview') {
      setCapturedPreview(null)
      closeConfirmModal()
      showToast('📸 Photo discarded. Ready to retake!')
    } else {
      closeConfirmModal()
    }
  }

  let title = '⚠️ HOLD UP! ARE YOU SURE?'
  let subtitle =
    'This action will permanently clear your images. Make sure you have saved your stickers before handing off to the next student!'
  let confirmBtnLabel = '🗑️ YES, ERASE ALL & RESET'

  if (type === 'reset_station') {
    title = '⚠️ ERASE IMAGES & RESET FOR NEXT STUDENT?'
    subtitle =
      photoCount > 0
        ? `You have ${photoCount} snapped photo${
            photoCount === 1 ? '' : 's'
          }${
            queueCount > 0
              ? ` (${queueCount}/${MAX_STICKERS} in your Sticker Queue)`
              : ''
          }. Continuing will PERMANENTLY ERASE all images and return to the Homepage for the next student!`
        : 'Are you sure you want to reset the booth and return to the Homepage for the next student?'
    confirmBtnLabel = '🗑️ YES, ERASE ALL & RESET BOOTH'
  } else if (type === 'delete_photo') {
    title = '⚠️ DELETE THIS STICKER?'
    subtitle =
      'Are you sure you want to permanently delete this photo from your gallery? Download or save it first if you want to keep it!'
    confirmBtnLabel = '🗑️ YES, DELETE THIS PHOTO'
  } else if (type === 'clear_queue') {
    title = '⚠️ CLEAR YOUR STICKER QUEUE?'
    subtitle = `Are you sure you want to remove all ${queueCount} sticker${
      queueCount === 1 ? '' : 's'
    } from your 3-sticker queue?`
    confirmBtnLabel = '🗑️ YES, CLEAR QUEUE'
  } else if (type === 'retake_preview') {
    title = '⚠️ DISCARD & RETAKE PHOTO?'
    subtitle =
      'Are you sure you want to discard this snapped photo and take a new one?'
    confirmBtnLabel = '🗑️ YES, DISCARD & RETAKE'
  }

  return (
    <div
      id="modal-confirm-clear"
      className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-3 sm:p-4 no-print"
      onClick={closeConfirmModal}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-clear-title"
    >
      <div
        className="pixel-box bg-[#151928] border-rose-400 max-w-lg w-full p-4 sm:p-5 relative flex flex-col gap-3.5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header with MSTC IT Badge + Warning */}
        <div className="flex items-start justify-between gap-2 border-b-2 border-[#334155] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <MstcBadge size="sm" />
            <h2
              id="confirm-clear-title"
              className="pixel-font text-[10px] sm:text-xs text-[#facc15] leading-relaxed"
            >
              {title}
            </h2>
          </div>

          <PixelCloseButton
            size="sm"
            onClick={closeConfirmModal}
            ariaLabel="Cancel and close"
          />
        </div>

        {/* Warning Body */}
        <div className="bg-[#0b0e17] border-2 border-rose-500/70 p-3.5 text-xs sm:text-sm text-slate-100 leading-relaxed space-y-2.5">
          <p className="text-rose-200 font-semibold">{subtitle}</p>

          {/* Preview of single photo being deleted */}
          {type === 'delete_photo' && targetPhotoSrc && (
            <div className="flex items-center gap-3 pt-1">
              <img
                src={targetPhotoSrc}
                alt="Photo to delete"
                className="w-20 h-20 object-contain bg-[#151928] border border-[#facc15] p-1 shrink-0"
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-300">
                  Want to save a copy to your device before deleting?
                </span>
                <button
                  type="button"
                  onClick={handleDownloadSingleBeforeDelete}
                  className="pixel-btn text-[8px] px-2.5 py-1.5 bg-emerald-700 text-white border-emerald-300 self-start"
                >
                  ⬇️ SAVE PNG FIRST
                </button>
              </div>
            </div>
          )}

          {/* Save Options Before Resetting for Next Student */}
          {type === 'reset_station' && readyCount > 0 && (
            <div className="bg-[#151928] border border-[#facc15] p-3 space-y-2">
              <p className="pixel-font text-[8px] text-[#facc15]">
                💾 SAVE YOUR STICKERS BEFORE RESETTING:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={stickerQueueDownloading}
                  onClick={downloadStickerQueue}
                  className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 flex-1 justify-center"
                >
                  {stickerQueueDownloading
                    ? '⏳ ZIPPING...'
                    : '⬇️ DOWNLOAD BATCH (ZIP)'}
                </button>

                {onOpenStickerQueue && (
                  <button
                    type="button"
                    onClick={() => {
                      closeConfirmModal()
                      onOpenStickerQueue()
                    }}
                    className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] flex-1 justify-center"
                  >
                    🎟️ OPEN STICKER QUEUE (EMAIL / SAVE)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* If they hit the refresh icon just trying to get back to the camera */}
        {type === 'reset_station' && (
          <button
            type="button"
            onClick={() => {
              closeConfirmModal()
              setView('camera')
            }}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[42px] bg-sky-500 hover:bg-sky-400 text-[#0b0e17] border-white w-full justify-center font-bold"
          >
            📷 JUST GO BACK TO CAMERA (KEEP ALL MY PHOTOS!)
          </button>
        )}

        {/* Primary Action Buttons: Cancel vs Confirm Erase */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
          <button
            id="btn-cancel-clear"
            type="button"
            onClick={closeConfirmModal}
            className="pixel-btn text-[8px] sm:text-[9px] px-4 py-2.5 min-h-[42px] bg-[#1e2538] hover:bg-[#283149] text-white border-[#64748b] flex-1 justify-center"
          >
            ✋ CANCEL (KEEP IMAGES)
          </button>

          <button
            id="btn-confirm-clear"
            type="button"
            onClick={handleConfirm}
            className="pixel-btn text-[8px] sm:text-[9px] px-4 py-2.5 min-h-[42px] bg-rose-700 hover:bg-rose-600 text-white border-rose-300 flex-1 justify-center"
          >
            {confirmBtnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
