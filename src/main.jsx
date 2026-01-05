import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import 'leaflet/dist/leaflet.css';
import socket from './socket'; // singleton socket

// Contexts
import { CartProvider } from './context/CartProvider';
import { AuthProvider } from './context/AuthProvider'; // ✅ Add AuthProvider

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyOtp from './components/VerifyOtp';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';
import ProductDetails from './components/ProductDetails';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import DeliveryDashboard from './components/DeliveryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentForm from './components/PaymentForm';
import UserRoleListener from './components/UserRoleListener'; 
import ChatWidget from './components/ChatWidget';

// ------------------------------
// Render App
// ------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* ✅ Wrap everything in AuthProvider */}
      <CartProvider>
        <BrowserRouter>

          {/* Real-time role listener using socket */}
          <UserRoleListener socket={socket} />

          {/* Navbar appears on every page */}
          <Navbar />
          <ChatWidget /> 

          <Routes>
            {/* ------------------ PUBLIC ROUTES ------------------ */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />

            {/* ------------------ PROTECTED ROUTES ------------------ */}

            {/* Customer / Admin / Delivery Access */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'delivery_man']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'delivery_man']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['customer', 'delivery_man', 'admin']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute allowedRoles={['customer', 'delivery_man', 'admin']}>
                <PaymentForm />
              </ProtectedRoute>
            } />

            <Route path="/order/:id" element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'delivery_man']}>
                <OrderTracking />
              </ProtectedRoute>
            } />

            {/* Admin Only */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Delivery Only */}
            <Route path="/delivery-dashboard" element={
              <ProtectedRoute allowedRoles={['delivery_man', 'admin']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            } />

            {/* Example of Order Tracking protected route */}
            <Route path="/order-tracking" element={
              <ProtectedRoute allowedRoles={['customer', 'admin']}>
                <OrderTracking />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
