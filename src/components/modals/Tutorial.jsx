/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import {MstcBadge, PixelIcon} from '../common/PixelUI'
import './Panel.css'

export default function Tutorial() {
  const {dismissTutorial} = useStore.getState()

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="pixel-box bg-[#151928] border-[#facc15] max-w-md w-full p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b-2 border-[#334155] pb-3">
          <MstcBadge size="sm" />
          <h2 id="tutorial-title" className="pixel-font text-xs text-[#facc15]">
            WELCOME TO PIXEL BOOF!
          </h2>
        </div>
        <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
          <div className="flex items-center gap-2.5">
            <PixelIcon name="arcade" size={14} className="text-[#facc15]" />
            <p>1. PICK A CHARACTER LENS OR CUSTOM PROMPT.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <PixelIcon name="camera" size={14} className="text-sky-300" />
            <p>2. SNAP A PHOTO WITH THE SHUTTER OR UPLOAD.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <PixelIcon name="ticket" size={14} className="text-emerald-400" />
            <p>3. QUEUE UP TO 3 FAVORITES FOR CRICUT STICKERS!</p>
          </div>
        </div>
        <button
          type="button"
          className="pixel-btn text-[10px] px-4 py-3 min-h-[44px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] w-full justify-center"
          onClick={dismissTutorial}
        >
          <PixelIcon name="check" size={13} />
          <span>GOT IT!</span>
        </button>
      </div>
    </div>
  )
}
