/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore, MAX_STICKERS, ORGANIZER_EMAIL} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'
import {MstcBadge, PixelCloseButton, PixelIcon} from '../common/PixelUI'

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
  }

  const isBusy = stickerQueueDownloading || emailSending
  const readyPhotos = photos.filter(p => !p.isBusy)
  const hasBatchItems = stickerQueue.length > 0 || readyPhotos.length > 0
  const hasName = Boolean((attendeeName || '').trim())
  const hasSchool = Boolean((attendeeSchool || '').trim())
  const hasAttendeeInfo = hasName && hasSchool
  const canSubmitBatch = !isBusy && hasBatchItems && hasAttendeeInfo

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
        className="pixel-box bg-[#151928] border-[#facc15] max-w-2xl w-full p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:p-5 relative flex flex-col max-h-[92dvh] rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-2 sm:hidden shrink-0" />
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#334155] pb-3 mb-3 gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MstcBadge size="sm" />
              <h2
                id="sticker-queue-title"
                className="pixel-font text-xs sm:text-sm text-[#facc15] inline-flex items-center gap-1.5"
              >
                <PixelIcon name="ticket" size={14} />
                <span>
                  STICKER QUEUE (
                  <span id="modal-queue-count">{stickerQueue.length}</span>/
                  {MAX_STICKERS} MAX)
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Enter your Name &amp; High School (required) to send your transparent Cricut-ready 3-sticker ZIP to{' '}
              <strong className="text-[#facc15]">{ORGANIZER_EMAIL}</strong> or{' '}
              <strong>Download Batch</strong> on the Kiosk computer.
            </p>
          </div>
          <PixelCloseButton
            id="btn-close-queue"
            onClick={onClose}
            ariaLabel="Close sticker queue"
          />
        </div>

        {/* Attendee Name & School Tagging Inputs (Required) */}
        <div className="bg-[#0b0e17] border-2 border-[#334155] p-3 mb-2.5 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="input-attendee-name"
                className="pixel-font text-[8px] text-sky-300 flex items-center justify-between mb-1"
              >
                <span>ATTENDEE FULL NAME *</span>
                <span
                  className={
                    hasName ? 'text-emerald-400' : 'text-amber-400'
                  }
                >
                  {hasName ? 'READY' : 'REQUIRED'}
                </span>
              </label>
              <input
                id="input-attendee-name"
                type="text"
                required
                aria-required="true"
                value={attendeeName}
                onChange={e => setAttendeeName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className={`w-full bg-[#151928] border px-3 py-2 min-h-[42px] text-base sm:text-xs text-white outline-none transition-colors ${
                  hasName
                    ? 'border-emerald-500/80 focus:border-[#facc15]'
                    : 'border-amber-500/70 focus:border-[#facc15]'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="input-attendee-school"
                className="pixel-font text-[8px] text-sky-300 flex items-center justify-between mb-1"
              >
                <span>HIGH SCHOOL *</span>
                <span
                  className={
                    hasSchool ? 'text-emerald-400' : 'text-amber-400'
                  }
                >
                  {hasSchool ? 'READY' : 'REQUIRED'}
                </span>
              </label>
              <input
                id="input-attendee-school"
                type="text"
                required
                aria-required="true"
                value={attendeeSchool}
                onChange={e => setAttendeeSchool(e.target.value)}
                placeholder="e.g. SPASH / Lincoln"
                className={`w-full bg-[#151928] border px-3 py-2 min-h-[42px] text-base sm:text-xs text-white outline-none transition-colors ${
                  hasSchool
                    ? 'border-emerald-500/80 focus:border-[#facc15]'
                    : 'border-amber-500/70 focus:border-[#facc15]'
                }`}
              />
            </div>
          </div>
          {!hasAttendeeInfo && (
            <p className="pixel-font text-[7px] text-amber-300 mt-2 flex items-center gap-1.5">
              <PixelIcon name="warning" size={11} className="text-amber-400 shrink-0" />
              <span>
                FILL IN BOTH FULL NAME &amp; HIGH SCHOOL ABOVE TO UNLOCK SEND
              </span>
            </p>
          )}
        </div>

        {/* Confirmation Banner when Gmail Send Succeeds */}
        {lastEmailResult && (
          <div className="bg-emerald-950/90 border border-emerald-400 px-3 py-2 mb-2.5 text-xs text-emerald-200 flex items-center gap-2 shrink-0">
            <PixelIcon name="check" size={13} className="text-emerald-400" />
            <span>
              Auto-sent <strong>{lastEmailResult.fileName}</strong> directly to{' '}
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
                  modes['mario'] ||
                  modes['8bit'] || {name: 'Custom', icon: 'pencil'}
                const imgSrc = imageData.outputs[id] || imageData.inputs[id]
                return (
                  <li
                    key={id}
                    className="pixel-box bg-[#0b0e17] border-[#facc15] p-2.5 relative flex flex-col items-center"
                  >
                    <span className="pixel-font text-[8px] bg-[#9f1239] text-[#facc15] px-2 py-0.5 self-start mb-1">
                      STICKER #{idx + 1}
                    </span>
                    {imgSrc && (
                      <div
                        className="w-28 h-28 sm:w-32 sm:h-32 my-1 flex items-center justify-center p-1"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #131826 25%, transparent 25%), linear-gradient(-45deg, #131826 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #131826 75%), linear-gradient(-45deg, transparent 75%, #131826 75%)',
                          backgroundSize: '14px 14px',
                          backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0'
                        }}
                      >
                        <img
                          src={imgSrc}
                          draggable={false}
                          alt="Queued sticker"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <span className="pixel-font text-[8px] text-white mt-1 truncate max-w-full inline-flex items-center gap-1">
                      <PixelIcon name={m.icon || 'star'} size={11} />
                      <span>{m.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromStickerQueue(id)}
                      className="pixel-btn text-[8px] px-2 py-1.5 min-h-[38px] bg-rose-800 hover:bg-rose-700 text-white border-rose-400 mt-2 w-full justify-center"
                    >
                      <PixelIcon name="trash" size={11} />
                      <span>Remove</span>
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

        {/* Footer Actions: Auto-Send via Gmail vs Kiosk Download Batch + Next Attendee Reset */}
        <div className="flex flex-col gap-2 pt-3 mt-2.5 border-t-2 border-[#334155] shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Auto-Send directly to mavscriptblue@gmail.com */}
            <button
              id="btn-email-batch"
              type="button"
              onClick={() =>
                processStickerBatch({
                  downloadLocal: false,
                  autoEmail: true
                })
              }
              disabled={!canSubmitBatch}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-3 min-h-[44px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] justify-center"
              title={
                !hasAttendeeInfo
                  ? 'Fill in your Full Name and High School first'
                  : `Automatically email ZIP batch directly to ${ORGANIZER_EMAIL}`
              }
            >
              <PixelIcon name="mail" size={13} />
              <span>
                {emailSending && !stickerQueueDownloading
                  ? 'SENDING TO GMAIL...'
                  : !hasAttendeeInfo
                    ? 'ENTER NAME & SCHOOL TO SEND'
                    : `SEND TO GMAIL (${ORGANIZER_EMAIL.split('@')[0]})`}
              </span>
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
              disabled={!canSubmitBatch}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-3 min-h-[44px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 justify-center"
              title={
                !hasAttendeeInfo
                  ? 'Fill in your Full Name and High School first'
                  : 'Aggregate up to 3 captured/queued stickers into a ZIP file for local saving on this computer'
              }
            >
              <PixelIcon name="download" size={13} />
              <span>
                {stickerQueueDownloading
                  ? 'ZIPPING BATCH...'
                  : !hasAttendeeInfo
                    ? 'ENTER NAME & SCHOOL FOR ZIP'
                    : 'DOWNLOAD BATCH'}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              id="btn-clear-queue"
              type="button"
              onClick={clearStickerQueue}
              className="pixel-btn text-[8px] px-3 py-2 min-h-[40px] bg-[#1e2538] text-slate-200 border-[#475569]"
            >
              <PixelIcon name="trash" size={12} />
              <span>CLEAR QUEUE</span>
            </button>

            <button
              id="btn-reset-station-modal"
              type="button"
              onClick={handleResetAndClose}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2 min-h-[40px] bg-rose-800 hover:bg-rose-700 text-white border-rose-400 flex-1 sm:flex-initial justify-center"
            >
              <PixelIcon name="reset" size={12} />
              <span>NEXT ATTENDEE (RETURN TO HOMEPAGE)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
