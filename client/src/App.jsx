import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import WishmoneyPayment from './pages/WishmoneyPayment'
import OrderSuccess from './pages/OrderSuccess'
import Account from './pages/Account'
import ProductDetails from './pages/ProductDetails'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { SettingsProvider } from './context/SettingsContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import { SearchProvider } from './context/SearchContext'
import { CustomerProvider } from './context/CustomerContext'
import './App.css'
import './styles/themes.css'

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <SearchProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                {/* Public Routes - للمتجر فقط */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/wishmoney" element={<WishmoneyPayment />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/account" element={<Account />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                
                {/* Admin Routes - محمية */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect any other admin routes to login */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
                    </SearchProvider>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </CartProvider>
            </CustomerProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SettingsProvider>
  </ErrorBoundary>
  )
}

export default App

