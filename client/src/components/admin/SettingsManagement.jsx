import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import api from '../../utils/api'
import { getImageUrl } from '../../utils/config'
import { useLanguage } from '../../context/LanguageContext'

const SettingsManagement = () => {
  const { settings, updateSettings, fetchSettings } = useSettings()
  const { t } = useLanguage()
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
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'logoFile') {
          formDataToSend.append(key, formData[key])
        }
      })
      if (formData.logoFile) {
        formDataToSend.append('logo', formData.logoFile)
      }

      await api.put('/settings', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      await fetchSettings()
      alert(t('settingsSaved'))
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(t('error'))
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
                  <p className="font-medium mb-1">⚠️ تحذير:</p>
                  <p className="text-sm">
                    الرابط يحتوي على localhost أو 127.0.0.1. هذا الرابط لن يعمل على أجهزة أخرى! 
                    يجب استخدام رابط عام يمكن الوصول إليه من الإنترنت (مثال: https://yourstore.com أو IP عام).
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                <strong>مهم:</strong> أدخل رابط المتجر الكامل الذي يمكن للزبائن الوصول إليه من أي جهاز. 
                يجب أن يبدأ بـ http:// أو https:// (مثال: https://yourstore.com).
                <br />
                <span className="text-red-600">لا تستخدم localhost أو 127.0.0.1 لأنهما لن يعملا على أجهزة أخرى.</span>
              </p>
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
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('holidayTheme')}</h3>
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

