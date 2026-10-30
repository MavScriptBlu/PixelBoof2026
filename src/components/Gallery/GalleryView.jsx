/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS} from '../../lib/store'
import PhotoThumbnail from './PhotoThumbnail'

export default function GalleryView({onPhotoClick, onShowStickerQueue}) {
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const stickerQueueDownloading = useStore.useStickerQueueDownloading()
  const {
    resetStationForNextAttendee,
    downloadStickerQueue,
    setView
  } = useStore.getState()

  const qLen = stickerQueue.length

  return (
    <div
      id="subview-gallery"
      className="flex-1 flex flex-col p-3 sm:p-4 bg-[#140f1d] overflow-y-auto pb-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-[#f7f7f7]">
        <div>
          <h2 className="pixel-font text-xs sm:text-sm text-[#ffcc00]">
            ATTENDEE GALLERY ({photos.length} SNAPS)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Snap as many photos as you like! Pick up to{' '}
            <strong>{MAX_STICKERS} favorites</strong> to turn into actual stickers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-download-batch-gallery"
            type="button"
            disabled={stickerQueueDownloading || qLen === 0}
            onClick={downloadStickerQueue}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[40px] bg-emerald-700 hover:bg-emerald-600 text-white border-white"
            title="Download Batch: Aggregate your queued stickers (up to 3) into a ZIP file"
          >
            {stickerQueueDownloading
              ? '⏳ ZIPPING...'
              : `⬇️ DOWNLOAD BATCH (${qLen}/${MAX_STICKERS})`}
          </button>

          <button
            id="btn-open-queue-gallery"
            type="button"
            onClick={onShowStickerQueue}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[40px] bg-[#8B1E41] text-[#ffcc00]"
          >
            🎟️ STICKER QUEUE (
            <span id="gallery-queue-count">{qLen}</span>/{MAX_STICKERS})
          </button>

          <button
            id="btn-reset-attendee-gallery"
            type="button"
            onClick={resetStationForNextAttendee}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[40px] bg-slate-800 text-rose-300 border-rose-400"
            title="Helpers: Wipe station for next student"
          >
            🔄 NEXT ATTENDEE
          </button>
        </div>
      </div>

      {photos.length > 0 ? (
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
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
          <span className="text-4xl mb-3">🖼️</span>
          <p className="pixel-font text-xs text-slate-200 mb-2">
            YOUR GALLERY IS EMPTY
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Switch to the Camera and snap as many photos as you like!
          </p>
          <button
            type="button"
            onClick={() => setView('camera')}
            className="pixel-btn text-[9px] px-4 py-2 bg-[#8B1E41] text-[#ffcc00]"
          >
            📷 Go to Camera
          </button>
        </div>
      )}
    </div>
  )
}
