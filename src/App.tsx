
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import NotFound from './pages/NotFound';
import AgentList from './pages/agents/AgentList';
import AgentCreate from './pages/agents/AgentCreate';
import AgentTest from './pages/agents/AgentTest';
import AgentEdit from './pages/agents/AgentEdit';
import AgentSettings from './pages/settings/business/AgentSettings';
import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
import ChatbotSettings from './pages/settings/business/ChatboxSettings';
import { ProtectedRoute, getDashboardPath } from './utils/routeUtils';

// Dashboard router component to manage conditional dashboard rendering
const DashboardRouter = () => {
  const { user } = useAuth();
  
  // Redirect to the appropriate dashboard based on user role
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'superadmin') {
    return <SuperAdminDashboard />;
  } else if (user.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  const RouteWithAuth = () => {
    const { user } = useAuth();
    
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/dashboard/superadmin" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']} userRole={user?.role} fallbackPath="/dashboard">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Agent routes */}
          <Route path="/agents" element={<AgentList />} />
          <Route path="/agents/create" element={<AgentCreate />} />
          <Route path="/agents/:agentId/test" element={<AgentTest />} />
          <Route path="/agents/:agentId/edit" element={<AgentEdit />} />
          
          {/* Settings routes */}
          <Route path="/settings/business/agents" element={<AgentSettings />} />
          <Route path="/settings/platform/compliance" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <ComplianceSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/business/chatbox" element={<ChatbotSettings />} />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <RouteWithAuth />
      </AuthProvider>
    </Router>
  );
}

export default App;
