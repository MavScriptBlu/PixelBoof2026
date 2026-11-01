/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS} from '../../lib/store'
import PhotoThumbnail from './PhotoThumbnail'
import {PixelIcon} from '../common/PixelUI'

export default function GalleryView({onPhotoClick, onShowStickerQueue}) {
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const stickerQueueDownloading = useStore.useStickerQueueDownloading()
  const attendeeName = useStore.useAttendeeName()
  const attendeeSchool = useStore.useAttendeeSchool()
  const {
    resetStationForNextAttendee,
    downloadStickerQueue,
    setView,
    showToast
  } = useStore.getState()

  const qLen = stickerQueue.length
  const readyPhotosCount = photos.filter(p => !p.isBusy).length
  const canDownloadBatch =
    !stickerQueueDownloading && (qLen > 0 || readyPhotosCount > 0)

  const handleGalleryDownloadBatch = () => {
    if (!attendeeName.trim() || !attendeeSchool.trim()) {
      if (onShowStickerQueue) onShowStickerQueue()
      showToast(
        'Enter your Full Name & High School in the Sticker Queue to unlock Download!',
        'error'
      )
      return
    }
    downloadStickerQueue()
  }

  return (
    <div
      id="subview-gallery"
      className="flex-1 flex flex-col p-3 sm:p-4 bg-[#0b0e17] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-2 pb-3 mb-4 border-b-2 border-[#334155]">
        <div>
          <h2 className="pixel-font text-xs sm:text-sm text-[#facc15]">
            ATTENDEE GALLERY ({photos.length} SNAPS)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Snap as many photos as you like! Pick up to{' '}
            <strong>{MAX_STICKERS} favorites</strong> for transparent Cricut stickers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <button
            id="btn-back-to-camera-gallery"
            type="button"
            onClick={() => setView('camera')}
            className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-2.5 min-h-[44px] bg-sky-500 hover:bg-sky-400 text-[#0b0e17] border-white font-bold justify-center"
            title="Return to the Camera to snap more photos (keeps all your images)"
          >
            <PixelIcon name="camera" size={13} />
            <span>BACK TO CAMERA</span>
          </button>

          <button
            id="btn-download-batch-gallery"
            type="button"
            disabled={!canDownloadBatch}
            onClick={handleGalleryDownloadBatch}
            className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-2.5 min-h-[44px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 justify-center"
            title="Download Batch: Aggregate your queued or captured stickers (up to 3) into a ZIP file"
          >
            <PixelIcon name="download" size={13} />
            <span>
              {stickerQueueDownloading
                ? 'ZIPPING...'
                : `DOWNLOAD BATCH (${
                    qLen > 0 ? qLen : Math.min(readyPhotosCount, MAX_STICKERS)
                  }/${MAX_STICKERS})`}
            </span>
          </button>

          <button
            id="btn-open-queue-gallery"
            type="button"
            onClick={onShowStickerQueue}
            className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-2.5 min-h-[44px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] justify-center"
          >
            <PixelIcon name="ticket" size={13} />
            <span>
              STICKER QUEUE (<span id="gallery-queue-count">{qLen}</span>/
              {MAX_STICKERS})
            </span>
          </button>

          <button
            id="btn-reset-attendee-gallery"
            type="button"
            onClick={resetStationForNextAttendee}
            className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-3 py-2.5 min-h-[44px] bg-[#151928] text-rose-300 border-rose-400 justify-center"
            title="Helpers: Wipe station for next student (asks 'Are you sure?' first)"
          >
            <PixelIcon name="reset" size={12} />
            <span>NEXT ATTENDEE</span>
          </button>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="flex flex-col gap-5">
          <ul
            id="gallery-grid"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {photos.map(photo => (
              <PhotoThumbnail
                key={photo.id}
                photo={photo}
                onClick={() => onPhotoClick(photo.id)}
              />
            ))}
          </ul>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setView('camera')}
              className="pixel-btn text-[9px] sm:text-[10px] px-5 py-3 min-h-[44px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15]"
            >
              <PixelIcon name="camera" size={14} />
              <span>BACK TO CAMERA (SNAP MORE PHOTOS)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
          <div className="mb-3 text-[#facc15]">
            <PixelIcon name="gallery" size={36} />
          </div>
          <p className="pixel-font text-xs text-slate-200 mb-2">
            YOUR GALLERY IS EMPTY
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Switch to the Camera and snap as many photos as you like!
          </p>
          <button
            type="button"
            onClick={() => setView('camera')}
            className="pixel-btn text-[9px] px-4 py-2.5 min-h-[44px] bg-[#9f1239] text-[#facc15] border-[#facc15]"
          >
            <PixelIcon name="camera" size={13} />
            <span>Go to Camera</span>
          </button>
        </div>
      )}
    </div>
  )
}
