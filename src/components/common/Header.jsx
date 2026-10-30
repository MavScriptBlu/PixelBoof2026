/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS} from '../../lib/store'

export default function Header({onOpenStickerQueue}) {
  const currentView = useStore.useCurrentView()
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const stickerQueueDownloading = useStore.useStickerQueueDownloading()
  const {
    setView,
    downloadStickerQueue,
    resetStationForNextAttendee
  } = useStore.getState()

  const qLen = stickerQueue.length
  const isCameraView = currentView === 'camera'

  const handleToggleView = () => {
    setView(isCameraView ? 'gallery' : 'camera')
  }

  return (
    <header
      className="flex items-center justify-between gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 border-b-2 border-[#ffcc00] shrink-0"
      style={{
        background: 'linear-gradient(90deg, #5e112b 0%, #8B1E41 55%, #3b0d1f 100%)'
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="pixel-font text-[7px] bg-[#120d18] text-[#ffcc00] border border-[#ffcc00] px-1.5 py-1 shadow-[2px_2px_0_#000] hidden md:inline-block shrink-0">
          MSTC IT
        </span>
        <h1 className="pixel-font text-[11px] sm:text-sm md:text-base text-[#ffcc00] drop-shadow-[2px_2px_0_#120d18] truncate">
          PIXEL BOOF
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Direct 1-Click Download Batch ZIP Button (Shown once user has queued 1–3 stickers) */}
        {qLen > 0 && (
          <button
            id="btn-download-batch-header"
            type="button"
            disabled={stickerQueueDownloading}
            onClick={downloadStickerQueue}
            className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-1.5 min-h-[36px] bg-emerald-700 hover:bg-emerald-600 text-white border-white flex items-center gap-1 whitespace-nowrap shrink-0"
            title="Download Batch: Save your queued stickers into a local ZIP file"
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">
              {stickerQueueDownloading ? 'ZIPPING...' : 'DOWNLOAD BATCH'}
            </span>
          </button>
        )}

        {/* 3-Sticker Queue Counter Button */}
        <button
          id="btn-open-queue-header"
          type="button"
          onClick={onOpenStickerQueue}
          className={`pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-1.5 min-h-[36px] flex items-center gap-1 whitespace-nowrap shrink-0 ${
            qLen >= MAX_STICKERS
              ? 'bg-[#ffcc00] text-[#120d18] border-white'
              : 'bg-[#120d18] text-[#06b6d4] border-[#06b6d4]'
          }`}
          title="Open 3-Sticker Print & Email Queue"
        >
          <span>🎟️</span>
          <span className="hidden xs:inline">STICKERS:</span>
          <span id="header-sticker-count">
            {qLen}/{MAX_STICKERS}
          </span>
        </button>

        {/* Camera / Gallery View Toggle */}
        <button
          id="btn-toggle-view"
          type="button"
          onClick={handleToggleView}
          className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-1.5 min-h-[36px] bg-[#23192d] text-white flex items-center gap-1 whitespace-nowrap shrink-0"
        >
          <span id="view-toggle-icon">{isCameraView ? '🖼️' : '📷'}</span>
          <span id="view-toggle-text">
            {isCameraView ? `GALLERY (${photos.length})` : 'CAMERA'}
          </span>
        </button>

        {/* Quick Next Attendee / Homepage Reset Button */}
        <button
          id="btn-header-next-attendee"
          type="button"
          onClick={resetStationForNextAttendee}
          className="pixel-btn text-[8px] sm:text-[9px] px-2 py-1.5 min-h-[36px] bg-[#120d18] text-rose-300 border-rose-400 flex items-center gap-1 whitespace-nowrap shrink-0"
          title="Next Attendee: Wipe session and return to Homepage"
        >
          <span>🔄</span>
          <span className="hidden md:inline">NEXT ATTENDEE</span>
        </button>
      </div>
    </header>
  )
}
