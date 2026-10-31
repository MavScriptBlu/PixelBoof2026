/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS, ORGANIZER_EMAIL} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'

export default function StickerQueueModal({onClose}) {
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()
  const stickerQueueDownloading = useStore.useStickerQueueDownloading()
  const emailSending = useStore.useEmailSending()
  const lastEmailResult = useStore.useLastEmailResult()
  const attendeeName = useStore.useAttendeeName()
  const attendeeSchool = useStore.useAttendeeSchool()

  const {
    removeFromStickerQueue,
    clearStickerQueue,
    processStickerBatch,
    resetStationForNextAttendee,
    setAttendeeName,
    setAttendeeSchool
  } = useStore.getState()

  const handleResetAndClose = () => {
    resetStationForNextAttendee()
    onClose()
  }

  const isBusy = stickerQueueDownloading || emailSending
  const readyPhotos = photos.filter(p => !p.isBusy)
  const hasBatchItems = stickerQueue.length > 0 || readyPhotos.length > 0

  return (
    <div
      id="modal-queue"
      className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sticker-queue-title"
    >
      <div
        className="pixel-box bg-[#1d1526] border-[#ffcc00] max-w-2xl w-full p-3.5 sm:p-5 relative flex flex-col max-h-[92dvh] rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#8B1E41] pb-2.5 mb-3 gap-2 shrink-0">
          <div>
            <h2
              id="sticker-queue-title"
              className="pixel-font text-xs sm:text-sm text-[#ffcc00]"
            >
              🎟️ STICKER QUEUE (
              <span id="modal-queue-count">{stickerQueue.length}</span>/
              {MAX_STICKERS} MAX)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Enter your Name &amp; High School! Send your 3-sticker ZIP to{' '}
              <strong className="text-[#ffcc00]">{ORGANIZER_EMAIL}</strong> or click{' '}
              <strong>Download Batch</strong> on the Kiosk computer.
            </p>
          </div>
          <button
            id="btn-close-queue"
            type="button"
            onClick={onClose}
            className="pixel-btn w-9 h-9 bg-[#120d18] text-white flex items-center justify-center text-xs shrink-0"
            aria-label="Close sticker queue"
          >
            ✕
          </button>
        </div>

        {/* Attendee Name & School Tagging Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#120d18] border border-[#8B1E41] p-3 mb-2.5 shrink-0">
          <div>
            <label
              htmlFor="input-attendee-name"
              className="pixel-font text-[8px] text-[#06b6d4] block mb-1"
            >
              ATTENDEE FULL NAME
            </label>
            <input
              id="input-attendee-name"
              type="text"
              value={attendeeName}
              onChange={e => setAttendeeName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-[#1d1526] border border-slate-600 focus:border-[#ffcc00] px-3 py-2 min-h-[40px] text-xs text-white"
            />
          </div>
          <div>
            <label
              htmlFor="input-attendee-school"
              className="pixel-font text-[8px] text-[#06b6d4] block mb-1"
            >
              HIGH SCHOOL
            </label>
            <input
              id="input-attendee-school"
              type="text"
              value={attendeeSchool}
              onChange={e => setAttendeeSchool(e.target.value)}
              placeholder="e.g. SPASH / Lincoln"
              className="w-full bg-[#1d1526] border border-slate-600 focus:border-[#ffcc00] px-3 py-2 min-h-[40px] text-xs text-white"
            />
          </div>
        </div>

        {/* Confirmation Banner when Gmail Send Succeeds */}
        {lastEmailResult && (
          <div className="bg-emerald-950/90 border border-emerald-400 px-3 py-2 mb-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2 shrink-0">
            <span>
              ✅ Sent <strong>{lastEmailResult.fileName}</strong> to{' '}
              <strong>{lastEmailResult.recipientEmail}</strong>!
            </span>
          </div>
        )}

        {/* Queued Stickers Grid */}
        <div id="queue-items-container" className="flex-1 overflow-y-auto py-1">
          {stickerQueue.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {stickerQueue.map((id, idx) => {
                const photo = photos.find(p => p.id === id)
                if (!photo) return null
                const m =
                  modes[photo.mode] ||
                  modes['8bit'] || {name: 'Custom', emoji: '✏️'}
                const imgSrc = imageData.outputs[id] || imageData.inputs[id]
                return (
                  <li
                    key={id}
                    className="pixel-box bg-[#120d18] border-[#ffcc00] p-2.5 relative flex flex-col items-center"
                  >
                    <span className="pixel-font text-[8px] bg-[#8B1E41] text-[#ffcc00] px-2 py-0.5 self-start mb-1">
                      STICKER #{idx + 1}
                    </span>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        draggable={false}
                        alt="Queued sticker"
                        className="w-28 h-28 sm:w-32 sm:h-32 object-contain my-1"
                      />
                    )}
                    <span className="pixel-font text-[8px] text-white mt-1 truncate max-w-full">
                      {m.emoji} {m.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromStickerQueue(id)}
                      className="pixel-btn text-[8px] px-2 py-1.5 min-h-[36px] bg-rose-800 text-white mt-2 w-full justify-center"
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p className="pixel-font text-[10px] text-slate-300 mb-2">
                YOUR STICKER QUEUE IS EMPTY (0/{MAX_STICKERS})
              </p>
              <p>
                Tap any generated photo and click &ldquo;Save for Sticker&rdquo; to pick up to {MAX_STICKERS} favorites, or click <strong>Download Batch</strong> to bundle up to {MAX_STICKERS} captured stickers!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions: Send via Gmail vs Kiosk Download Batch + Next Attendee Reset */}
        <div className="flex flex-col gap-2 pt-3 mt-2.5 border-t-2 border-[#3b2032] shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Personal Phones: Send to mavscriptblue@gmail.com */}
            <button
              id="btn-email-batch"
              type="button"
              onClick={() =>
                processStickerBatch({
                  downloadLocal: false,
                  autoEmail: true,
                  shareOnMobile: true
                })
              }
              disabled={isBusy || !hasBatchItems}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-3 min-h-[44px] bg-[#8B1E41] hover:bg-[#a6244d] text-[#ffcc00] border-[#ffcc00] justify-center"
              title={`Email ZIP batch to ${ORGANIZER_EMAIL}`}
            >
              {emailSending && !stickerQueueDownloading
                ? '⏳ SENDING TO GMAIL...'
                : `📧 SEND TO GMAIL (${ORGANIZER_EMAIL.split('@')[0]})`}
            </button>

            {/* School Computer Kiosks: Download Batch ZIP */}
            <button
              id="btn-download-batch"
              type="button"
              onClick={() =>
                processStickerBatch({
                  downloadLocal: true,
                  autoEmail: false
                })
              }
              disabled={isBusy || !hasBatchItems}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-3 min-h-[44px] bg-emerald-700 hover:bg-emerald-600 text-white border-white justify-center"
              title="Aggregate up to 3 captured/queued stickers into a ZIP file for local saving on this computer"
            >
              {stickerQueueDownloading
                ? '⏳ ZIPPING BATCH...'
                : '⬇️ DOWNLOAD BATCH'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              id="btn-clear-queue"
              type="button"
              onClick={clearStickerQueue}
              className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-[#23192d] text-slate-200"
            >
              🗑️ CLEAR QUEUE
            </button>

            <button
              id="btn-reset-station-modal"
              type="button"
              onClick={handleResetAndClose}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2 min-h-[38px] bg-rose-800 text-white border-rose-300 flex-1 sm:flex-initial justify-center"
            >
              🔄 NEXT ATTENDEE (RETURN TO HOMEPAGE)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
