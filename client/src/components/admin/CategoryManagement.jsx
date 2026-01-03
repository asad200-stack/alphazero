import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import { getImageUrl } from '../../utils/config'
import { useLanguage } from '../../context/LanguageContext'

const CategoryManagement = () => {
  const { language, t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    display_order: 0,
    enabled: 1
  })
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/admin')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setFormData(prev => ({ ...prev, image_file: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'image_file') {
          formDataToSend.append(key, formData[key])
        }
      })

      if (formData.image_file) {
        formDataToSend.append('image', formData.image_file)
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/categories', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      await fetchCategories()
      resetForm()
      if (window.showToast) {
        window.showToast(
          editingCategory
            ? (language === 'ar' ? 'تم تحديث التصنيف بنجاح' : 'Category updated successfully')
            : (language === 'ar' ? 'تم إضافة التصنيف بنجاح' : 'Category added successfully'),
          'success'
        )
      }
    } catch (error) {
      console.error('Error saving category:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء حفظ التصنيف' : 'Error saving category',
          'error'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      display_order: 0,
      enabled: 1
    })
    setImagePreview(null)
    setEditingCategory(null)
    setShowForm(false)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      name_ar: category.name_ar || '',
      description: category.description || '',
      description_ar: category.description_ar || '',
      display_order: category.display_order || 0,
      enabled: category.enabled || 1
    })
    setImagePreview(category.image ? getImageUrl(category.image) : null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Are you sure you want to delete this category?')) {
      return
    }

    try {
      await api.delete(`/categories/${id}`)
      await fetchCategories()
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'تم حذف التصنيف بنجاح' : 'Category deleted successfully',
          'success'
        )
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء حذف التصنيف' : 'Error deleting category',
          'error'
        )
      }
    }
  }

  const handleToggleEnabled = async (category) => {
    try {
      const newEnabled = (category.enabled === 1 || category.enabled === '1' || category.enabled === true) ? 0 : 1
      const updateData = {
        name: category.name,
        name_ar: category.name_ar,
        description: category.description,
        description_ar: category.description_ar,
        image: category.image,
        display_order: category.display_order,
        enabled: newEnabled
      }
      
      await api.put(`/categories/${category.id}`, updateData)
      await fetchCategories()
      
      if (window.showToast) {
        window.showToast(
          newEnabled === 1
            ? (language === 'ar' ? 'تم تفعيل التصنيف' : 'Category enabled')
            : (language === 'ar' ? 'تم إلغاء تفعيل التصنيف' : 'Category disabled'),
          'success'
        )
      }
    } catch (error) {
      console.error('Error toggling category:', error)
    }
  }

  if (loading && categories.length === 0) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {language === 'ar' ? 'إدارة التصنيفات' : 'Category Management'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + {language === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingCategory
                    ? (language === 'ar' ? 'تعديل التصنيف' : 'Edit Category')
                    : (language === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category')
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
                      {language === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      name="name_ar"
                      value={formData.name_ar}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      name="description_ar"
                      value={formData.description_ar}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'صورة التصنيف' : 'Category Image'}
                  </label>
                  {imagePreview && (
                    <div className="mb-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
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
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    {imagePreview 
                      ? (language === 'ar' ? 'تغيير الصورة' : 'Change Image')
                      : (language === 'ar' ? 'رفع صورة' : 'Upload Image')
                    }
                  </button>
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
                        name="enabled"
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
                      : (editingCategory 
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

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا توجد تصنيفات' : 'No categories yet'}
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4 space-x-reverse flex-1">
                  {category.image && (
                    <img
                      src={getImageUrl(category.image)}
                      alt="Category"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {language === 'ar' ? (category.name_ar || category.name) : (category.name || category.name_ar)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Order: {category.display_order} | {category.enabled === 1 ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleToggleEnabled(category)}
                    className={`px-3 py-1 rounded text-sm ${
                      category.enabled === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.enabled === 1 ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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

export default CategoryManagement

