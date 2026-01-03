import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'

const Banner = () => {
  const { settings } = useSettings()
  const { t, language } = useLanguage()

  if (settings.banner_enabled !== 'true') {
    return null
  }

  return (
    <div 
      className="w-full relative overflow-hidden luxury-shadow-lg"
      style={{ 
        background: `linear-gradient(135deg, ${settings.primary_color || '#667eea'} 0%, ${settings.secondary_color || '#764ba2'} 100%)`,
        minHeight: '320px'
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Arabic Text */}
          <div className="text-white text-right">
            <p className="text-lg md:text-xl mb-3 font-semibold opacity-90 tracking-wide">
              {t('limitedStock')}
            </p>
            <p className="text-3xl md:text-4xl mb-5 font-black leading-tight drop-shadow-lg">
              {settings.banner_text || t('specialOffers')}
            </p>
            <p className="text-base md:text-lg opacity-80 font-medium mb-6">
              {t('limitedTimeOnly')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="inline-block px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-center"
                style={{ color: settings.primary_color || '#667eea' }}
              >
                {language === 'ar' ? 'تسوّق الآن' : 'Shop Now'}
              </Link>
              <Link
                to="/shop"
                className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-center"
              >
                {language === 'ar' ? 'شوف العروض' : 'View Offers'}
              </Link>
            </div>
          </div>

          {/* English Text */}
          <div className="text-white text-left">
            <h2 className="text-5xl md:text-7xl font-black mb-3 drop-shadow-2xl tracking-tight">
              {t('blackFriday')}
            </h2>
            <p className="text-xl md:text-2xl mt-5 font-bold drop-shadow-lg">
              {settings.banner_text_en || t('specialOffers')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner

