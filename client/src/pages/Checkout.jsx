import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import { getProductPrices } from '../utils/productHelpers'

const Checkout = () => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { cart, getCartTotal, clearCart } = useCart()
  const { settings } = useSettings()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    payment_method: 'cash_on_delivery',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required'
    }
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required'
    }
    
    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = language === 'ar' ? 'عنوان الشحن مطلوب' : 'Shipping address is required'
    }
    
    if (!formData.payment_method) {
      newErrors.payment_method = language === 'ar' ? 'طريقة الدفع مطلوبة' : 'Payment method is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleWishmoneyPayment = async () => {
    // Create order first
    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        payment_method: 'wishmoney',
        items: cart.map(item => {
          const { displayPrice } = getProductPrices(item)
          return {
            product_id: item.id,
            product_name: item.name,
            product_name_ar: item.name_ar,
            quantity: item.quantity,
            price: displayPrice,
            total: displayPrice * item.quantity
          }
        }),
        total_amount: getCartTotal(),
        notes: formData.notes
      }

      const response = await api.post('/orders', orderData)
      
      // Show success message and redirect to order success page
      // Note: Wishmoney integration requires API credentials and proper setup
      // For now, we'll mark the order as pending and show success message
      showToast(
        language === 'ar' 
          ? `تم إنشاء الطلب بنجاح! رقم الطلب: ${response.data.order_number}. سيتم التواصل معك لإتمام الدفع.`
          : `Order created successfully! Order number: ${response.data.order_number}. We will contact you to complete the payment.`,
        'success'
      )
      
      clearCart()
      navigate(`/order-success?order=${response.data.order_number}`)
      
      // TODO: When Wishmoney API is configured, uncomment and use the following:
      // const wishmoneyUrl = `YOUR_WISHMONEY_PAYMENT_URL?order_id=${response.data.order_number}&amount=${getCartTotal()}&callback=${encodeURIComponent(window.location.origin + '/order-success')}`
      // window.location.href = wishmoneyUrl
    } catch (error) {
      console.error('Error creating order:', error)
      showToast(
        error.response?.data?.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'),
        'error'
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (cart.length === 0) {
      showToast(
        language === 'ar' ? 'السلة فارغة' : 'Cart is empty',
        'error'
      )
      navigate('/cart')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        payment_method: formData.payment_method,
        items: cart.map(item => {
          const { displayPrice } = getProductPrices(item)
          return {
            product_id: item.id,
            product_name: item.name,
            product_name_ar: item.name_ar,
            quantity: item.quantity,
            price: displayPrice,
            total: displayPrice * item.quantity
          }
        }),
        total_amount: getCartTotal(),
        notes: formData.notes
      }

      if (formData.payment_method === 'wishmoney') {
        // Handle wishmoney payment
        await handleWishmoneyPayment()
        return
      }

      // For cash on delivery, create order directly
      const response = await api.post('/orders', orderData)
      
      showToast(
        language === 'ar' 
          ? `تم إنشاء الطلب بنجاح! رقم الطلب: ${response.data.order_number}`
          : `Order created successfully! Order number: ${response.data.order_number}`,
        'success'
      )
      
      clearCart()
      navigate(`/order-success?order=${response.data.order_number}`)
    } catch (error) {
      console.error('Error creating order:', error)
      showToast(
        error.response?.data?.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'),
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {language === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
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
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'العنوان' : 'Address'} *
                  </label>
                  <textarea
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.shipping_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.shipping_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المدينة' : 'City'}
                    </label>
                    <input
                      type="text"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                    </label>
                    <input
                      type="text"
                      name="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'} *
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.payment_method === 'cash_on_delivery'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={formData.payment_method === 'cash_on_delivery'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">
                      {language === 'ar' ? 'نقد عند الاستلام' : 'Cash on Delivery'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'ar' ? 'ادفع عند استلام الطلب' : 'Pay when you receive the order'}
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.payment_method === 'wishmoney'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="wishmoney"
                    checked={formData.payment_method === 'wishmoney'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">Wishmoney</div>
                    <div className="text-sm text-gray-600">
                      {language === 'ar' ? 'الدفع الإلكتروني عبر Wishmoney' : 'Pay online with Wishmoney'}
                    </div>
                  </div>
                </label>
              </div>
              {errors.payment_method && (
                <p className="text-red-500 text-sm mt-2">{errors.payment_method}</p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={language === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>
              
              <div className="space-y-3 mb-4">
                {cart.map((item) => {
                  const { displayPrice } = getProductPrices(item)
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {language === 'ar' ? (item.name_ar || item.name) : (item.name || item.name_ar)} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {(displayPrice * item.quantity).toFixed(2)} {t('currency')}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">{language === 'ar' ? 'الإجمالي' : 'Total'}:</span>
                  <span className="text-2xl font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                    {getCartTotal().toFixed(2)} {t('currency')}
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
                  style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
                >
                  {loading 
                    ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                    : (language === 'ar' ? 'إتمام الطلب' : 'Complete Order')
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default Checkout

