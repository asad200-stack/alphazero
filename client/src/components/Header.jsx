import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../utils/config'

const Header = () => {
  const { settings } = useSettings()
  const { language, changeLanguage, t } = useLanguage()
  const { getCartCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-4 space-x-reverse flex-shrink-0">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              {settings.logo ? (
                <img 
                  src={getImageUrl(settings.logo)} 
                  alt={settings.store_name}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div 
                  className="text-2xl md:text-3xl font-black tracking-tight"
                  style={{ 
                    letterSpacing: '-0.02em',
                    color: settings.primary_color || '#3B82F6'
                  }}
                >
                  {settings.store_name || 'متجري الإلكتروني'}
                </div>
              )}
            </Link>
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center space-x-3 space-x-reverse flex-shrink-0">
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-gray-50">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100">
                {t('home')}
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100">
                {t('shop')}
              </Link>
              <Link to="/admin/login" className="text-gray-700 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100">
                {t('admin')}
              </Link>
              <button
                onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-gray-900 font-semibold text-right px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </button>
            </nav>
          </div>
        )}

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center justify-center space-x-8 space-x-reverse py-3 border-t border-gray-200">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-gray-900 font-semibold transition-all duration-300 relative group px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            {t('home')}
          </Link>
          <Link 
            to="/shop" 
            className="text-gray-700 hover:text-gray-900 font-semibold transition-all duration-300 relative group px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            {t('shop')}
          </Link>
          <Link 
            to="/admin/login" 
            className="text-gray-700 hover:text-gray-900 font-semibold transition-all duration-300 relative group px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            {t('admin')}
          </Link>
          <button
            onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-gray-900 font-semibold transition-all duration-300 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </button>
        </nav>
      </div>
      
    </header>
  )
}

export default Header

