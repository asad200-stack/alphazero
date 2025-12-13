import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { getImageUrl } from '../utils/config'

const Header = () => {
  const { settings } = useSettings()
  const { language, changeLanguage, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center space-x-4 space-x-reverse">
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
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div 
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: settings.primary_color || '#3B82F6' }}
                >
                  {settings.store_name || 'متجري الإلكتروني'}
                </div>
              )}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link to="/cart" className="relative text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium">
                {t('home')}
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-gray-900 font-medium">
                {t('shop')}
              </Link>
              <Link to="/admin/login" className="text-gray-700 hover:text-gray-900 font-medium">
                {t('admin')}
              </Link>
              <button
                onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-gray-900 font-medium text-right"
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
        <nav className="hidden md:flex items-center justify-center space-x-8 space-x-reverse py-3">
          <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium transition">
            {t('home')}
          </Link>
          <Link to="/shop" className="text-gray-700 hover:text-gray-900 font-medium transition">
            {t('shop')}
          </Link>
          <Link to="/admin/login" className="text-gray-700 hover:text-gray-900 font-medium transition">
            {t('admin')}
          </Link>
          <button
            onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-gray-900 font-medium transition px-3 py-1 rounded-lg hover:bg-gray-100"
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

