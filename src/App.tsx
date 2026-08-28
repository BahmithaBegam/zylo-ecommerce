import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';

import { Navbar } from './components/layout/Navbar.js';
import { MobileBottomNav } from './components/layout/MobileBottomNav.js';
import { ScrollToTop } from './components/common/ScrollToTop.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { AdminLayout } from './components/layout/AdminLayout.js';
import { SplashScreen } from './components/common/SplashScreen.js';

// Customer Pages
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { KidsPage } from './pages/KidsPage.js';
import { ToysPage } from './pages/ToysPage.js';
import { DealsPage } from './pages/DealsPage.js';
import { BestsellersPage } from './pages/BestsellersPage.js';
import { NewArrivalsPage } from './pages/NewArrivalsPage.js';
import { ProductDetailsPage } from './pages/ProductDetailsPage.js';
import { CartPage } from './pages/CartPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { MyOrdersPage } from './pages/MyOrdersPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages.js';
import { AboutPage, ContactPage, FAQPage, ShippingPolicyPage } from './pages/StaticPages.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminProducts } from './pages/admin/AdminProducts.js';
import { AdminOrders } from './pages/admin/AdminOrders.js';
import { AdminCategories } from './pages/admin/AdminCategories.js';
import { AdminUsers } from './pages/admin/AdminUsers.js';
import { AdminReviews } from './pages/admin/AdminReviews.js';

const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden w-full max-w-full relative">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SplashScreen />
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* Storefront Layout */}
                  <Route element={<StorefrontLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/sarees" element={<Navigate to="/shop?category=Women" replace />} />
                    <Route path="/saree" element={<Navigate to="/shop?category=Women" replace />} />
                    <Route path="/kids" element={<KidsPage />} />
                    <Route path="/toys" element={<ToysPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/bestsellers" element={<BestsellersPage />} />
                    <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    
                    {/* Checkout & Orders */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                    <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                    <Route path="/orders/track" element={<OrderTrackingPage />} />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <MyOrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Information Pages */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  </Route>

                  {/* Secure Admin Dashboard Layout */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="reviews" element={<AdminReviews />} />
                  </Route>

                  {/* 404 Catch-All */}
                  <Route path="*" element={<StorefrontLayout />}>
                    <Route
                      path="*"
                      element={
                        <div className="max-w-md mx-auto my-24 p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">404</div>
                          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Page Not Found</h2>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                            The requested page does not exist or has been relocated.
                          </p>
                          <a
                            href="/"
                            className="px-6 py-2.5 bg-zinc-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Return Home
                          </a>
                        </div>
                      }
                    />
                  </Route>
                </Routes>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
