import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useLanguage } from '../context/LanguageContext'

const ProductRating = ({ productId, showStars = true, showCount = true, size = 'md' }) => {
  const { language, t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      fetchStats()
    }
  }, [productId])

  const fetchStats = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching rating stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return null
  }

  if (stats.total_reviews === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <span className="text-xs">({language === 'ar' ? 'لا توجد تقييمات' : 'No ratings'})</span>
      </div>
    )
  }

  const averageRating = parseFloat(stats.average_rating)
  const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className={`${starSize} text-yellow-400 fill-current`} viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className={`${starSize} text-yellow-400 fill-current`} viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-fill">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half-fill)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className={`${starSize} text-gray-300 fill-current`} viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {showStars && renderStars(averageRating)}
      <span className={`${textSize} font-semibold text-gray-700`}>
        {averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`${textSize} text-gray-500`}>
          ({stats.total_reviews} {language === 'ar' ? 'تقييم' : 'reviews'})
        </span>
      )}
    </div>
  )
}

export default ProductRating

