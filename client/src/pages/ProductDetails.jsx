import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import ContactButtons from '../components/ContactButtons'
import BottomNavigation from '../components/BottomNavigation'
import ImageLightbox from '../components/ImageLightbox'
import api from '../utils/api'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { getImageUrl } from '../utils/config'
import { getProductPrices } from '../utils/productHelpers'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const { settings } = useSettings()
  const { language, t } = useLanguage()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (settings.whatsapp_number) {
      const message = encodeURIComponent(`مرحباً، أريد الاستفسار عن: ${product.name_ar || product.name}`)
      window.open(`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: settings.primary_color || '#3B82F6' }}></div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  // Get product prices using helper function
  const { hasDiscount, displayPrice, originalPrice, discountPercentage } = getProductPrices(product)

  // Get all images
  const allImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_path || img)
    : product.image 
      ? [product.image]
      : []

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToHome')}
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              {allImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div 
                    className="relative cursor-zoom-in"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img
                      src={getImageUrl(allImages[selectedImageIndex])}
                      alt={language === 'ar' ? (product.name_ar || product.name) : (product.name || product.name_ar)}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                      Click to zoom
                    </div>
                  </div>
                  
                  {/* Thumbnail Images */}
                  {allImages.length > 1 && (
                    <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                            selectedImageIndex === index 
                              ? 'border-blue-500' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">{t('noImage') || 'No Image'}</span>
                </div>
              )}
            </div>
            
            <div className="md:w-1/2 p-8">
              {hasDiscount && (
                <div 
                  className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4"
                >
                  {t('discount')} {discountPercentage}%
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-4 text-gray-800">
                {language === 'ar' ? (product.name_ar || product.name) : (product.name || product.name_ar)}
              </h1>
              
              {(language === 'ar' ? (product.description_ar || product.description) : (product.description || product.description_ar)) ? (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language === 'ar' ? (product.description_ar || product.description) : (product.description || product.description_ar)}
                </p>
              ) : null}
              
              <div className="mb-6">
                {hasDiscount && originalPrice !== null && !isNaN(displayPrice) && !isNaN(originalPrice) ? (
                  <div>
                    <div className="flex flex-col space-y-2 mb-2">
                      {/* السعر الأصلي (مشطوب) - يظهر أولاً */}
                      <span className="text-2xl text-gray-500 line-through">
                        {Number(originalPrice).toFixed(2)} {t('currency')}
                      </span>
                      {/* السعر بعد الخصم (بالأخضر) - يظهر ثانياً */}
                      <span className="text-4xl md:text-5xl font-bold text-green-600">
                        {Number(displayPrice).toFixed(2)} {t('currency')}
                      </span>
                    </div>
                    <p className="text-green-600 font-medium">
                      {t('youSaved')} {Number(originalPrice - displayPrice).toFixed(2)} {t('currency')}
                    </p>
                  </div>
                ) : (
                  <span className="text-4xl font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                    {!isNaN(displayPrice) ? Number(displayPrice).toFixed(2) : '0.00'} {t('currency')}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleContact}
                className="w-full py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 transition shadow-lg"
                style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
              >
                {t('contactUs')}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showLightbox && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          currentIndex={selectedImageIndex}
          onClose={() => setShowLightbox(false)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}

      <ContactButtons />
      <BottomNavigation />
    </div>
  )
}

export default ProductDetails

