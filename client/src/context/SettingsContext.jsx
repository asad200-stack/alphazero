import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    store_name: 'متجري الإلكتروني',
    store_name_en: 'My Store',
    logo: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    whatsapp_number: '',
    phone_number: '',
    instagram_url: '',
    store_url: '',
    banner_text: 'عروض خاصة - خصومات تصل إلى 50%',
    banner_text_en: 'Special Offers - Up to 50% Off',
    banner_enabled: 'true',
    default_language: 'ar'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings')
      setSettings(response.data)
      // Apply primary color to CSS variables
      if (response.data.primary_color) {
        document.documentElement.style.setProperty('--primary-color', response.data.primary_color)
      }
      if (response.data.secondary_color) {
        document.documentElement.style.setProperty('--secondary-color', response.data.secondary_color)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      await axios.put('/api/settings', newSettings)
      setSettings(prev => ({ ...prev, ...newSettings }))
      return true
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

