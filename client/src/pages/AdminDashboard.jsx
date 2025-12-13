import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import ProductsManagement from '../components/admin/ProductsManagement'
import SettingsManagement from '../components/admin/SettingsManagement'
import api from '../utils/api'

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin/login')
      return
    }
    setAuthenticated(true)
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                عرض المتجر
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 space-x-reverse">
            <Link
              to="/admin/dashboard"
              className="px-6 py-3 rounded-lg font-medium transition"
              style={{ 
                backgroundColor: '#3B82F6',
                color: 'white'
              }}
            >
              المنتجات
            </Link>
            <Link
              to="/admin/settings"
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              الإعدادات
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="dashboard" element={<ProductsManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard


