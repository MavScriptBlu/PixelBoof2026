/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'
import PixelLoader from '../common/PixelLoader'
import Share from '../common/Share'

export default function PhotoThumbnail({photo, onClick}) {
  const stickerQueue = useStore.useStickerQueue()
  const {deletePhoto, toggleStickerQueue} = useStore.getState()
  const {id, mode, isBusy} = photo

  const inQ = stickerQueue.includes(id)
  const m =
    modes[mode] || modes['mario'] || modes['8bit'] || {name: 'Custom', emoji: '✏️'}
  const imgSrc = isBusy
    ? imageData.inputs[id]
    : imageData.outputs[id] || imageData.inputs[id]

  const handleDelete = e => {
    e.stopPropagation()
    deletePhoto(id)
  }

  const handleToggleQueue = e => {
    e.stopPropagation()
    if (!isBusy) {
      toggleStickerQueue(id)
    }
  }

  return (
    <li
      className={`pixel-box bg-[#151928] p-2 relative flex flex-col ${
        inQ ? 'border-[#facc15]' : 'border-[#334155]'
      }`}
    >
      <div
        onClick={() => onClick()}
        className="aspect-square bg-[#0b0e17] flex items-center justify-center p-2 cursor-pointer relative overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #131826 25%, transparent 25%), linear-gradient(-45deg, #131826 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #131826 75%), linear-gradient(-45deg, transparent 75%, #131826 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0'
        }}
      >
        {imgSrc && (
          <img
            src={imgSrc}
            draggable={false}
            alt={m.name}
            className={`w-full h-full object-contain ${
              isBusy ? 'opacity-25' : ''
            }`}
          />
        )}
        {isBusy && (
          <div className="absolute inset-0 bg-[#0b0e17]/80 flex items-center justify-center">
            <PixelLoader size="lg" />
          </div>
        )}
        {inQ && !isBusy && (
          <span className="absolute top-1.5 left-1.5 pixel-font text-[7px] bg-[#facc15] text-black px-1.5 py-0.5">
            ★ QUEUED
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mt-1.5 px-0.5">
        <span className="pixel-font text-[7px] text-slate-300 truncate">
          {m.emoji} {m.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 mt-1.5">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleToggleQueue}
          className={`pixel-btn text-[7px] sm:text-[8px] px-2 py-1.5 min-h-[34px] flex-1 justify-center truncate ${
            inQ
              ? 'bg-emerald-700 text-white border-emerald-300'
              : 'bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15]'
          }`}
        >
          {isBusy ? (
            <PixelLoader size="md" />
          ) : inQ ? (
            '✅ QUEUED'
          ) : (
            '🏷️ QUEUE'
          )}
        </button>

        {!isBusy && imgSrc && (
          <Share
            compact
            url={imgSrc}
            fileName={`pixelboof-${id}.png`}
            modeName={m.name}
          />
        )}

        <button
          type="button"
          onClick={handleDelete}
          className="pixel-btn text-[9px] px-2 py-1.5 min-h-[34px] bg-[#0f1320] text-rose-400 border-rose-400/60"
          title="Delete photo"
        >
          🗑️
        </button>
      </div>
    </li>
  )
}
