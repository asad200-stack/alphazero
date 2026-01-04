import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'

const ProductReviews = ({ productId }) => {
  const { language, t } = useLanguage()
  const { showToast } = useToast()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    rating: 5,
    review_text: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/reviews', {
        product_id: productId,
        ...formData
      })
      showToast(
        language === 'ar' 
          ? 'تم إرسال المراجعة بنجاح. سيتم نشرها بعد الموافقة.'
          : 'Review submitted successfully. It will be published after approval.',
        'success'
      )
      setFormData({
        customer_name: '',
        customer_email: '',
        rating: 5,
        review_text: ''
      })
      setShowForm(false)
      fetchReviews()
      fetchStats()
    } catch (error) {
      showToast(
        error.response?.data?.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'),
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'التقييمات والمراجعات' : 'Reviews & Ratings'}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {language === 'ar' ? 'أضف مراجعة' : 'Add Review'}
        </button>
      </div>

      {stats && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {parseFloat(stats.average_rating).toFixed(1)}
              </div>
              {renderStars(parseFloat(stats.average_rating))}
              <div className="text-sm text-gray-600 mt-2">
                {stats.total_reviews} {language === 'ar' ? 'تقييم' : 'reviews'}
              </div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.rating_distribution[star] || 0
                const percentage = stats.total_reviews > 0 
                  ? (count / stats.total_reviews) * 100 
                  : 0
                return (
                  <div key={star} className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600 w-12">{star} {language === 'ar' ? 'نجمة' : 'star'}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {language === 'ar' ? 'أضف مراجعتك' : 'Add Your Review'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'التقييم' : 'Rating'}
            </label>
            {renderStars(formData.rating, true, (rating) => 
              setFormData({ ...formData, rating })
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'الاسم' : 'Name'} *
            </label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'المراجعة' : 'Review'}
            </label>
            <textarea
              value={formData.review_text}
              onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'ar' ? 'اكتب مراجعتك هنا...' : 'Write your review here...'}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting 
                ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                : (language === 'ar' ? 'إرسال' : 'Submit')
              }
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'ar' ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">{review.customer_name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.review_text && (
                <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductReviews

