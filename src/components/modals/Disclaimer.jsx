/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import {MstcBadge, PixelIcon} from '../common/PixelUI'
import './Panel.css'

export default function Disclaimer() {
  const {acceptDisclaimer} = useStore.getState()

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="pixel-box bg-[#151928] border-[#facc15] max-w-md w-full p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b-2 border-[#334155] pb-3">
          <MstcBadge size="sm" />
          <h2 id="disclaimer-title" className="pixel-font text-xs text-[#facc15]">
            PRIVACY &amp; TERMS OF USE
          </h2>
        </div>
        <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <PixelIcon name="camera" size={14} className="text-[#facc15] mt-0.5" />
            <p>
              <strong>Your photos are not saved or stored.</strong> All
              processing happens in memory and images are deleted when you
              refresh or close the page.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <PixelIcon name="bot" size={14} className="text-sky-300 mt-0.5" />
            <p>
              <strong>This is an AI technology demo.</strong> Gemini AI transforms
              your photo into an original pixel-art sticker character.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <PixelIcon name="shield" size={14} className="text-emerald-400 mt-0.5" />
            <p>
              By continuing, you agree to use this app responsibly at Mid-State
              Tech-Con.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="pixel-btn text-[10px] px-4 py-3 min-h-[44px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] w-full justify-center"
          onClick={acceptDisclaimer}
        >
          <PixelIcon name="check" size={13} />
          <span>ACCEPT &amp; CONTINUE</span>
        </button>
      </div>
    </div>
  )
}
