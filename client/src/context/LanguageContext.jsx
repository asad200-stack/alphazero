import { createContext, useContext, useState, useEffect } from 'react'
import { useSettings } from './SettingsContext'
import ar from '../locales/ar'
import en from '../locales/en'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { settings } = useSettings()
  const [language, setLanguage] = useState(() => {
    // Initialize from localStorage first
    return localStorage.getItem('language') || 'ar'
  })
  const [translations, setTranslations] = useState(() => {
    const savedLang = localStorage.getItem('language') || 'ar'
    return savedLang === 'en' ? en : ar
  })

  useEffect(() => {
    // Initialize HTML direction on mount
    const savedLang = localStorage.getItem('language') || 'ar'
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = savedLang
  }, [])

  useEffect(() => {
    // Update language when settings change (only if no manual language is set)
    if (settings && settings.default_language) {
      const savedLanguage = settings.default_language
      const manualLanguage = localStorage.getItem('language')
      
      // Only update if user hasn't manually set a language preference
      if (!manualLanguage && savedLanguage !== language) {
        setLanguage(savedLanguage)
        setTranslations(savedLanguage === 'en' ? en : ar)
        document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = savedLanguage
      }
    }
  }, [settings?.default_language])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    setTranslations(lang === 'en' ? en : ar)
    localStorage.setItem('language', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const t = (key) => {
    return translations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

