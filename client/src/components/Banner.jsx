import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'

const Banner = () => {
  const { settings } = useSettings()
  const { t } = useLanguage()

  if (settings.banner_enabled !== 'true') {
    return null
  }

  return (
    <div 
      className="w-full relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${settings.primary_color || '#DC2626'} 0%, ${settings.secondary_color || '#991B1B'} 100%)`,
        minHeight: '280px'
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Arabic Text */}
          <div className="text-white text-right">
            <p className="text-lg md:text-xl mb-2 font-semibold">
              {t('limitedStock')}
            </p>
            <p className="text-2xl md:text-3xl mb-4 font-bold">
              {settings.banner_text || t('specialOffers')}
            </p>
            <p className="text-sm md:text-base opacity-90">
              {t('limitedTimeOnly')}
            </p>
          </div>

          {/* English Text */}
          <div className="text-white text-left">
            <h2 className="text-4xl md:text-6xl font-black mb-2">
              {t('blackFriday')}
            </h2>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl md:text-4xl font-bold">{t('upTo')}</span>
              <span className="text-5xl md:text-7xl font-black bg-white text-red-600 px-4 py-2 rounded-lg">
                90%
              </span>
            </div>
            <p className="text-lg md:text-xl mt-4 font-semibold">
              {settings.banner_text_en || t('specialOffers')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner

