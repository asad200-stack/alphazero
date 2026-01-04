import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { useLanguage } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import api from '../utils/api'

const OrderSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { settings } = useSettings()
  const orderNumber = searchParams.get('order')
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderNumber) {
      navigate('/')
      return
    }
    fetchOrderDetails()
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      // Get order by order_number (public endpoint)
      const response = await api.get(`/orders/track/${orderNumber}`)
      const orderData = response.data
      
      if (orderData) {
        setOrder(orderData)
        // Items are already included in the response
        if (orderData.items) {
          setOrderItems(orderData.items)
        } else {
          // Fallback: try to fetch items separately
          try {
            const itemsResponse = await api.get(`/orders/${orderData.id}/items`)
            setOrderItems(itemsResponse.data)
          } catch (err) {
            console.error('Error fetching order items:', err)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'الطلب غير موجود' : 'Order Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'ar' 
                ? 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب.'
                : 'Order not found. Please check the order number.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg font-semibold transition"
              style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
            >
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              {language === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Order Placed Successfully!'}
            </h1>
            <p className="text-gray-600 mb-4">
              {language === 'ar' 
                ? 'شكراً لك! تم استلام طلبك وسنتواصل معك قريباً.'
                : 'Thank you! Your order has been received and we will contact you soon.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
              </p>
              <p className="text-2xl font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                {order.order_number}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
            </h2>

            {/* Order Items */}
            {orderItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ar' ? 'المنتجات' : 'Products'}
                </h3>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-4">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {language === 'ar' ? (item.product_name_ar || item.product_name) : (item.product_name || item.product_name_ar)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'الكمية' : 'Quantity'}: {item.quantity} × {parseFloat(item.price).toFixed(2)} {t('currency')}
                        </p>
                      </div>
                      <p className="font-bold">
                        {parseFloat(item.total).toFixed(2)} {t('currency')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}:</span>
                <span className="font-bold text-xl" style={{ color: settings.primary_color || '#3B82F6' }}>
                  {parseFloat(order.total_amount).toFixed(2)} {t('currency')}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'الاسم' : 'Name'}</p>
                <p className="font-semibold">{order.customer_name}</p>
              </div>
              {order.customer_email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                  <p className="font-semibold">{order.customer_email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</p>
                <p className="font-semibold">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                <p className="font-semibold">{order.shipping_address}</p>
                {order.shipping_city && (
                  <p className="font-semibold">{order.shipping_city}</p>
                )}
                {order.shipping_postal_code && (
                  <p className="font-semibold">{order.shipping_postal_code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</p>
                <p className="font-semibold">
                  {order.payment_method === 'cash_on_delivery' 
                    ? (language === 'ar' ? 'نقد عند الاستلام' : 'Cash on Delivery')
                    : order.payment_method === 'wishmoney'
                    ? 'Wishmoney'
                    : order.payment_method}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{language === 'ar' ? 'حالة الطلب' : 'Order Status'}</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.order_status}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-3">
              {language === 'ar' ? 'ماذا بعد؟' : 'What\'s Next?'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  {language === 'ar' 
                    ? 'سيتم التواصل معك قريباً لتأكيد الطلب.'
                    : 'We will contact you soon to confirm your order.'}
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  {language === 'ar' 
                    ? 'يمكنك متابعة حالة الطلب من صفحة حسابك.'
                    : 'You can track your order status from your account page.'}
                </span>
              </li>
              {order.payment_method === 'cash_on_delivery' && (
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>
                    {language === 'ar' 
                      ? 'سيتم الدفع عند استلام الطلب.'
                      : 'Payment will be collected upon delivery.'}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition"
              style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
            >
              {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </button>
            <button
              onClick={() => navigate('/account')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
            </button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default OrderSuccess

