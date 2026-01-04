import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { useLanguage } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { useCart } from '../context/CartContext'
import api from '../utils/api'

const WishmoneyPayment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { settings } = useSettings()
  const { showToast } = useToast()
  const { clearCart } = useCart()
  
  const orderNumber = searchParams.get('order')
  const amount = searchParams.get('amount')
  const callbackUrl = searchParams.get('callback')
  
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, processing, success, failed

  useEffect(() => {
    if (!orderNumber || !amount) {
      showToast(
        language === 'ar' ? 'معلومات الطلب غير صحيحة' : 'Invalid order information',
        'error'
      )
      navigate('/cart')
    }
  }, [orderNumber, amount, navigate, language, showToast])

  const handlePayment = async () => {
    setLoading(true)
    setPaymentStatus('processing')
    
    try {
      // Simulate payment processing
      // In production, this would integrate with Wishmoney API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update order payment status
      try {
        await api.put(`/orders/${orderNumber}/status`, {
          payment_status: 'paid',
          order_status: 'processing'
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      } catch (err) {
        console.error('Error updating order status:', err)
      }
      
      setPaymentStatus('success')
      showToast(
        language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment successful!',
        'success'
      )
      
      clearCart()
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        if (callbackUrl) {
          window.location.href = decodeURIComponent(callbackUrl)
        } else {
          navigate(`/order-success?order=${orderNumber}`)
        }
      }, 2000)
    } catch (error) {
      setPaymentStatus('failed')
      showToast(
        language === 'ar' ? 'فشل الدفع. يرجى المحاولة مرة أخرى' : 'Payment failed. Please try again',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/cart')
  }

  if (!orderNumber || !amount) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              {language === 'ar' ? 'الدفع عبر Wishmoney' : 'Pay with Wishmoney'}
            </h1>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === 'ar' ? 'رقم الطلب' : 'Order Number'}:</span>
                  <span className="font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}:</span>
                  <span className="font-bold text-lg" style={{ color: settings.primary_color || '#3B82F6' }}>
                    {parseFloat(amount).toFixed(2)} {t('currency')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {paymentStatus === 'pending' && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    {language === 'ar' 
                      ? 'سيتم توجيهك إلى صفحة الدفع الآمنة لـ Wishmoney لإتمام عملية الدفع.'
                      : 'You will be redirected to Wishmoney secure payment page to complete the payment.'}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
                    style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
                  >
                    {loading 
                      ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                      : (language === 'ar' ? 'الدفع الآن' : 'Pay Now')
                    }
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {language === 'ar' ? 'جاري معالجة الدفع...' : 'Processing payment...'}
                </p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  {language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ar' ? 'سيتم توجيهك إلى صفحة التأكيد...' : 'Redirecting to confirmation page...'}
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">
                  {language === 'ar' ? 'فشل الدفع' : 'Payment Failed'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar' ? 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.' : 'An error occurred while processing payment. Please try again.'}
                </p>
                <button
                  onClick={handlePayment}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            )}

            {/* Payment Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {language === 'ar' 
                  ? 'الدفع آمن ومحمي. لن يتم حفظ معلومات الدفع الخاصة بك.'
                  : 'Payment is secure and protected. Your payment information will not be saved.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default WishmoneyPayment

