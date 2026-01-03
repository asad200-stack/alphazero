import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import BottomNavigation from '../components/BottomNavigation'
import SkeletonLoader from '../components/SkeletonLoader'
import ProductFilters from '../components/ProductFilters'
import ScrollAnimation from '../components/ScrollAnimation'
import api from '../utils/api'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { useSearch } from '../context/SearchContext'

const Shop = () => {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()
  const { t, language } = useLanguage()
  const { searchQuery } = useSearch()

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const handleFilterChange = (filteredProducts) => {
    setProducts(filteredProducts)
  }

  // Filter products by search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(product => {
        const name = language === 'ar' 
          ? (product.name_ar || product.name || '').toLowerCase()
          : (product.name || product.name_ar || '').toLowerCase()
        const description = language === 'ar'
          ? (product.description_ar || product.description || '').toLowerCase()
          : (product.description || product.description_ar || '').toLowerCase()
        const query = searchQuery.toLowerCase()
        return name.includes(query) || description.includes(query)
      })
      setProducts(filtered)
    } else {
      setProducts(allProducts)
    }
  }, [searchQuery, allProducts, language])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight" style={{ color: settings.primary_color || '#3B82F6' }}>
            {t('products')}
          </h1>
          <p className="text-gray-600 text-lg font-medium">{t('discoverProducts')}</p>
        </div>

        {!loading && allProducts.length > 0 && (
          <ProductFilters products={allProducts} onFilterChange={handleFilterChange} />
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
          <div className="theme-products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ScrollAnimation key={product.id} delay={index * 50}>
                <ProductCard product={product} />
              </ScrollAnimation>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}

export default Shop

