import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ConfirmProvider } from './context/ConfirmContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Helper for robust named & default export lazy loading
const lazyLoad = (importFn, name) =>
  lazy(() =>
    importFn().then((m) => ({
      default: m[name] || m.default,
    }))
  );

// Customer Pages (Lazy Loaded)
const HomePage = lazyLoad(() => import('./pages/HomePage'), 'HomePage');
const ShopPage = lazyLoad(() => import('./pages/ShopPage'), 'ShopPage');
const ProductDetailPage = lazyLoad(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const CartPage = lazyLoad(() => import('./pages/CartPage'), 'CartPage');
const CheckoutPage = lazyLoad(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const OrderSuccessPage = lazyLoad(() => import('./pages/OrderSuccessPage'), 'OrderSuccessPage');
const LoginPage = lazyLoad(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyLoad(() => import('./pages/RegisterPage'), 'RegisterPage');
const OrdersPage = lazyLoad(() => import('./pages/OrdersPage'), 'OrdersPage');
const ContactPage = lazyLoad(() => import('./pages/ContactPage'), 'ContactPage');
const WishlistPage = lazyLoad(() => import('./pages/WishlistPage'), 'WishlistPage');
const NotFoundPage = lazyLoad(() => import('./pages/NotFoundPage'), 'NotFoundPage');
const TermsPage = lazyLoad(() => import('./pages/TermsPage'), 'TermsPage');
const PaymentPage = lazyLoad(() => import('./pages/PaymentPage'), 'PaymentPage');

// Admin Pages & Layout (Lazy Loaded)
const AdminRoute = lazyLoad(() => import('./components/AdminRoute'), 'AdminRoute');
const AdminLayout = lazyLoad(() => import('./pages/admin/AdminLayout'), 'AdminLayout');
const AdminOverview = lazyLoad(() => import('./pages/admin/AdminOverview'), 'AdminOverview');
const AdminProducts = lazyLoad(() => import('./pages/admin/AdminProducts'), 'AdminProducts');
const AdminCategories = lazyLoad(() => import('./pages/admin/AdminCategories'), 'AdminCategories');
const AdminOrders = lazyLoad(() => import('./pages/admin/AdminOrders'), 'AdminOrders');
const AdminUsers = lazyLoad(() => import('./pages/admin/AdminUsers'), 'AdminUsers');
const AdminVideos = lazyLoad(() => import('./pages/admin/AdminVideos'), 'AdminVideos');
const AdminPaymentSettings = lazyLoad(() => import('./pages/admin/AdminPaymentSettings'), 'AdminPaymentSettings');
const AdminPaymentVerification = lazyLoad(() => import('./pages/admin/AdminPaymentVerification'), 'AdminPaymentVerification');
const AdminSecurity = lazyLoad(() => import('./pages/admin/AdminSecurity'), 'AdminSecurity');
const AdminBanners = lazyLoad(() => import('./pages/admin/AdminBanners'), 'AdminBanners');

// Fallback loader component during route chunk transition
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-12">
    <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-gray-400 font-medium text-xs tracking-wider uppercase">Loading...</p>
  </div>
);

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
                  <Suspense fallback={<PageLoader />}>
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
                          <Route path="payment-settings" element={<AdminPaymentSettings />} />
                          <Route path="payment-verification" element={<AdminPaymentVerification />} />
                          <Route path="security" element={<AdminSecurity />} />
                          <Route path="banners" element={<AdminBanners />} />
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
                                <Route path="/payment/:id" element={<PaymentPage />} />

                                {/* Catch-All 404 Route for Customer Pages */}
                                <Route path="*" element={<NotFoundPage />} />
                              </Routes>
                            </main>
                            <Footer />
                          </div>
                        }
                      />
                    </Routes>
                  </Suspense>
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
