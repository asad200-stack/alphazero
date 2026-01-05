import { useState, useEffect } from 'react'
import { getImageUrl } from '../utils/config'

const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const handleMouseMove = (e) => {
    if (zoom > 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100
      setPosition({ x, y })
    }
  }

  const handleDoubleClick = () => {
    setZoom(prev => prev === 1 ? 2 : 1)
    setPosition({ x: 0, y: 0 })
  }

  if (!images || images.length === 0) return null

  const currentImage = images[currentIndex]?.image_path || images[currentIndex]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
      >
        ×
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative max-w-7xl max-h-screen p-4"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={getImageUrl(currentImage)}
          alt="Product"
          className="max-w-full max-h-[90vh] object-contain transition-transform duration-200 cursor-zoom-in"
          style={{
            transform: `scale(${zoom}) translate(${position.x}%, ${position.y}%)`,
            transformOrigin: 'center center'
          }}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      <div className="absolute bottom-4 right-4 text-white text-sm">
        <div className="flex flex-col space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoom(prev => Math.min(3, prev + 0.2))
            }}
            className="bg-black bg-opacity-50 px-3 py-1 rounded"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoom(prev => Math.max(0.5, prev - 0.2))
            }}
            className="bg-black bg-opacity-50 px-3 py-1 rounded"
          >
            −
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoom(1)
              setPosition({ x: 0, y: 0 })
            }}
            className="bg-black bg-opacity-50 px-3 py-1 rounded text-xs"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageLightbox













