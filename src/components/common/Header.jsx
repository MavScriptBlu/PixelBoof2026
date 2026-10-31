/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS} from '../../lib/store'
import {MstcBadge} from './PixelUI'

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
      className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border-b-2 border-[#facc15]/80 shrink-0"
      style={{
        background: 'linear-gradient(90deg, #131829 0%, #7f1030 55%, #131829 100%)'
      }}
    >
      <button
        type="button"
        onClick={() => setView('camera')}
        className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left group"
        title="Return to Camera View"
      >
        <MstcBadge />
        <h1 className="pixel-font text-[10px] sm:text-sm md:text-base text-[#facc15] drop-shadow-[2px_2px_0_#07090f] truncate group-hover:text-amber-200 transition-colors">
          PIXEL BOOF
        </h1>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Direct 1-Click Download Batch ZIP Button (Shown once user has queued 1–3 stickers) */}
        {qLen > 0 && (
          <button
            id="btn-download-batch-header"
            type="button"
            disabled={stickerQueueDownloading}
            onClick={downloadStickerQueue}
            className="pixel-btn text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-1.5 min-h-[36px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 flex items-center gap-1 whitespace-nowrap shrink-0"
            title="Download Batch: Save your queued stickers into a local ZIP file"
          >
            <span>⬇️</span>
            <span className="hidden md:inline">
              {stickerQueueDownloading ? 'ZIPPING...' : 'DOWNLOAD BATCH'}
            </span>
          </button>
        )}

        {/* 3-Sticker Queue Counter Button */}
        <button
          id="btn-open-queue-header"
          type="button"
          onClick={onOpenStickerQueue}
          className={`pixel-btn text-[8px] sm:text-[9px] px-2.5 py-1.5 min-h-[36px] flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            qLen >= MAX_STICKERS
              ? 'bg-[#facc15] text-[#0b0e17] border-white'
              : 'bg-[#151928] text-sky-300 border-[#475569] hover:border-sky-400'
          }`}
          title="Open 3-Sticker Print & Email Queue"
        >
          <span>🎟️</span>
          <span className="hidden sm:inline">STICKERS:</span>
          <span id="header-sticker-count">
            {qLen}/{MAX_STICKERS}
          </span>
        </button>

        {/* Camera / Gallery View Toggle */}
        <button
          id="btn-toggle-view"
          type="button"
          onClick={handleToggleView}
          className={`pixel-btn text-[8px] sm:text-[9px] px-2.5 py-1.5 min-h-[36px] flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            isCameraView
              ? 'bg-[#1b2236] text-slate-100 border-[#475569] hover:border-[#facc15]'
              : 'bg-[#facc15] text-[#0b0e17] border-white font-bold'
          }`}
          title={
            isCameraView
              ? 'Open Gallery of Snapped Photos'
              : 'Return to Live Camera View'
          }
        >
          <span id="view-toggle-icon">{isCameraView ? '🖼️' : '📷'}</span>
          <span id="view-toggle-text">
            {isCameraView ? `GALLERY (${photos.length})` : 'BACK TO CAMERA'}
          </span>
        </button>

        {/* Quick Next Attendee / Homepage Reset Button (Opens 'Are you sure?' Validator) */}
        <button
          id="btn-header-next-attendee"
          type="button"
          onClick={resetStationForNextAttendee}
          className="pixel-btn text-[8px] sm:text-[9px] px-2.5 py-1.5 min-h-[36px] bg-[#151928] text-rose-300 border-[#475569] hover:border-rose-400 flex items-center gap-1 whitespace-nowrap shrink-0"
          title="Next Attendee: Wipe session and return to Homepage (asks for confirmation first)"
        >
          <span>🔄</span>
          <span className="hidden lg:inline">NEXT ATTENDEE</span>
        </button>
      </div>
    </header>
  )
}
