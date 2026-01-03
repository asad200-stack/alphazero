import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'

const ProductCarousel = ({ products, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(4)
  const { settings } = useSettings()
  const { t } = useLanguage()

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setItemsToShow(4)
      } else if (window.innerWidth >= 768) {
        setItemsToShow(3)
      } else {
        setItemsToShow(2)
      }
    }

    updateItemsToShow()
    window.addEventListener('resize', updateItemsToShow)
    return () => window.removeEventListener('resize', updateItemsToShow)
  }, [])

  const maxIndex = Math.max(0, products.length - itemsToShow)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  if (!products || products.length === 0) return null

  return (
    <section className="mb-12 relative">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: settings.primary_color || '#DC2626' }}>
            {title}
          </h2>
          <Link 
            to="/shop" 
            className="text-sm md:text-base font-semibold hover:underline"
            style={{ color: settings.primary_color || '#DC2626' }}
          >
            {t('viewAll') || 'عرض الكل'} →
          </Link>
        </div>
      )}

      <div className="relative">
        {/* Navigation Arrows */}
        {products.length > itemsToShow && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all duration-300 hover:scale-110 -translate-x-4"
              aria-label="Previous"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all duration-300 hover:scale-110 translate-x-4"
              aria-label="Next"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        {maxIndex > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(products.length / itemsToShow) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * itemsToShow)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsToShow) === index
                    ? 'w-8 bg-gray-900'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductCarousel





