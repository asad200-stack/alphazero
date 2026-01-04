import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const CustomerContext = createContext()

export const useCustomer = () => {
  const context = useContext(CustomerContext)
  if (!context) {
    return null // Return null instead of throwing error for optional context
  }
  return context
}

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('customer_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/customers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCustomer(response.data)
      fetchAddresses()
      fetchOrders()
    } catch (error) {
      localStorage.removeItem('customer_token')
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/customers/login', { email, password })
      localStorage.setItem('customer_token', response.data.token)
      setCustomer(response.data.customer)
      await fetchAddresses()
      await fetchOrders()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const register = async (email, password, first_name, last_name, phone) => {
    try {
      const response = await api.post('/customers/register', {
        email,
        password,
        first_name,
        last_name,
        phone
      })
      localStorage.setItem('customer_token', response.data.token)
      setCustomer(response.data.customer)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('customer_token')
    setCustomer(null)
    setAddresses([])
    setOrders([])
  }

  const fetchAddresses = async () => {
    const token = localStorage.getItem('customer_token')
    if (!token) return

    try {
      const response = await api.get('/customers/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAddresses(response.data)
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const fetchOrders = async () => {
    const token = localStorage.getItem('customer_token')
    if (!token) return

    try {
      const response = await api.get('/customers/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const addAddress = async (addressData) => {
    const token = localStorage.getItem('customer_token')
    if (!token) return { success: false, error: 'Not authenticated' }

    try {
      await api.post('/customers/addresses', addressData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchAddresses()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add address' 
      }
    }
  }

  const updateAddress = async (id, addressData) => {
    const token = localStorage.getItem('customer_token')
    if (!token) return { success: false, error: 'Not authenticated' }

    try {
      await api.put(`/customers/addresses/${id}`, addressData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchAddresses()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update address' 
      }
    }
  }

  const deleteAddress = async (id) => {
    const token = localStorage.getItem('customer_token')
    if (!token) return { success: false, error: 'Not authenticated' }

    try {
      await api.delete(`/customers/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchAddresses()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete address' 
      }
    }
  }

  return (
    <CustomerContext.Provider value={{
      customer,
      loading,
      addresses,
      orders,
      login,
      register,
      logout,
      fetchAddresses,
      fetchOrders,
      addAddress,
      updateAddress,
      deleteAddress
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

