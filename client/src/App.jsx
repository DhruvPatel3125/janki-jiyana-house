import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrdersPage } from './pages/OrdersPage';
import { ContactPage } from './pages/ContactPage';
import { WishlistPage } from './pages/WishlistPage';
import { NotFoundPage } from './pages/NotFoundPage'; // NEW: 404 Page
import { TermsPage } from './pages/TermsPage'; // NEW: Terms Page

// Admin imports
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminVideos } from './pages/admin/AdminVideos';

import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ConfirmProvider } from './context/ConfirmContext'; // NEW: Confirmation Modal Context
import { GoogleOAuthProvider } from '@react-oauth/google';

export function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <ErrorBoundary>
      <ConfirmProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Router>
                  <OfflineBanner />
                  <Toaster position="top-center" reverseOrder={false} containerStyle={{ top: 20 }} toastOptions={{ maxToasts: 1 }} />
                  <FloatingWhatsApp />
                  <Routes>
                    {/* Protected Admin Section */}
                    <Route path="/admin" element={<AdminRoute />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<AdminOverview />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="videos" element={<AdminVideos />} />
                      </Route>
                    </Route>

                    {/* Main Customer Storefront Section */}
                    <Route
                      path="*"
                      element={
                        <div className="flex flex-col min-h-screen">
                          <Navbar />
                          <main className="flex-grow">
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/shop" element={<ShopPage />} />
                              <Route path="/product/:id" element={<ProductDetailPage />} />
                              <Route path="/cart" element={<CartPage />} />
                              <Route path="/checkout" element={<CheckoutPage />} />
                              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                              <Route path="/login" element={<LoginPage />} />
                              <Route path="/register" element={<RegisterPage />} />
                              <Route path="/orders" element={<OrdersPage />} />
                              <Route path="/contact" element={<ContactPage />} />
                              <Route path="/wishlist" element={<WishlistPage />} />
                              <Route path="/terms" element={<TermsPage />} />

                              {/* Catch-All 404 Route for Customer Pages */}
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </main>
                          <Footer />
                        </div>
                      }
                    />
                  </Routes>
                </Router>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </ConfirmProvider>
    </ErrorBoundary>
  );
}

export default App;
