import { useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'

const SEOHead = ({ title, description, image, url }) => {
  const { settings } = useSettings()
  const { language } = useLanguage()

  useEffect(() => {
    const siteName = settings.store_name_en || settings.store_name || 'My Store'
    
    const siteDescription = description || 
      (language === 'ar' 
        ? 'متجر إلكتروني احترافي'
        : 'Professional E-commerce Store')
    
    const siteTitle = title 
      ? `${title} - ${siteName}`
      : siteName

    const siteUrl = url || window.location.href
    const siteImage = image || settings.logo || '/logo.png'

    // Update title
    document.title = siteTitle

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', siteDescription)
    updateMetaTag('title', siteTitle)

    // Open Graph tags
    updateMetaTag('og:title', siteTitle, 'property')
    updateMetaTag('og:description', siteDescription, 'property')
    updateMetaTag('og:image', siteImage, 'property')
    updateMetaTag('og:url', siteUrl, 'property')
    updateMetaTag('og:type', 'website', 'property')
    updateMetaTag('og:site_name', siteName, 'property')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', siteTitle)
    updateMetaTag('twitter:description', siteDescription)
    updateMetaTag('twitter:image', siteImage)

    // Additional meta tags
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    updateMetaTag('theme-color', settings.primary_color || '#3B82F6')
  }, [title, description, image, url, settings, language])

  return null
}

export default SEOHead







