import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState(null)
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveTheme()
    fetchThemes()
  }, [])

  const fetchActiveTheme = async () => {
    try {
      const response = await axios.get('/api/themes/active')
      setActiveTheme(response.data)
      applyTheme(response.data)
    } catch (error) {
      console.error('Error fetching active theme:', error)
      // Set default theme
      const defaultTheme = {
        template_type: 'general',
        config: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          fontFamily: 'Inter',
          buttonStyle: 'rounded',
          showBanner: true,
          showFeatured: true,
          showOffers: true,
          showBestSellers: true
        }
      }
      setActiveTheme(defaultTheme)
      applyTheme(defaultTheme)
    } finally {
      setLoading(false)
    }
  }

  const fetchThemes = async () => {
    try {
      const response = await axios.get('/api/themes')
      setThemes(response.data)
    } catch (error) {
      console.error('Error fetching themes:', error)
    }
  }

  const applyTheme = (theme) => {
    if (!theme || !theme.config) return

    const { config } = theme
    const root = document.documentElement

    // Apply CSS variables
    if (config.primaryColor) {
      root.style.setProperty('--theme-primary', config.primaryColor)
      root.style.setProperty('--primary-color', config.primaryColor)
    }
    if (config.secondaryColor) {
      root.style.setProperty('--theme-secondary', config.secondaryColor)
      root.style.setProperty('--secondary-color', config.secondaryColor)
    }
    if (config.fontFamily) {
      root.style.setProperty('--theme-font', config.fontFamily)
    }

    // Apply theme class to body
    root.setAttribute('data-theme', theme.template_type || 'general')
    
    // Apply button style
    if (config.buttonStyle) {
      root.setAttribute('data-button-style', config.buttonStyle)
    }
  }

  const activateTheme = async (themeId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/themes/${themeId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Refresh active theme
      await fetchActiveTheme()
      await fetchThemes()
      
      if (window.showToast) {
        window.showToast('Theme activated successfully', 'success')
      }
      return true
    } catch (error) {
      console.error('Error activating theme:', error)
      if (window.showToast) {
        window.showToast('Error activating theme', 'error')
      }
      return false
    }
  }

  const updateThemeConfig = async (themeId, config) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/themes/${themeId}/config`, { config }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Refresh themes
      await fetchThemes()
      if (activeTheme && activeTheme.id === themeId) {
        const updatedTheme = await axios.get('/api/themes/active')
        setActiveTheme(updatedTheme.data)
        applyTheme(updatedTheme.data) // Re-apply theme with new colors
      }
      
      if (window.showToast) {
        window.showToast('Theme config updated successfully', 'success')
      }
      return true
    } catch (error) {
      console.error('Error updating theme config:', error)
      if (window.showToast) {
        window.showToast('Error updating theme config', 'error')
      }
      return false
    }
  }

  return (
    <ThemeContext.Provider value={{
      activeTheme,
      themes,
      loading,
      activateTheme,
      updateThemeConfig,
      fetchThemes,
      fetchActiveTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}


