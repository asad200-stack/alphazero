import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { getImageUrl } from '../utils/config'
import { getProductPrices } from '../utils/productHelpers'

const ProductCard = ({ product }) => {
  const { settings } = useSettings()
  const { language, t } = useLanguage()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isLiked = isInWishlist(product.id)
  
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

  const [isAdding, setIsAdding] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAdding(true)
    addToCart(product, 1)
    showToast(t('productAddedToCart') || 'تم إضافة المنتج للسلة', 'success')
    
    setTimeout(() => {
      setIsAdding(false)
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 2000)
    }, 500)
  }

  return (
    <div className="theme-product-card bg-white luxury-rounded-lg luxury-shadow overflow-hidden product-card relative group gpu-accelerated">
      {/* Like Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist(product)
          showToast(
            isLiked 
              ? (t('removedFromWishlist') || 'تم إزالة المنتج من المفضلة')
              : (t('addedToWishlist') || 'تم إضافة المنتج للمفضلة'),
            'success'
          )
        }}
        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 smooth-transition"
      >
        <svg 
          className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'text-red-500 fill-current scale-110' : 'text-gray-400'}`}
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={language === 'ar' ? (product.name_ar || product.name) : (product.name || product.name_ar)}
              className="w-full h-48 md:h-64 object-cover product-image gpu-accelerated"
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400">{t('noImage') || 'No Image'}</span>
            </div>
          )}
          {hasDiscountPrice && (
            <div 
              className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm pulse-animation"
            >
              -{discountPercentage}%
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-base md:text-lg font-bold mb-3 text-gray-900 line-clamp-2 min-h-[3rem] leading-tight smooth-transition">
            {language === 'ar' ? (product.name_ar || product.name) : (product.name || product.name_ar)}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {hasDiscountPrice ? (
                <>
                  <span className="text-sm md:text-base text-gray-500 line-through mb-1">
                    {parseFloat(product.price).toFixed(2)} {t('currency')}
                  </span>
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
          <div className="flex gap-3 product-card-actions">
            <Link
              to={`/product/${product.id}`}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 text-sm md:text-base text-center luxury-shadow hover:shadow-lg smooth-transition"
            >
              {t('readMore')}
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="theme-button-primary flex-1 bg-gradient-to-r from-gray-900 to-black text-white py-3 rounded-xl font-semibold hover:from-black hover:to-gray-800 transition-all duration-300 text-sm md:text-base luxury-btn luxury-shadow hover:shadow-xl add-to-cart-btn smooth-transition relative"
            >
              {isAdding ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}
                </span>
              ) : showCheck ? (
                <span className="flex items-center justify-center checkmark-animation">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'ar' ? 'تم!' : 'Added!'}
                </span>
              ) : (
                t('addToCart') || 'أضف للسلة'
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard

