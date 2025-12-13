import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { getImageUrl } from '../utils/config'
import { getProductPrices } from '../utils/productHelpers'

const ProductCard = ({ product }) => {
  const { settings } = useSettings()
  const { language, t } = useLanguage()
  const [isLiked, setIsLiked] = useState(false)
  
  // Get product prices using helper function for discount percentage
  const { discountPercentage } = getProductPrices(product)
  
  // Simple check - EXACTLY same as admin panel
  const hasDiscountPrice = product.discount_price && 
                          product.discount_price !== null && 
                          product.discount_price !== undefined &&
                          product.discount_price !== '' &&
                          parseFloat(product.discount_price) > 0 &&
                          parseFloat(product.price) > 0 &&
                          parseFloat(product.discount_price) < parseFloat(product.price)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover relative">
      {/* Like Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsLiked(!isLiked)
        }}
        className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
      >
        <svg 
          className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link to={`/product/${product.id}`}>
        <div className="relative">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={language === 'ar' ? (product.name_ar || product.name) : (product.name || product.name_ar)}
              className="w-full h-48 md:h-56 object-cover"
            />
          ) : (
            <div className="w-full h-48 md:h-56 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">{t('noImage') || 'No Image'}</span>
            </div>
          )}
          {hasDiscountPrice && (
            <div 
              className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            >
              -{discountPercentage}%
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800 line-clamp-2 min-h-[3rem]">
            {language === 'ar' ? (product.name_ar || product.name) : (product.name || product.name_ar)}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {hasDiscountPrice ? (
                <>
                  {/* السعر الأصلي (مشطوب) - يظهر أولاً */}
                  <span className="text-sm md:text-base text-gray-500 line-through mb-1">
                    {parseFloat(product.price).toFixed(2)} {t('currency')}
                  </span>
                  {/* السعر بعد الخصم (بالأخضر) - يظهر ثانياً */}
                  <span className="text-xl md:text-2xl font-bold text-green-600">
                    {parseFloat(product.discount_price).toFixed(2)} {t('currency')}
                  </span>
                </>
              ) : (
                <span className="text-xl md:text-2xl font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                  {parseFloat(product.price).toFixed(2)} {t('currency')}
                </span>
              )}
            </div>
          </div>
          <button
            className="w-full bg-black text-white py-2.5 rounded-full font-medium hover:bg-gray-800 transition text-sm md:text-base"
            onClick={(e) => {
              e.preventDefault()
              window.location.href = `/product/${product.id}`
            }}
          >
            {t('readMore')}
          </button>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard

