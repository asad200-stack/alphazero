import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const countries = [
  { code: 'LB', name: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪' },
  { code: 'JO', name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'EG', name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
]

const CountrySelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const { language } = useLanguage()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 space-x-reverse text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-300"
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="font-semibold hidden md:block">
          {language === 'ar' ? selectedCountry.nameAr : selectedCountry.name}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[200px] overflow-hidden">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-right ${
                  selectedCountry.code === country.code ? 'bg-red-50' : ''
                }`}
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="flex-1 font-semibold text-gray-800">
                  {language === 'ar' ? country.nameAr : country.name}
                </span>
                {selectedCountry.code === country.code && (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CountrySelector





