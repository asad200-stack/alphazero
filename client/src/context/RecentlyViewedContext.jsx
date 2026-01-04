import { createContext, useContext, useState, useEffect } from 'react'

const RecentlyViewedContext = createContext()

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
  }
  return context
}

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('recentlyViewed')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed))
  }, [recentlyViewed])

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.id !== product.id)
      // Add to beginning and limit to 10
      return [product, ...filtered].slice(0, 10)
    })
  }

  const getRelatedProducts = (currentProductId, allProducts, limit = 4) => {
    // Get products excluding current one
    const otherProducts = allProducts.filter(p => p.id !== currentProductId)
    // Shuffle and take limit
    return otherProducts.sort(() => Math.random() - 0.5).slice(0, limit)
  }

  return (
    <RecentlyViewedContext.Provider value={{
      recentlyViewed,
      addToRecentlyViewed,
      getRelatedProducts
    }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}







