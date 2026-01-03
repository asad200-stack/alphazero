import { useState, useEffect } from 'react'
import Header from '../components/Header'
import BannerSlider from '../components/BannerSlider'
import TrustElements from '../components/TrustElements'
import ProductCard from '../components/ProductCard'
import ProductCarousel from '../components/ProductCarousel'
import ContactButtons from '../components/ContactButtons'
import BottomNavigation from '../components/BottomNavigation'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import SkeletonLoader from '../components/SkeletonLoader'
import ScrollAnimation from '../components/ScrollAnimation'
import api from '../utils/api'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { useSearch } from '../context/SearchContext'

const Home = () => {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()
  const { t, language } = useLanguage()
  const { searchQuery } = useSearch()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setAllProducts(response.data)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter products by search query and category
  useEffect(() => {
    let filtered = allProducts
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => {
        const name = language === 'ar' 
          ? (product.name_ar || product.name || '').toLowerCase()
          : (product.name || product.name_ar || '').toLowerCase()
        const description = language === 'ar'
          ? (product.description_ar || product.description || '').toLowerCase()
          : (product.description || product.description_ar || '').toLowerCase()
        const query = searchQuery.toLowerCase()
        return name.includes(query) || description.includes(query)
      })
    }
    
    setProducts(filtered)
  }, [searchQuery, selectedCategory, allProducts, language])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-20 md:pb-0">
      <SEOHead 
        title={settings.store_name || 'متجري الإلكتروني'}
        description={language === 'ar' ? 'اكتشف مجموعتنا المميزة من المنتجات' : 'Discover our amazing product collection'}
      />
      <Header />
      <BannerSlider />
      <TrustElements />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Categories Section with Scroll Animation */}
        {categories.length > 0 && (
          <ScrollAnimation>
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black mb-6" style={{ color: settings.primary_color || '#3B82F6' }}>
                {language === 'ar' ? 'التصنيفات' : 'Categories'}
              </h2>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`theme-category-btn px-6 py-3 rounded-lg font-semibold category-btn smooth-transition ${
                    selectedCategory === null ? 'active' : ''
                  }`}
                >
                  {language === 'ar' ? 'جميع التصنيفات' : 'All Categories'}
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`theme-category-btn px-6 py-3 rounded-lg font-semibold category-btn smooth-transition ${
                      selectedCategory === category.id ? 'active' : ''
                    }`}
                  >
                    {language === 'ar' ? (category.name_ar || category.name) : (category.name || category.name_ar)}
                  </button>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        )}
        
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
                {selectedCategory 
                  ? (language === 'ar' 
                      ? (categories.find(c => c.id === selectedCategory)?.name_ar || categories.find(c => c.id === selectedCategory)?.name || 'المنتجات')
                      : (categories.find(c => c.id === selectedCategory)?.name || categories.find(c => c.id === selectedCategory)?.name_ar || 'Products'))
                  : (t('allProducts') || 'جميع المنتجات')
                }
              </h2>
              <div className="theme-products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <ScrollAnimation key={product.id} delay={index * 100}>
                    <ProductCard product={product} />
                  </ScrollAnimation>
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

