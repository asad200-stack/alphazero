import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { getImageUrl } from '../utils/config'
import { getProductPrices } from '../utils/productHelpers'

const Cart = () => {
  const { t, language } = useLanguage()
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const { settings } = useSettings()

  const handleCheckout = () => {
    if (settings.whatsapp_number) {
      const items = cart.map(item => {
        const name = language === 'ar' ? (item.name_ar || item.name) : (item.name || item.name_ar)
        const price = item.discount_price && parseFloat(item.discount_price) > 0 && parseFloat(item.discount_price) < parseFloat(item.price)
          ? parseFloat(item.discount_price)
          : parseFloat(item.price)
        return `${name} x${item.quantity} = ${(price * item.quantity).toFixed(2)} ${t('currency')}`
      }).join('\n')
      
      const total = getCartTotal().toFixed(2)
      const message = encodeURIComponent(
        `مرحباً، أريد طلب:\n\n${items}\n\n${t('total')}: ${total} ${t('currency')}`
      )
      window.open(`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('shoppingCart')}</h1>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">{t('emptyCart')}</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t('continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md divide-y">
              {cart.map((item) => {
                const { displayPrice } = getProductPrices(item)
                return (
                  <div key={item.id} className="p-4 flex items-center space-x-4 space-x-reverse">
                    {item.image && (
                      <img
                        src={getImageUrl(item.image)}
                        alt={language === 'ar' ? (item.name_ar || item.name) : (item.name || item.name_ar)}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {language === 'ar' ? (item.name_ar || item.name) : (item.name || item.name_ar)}
                      </h3>
                      <p className="text-lg font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                        {displayPrice.toFixed(2)} {t('currency')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">{t('total')}:</span>
                <span className="text-2xl font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                  {getCartTotal().toFixed(2)} {t('currency')}
                </span>
              </div>
              <Link
                to="/checkout"
                className="block w-full py-3 rounded-lg text-white font-bold text-lg hover:opacity-90 transition text-center"
                style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
              >
                {t('checkout')}
              </Link>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}

export default Cart

