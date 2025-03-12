
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';

// Pages
import Index from '@/pages/Index';
import SuperAdminDashboard from '@/pages/dashboard/SuperAdminDashboard';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import BusinessList from '@/pages/businesses/BusinessList';
import BusinessDetail from '@/pages/businesses/BusinessDetail';
import UserList from '@/pages/users/UserList';
import UserDetail from '@/pages/users/UserDetail';
import PlatformAnalytics from '@/pages/analytics/PlatformAnalytics';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

// Auth Provider
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            {/* Business routes */}
            <Route path="/businesses" element={<BusinessList />} />
            <Route path="/businesses/:id" element={<BusinessDetail />} />
            
            {/* User routes */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/:id" element={<UserDetail />} />
            
            {/* Analytics routes */}
            <Route path="/analytics" element={<PlatformAnalytics />} />
            
            {/* Add other routes as needed */}
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
