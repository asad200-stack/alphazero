import React, { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

const ThemeManagement = () => {
  const { themes, activeTheme, activateTheme, updateThemeConfig, fetchThemes } = useTheme()
  const { t, language } = useLanguage()
  const [previewTheme, setPreviewTheme] = useState(null)
  const [editingConfig, setEditingConfig] = useState(null)

  const themeIcons = {
    clothing: '👕',
    beauty: '💄',
    electronics: '📱',
    general: '🛒'
  }

  const handleActivateTheme = async (theme) => {
    if (window.confirm(language === 'ar' 
      ? `هل تريد تفعيل ثيم "${theme.name_ar || theme.name}"؟`
      : `Do you want to activate theme "${theme.name}"?`)) {
      await activateTheme(theme.id)
    }
  }

  const handleEditConfig = (theme) => {
    setEditingConfig({
      ...theme,
      config: { ...theme.config }
    })
  }

  const handleSaveConfig = async () => {
    if (!editingConfig) return
    
    const success = await updateThemeConfig(editingConfig.id, editingConfig.config)
    if (success) {
      setEditingConfig(null)
    }
  }

  const handleConfigChange = (key, value) => {
    setEditingConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }))
  }

  const handlePreview = (theme) => {
    setPreviewTheme(theme)
    // Apply preview theme temporarily
    const root = document.documentElement
    root.setAttribute('data-theme-preview', theme.template_type)
    if (theme.config) {
      if (theme.config.primaryColor) {
        root.style.setProperty('--theme-primary', theme.config.primaryColor)
      }
      if (theme.config.secondaryColor) {
        root.style.setProperty('--theme-secondary', theme.config.secondaryColor)
      }
    }
  }

  const closePreview = () => {
    setPreviewTheme(null)
    const root = document.documentElement
    root.removeAttribute('data-theme-preview')
    // Restore active theme
    if (activeTheme) {
      root.setAttribute('data-theme', activeTheme.template_type || 'general')
      if (activeTheme.config) {
        if (activeTheme.config.primaryColor) {
          root.style.setProperty('--theme-primary', activeTheme.config.primaryColor)
        }
        if (activeTheme.config.secondaryColor) {
          root.style.setProperty('--theme-secondary', activeTheme.config.secondaryColor)
        }
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {language === 'ar' ? 'إدارة الثيمات' : 'Theme Management'}
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {language === 'ar' ? 'الثيم النشط' : 'Active Theme'}
        </h3>
        {activeTheme && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <span className="text-4xl">{themeIcons[activeTheme.template_type] || '🛒'}</span>
            <div>
              <h4 className="font-bold text-lg text-gray-800">
                {language === 'ar' ? (activeTheme.name_ar || activeTheme.name) : (activeTheme.name || activeTheme.name_ar)}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? (activeTheme.description_ar || activeTheme.description) : (activeTheme.description || activeTheme.description_ar)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
              theme.is_active === 1 ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{themeIcons[theme.template_type] || '🛒'}</span>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">
                      {language === 'ar' ? (theme.name_ar || theme.name) : (theme.name || theme.name_ar)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'ar' ? (theme.description_ar || theme.description) : (theme.description || theme.description_ar)}
                    </p>
                  </div>
                </div>
                {theme.is_active === 1 && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {theme.config && (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: theme.config.primaryColor || '#3B82F6' }}
                      ></div>
                      <span className="text-xs text-gray-600">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: theme.config.secondaryColor || '#1E40AF' }}
                      ></div>
                      <span className="text-xs text-gray-600">Secondary</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {theme.is_active !== 1 && (
                  <button
                    onClick={() => handleActivateTheme(theme)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    {language === 'ar' ? 'تفعيل' : 'Activate'}
                  </button>
                )}
                <button
                  onClick={() => handlePreview(theme)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {language === 'ar' ? 'معاينة' : 'Preview'}
                </button>
                <button
                  onClick={() => handleEditConfig(theme)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  title={language === 'ar' ? 'تعديل الإعدادات' : 'Edit Config'}
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Config Edit Modal */}
      {editingConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {language === 'ar' ? 'تعديل إعدادات الثيم' : 'Edit Theme Config'}
                </h2>
                <button
                  onClick={() => setEditingConfig(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
                  </label>
                  <input
                    type="color"
                    value={editingConfig.config.primaryColor || '#3B82F6'}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}
                  </label>
                  <input
                    type="color"
                    value={editingConfig.config.secondaryColor || '#1E40AF'}
                    onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'نمط الأزرار' : 'Button Style'}
                  </label>
                  <select
                    value={editingConfig.config.buttonStyle || 'rounded'}
                    onChange={(e) => handleConfigChange('buttonStyle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="rounded">{language === 'ar' ? 'مستدير' : 'Rounded'}</option>
                    <option value="rounded-full">{language === 'ar' ? 'دائري كامل' : 'Fully Rounded'}</option>
                    <option value="square">{language === 'ar' ? 'مربع' : 'Square'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={editingConfig.config.showBanner !== false}
                      onChange={(e) => handleConfigChange('showBanner', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">{language === 'ar' ? 'إظهار البانر' : 'Show Banner'}</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={editingConfig.config.showFeatured !== false}
                      onChange={(e) => handleConfigChange('showFeatured', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">{language === 'ar' ? 'إظهار المنتجات المميزة' : 'Show Featured Products'}</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={editingConfig.config.showOffers !== false}
                      onChange={(e) => handleConfigChange('showOffers', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">{language === 'ar' ? 'إظهار العروض' : 'Show Offers'}</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={editingConfig.config.showBestSellers !== false}
                      onChange={(e) => handleConfigChange('showBestSellers', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">{language === 'ar' ? 'إظهار الأكثر مبيعاً' : 'Show Best Sellers'}</span>
                  </label>
                </div>

                <div className="pt-4 border-t flex gap-4">
                  <button
                    onClick={handleSaveConfig}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingConfig(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {language === 'ar' ? 'معاينة الثيم' : 'Theme Preview'}
                </h2>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'ar' 
                    ? 'هذه معاينة مؤقتة للثيم. اضغط "تفعيل" لتطبيق الثيم على الموقع.'
                    : 'This is a temporary preview. Click "Activate" to apply the theme to your store.'}
                </p>
                <button
                  onClick={() => {
                    handleActivateTheme(previewTheme)
                    closePreview()
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {language === 'ar' ? 'تفعيل هذا الثيم' : 'Activate This Theme'}
                </button>
              </div>

              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src="/"
                  className="w-full h-[600px] border-0"
                  title="Theme Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeManagement

