/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import imageData from '../../lib/imageData'
import modes from '../../lib/modes'
import PixelLoader from '../common/PixelLoader'

export default function PhotoThumbnail({photo, onClick}) {
  const stickerQueue = useStore.useStickerQueue()
  const {deletePhoto, toggleStickerQueue} = useStore.getState()
  const {id, mode, isBusy} = photo

  const inQ = stickerQueue.includes(id)
  const m = modes[mode] || modes['8bit'] || {name: 'Custom', emoji: '✏️'}
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
      className={`pixel-box bg-[#1d1526] p-2 relative flex flex-col ${
        inQ ? 'border-[#ffcc00]' : 'border-slate-600'
      }`}
    >
      <div
        onClick={() => onClick()}
        className="aspect-square bg-[#120d18] flex items-center justify-center p-1.5 cursor-pointer relative overflow-hidden"
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
          <div className="absolute inset-0 bg-[#120d18]/75 flex items-center justify-center">
            <PixelLoader size="lg" />
          </div>
        )}
        <span className="absolute bottom-1 right-1.5 text-base">{m.emoji}</span>
        {inQ && !isBusy && (
          <span className="absolute top-1.5 left-1.5 pixel-font text-[7px] bg-[#ffcc00] text-black px-1.5 py-0.5">
            ★ QUEUED
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mt-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleToggleQueue}
          className={`pixel-btn text-[7px] sm:text-[8px] px-2 py-1.5 min-h-[34px] flex-1 justify-center truncate ${
            inQ
              ? 'bg-emerald-700 text-white border-white'
              : 'bg-[#8B1E41] text-[#ffcc00] border-[#ffcc00]'
          }`}
        >
          {isBusy ? (
            <PixelLoader size="md" />
          ) : inQ ? (
            '✅ QUEUED'
          ) : (
            '🏷️ SAVE FOR STICKER'
          )}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="pixel-btn text-[9px] px-2 py-1.5 min-h-[34px] bg-[#120d18] text-rose-400 border-rose-400/60"
          title="Delete photo"
        >
          🗑️
        </button>
      </div>
    </li>
  )
}
