import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import ProductsManagement from '../components/admin/ProductsManagement'
import SettingsManagement from '../components/admin/SettingsManagement'
import BannerManagement from '../components/admin/BannerManagement'
import CategoryManagement from '../components/admin/CategoryManagement'
import ThemeManagement from '../components/admin/ThemeManagement'
import OrdersManagement from '../components/admin/OrdersManagement'
import api from '../utils/api'
import { useLanguage } from '../context/LanguageContext'

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { t, language, changeLanguage } = useLanguage()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchStats()
      // Poll for new orders every 30 seconds
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats/summary')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin/login')
      setLoading(false)
      return
    }

    // Verify token with backend
    try {
      const response = await api.get('/auth/verify')
      if (response.data.valid) {
        setAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/admin/login')
      }
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-800">{t('adminDashboard')}</h1>
            <div className="flex items-center space-x-4 space-x-reverse rtl:space-x-reverse">
              <button
                onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-sm font-medium"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                {t('viewStore')}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 space-x-reverse rtl:space-x-reverse flex-wrap">
            <Link
              to="/admin/dashboard"
              className="px-6 py-3 rounded-lg font-medium transition"
              style={{ 
                backgroundColor: '#3B82F6',
                color: 'white'
              }}
            >
              {t('products')}
            </Link>
            <Link
              to="/admin/categories"
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              {language === 'ar' ? 'التصنيفات' : 'Categories'}
            </Link>
            <Link
              to="/admin/banners"
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              {language === 'ar' ? 'البانرات' : 'Banners'}
            </Link>
            <Link
              to="/admin/settings"
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              {t('settings')}
            </Link>
            <Link
              to="/admin/themes"
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              {language === 'ar' ? 'الثيمات' : 'Themes'}
            </Link>
            <Link
              to="/admin/orders"
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition relative"
            >
              {language === 'ar' ? 'الطلبات' : 'Orders'}
              {stats && stats.pending_orders > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pending_orders}
                </span>
              )}
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="dashboard" element={<ProductsManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="themes" element={<ThemeManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard


