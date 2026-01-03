import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Banner from '../components/Banner'
import TrustElements from '../components/TrustElements'
import ProductCard from '../components/ProductCard'
import ProductCarousel from '../components/ProductCarousel'
import ContactButtons from '../components/ContactButtons'
import BottomNavigation from '../components/BottomNavigation'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import SkeletonLoader from '../components/SkeletonLoader'
import api from '../utils/api'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()
  const { t, language } = useLanguage()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-20 md:pb-0">
      <SEOHead 
        title={settings.store_name || 'متجري الإلكتروني'}
        description={language === 'ar' ? 'اكتشف مجموعتنا المميزة من المنتجات' : 'Discover our amazing product collection'}
      />
      <Header />
      <Banner />
      <TrustElements />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <SkeletonLoader count={8} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('noProducts')}</p>
          </div>
        ) : (
          <>
            {/* Featured Products Carousel - Ishtari Style */}
            <ProductCarousel 
              products={products.slice(0, 8)} 
              title={t('featuredProducts') || 'منتجات مميزة'}
            />
            
            {/* All Products Grid */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black mb-6" style={{ color: settings.primary_color || '#DC2626' }}>
                {t('allProducts') || 'جميع المنتجات'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
      <ContactButtons />
      <BottomNavigation />
    </div>
  )
}

export default Home

