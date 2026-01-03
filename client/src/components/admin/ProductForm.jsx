import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import { getImageUrl } from '../../utils/config'
import { useLanguage } from '../../context/LanguageContext'
import ShareStoreLink from './ShareStoreLink'

const ProductForm = ({ product, onClose, onSuccess }) => {
  const { language, t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: '',
    discount_price: '',
    discount_percentage: '',
    category_id: ''
  })
  const [images, setImages] = useState([]) // Array of { file: File, preview: string } or { id: number, image_path: string }
  const [deletedImages, setDeletedImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    name_ar: '',
    enabled: 1
  })
  const [categoryImage, setCategoryImage] = useState(null)
  const [categoryImagePreview, setCategoryImagePreview] = useState(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const fileInputRef = useRef(null)
  const categoryImageInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/admin')
      setCategories(response.data.filter(c => c.enabled === 1))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    if (value === 'add_new') {
      setShowCategoryModal(true)
    } else {
      handleChange(e)
    }
  }

  const handleCategoryImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCategoryImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCategoryImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال اسم التصنيف' : 'Please enter category name')
      return
    }

    setAddingCategory(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', newCategory.name)
      formDataToSend.append('name_ar', newCategory.name_ar || newCategory.name)
      formDataToSend.append('enabled', newCategory.enabled)
      
      if (categoryImage) {
        formDataToSend.append('image', categoryImage)
      }

      const response = await api.post('/categories', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Refresh categories list
      await fetchCategories()
      
      // Set the newly created category as selected
      setFormData(prev => ({ ...prev, category_id: response.data.id }))
      
      // Close modal and reset form
      setShowCategoryModal(false)
      setNewCategory({ name: '', name_ar: '', enabled: 1 })
      setCategoryImage(null)
      setCategoryImagePreview(null)
      
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'تم إضافة التصنيف بنجاح' : 'Category added successfully',
          'success'
        )
      }
    } catch (error) {
      console.error('Error adding category:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء إضافة التصنيف' : 'Error adding category',
          'error'
        )
      }
    } finally {
      setAddingCategory(false)
    }
  }

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        name_ar: product.name_ar || '',
        description: product.description || '',
        description_ar: product.description_ar || '',
        price: product.price || '',
        discount_price: product.discount_price || '',
        discount_percentage: product.discount_percentage || '',
        category_id: product.category_id || ''
      })
      
      // Load existing images
      if (product.images && product.images.length > 0) {
        setImages(product.images.map(img => ({
          id: img.id,
          image_path: img.image_path,
          preview: getImageUrl(img.image_path)
        })))
      } else if (product.image) {
        setImages([{
          id: 0,
          image_path: product.image,
          preview: getImageUrl(product.image)
        }])
      }
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-calculate discount percentage
    if (name === 'price' || name === 'discount_price') {
      const price = parseFloat(name === 'price' ? value : formData.price)
      const discountPrice = parseFloat(name === 'discount_price' ? value : formData.discount_price)
      if (price && discountPrice && discountPrice < price) {
        const percentage = Math.round(((price - discountPrice) / price) * 100)
        setFormData(prev => ({ ...prev, discount_percentage: percentage }))
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert(language === 'ar' ? 'الرجاء اختيار ملفات صورة' : 'Please select image files')
      return
    }
    
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file: file,
          preview: e.target.result
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const image = images[index]
    if (image.id) {
      // Existing image - mark for deletion
      setDeletedImages(prev => [...prev, image.id])
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('name_ar', formData.name_ar || formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('description_ar', formData.description_ar || formData.description)
      formDataToSend.append('price', formData.price)
      if (formData.category_id) {
        formDataToSend.append('category_id', formData.category_id)
      }
      if (formData.discount_price) {
        formDataToSend.append('discount_price', formData.discount_price)
      }
      if (formData.discount_percentage) {
        formDataToSend.append('discount_percentage', formData.discount_percentage)
      }
      
      // Add new images
      images.forEach(img => {
        if (img.file) {
          formDataToSend.append('images', img.file)
        }
      })
      
      // Add deleted image IDs
      if (deletedImages.length > 0) {
        formDataToSend.append('deleted_images', JSON.stringify(deletedImages))
      }

      if (product) {
        await api.put(`/products/${product.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      onSuccess()
      // Show success message if toast is available
      if (window.showToast) {
        window.showToast(
          product 
            ? (language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
            : (language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully'),
          'success'
        )
      }
    } catch (error) {
      console.error('Error saving product:', error)
      if (window.showToast) {
        window.showToast(
          language === 'ar' ? 'حدث خطأ أثناء حفظ المنتج' : 'Error saving product',
          'error'
        )
      } else {
        alert(language === 'ar' ? 'حدث خطأ أثناء حفظ المنتج' : 'Error saving product')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {product 
                ? (language === 'ar' ? 'تعديل منتج' : 'Edit Product')
                : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')
              }
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'ar' ? 'التصنيف *' : 'Category *'}
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleCategoryChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{language === 'ar' ? '-- اختر التصنيف --' : '-- Select Category --'}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {language === 'ar' ? (category.name_ar || category.name) : (category.name || category.name_ar)}
                  </option>
                ))}
                <option value="add_new" className="text-blue-600 font-semibold bg-blue-50">
                  {language === 'ar' ? '+ إضافة تصنيف جديد' : '+ Add New Category'}
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  name="description_ar"
                  value={formData.description_ar}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'السعر الأصلي (د.أ)' : 'Original Price'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'السعر بعد الخصم (د.أ)' : 'Discount Price'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'ar' ? 'صور المنتج (يمكن رفع أكثر من صورة)' : 'Product Images (can upload multiple images)'}
              </label>
              
              {/* Existing and new images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8m0-8h8m-8 0H12m16-16v16m0 0v16m0-16h16m-16 0H12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-gray-600">
                    {language === 'ar' ? 'اسحب الصور هنا أو انقر للاختيار' : 'Drag images here or click to select'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === 'ar' 
                      ? 'PNG, JPG, GIF حتى 5MB - يمكن رفع حتى 10 صور'
                      : 'PNG, JPG, GIF up to 5MB - Can upload up to 10 images'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex space-x-4 space-x-reverse">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading 
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                    : (product 
                        ? (language === 'ar' ? 'تحديث' : 'Update')
                        : (language === 'ar' ? 'إضافة' : 'Add')
                      )
                  }
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2 text-center">
                  {language === 'ar' ? 'بعد الحفظ، شارك رابط المتجر مع زبائنك:' : 'After saving, share the store link with your customers:'}
                </p>
                <div className="flex justify-center">
                  <ShareStoreLink />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {language === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategory({ name: '', name_ar: '', enabled: 1 })
                    setCategoryImage(null)
                    setCategoryImagePreview(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={language === 'ar' ? 'مثال: Electronics' : 'e.g., Electronics'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={newCategory.name_ar}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={language === 'ar' ? 'مثال: إلكترونيات' : 'e.g., إلكترونيات'}
                  />
                </div>

                {/* Category Image/Icon */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'صورة/أيقونة التصنيف (اختياري)' : 'Category Icon/Image (Optional)'}
                  </label>
                  {categoryImagePreview && (
                    <div className="mb-2">
                      <img
                        src={categoryImagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <input
                    ref={categoryImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => categoryImageInputRef.current?.click()}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    {categoryImagePreview 
                      ? (language === 'ar' ? 'تغيير الصورة' : 'Change Image')
                      : (language === 'ar' ? 'رفع صورة/أيقونة' : 'Upload Icon/Image')
                    }
                  </button>
                </div>

                <div className="flex space-x-4 space-x-reverse pt-4">
                  <button
                    type="submit"
                    disabled={addingCategory}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {addingCategory 
                      ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...')
                      : (language === 'ar' ? 'إضافة' : 'Add')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false)
                      setNewCategory({ name: '', name_ar: '', enabled: 1 })
                      setCategoryImage(null)
                      setCategoryImagePreview(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductForm

