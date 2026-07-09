import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ShopLayout from '../layouts/ShopLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth Route Wrapper
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/Login';

// Shop Pages
import ProductGrid from '../pages/shop/ProductGrid';
import ProductDetail from '../pages/shop/ProductDetail';
import Cart from '../pages/shop/Cart';
import Orders from '../pages/shop/Orders';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import OrdersPanel from '../pages/admin/OrdersPanel';
import LossReport from '../pages/admin/LossReport';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<OrdersPanel />} />
          <Route path="losses" element={<LossReport />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* Protected Customer Routes */}
      <Route element={<ProtectedRoute allowedRole="customer" />}>
        <Route path="/shop/*" element={<ShopLayout />}>
          <Route index element={<ProductGrid />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
