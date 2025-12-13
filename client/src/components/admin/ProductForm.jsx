import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import { getImageUrl } from '../../utils/config'
import ShareStoreLink from './ShareStoreLink'

const ProductForm = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: '',
    discount_price: '',
    discount_percentage: ''
  })
  const [images, setImages] = useState([]) // Array of { file: File, preview: string } or { id: number, image_path: string }
  const [deletedImages, setDeletedImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        name_ar: product.name_ar || '',
        description: product.description || '',
        description_ar: product.description_ar || '',
        price: product.price || '',
        discount_price: product.discount_price || '',
        discount_percentage: product.discount_percentage || ''
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
      alert('الرجاء اختيار ملفات صورة')
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
    } catch (error) {
      console.error('Error saving product:', error)
      alert('حدث خطأ أثناء حفظ المنتج')
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
              {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
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
                  اسم المنتج (إنجليزي)
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
                  اسم المنتج (عربي)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  الوصف (إنجليزي)
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
                  الوصف (عربي)
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
                  السعر الأصلي (د.أ)
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
                  السعر بعد الخصم (د.أ)
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
                  نسبة الخصم (%)
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
                صور المنتج (يمكن رفع أكثر من صورة)
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
                    اسحب الصور هنا أو انقر للاختيار
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, GIF حتى 5MB - يمكن رفع حتى 10 صور
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
                  {loading ? 'جاري الحفظ...' : (product ? 'تحديث' : 'إضافة')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  إلغاء
                </button>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2 text-center">بعد الحفظ، شارك رابط المتجر مع زبائنك:</p>
                <div className="flex justify-center">
                  <ShareStoreLink />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductForm

