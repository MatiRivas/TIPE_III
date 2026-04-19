import React from 'react';
import {Routes, Route, Navigate } from 'react-router-dom';
import Login          from './pages/Login';
import POS            from './pages/POS';
import Dashboard      from './pages/Dashboard';
import Inventory      from './pages/Inventory';
import Reports        from './pages/Reports';
import AdminUsers     from './pages/AdminUsers';
import AdminDiscounts from './pages/AdminDiscounts';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout    from './components/AdminLayout';
import { useAuthStore } from './store/useAuthStore';
import { useDiscounts } from './hooks/useDiscounts';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
    useDiscounts();

  return (
      <Routes>
        {/* Pública */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />  {/* <- agrega esta */}

        {/* Vendedor */}
        <Route path="/pos" element={<PrivateRoute><POS /></PrivateRoute>} />

        {/* Admin — con sidebar */}
        <Route element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/admin/users"     element={<AdminUsers />} />
          <Route path="/admin/discounts" element={<AdminDiscounts />} />
          <Route path="/inventory"       element={<Inventory />} />
          <Route path="/reports"         element={<Reports />} />
        </Route>
      </Routes>
  );
}