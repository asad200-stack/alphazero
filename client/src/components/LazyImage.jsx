import { useState, useEffect, useRef } from 'react'

const LazyImage = ({ src, alt, className, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!src) {
      console.warn('LazyImage: No src provided')
      return
    }
    
    console.log('LazyImage: Setting up observer for', src)
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('LazyImage: Image is visible, loading', src)
            setImageSrc(src)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
      observer.disconnect()
    }
  }, [src])

  const handleError = (e) => {
    console.error('LazyImage: Error loading image', src, e)
    setHasError(true)
    setIsLoaded(false)
  }

  if (!src) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center z-10">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => {
            console.log('LazyImage: Image loaded successfully', src)
            setIsLoaded(true)
            setHasError(false)
          }}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default LazyImage





