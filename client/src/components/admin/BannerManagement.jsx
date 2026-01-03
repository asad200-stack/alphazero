import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import { getImageUrl } from '../../utils/config'
import { useLanguage } from '../../context/LanguageContext'
import LazyImage from '../LazyImage'

const BannerManagement = () => {
  const { language, t } = useLanguage()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    subtitle: '',
    subtitle_ar: '',
    button_text: '',
    button_text_ar: '',
    button_link: '/shop',
    button_text_2: '',
    button_text_2_ar: '',
    button_link_2: '/shop',
    display_order: 0,
    enabled: 1
  })
  const [imagePreviews, setImagePreviews] = useState({
    desktop: null,
    tablet: null,
    mobile: null
  })
  const fileInputRefs = {
    desktop: useRef(null),
    tablet: useRef(null),
    mobile: useRef(null)
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await api.get('/banners/admin')
      setBanners(response.data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileInput = (type) => (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => ({ ...prev, [type]: e.target.result }))
      }
      reader.readAsDataURL(file)
      setFormData(prev => ({ ...prev, [`image_${type}_file`]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (!key.includes('_file')) {
          formDataToSend.append(key, formData[key])
        }
      })

      if (formData.image_desktop_file) {
        formDataToSend.append('image_desktop', formData.image_desktop_file)
      }
      if (formData.image_tablet_file) {
        formDataToSend.append('image_tablet', formData.image_tablet_file)
      }
      if (formData.image_mobile_file) {
        formDataToSend.append('image_mobile', formData.image_mobile_file)
      }

      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/banners', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      await fetchBanners()
      resetForm()
      if (window.showToast) {
        window.showToast(
          editingBanner
            ? (language === 'ar' ? 'تم تحديث البانر بنجاح' : 'Banner updated successfully')
            : (language === 'ar' ? 'تم إضافة البانر بنجاح' : 'Banner added successfully'),
          'success'
        )
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء حفظ البانر' : 'Error saving banner',
          'error'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      subtitle: '',
      subtitle_ar: '',
      button_text: '',
      button_text_ar: '',
      button_link: '/shop',
      button_text_2: '',
      button_text_2_ar: '',
      button_link_2: '/shop',
      display_order: 0,
      enabled: 1
    })
    setImagePreviews({ desktop: null, tablet: null, mobile: null })
    setEditingBanner(null)
    setShowForm(false)
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      title_ar: banner.title_ar || '',
      subtitle: banner.subtitle || '',
      subtitle_ar: banner.subtitle_ar || '',
      button_text: banner.button_text || '',
      button_text_ar: banner.button_text_ar || '',
      button_link: banner.button_link || '/shop',
      button_text_2: banner.button_text_2 || '',
      button_text_2_ar: banner.button_text_2_ar || '',
      button_link_2: banner.button_link_2 || '/shop',
      display_order: banner.display_order || 0,
      enabled: banner.enabled || 1
    })
    setImagePreviews({
      desktop: banner.image_desktop ? getImageUrl(banner.image_desktop) : null,
      tablet: banner.image_tablet ? getImageUrl(banner.image_tablet) : null,
      mobile: banner.image_mobile ? getImageUrl(banner.image_mobile) : null
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا البانر؟' : 'Are you sure you want to delete this banner?')) {
      return
    }

    try {
      await api.delete(`/banners/${id}`)
      await fetchBanners()
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'تم حذف البانر بنجاح' : 'Banner deleted successfully',
          'success'
        )
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء حذف البانر' : 'Error deleting banner',
          'error'
        )
      }
    }
  }

  const handleToggleEnabled = async (banner) => {
    try {
      const currentEnabled = banner.enabled === 1 || banner.enabled === '1' || banner.enabled === true
      const newEnabled = currentEnabled ? 0 : 1
      
      console.log('Toggling banner:', {
        id: banner.id,
        currentEnabled,
        newEnabled,
        hasImages: {
          desktop: !!banner.image_desktop,
          tablet: !!banner.image_tablet,
          mobile: !!banner.image_mobile
        }
      })
      
      // Use JSON instead of FormData for simple updates
      const updateData = {
        title: banner.title,
        title_ar: banner.title_ar,
        subtitle: banner.subtitle,
        subtitle_ar: banner.subtitle_ar,
        button_text: banner.button_text,
        button_text_ar: banner.button_text_ar,
        button_link: banner.button_link,
        button_text_2: banner.button_text_2,
        button_text_2_ar: banner.button_text_2_ar,
        button_link_2: banner.button_link_2,
        image_desktop: banner.image_desktop,
        image_tablet: banner.image_tablet,
        image_mobile: banner.image_mobile,
        display_order: banner.display_order,
        enabled: newEnabled
      }
      
      const response = await api.put(`/banners/${banner.id}`, updateData)
      console.log('Banner update response:', response.data)
      
      await fetchBanners()
      
      if (window.showToast) {
        window.showToast(
          newEnabled === 1
            ? (language === 'ar' ? 'تم تفعيل البانر' : 'Banner enabled')
            : (language === 'ar' ? 'تم إلغاء تفعيل البانر' : 'Banner disabled'),
          'success'
        )
      }
    } catch (error) {
      console.error('Error toggling banner:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء تحديث البانر' : 'Error updating banner',
          'error'
        )
      }
    }
  }

  if (loading && banners.length === 0) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {language === 'ar' ? 'إدارة البانرات' : 'Banner Management'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + {language === 'ar' ? 'إضافة بانر جديد' : 'Add New Banner'}
        </button>
      </div>


      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingBanner
                    ? (language === 'ar' ? 'تعديل البانر' : 'Edit Banner')
                    : (language === 'ar' ? 'إضافة بانر جديد' : 'Add New Banner')
                  }
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      name="title_ar"
                      value={formData.title_ar}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}
                    </label>
                    <input
                      type="text"
                      name="subtitle_ar"
                      value={formData.subtitle_ar}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'نص الزر الأول (إنجليزي)' : 'Button 1 Text (English)'}
                    </label>
                    <input
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleChange}
                      placeholder="Shop Now"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'نص الزر الأول (عربي)' : 'Button 1 Text (Arabic)'}
                    </label>
                    <input
                      type="text"
                      name="button_text_ar"
                      value={formData.button_text_ar}
                      onChange={handleChange}
                      placeholder="تسوّق الآن"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'رابط الزر الأول' : 'Button 1 Link'}
                    </label>
                    <input
                      type="text"
                      name="button_link"
                      value={formData.button_link}
                      onChange={handleChange}
                      placeholder="/shop"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'نص الزر الثاني (إنجليزي)' : 'Button 2 Text (English)'}
                    </label>
                    <input
                      type="text"
                      name="button_text_2"
                      value={formData.button_text_2}
                      onChange={handleChange}
                      placeholder="View Offers"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'نص الزر الثاني (عربي)' : 'Button 2 Text (Arabic)'}
                    </label>
                    <input
                      type="text"
                      name="button_text_2_ar"
                      value={formData.button_text_2_ar}
                      onChange={handleChange}
                      placeholder="شوف العروض"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'رابط الزر الثاني' : 'Button 2 Link'}
                    </label>
                    <input
                      type="text"
                      name="button_link_2"
                      value={formData.button_link_2}
                      onChange={handleChange}
                      placeholder="/shop"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">
                    {language === 'ar' ? 'صور البانر' : 'Banner Images'}
                  </h4>
                  
                  {['desktop', 'tablet', 'mobile'].map((type) => (
                    <div key={type}>
                      <label className="block text-gray-700 font-medium mb-2 capitalize">
                        {language === 'ar' 
                          ? `صورة ${type === 'desktop' ? 'Desktop' : type === 'tablet' ? 'Tablet' : 'Mobile'}`
                          : `${type === 'desktop' ? 'Desktop' : type === 'tablet' ? 'Tablet' : 'Mobile'} Image`
                        }
                      </label>
                      {imagePreviews[type] && (
                        <div className="mb-2">
                          <img
                            src={imagePreviews[type]}
                            alt={`${type} preview`}
                            className="w-full max-h-48 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                      <input
                        ref={fileInputRefs[type]}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput(type)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs[type].current?.click()}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                      >
                        {imagePreviews[type] 
                          ? (language === 'ar' ? 'تغيير الصورة' : 'Change Image')
                          : (language === 'ar' ? 'رفع صورة' : 'Upload Image')
                        }
                      </button>
                    </div>
                  ))}
                </div>

                {/* Display Order & Enabled */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'ترتيب العرض' : 'Display Order'}
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={formData.enabled === 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked ? 1 : 0 }))}
                        className="w-5 h-5"
                      />
                      <span className="text-gray-700 font-medium">
                        {language === 'ar' ? 'مفعل' : 'Enabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 space-x-reverse pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading 
                      ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                      : (editingBanner 
                          ? (language === 'ar' ? 'تحديث' : 'Update')
                          : (language === 'ar' ? 'إضافة' : 'Add')
                        )
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {banners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا توجد بانرات' : 'No banners yet'}
          </div>
        ) : (
          <div className="divide-y">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4 space-x-reverse flex-1">
                  {banner.image_desktop && (
                    <img
                      src={getImageUrl(banner.image_desktop)}
                      alt="Banner"
                      className="w-24 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {language === 'ar' ? (banner.title_ar || banner.title) : (banner.title || banner.title_ar) || 'Banner'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Order: {banner.display_order} | {banner.enabled === 1 ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleToggleEnabled(banner)}
                    className={`px-3 py-1 rounded text-sm ${
                      banner.enabled === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {banner.enabled === 1 ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BannerManagement

