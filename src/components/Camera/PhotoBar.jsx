/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import imageData from '../../lib/imageData'
import PixelLoader from '../common/PixelLoader'

export default function PhotoBar({onPhotoClick}) {
  const photos = useStore.usePhotos()
  const stickerQueue = useStore.useStickerQueue()

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-end text-[9px] text-slate-400 pr-1 select-none">
        <span className="hidden sm:inline">No snaps yet</span>
      </div>
    )
  }

  return (
    <div
      id="photo-bar-container"
      className="flex items-center justify-end max-w-full overflow-x-auto py-0.5"
    >
      <ul id="photo-bar-list" className="flex items-center gap-1.5">
        {photos.map(({id, isBusy}) => {
          const inQ = stickerQueue.includes(id)
          const imgSrc = isBusy
            ? imageData.inputs[id]
            : imageData.outputs[id] || imageData.inputs[id]
          return (
            <li key={id} className="w-11 h-11 sm:w-12 sm:h-12 relative shrink-0">
              <button
                type="button"
                onClick={() => onPhotoClick(id)}
                aria-label={`View sticker ${id}`}
                className={`w-full h-full border-2 ${
                  inQ
                    ? 'border-[#ffcc00]'
                    : isBusy
                      ? 'border-[#06b6d4]'
                      : 'border-[#6b4c70] hover:border-white'
                } bg-[#120d18] overflow-hidden relative cursor-pointer flex items-center justify-center`}
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    draggable={false}
                    alt="Sticker thumbnail"
                    className={`w-full h-full object-contain ${
                      isBusy ? 'opacity-25' : ''
                    }`}
                  />
                )}
                {isBusy && (
                  <div className="absolute inset-0 bg-[#120d18]/75 flex items-center justify-center">
                    <PixelLoader size="sm" />
                  </div>
                )}
                {inQ && !isBusy && (
                  <span className="absolute top-0 right-0 text-[8px] bg-[#ffcc00] text-black font-black px-0.5 leading-tight">
                    ★
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
