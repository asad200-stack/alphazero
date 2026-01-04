import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import ProductCard from '../components/ProductCard'
import { useLanguage } from '../context/LanguageContext'
import { useWishlist } from '../context/WishlistContext'
import { useSettings } from '../context/SettingsContext'
import { useCustomer } from '../context/CustomerContext'
import { useToast } from '../context/ToastContext'

const Account = () => {
  const { t, language } = useLanguage()
  const { wishlist } = useWishlist()
  const { settings } = useSettings()
  const { customer, loading, orders, addresses, login, register, logout, fetchOrders, addAddress, updateAddress, deleteAddress } = useCustomer()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('account')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  
  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  // Register form
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })
  // Address form
  const [addressForm, setAddressForm] = useState({
    address_type: 'home',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    is_default: false
  })

  useEffect(() => {
    if (customer) {
      fetchOrders()
    }
  }, [customer])

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(loginForm.email, loginForm.password)
    if (result.success) {
      showToast(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful', 'success')
      setShowLoginModal(false)
      setLoginForm({ email: '', password: '' })
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match', 'error')
      return
    }
    const result = await register(
      registerForm.email,
      registerForm.password,
      registerForm.first_name,
      registerForm.last_name,
      registerForm.phone
    )
    if (result.success) {
      showToast(language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully', 'success')
      setShowRegisterModal(false)
      setRegisterForm({ email: '', password: '', confirmPassword: '', first_name: '', last_name: '', phone: '' })
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleLogout = () => {
    logout()
    showToast(language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out', 'success')
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const result = await addAddress(addressForm)
    if (result.success) {
      showToast(language === 'ar' ? 'تم إضافة العنوان بنجاح' : 'Address added successfully', 'success')
      setShowAddressModal(false)
      setAddressForm({ address_type: 'home', full_name: '', phone: '', address: '', city: '', postal_code: '', is_default: false })
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm({
      address_type: address.address_type,
      full_name: address.full_name,
      phone: address.phone,
      address: address.address,
      city: address.city || '',
      postal_code: address.postal_code || '',
      is_default: address.is_default === 1
    })
    setShowAddressModal(true)
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    const result = await updateAddress(editingAddress.id, addressForm)
    if (result.success) {
      showToast(language === 'ar' ? 'تم تحديث العنوان بنجاح' : 'Address updated successfully', 'success')
      setShowAddressModal(false)
      setEditingAddress(null)
      setAddressForm({ address_type: 'home', full_name: '', phone: '', address: '', city: '', postal_code: '', is_default: false })
    } else {
      showToast(result.error, 'error')
    }
  }

  const handleDeleteAddress = async (id) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
      const result = await deleteAddress(id)
      if (result.success) {
        showToast(language === 'ar' ? 'تم حذف العنوان' : 'Address deleted', 'success')
      } else {
        showToast(result.error, 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('myAccount') || 'My Account'}</h1>
        
        {/* Not logged in */}
        {!customer && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">{language === 'ar' ? 'مرحباً!' : 'Welcome!'}</h2>
            <p className="text-gray-600 mb-6">
              {language === 'ar' 
                ? 'سجل الدخول أو أنشئ حساباً جديداً للوصول إلى طلباتك وعناوينك'
                : 'Login or create an account to access your orders and addresses'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-3 rounded-lg font-semibold transition"
                style={{ 
                  backgroundColor: settings.primary_color || '#3B82F6',
                  color: 'white'
                }}
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                {language === 'ar' ? 'إنشاء حساب' : 'Register'}
              </button>
            </div>
          </div>
        )}

        {/* Logged in */}
        {customer && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('account')}
                className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'border-b-2 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'account' ? { borderColor: settings.primary_color || '#3B82F6' } : {}}
              >
                {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-b-2 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'orders' ? { borderColor: settings.primary_color || '#3B82F6' } : {}}
              >
                {language === 'ar' ? 'الطلبات' : 'Orders'}
                {orders.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                  activeTab === 'addresses'
                    ? 'border-b-2 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'addresses' ? { borderColor: settings.primary_color || '#3B82F6' } : {}}
              >
                {language === 'ar' ? 'العناوين' : 'Addresses'}
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-4 py-2 font-medium transition relative whitespace-nowrap ${
                  activeTab === 'wishlist'
                    ? 'border-b-2 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'wishlist' ? { borderColor: settings.primary_color || '#3B82F6' } : {}}
              >
                {t('wishlist') || 'Wishlist'}
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold">
                    {customer.first_name && customer.last_name
                      ? `${customer.first_name} ${customer.last_name}`
                      : customer.email}
                  </h2>
                  <p className="text-gray-600">{customer.email}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                    </label>
                    <p className="text-gray-900">{customer.first_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                    </label>
                    <p className="text-gray-900">{customer.last_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      {language === 'ar' ? 'الهاتف' : 'Phone'}
                    </label>
                    <p className="text-gray-900">{customer.phone || '-'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-4">
                      {language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block px-6 py-3 rounded-lg font-semibold transition"
                      style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
                    >
                      {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">
                              {language === 'ar' ? 'طلب رقم' : 'Order'} #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: settings.primary_color || '#3B82F6' }}>
                              {parseFloat(order.total_amount).toFixed(2)} {t('currency')}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{language === 'ar' ? 'عنوان الشحن' : 'Shipping'}: {order.shipping_address}</p>
                          <p>{language === 'ar' ? 'طريقة الدفع' : 'Payment'}: {order.payment_method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {language === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses'}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null)
                      setAddressForm({ address_type: 'home', full_name: '', phone: '', address: '', city: '', postal_code: '', is_default: false })
                      setShowAddressModal(true)
                    }}
                    className="px-4 py-2 rounded-lg font-semibold transition"
                    style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
                  >
                    {language === 'ar' ? '+ إضافة عنوان' : '+ Add Address'}
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">
                      {language === 'ar' ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white rounded-lg shadow-md p-6">
                        {address.is_default === 1 && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                            {language === 'ar' ? 'افتراضي' : 'Default'}
                          </span>
                        )}
                        <h3 className="font-bold mb-2">{address.full_name}</h3>
                        <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                        <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                        {address.city && <p className="text-gray-600 text-sm mb-1">{address.city}</p>}
                        {address.postal_code && <p className="text-gray-600 text-sm mb-4">{address.postal_code}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                          >
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          >
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-4">{t('emptyWishlist') || 'قائمة المفضلة فارغة'}</p>
                    <Link
                      to="/shop"
                      className="inline-block px-6 py-3 rounded-lg font-semibold transition"
                      style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
                    >
                      {t('browseProducts') || 'تصفح المنتجات'}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {wishlist.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNavigation />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{language === 'ar' ? 'تسجيل الدخول' : 'Login'}</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg font-semibold transition"
                style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  setShowRegisterModal(true)
                }}
                className="text-blue-600 hover:underline"
              >
                {language === 'ar' ? 'سجل الآن' : 'Register now'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{language === 'ar' ? 'إنشاء حساب' : 'Register'}</h2>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                  </label>
                  <input
                    type="text"
                    value={registerForm.first_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                  </label>
                  <input
                    type="text"
                    value={registerForm.last_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'} *
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg font-semibold transition"
                style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
              >
                {language === 'ar' ? 'إنشاء حساب' : 'Register'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  setShowLoginModal(true)
                }}
                className="text-blue-600 hover:underline"
              >
                {language === 'ar' ? 'سجل الدخول' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingAddress 
                  ? (language === 'ar' ? 'تعديل العنوان' : 'Edit Address')
                  : (language === 'ar' ? 'إضافة عنوان' : 'Add Address')}
              </h2>
              <button onClick={() => {
                setShowAddressModal(false)
                setEditingAddress(null)
                setAddressForm({ address_type: 'home', full_name: '', phone: '', address: '', city: '', postal_code: '', is_default: false })
              }} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'نوع العنوان' : 'Address Type'}
                </label>
                <select
                  value={addressForm.address_type}
                  onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="home">{language === 'ar' ? 'منزل' : 'Home'}</option>
                  <option value="work">{language === 'ar' ? 'عمل' : 'Work'}</option>
                  <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={addressForm.full_name}
                  onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'الهاتف' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {language === 'ar' ? 'العنوان' : 'Address'} *
                </label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                  </label>
                  <input
                    type="text"
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_default" className="ml-2 text-gray-700">
                  {language === 'ar' ? 'تعيين كعنوان افتراضي' : 'Set as default address'}
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg font-semibold transition"
                style={{ backgroundColor: settings.primary_color || '#3B82F6', color: 'white' }}
              >
                {editingAddress 
                  ? (language === 'ar' ? 'تحديث العنوان' : 'Update Address')
                  : (language === 'ar' ? 'إضافة العنوان' : 'Add Address')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Account
