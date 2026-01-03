import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getImageUrl } from '../utils/config'
import api from '../utils/api'
import LazyImage from './LazyImage'

const BannerSlider = () => {
  const { language } = useLanguage()
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
    
    // Refresh banners every 30 seconds to catch updates
    const refreshInterval = setInterval(() => {
      fetchBanners()
    }, 30000)
    
    // Also refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      fetchBanners()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000) // Auto slide every 5 seconds

      return () => clearInterval(interval)
    }
  }, [banners.length])

  const fetchBanners = async () => {
    try {
      const response = await api.get('/banners')
      console.log('Banners API Response:', response.data)
      
      // The API already filters enabled banners, but we'll double-check
      const enabledBanners = response.data.filter(b => {
        const enabled = b.enabled
        const isEnabled = enabled === 1 || enabled === '1' || enabled === true
        console.log(`Banner ${b.id}: enabled=${enabled}, isEnabled=${isEnabled}, hasImage=${!!(b.image_desktop || b.image_tablet || b.image_mobile)}`)
        return isEnabled
      })
      
      console.log('Enabled Banners:', enabledBanners)
      setBanners(enabledBanners)
      
      // Reset index if current banner is no longer available
      if (enabledBanners.length > 0 && currentIndex >= enabledBanners.length) {
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (loading) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse"></div>
    )
  }

  if (banners.length === 0) {
    console.log('No enabled banners found')
    return null
  }

  const currentBanner = banners[currentIndex]
  if (!currentBanner) return null

  // Get responsive image
  const getImage = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 768) {
        return currentBanner.image_mobile || currentBanner.image_tablet || currentBanner.image_desktop
      } else if (width < 1024) {
        return currentBanner.image_tablet || currentBanner.image_desktop
      }
    }
    return currentBanner.image_desktop || currentBanner.image_tablet || currentBanner.image_mobile
  }

  const imageUrl = getImage()
  
  console.log('Current Banner:', currentBanner)
  console.log('Image URL:', imageUrl)
  console.log('Full Image URL:', imageUrl ? getImageUrl(imageUrl) : null)
  
  // If no image URL, don't render
  if (!imageUrl) {
    console.warn('No image URL found for banner:', currentBanner)
    return null
  }
  
  const title = language === 'ar' ? (currentBanner.title_ar || currentBanner.title) : (currentBanner.title || currentBanner.title_ar)
  const subtitle = language === 'ar' ? (currentBanner.subtitle_ar || currentBanner.subtitle) : (currentBanner.subtitle || currentBanner.subtitle_ar)
  const buttonText = language === 'ar' ? (currentBanner.button_text_ar || currentBanner.button_text) : (currentBanner.button_text || currentBanner.button_text_ar)
  const buttonText2 = language === 'ar' ? (currentBanner.button_text_2_ar || currentBanner.button_text_2) : (currentBanner.button_text_2 || currentBanner.button_text_2_ar)

  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden">
      {/* Banner Image */}
      <LazyImage
        src={getImageUrl(imageUrl)}
        alt={title || 'Banner'}
        className="w-full h-full object-cover"
        key={imageUrl} // Force re-render when image changes
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-white">
            {subtitle && (
              <p className="text-lg md:text-xl mb-3 font-semibold opacity-90">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
                {title}
              </h1>
            )}
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {buttonText && currentBanner.button_link && (
                <Link
                  to={currentBanner.button_link}
                  className="inline-block px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-center"
                >
                  {buttonText}
                </Link>
              )}
              {buttonText2 && currentBanner.button_link_2 && (
                <Link
                  to={currentBanner.button_link_2}
                  className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-center"
                >
                  {buttonText2}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all z-20"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all z-20"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerSlider

