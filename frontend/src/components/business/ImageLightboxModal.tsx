import React from 'react'
import { getFullImageUrl } from '../../services/api'

interface ImageLightboxModalProps {
  images: { url: string; title?: string }[]
  initialIndex?: number
  onClose: () => void
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [index, setIndex] = React.useState(initialIndex)
  const current = images[index]

  if (!current) return null

  const prev = () => setIndex(i => (i > 0 ? i - 1 : images.length - 1))
  const next = () => setIndex(i => (i < images.length - 1 ? i + 1 : 0))

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/90 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 text-white" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="text-2xl leading-none px-2">✕</button>
        <span className="text-sm opacity-80">{index + 1} / {images.length}</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-4" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button type="button" onClick={prev} className="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/20 text-white text-xl">
            ‹
          </button>
        )}
        <img
          src={getFullImageUrl(current.url)}
          alt={current.title || 'تصویر کسب\u200cوکار'}
          className="max-h-[70vh] max-w-full object-contain rounded-lg"
        />
        {images.length > 1 && (
          <button type="button" onClick={next} className="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/20 text-white text-xl">
            ›
          </button>
        )}
      </div>

      {current.title && (
        <p className="text-center text-white/80 text-sm pb-6 px-4">{current.title}</p>
      )}
    </div>
  )
}
