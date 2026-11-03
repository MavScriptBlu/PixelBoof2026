/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect, useRef} from 'react'
import {useStore} from '../../lib/store'
import {PixelCloseButton, PixelIcon} from '../common/PixelUI'
import {playSuccessSound} from '../../lib/sound'

export default function OrganizerAuthModal({isOpen, onSuccess, onClose}) {
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef(null)

  const {unlockOrganizerWithPin} = useStore.getState()

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setErrorMsg('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = e => {
    e.preventDefault()
    if (!pin.trim()) {
      setErrorMsg('Please enter the admin password.')
      return
    }

    const success = unlockOrganizerWithPin(pin)
    if (success) {
      setErrorMsg('')
      if (onSuccess) {
        onSuccess()
      }
    } else {
      setErrorMsg('Access Denied: Incorrect password.')
      inputRef.current?.select()
    }
  }

  return (
    <div
      id="modal-organizer-auth"
      className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="organizer-auth-title"
    >
      <div
        className="pixel-box bg-[#151928] border-[#facc15] max-w-md w-full p-5 sm:p-6 relative shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3">
          <PixelCloseButton
            id="btn-close-auth-modal"
            size="sm"
            onClick={onClose}
            ariaLabel="Cancel"
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#9f1239] border border-[#facc15] text-[#facc15]">
            <PixelIcon name="lock" size={16} />
          </span>
          <div>
            <span className="pixel-font text-[8px] text-cyan-400 block">
              MSTC IT &bull; ADMIN GATE
            </span>
            <h3
              id="organizer-auth-title"
              className="pixel-font text-xs sm:text-sm text-[#facc15]"
            >
              ADMIN ACCESS LOCK
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          The <strong>Station Hub</strong>, <strong>QR Code Manager</strong>, and <strong>Master Playbook</strong> are restricted to organizers only.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="organizer-pin-input"
              className="text-[10px] font-bold text-sky-300 uppercase block mb-1"
            >
              Enter Admin Password
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                id="organizer-pin-input"
                type={showPassword ? 'text' : 'password'}
                value={pin}
                onChange={e => {
                  setPin(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full bg-[#0b0e17] border-2 border-[#475569] focus:border-[#facc15] px-3 py-2.5 min-h-[42px] text-sm text-white font-mono tracking-wider outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 text-slate-400 hover:text-[#facc15] px-1.5 py-1 text-xs"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs font-semibold text-rose-400 mt-1.5 flex items-center gap-1">
                <PixelIcon name="warning" size={12} />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              id="btn-submit-organizer-pin"
              type="submit"
              className="pixel-btn text-[9px] px-4 py-2.5 min-h-[42px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] flex-1 justify-center font-bold"
            >
              <PixelIcon name="unlock" size={12} />
              <span>UNLOCK HUB</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pixel-btn text-[9px] px-3 py-2.5 min-h-[42px] bg-[#0f1320] text-slate-300 border-[#334155] hover:border-slate-400 justify-center"
            >
              CANCEL
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-[#334155] flex justify-between items-center text-[10px] text-slate-400">
          <span>Organizer: Blu (mavscriptblue@gmail.com)</span>
          <span className="font-mono text-cyan-400">Protected</span>
        </div>
      </div>
    </div>
  )
}
