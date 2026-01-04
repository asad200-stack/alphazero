import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../utils/api'
import { getImageUrl } from '../../utils/config'
import { useLanguage } from '../../context/LanguageContext'

const SettingsManagement = () => {
  const { settings, updateSettings, fetchSettings } = useSettings()
  const { t, language } = useLanguage()
  
  // Get theme context with error handling
  let themes = []
  let activeTheme = null
  let activateThemeFn = null
  let themeError = false
  
  try {
    const themeContext = useTheme()
    if (themeContext) {
      themes = themeContext.themes || []
      activeTheme = themeContext.activeTheme
      activateThemeFn = themeContext.activateTheme
    }
  } catch (error) {
    console.error('Theme context error:', error)
    themeError = true
  }
  const [formData, setFormData] = useState({
    store_name: '',
    store_name_en: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    whatsapp_number: '',
    phone_number: '',
    instagram_url: '',
    store_url: '',
    banner_text: '',
    banner_text_en: '',
    banner_enabled: 'true',
    default_language: 'ar',
    holiday_theme: 'none'
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name || '',
        store_name_en: settings.store_name_en || '',
        primary_color: settings.primary_color || '#3B82F6',
        secondary_color: settings.secondary_color || '#1E40AF',
        whatsapp_number: settings.whatsapp_number || '',
        phone_number: settings.phone_number || '',
        instagram_url: settings.instagram_url || '',
        store_url: settings.store_url || '',
      banner_text: settings.banner_text || '',
      banner_text_en: settings.banner_text_en || '',
      banner_enabled: settings.banner_enabled || 'true',
      default_language: settings.default_language || 'ar',
      holiday_theme: settings.holiday_theme || 'none'
      })
      if (settings.logo) {
        setPreview(getImageUrl(settings.logo))
      }
    }
  }, [settings])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) {
        alert(t('error'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Store file for upload
      setFormData(prev => ({ ...prev, logoFile: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If there's a logo file, use FormData, otherwise use JSON
      if (formData.logoFile) {
        const formDataToSend = new FormData()
        Object.keys(formData).forEach(key => {
          if (key !== 'logoFile') {
            const value = formData[key]
            if (value !== undefined && value !== null) {
              formDataToSend.append(key, value)
            }
          }
        })
        formDataToSend.append('logo', formData.logoFile)

        // Let axios handle FormData automatically
        await api.put('/settings', formDataToSend)
      } else {
        // No file, send as JSON
        const jsonData = {}
        Object.keys(formData).forEach(key => {
          if (key !== 'logoFile') {
            const value = formData[key]
            // Include all values, even empty strings, but not undefined/null
            if (value !== undefined && value !== null) {
              jsonData[key] = value
            }
          }
        })
        
        console.log('Sending JSON data:', jsonData)
        console.log('JSON data keys:', Object.keys(jsonData))
        console.log('JSON data size:', JSON.stringify(jsonData).length)
        console.log('JSON stringified:', JSON.stringify(jsonData))
        
        // Ensure we have at least one field to update
        if (Object.keys(jsonData).length === 0) {
          throw new Error('No data to update')
        }
        
        // Don't explicitly set Content-Type - let axios handle it
        await api.put('/settings', jsonData)
      }

      await fetchSettings()
      // Toast will be shown from useToast if available
      if (window.showToast) {
        window.showToast(t('settingsSaved'), 'success')
      } else {
        alert(t('settingsSaved'))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      // Extract error message from response
      let errorMessage = t('error') || 'حدث خطأ'
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (window.showToast) {
        window.showToast(errorMessage, 'error')
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('storeSettings')}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('storeInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('storeName')}
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('storeNameEn')}
              </label>
              <input
                type="text"
                name="store_name_en"
                value={formData.store_name_en}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('logo')}</h3>
          <div className="flex items-center space-x-6 space-x-reverse rtl:space-x-reverse">
            {preview && (
              <img
                src={preview}
                alt="Logo preview"
                className="h-24 w-auto object-contain border border-gray-300 rounded-lg p-2"
              />
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                {preview ? t('changeImage') : t('uploadLogo')}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('colors')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('primaryColor')}
              </label>
              <div className="flex items-center space-x-3 space-x-reverse rtl:space-x-reverse">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('secondaryColor')}
              </label>
              <div className="flex items-center space-x-3 space-x-reverse rtl:space-x-reverse">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('contactInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('whatsappNumber')}
              </label>
              <input
                type="text"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="+962791234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+962791234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                {t('instagramUrl')}
              </label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/yourstore"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                {t('storeUrl')} *
              </label>
              <input
                type="url"
                name="store_url"
                value={formData.store_url}
                onChange={handleChange}
                placeholder="https://yourstore.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formData.store_url && (formData.store_url.includes('localhost') || formData.store_url.includes('127.0.0.1'))
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {formData.store_url && (formData.store_url.includes('localhost') || formData.store_url.includes('127.0.0.1')) && (
                <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-medium mb-1">⚠️ {t('warning')}</p>
                  <p className="text-sm">
                    {t('localhostWarning')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('languageSettings')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('defaultLanguage')}
              </label>
              <select
                name="default_language"
                value={formData.default_language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ar">{t('arabic')}</option>
                <option value="en">{t('english')}</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('bannerSettings')}</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.banner_enabled === 'true'}
                  onChange={(e) => setFormData(prev => ({ ...prev, banner_enabled: e.target.checked ? 'true' : 'false' }))}
                  className="w-5 h-5"
                />
                <span className="text-gray-700">{t('enableBanner')}</span>
              </label>
            </div>

            {formData.banner_enabled === 'true' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t('bannerText')}
                  </label>
                  <input
                    type="text"
                    name="banner_text"
                    value={formData.banner_text}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t('bannerTextEn')}
                  </label>
                  <input
                    type="text"
                    name="banner_text_en"
                    value={formData.banner_text_en}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('appearance') || (language === 'ar' ? 'المظهر والثيمات' : 'Appearance & Themes')}</h3>
          
          {/* Holiday Theme */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3 text-gray-700">{t('holidayTheme')}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t('selectHolidayTheme')}
                </label>
                <select
                  name="holiday_theme"
                  value={formData.holiday_theme}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">{t('noTheme')}</option>
                  <option value="christmas">{t('christmasTheme')}</option>
                  <option value="eid">{t('eidTheme')}</option>
                  <option value="ramadan">{t('ramadanTheme')}</option>
                  <option value="valentine">{t('valentineTheme')}</option>
                  <option value="newyear">{t('newYearTheme')}</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  {t('holidayThemeDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Store Themes Section - Always visible */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold mb-3 text-gray-700">
              {language === 'ar' ? '🎨 ثيمات المتجر' : '🎨 Store Themes'}
            </h4>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border-2 border-gray-200 shadow-sm">
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  {language === 'ar' 
                    ? 'اختر ثيم احترافي لمتجرك. كل ثيم مصمم خصيصاً لنوع معين من المتاجر.'
                    : 'Choose a professional theme for your store. Each theme is designed specifically for a certain type of store.'}
                </p>
                
                {themeError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      {language === 'ar' 
                        ? '⚠️ حدث خطأ في تحميل الثيمات. يرجى تحديث الصفحة.'
                        : '⚠️ Error loading themes. Please refresh the page.'}
                    </p>
                  </div>
                )}
                
                {activeTheme && !themeError && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      {language === 'ar' ? 'الثيم النشط:' : 'Active Theme:'}
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {language === 'ar' ? (activeTheme.name_ar || activeTheme.name) : (activeTheme.name || activeTheme.name_ar)}
                    </p>
                  </div>
                )}

                {themes.length === 0 && !themeError ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      {language === 'ar' 
                        ? 'جاري تحميل الثيمات...' 
                        : 'Loading themes...'}
                    </p>
                    <p className="text-xs text-yellow-700">
                      {language === 'ar' 
                        ? 'إذا لم تظهر الثيمات، اضغط على "إدارة الثيمات المتقدمة" أدناه.'
                        : 'If themes don\'t appear, click "Advanced Theme Management" below.'}
                    </p>
                  </div>
                ) : themes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((theme) => {
                  const themeIcons = {
                    clothing: '👕',
                    beauty: '💄',
                    electronics: '📱',
                    general: '🛒'
                  }
                  const isActive = theme.is_active === 1
                  
                  return (
                    <div
                      key={theme.id}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{themeIcons[theme.template_type] || '🛒'}</span>
                          <h4 className="font-bold text-gray-800">
                            {language === 'ar' ? (theme.name_ar || theme.name) : (theme.name || theme.name_ar)}
                          </h4>
                        </div>
                        {isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                            {language === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'ar' ? (theme.description_ar || theme.description) : (theme.description || theme.description_ar)}
                      </p>
                      {!isActive && activateThemeFn && (
                        <button
                          onClick={async () => {
                            if (window.confirm(language === 'ar' 
                              ? `هل تريد تفعيل ثيم "${theme.name_ar || theme.name}"؟`
                              : `Do you want to activate theme "${theme.name}"?`)) {
                              await activateThemeFn(theme.id)
                              // Refresh page to show updated theme
                              window.location.reload()
                            }
                          }}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                        >
                          {language === 'ar' ? 'تفعيل' : 'Activate'}
                        </button>
                      )}
                    </div>
                  )
                })}
                </div>
                ) : null}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href="/admin/themes"
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm inline-flex items-center gap-1"
                  >
                    {language === 'ar' ? 'إدارة الثيمات المتقدمة' : 'Advanced Theme Management'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? t('saving') : t('save') + ' ' + t('settings')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsManagement

