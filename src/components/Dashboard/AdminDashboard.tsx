import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../Admin/Layout/AdminLayout';
import { DashboardHome } from '../Admin/Dashboard/DashboardHome';
import { ProductsList } from '../Admin/Products/ProductsList';
import { CategoriesList } from '../Admin/Categories/CategoriesList';
import { OrdersList } from '../Admin/Orders/OrdersList';
import { UsersList } from '../Admin/Users/UsersList';
import { SettingsPage } from '../Admin/Settings/SettingsPage';

export const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/products" element={<ProductsList />} />
        <Route path="/categories" element={<CategoriesList />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/analytics" element={<div className="text-center py-12 text-gray-600">Analytics Dashboard (Coming Soon)</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

