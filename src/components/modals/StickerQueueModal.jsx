/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react'
import {useStore, MAX_STICKERS, ORGANIZER_EMAIL} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'
import {initAuth, googleSignIn, getAccessToken, logout} from '../../lib/gmailAuth'

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
    setAttendeeSchool,
    showToast
  } = useStore.getState()

  const [needsAuth, setNeedsAuth] = useState(true)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [pendingConfirmAction, setPendingConfirmAction] = useState(null)

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, authedToken) => {
        setUser(authedUser)
        setToken(authedToken)
        setNeedsAuth(false)
      },
      () => {
        setUser(null)
        setToken(null)
        setNeedsAuth(true)
      }
    )
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    setIsLoggingIn(true)
    try {
      const result = await googleSignIn()
      if (result) {
        setToken(result.accessToken)
        setUser(result.user)
        setNeedsAuth(false)
        showToast(`✅ Signed in with Google as ${result.user.email}!`)
      }
    } catch (err) {
      console.error('Login failed:', err)
      showToast('Google Sign-In was cancelled or failed.', 'error')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setToken(null)
    setNeedsAuth(true)
  }

  const handleResetAndClose = () => {
    resetStationForNextAttendee()
    onClose()
  }

  const rawName = (attendeeName || '').trim() || 'Attendee'
  const rawSchool = (attendeeSchool || '').trim() || 'TechCon'
  const prefix = `${rawName.replace(/\s+/g, '_')}-${rawSchool.replace(/\s+/g, '_')}`
  const previewZipName = `${prefix}_PixelBoof_${stickerQueue.length}stickers.zip`

  const handleRequestGmailSend = async ({downloadLocal = false}) => {
    if (stickerQueue.length === 0) {
      showToast('Queue at least 1 sticker first!', 'error')
      return
    }
    let activeToken = token || (await getAccessToken())
    if (!activeToken) {
      try {
        setIsLoggingIn(true)
        const result = await googleSignIn()
        if (result?.accessToken) {
          activeToken = result.accessToken
          setToken(result.accessToken)
          setUser(result.user)
          setNeedsAuth(false)
        }
      } catch {
        setNeedsAuth(true)
        showToast('Please sign in with Google to send via Gmail.', 'error')
        return
      } finally {
        setIsLoggingIn(false)
      }
    }
    // Present mandatory confirmation dialog before sending email via Gmail API
    setPendingConfirmAction({
      downloadLocal,
      accessToken: activeToken
    })
  }

  const handleConfirmSendEmail = async () => {
    if (!pendingConfirmAction) return
    const {downloadLocal, accessToken} = pendingConfirmAction
    setPendingConfirmAction(null)
    const res = await processStickerBatch({
      downloadLocal,
      autoEmail: true,
      accessToken
    })
    if (res?.needsAuth) {
      setNeedsAuth(true)
      setToken(null)
    }
  }

  const isBusy = stickerQueueDownloading || emailSending || isLoggingIn

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
              Enter your Name &amp; High School! Send your sticker ZIP via{' '}
              <strong>Gmail</strong> to the{' '}
              <strong className="text-[#ffcc00]">Booth Print Queue</strong> or download on the Kiosk.
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

        {/* Google Account Bar for Gmail Delivery */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#120d18] border border-slate-600 px-3 py-2 mb-2.5 shrink-0">
          {!needsAuth && user ? (
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs text-emerald-300 truncate">
                ✅ Gmail Connected: <strong>{user.email}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="pixel-btn text-[8px] px-2.5 py-1 bg-[#23192d] text-slate-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <span className="text-xs text-slate-300">
                Using a personal phone? Sign in with Google to email your batch via Gmail:
              </span>
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{display: 'block'}}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          )}
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

        {/* Mandatory User Confirmation Dialog before Sending Email via Gmail API */}
        {pendingConfirmAction && (
          <div className="pixel-box bg-[#120d18] border-[#ffcc00] p-3 mb-2.5 shrink-0">
            <p className="pixel-font text-[8px] text-[#ffcc00] mb-1.5">
              📧 CONFIRM GMAIL SEND:
            </p>
            <p className="text-xs text-slate-200 leading-relaxed mb-2.5">
              Send an email via Gmail to{' '}
              <strong className="text-[#ffcc00]">{ORGANIZER_EMAIL}</strong> with{' '}
              <strong>{stickerQueue.length} sticker(s)</strong> attached as{' '}
              <code>{previewZipName}</code>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingConfirmAction(null)}
                className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-[#23192d] text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendEmail}
                className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-emerald-700 text-white border-[#ffcc00]"
              >
                ✅ Confirm &amp; Send Email
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Banner when Gmail Send Succeeds */}
        {lastEmailResult && (
          <div className="bg-emerald-950/90 border border-emerald-400 px-3 py-2 mb-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2 shrink-0">
            <span>
              ✅ Sent <strong>{lastEmailResult.fileName}</strong> via Gmail to{' '}
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
                Tap any generated sticker and click &ldquo;Save to Queue&rdquo; to pick up to {MAX_STICKERS} favorites!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions: Send via Gmail vs Kiosk Local ZIP Download + Next Attendee Reset */}
        <div className="flex flex-col gap-2 pt-3 mt-2.5 border-t-2 border-[#3b2032] shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Personal Phones: Send via Gmail to Booth Print Queue */}
            <button
              id="btn-email-batch"
              type="button"
              onClick={() => handleRequestGmailSend({downloadLocal: false})}
              disabled={isBusy || stickerQueue.length === 0}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-3 min-h-[44px] bg-[#8B1E41] hover:bg-[#a6244d] text-[#ffcc00] border-[#ffcc00] justify-center"
              title="Send ZIP batch via Gmail to Booth Print Queue"
            >
              {emailSending && !stickerQueueDownloading
                ? '⏳ SENDING VIA GMAIL...'
                : '📧 SEND VIA GMAIL TO BOOTH'}
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
              disabled={isBusy || stickerQueue.length === 0}
              className="pixel-btn text-[8px] sm:text-[9px] px-3 py-3 min-h-[44px] bg-emerald-700 hover:bg-emerald-600 text-white border-white justify-center"
              title="Aggregate your queued stickers (up to 3) into a ZIP file for local saving on this computer"
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
