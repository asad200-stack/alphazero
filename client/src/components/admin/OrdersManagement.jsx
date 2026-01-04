import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'

const OrdersManagement = () => {
  const { language, t } = useLanguage()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchOrders()
    fetchStats()
    // Poll for new orders every 30 seconds
    const interval = setInterval(() => {
      fetchOrders()
      fetchStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      showToast(
        language === 'ar' ? 'خطأ في جلب الطلبات' : 'Error fetching orders',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats/summary')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setSelectedOrder(response.data)
      setOrderItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching order details:', error)
      showToast(
        language === 'ar' ? 'خطأ في جلب تفاصيل الطلب' : 'Error fetching order details',
        'error'
      )
    }
  }

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        order_status: orderStatus,
        payment_status: paymentStatus
      })
      showToast(
        language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated',
        'success'
      )
      fetchOrders()
      fetchStats()
      if (selectedOrder && selectedOrder.id === orderId) {
        fetchOrderDetails(orderId)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      showToast(
        language === 'ar' ? 'خطأ في تحديث حالة الطلب' : 'Error updating order status',
        'error'
      )
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {language === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
        </h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </p>
            <p className="text-2xl font-bold">{stats.total_orders || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
            </p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending_orders || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'قيد المعالجة' : 'Processing'}
            </p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing_orders || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {parseFloat(stats.total_revenue || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                {language === 'ar' ? 'قائمة الطلبات' : 'Orders List'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'رقم الطلب' : 'Order #'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'العميل' : 'Customer'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'المبلغ' : 'Amount'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'التاريخ' : 'Date'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'إجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => fetchOrderDetails(order.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.customer_name}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {parseFloat(order.total_amount).toFixed(2)} {t('currency')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              fetchOrderDetails(order.id)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {language === 'ar' ? 'عرض' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setOrderItems([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
                  </p>
                  <p className="font-semibold">{selectedOrder.order_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ar' ? 'العميل' : 'Customer'}
                  </p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                  {selectedOrder.customer_email && (
                    <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                  )}
                  <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                  </p>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  {selectedOrder.shipping_city && (
                    <p className="text-sm">{selectedOrder.shipping_city}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </p>
                  <p className="font-semibold">
                    {selectedOrder.payment_method === 'cash_on_delivery'
                      ? (language === 'ar' ? 'نقد عند الاستلام' : 'Cash on Delivery')
                      : selectedOrder.payment_method}
                  </p>
                </div>

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {language === 'ar' ? 'المنتجات' : 'Products'}
                    </p>
                    <div className="space-y-2">
                      {orderItems.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-medium">
                            {language === 'ar' ? (item.product_name_ar || item.product_name) : (item.product_name || item.product_name_ar)}
                          </p>
                          <p className="text-gray-600">
                            {item.quantity} × {parseFloat(item.price).toFixed(2)} = {parseFloat(item.total).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">
                      {language === 'ar' ? 'المبلغ الإجمالي' : 'Total'}
                    </span>
                    <span className="font-bold text-lg">
                      {parseFloat(selectedOrder.total_amount).toFixed(2)} {t('currency')}
                    </span>
                  </div>
                </div>

                {/* Status Updates */}
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
                    </label>
                    <select
                      value={selectedOrder.order_status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.payment_status)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                      <option value="processing">{language === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                      <option value="shipped">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                      <option value="delivered">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                      <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                    </label>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, selectedOrder.order_status, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                      <option value="paid">{language === 'ar' ? 'مدفوع' : 'Paid'}</option>
                      <option value="failed">{language === 'ar' ? 'فشل' : 'Failed'}</option>
                    </select>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'ar' ? 'ملاحظات' : 'Notes'}
                    </p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              {language === 'ar' ? 'اختر طلباً لعرض التفاصيل' : 'Select an order to view details'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersManagement

