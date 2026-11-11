import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ProductGrid from './components/ProductGrid';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WholesalePage from './pages/WholesalePage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import CustomerAccountPage from './pages/CustomerAccountPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DeliveryVerifyPage from './pages/DeliveryVerifyPage';
import AdminRoute from './components/AdminRoute';
import RangoliColorCatalog from './components/RangoliColorCatalog';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');

    switch (location.pathname) {
      case '/':
        document.title = 'New Rang Rangoli | Premium Indian Colors & Art Tools';
        break;
      case '/admin':
        document.title = 'Admin Control Center | New Rang Rangoli';
        break;
      case '/shop':
        if (category) {
          document.title = `${category} Colors & Tools | New Rang Rangoli`;
        } else {
          document.title = 'Shop Indian Rangoli Colors & Powder | New Rang Rangoli';
        }
        break;
      case '/colors':
        document.title = '23 Rangoli Color Shades Catalog | New Rang Rangoli';
        break;
      case '/login':
        document.title = 'Customer Sign In | New Rang Rangoli';
        break;
      case '/register':
        document.title = 'Customer Registration | New Rang Rangoli';
        break;
      case '/account':
        document.title = 'My Account & Orders | New Rang Rangoli';
        break;
      case '/wholesale':
        document.title = 'Wholesale Business & Retailer Portal | New Rang Rangoli';
        break;
      case '/delivery':
      case '/delivery-verify':
        document.title = 'Doorstep Delivery Verification | New Rang Rangoli';
        break;
      case '/cart':
        document.title = 'Your Shopping Cart | New Rang Rangoli';
        break;
      case '/checkout':
        document.title = 'Secure Checkout | New Rang Rangoli';
        break;
      default:
        if (location.pathname.startsWith('/product/')) {
          document.title = 'Product Details | New Rang Rangoli';
        } else {
          document.title = 'New Rang Rangoli';
        }
        break;
    }
  }, [location]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<ProductGrid />} />
            <Route path="/colors" element={<Navigate to="/shop?category=Rangoli" replace />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<CustomerAuthPage defaultTab="login" />} />
            <Route path="/register" element={<CustomerAuthPage defaultTab="register" />} />
            <Route path="/account" element={<CustomerAccountPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wholesale" element={<WholesalePage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/delivery-verify/:id" element={<DeliveryVerifyPage />} />
            <Route path="/delivery-verify" element={<DeliveryVerifyPage />} />
            <Route path="/delivery" element={<DeliveryVerifyPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
