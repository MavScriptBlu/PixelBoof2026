/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useStore} from '../../lib/store'
import imageData from '../../lib/imageData'
import PixelLoader from '../common/PixelLoader'
import {PixelIcon} from '../common/PixelUI'

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
      className="flex items-center justify-end max-w-full overflow-x-auto no-scrollbar py-0.5"
    >
      <ul id="photo-bar-list" className="flex items-center gap-1 sm:gap-1.5">
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
                    ? 'border-[#facc15]'
                    : isBusy
                      ? 'border-sky-400'
                      : 'border-[#475569] hover:border-white'
                } bg-[#0b0e17] overflow-hidden relative cursor-pointer flex items-center justify-center p-0.5`}
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #131826 25%, transparent 25%), linear-gradient(-45deg, #131826 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #131826 75%), linear-gradient(-45deg, transparent 75%, #131826 75%)',
                  backgroundSize: '10px 10px',
                  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0'
                }}
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
                  <div className="absolute inset-0 bg-[#0b0e17]/80 flex items-center justify-center">
                    <PixelLoader size="sm" />
                  </div>
                )}
                {inQ && !isBusy && (
                  <span className="absolute top-0 right-0 bg-[#facc15] text-black p-0.5 leading-none flex items-center justify-center">
                    <PixelIcon name="star" size={8} />
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
