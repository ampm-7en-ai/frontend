import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import Login from './pages/Login';
import Verify from './pages/Verify';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import NotFound from './pages/NotFound';
import AgentList from './pages/agents/AgentList';
import AgentTest from './pages/agents/AgentTest';
import AgentEdit from './pages/agents/AgentEdit';
import SettingsLayout from './pages/settings/SettingsLayout';
import AgentSettings from './pages/settings/business/AgentSettings';
import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
import { ProtectedRoute, getDashboardPath } from './utils/routeUtils';

import BusinessList from './pages/businesses/BusinessList';
import BusinessDetail from './pages/businesses/BusinessDetail';
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';
import PlatformAnalytics from './pages/analytics/PlatformAnalytics';
import ConversationList from './pages/conversations/ConversationList';
import ConversationDetail from './pages/conversations/ConversationDetail';
import KnowledgeBase from './pages/knowledge/KnowledgeBase';
import KnowledgeUpload from './pages/knowledge/KnowledgeUpload';
import Documentation from './pages/help/Documentation';
import SupportTicket from './pages/help/SupportTicket';
import BusinessProfile from './pages/settings/business/BusinessProfile';
import TeamSettings from './pages/settings/business/TeamSettings';
import IntegrationsSettings from './pages/settings/business/IntegrationsSettings';
import BusinessBillingSettings from './pages/settings/business/BusinessBillingSettings';
import PreferencesSettings from './pages/settings/business/PreferencesSettings';
import GeneralSettings from './pages/settings/platform/GeneralSettings';
import SecuritySettings from './pages/settings/platform/SecuritySettings';
import LLMProvidersSettings from './pages/settings/platform/LLMProvidersSettings';
import BillingSettings from './pages/settings/platform/BillingSettings';
import CustomizationSettings from './pages/settings/platform/CustomizationSettings';

import { Toaster } from "@/components/ui/toaster";

const ProtectedRoutes = () => {
  const { user, needsVerification, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  if (needsVerification || user.isVerified === false) {
    if (location.pathname === '/verify') {
      return (
        <Routes>
          <Route path="/verify" element={<Verify />} />
        </Routes>
      );
    }
    return <Navigate to="/verify" replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          user.role === 'superadmin' ? <SuperAdminDashboard /> : <AdminDashboard />
        } />
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
        
        <Route path="/agents" element={<AgentList />} />
        <Route path="/agents/:agentId/test" element={<AgentTest />} />
        <Route path="/agents/:agentId/edit" element={<AgentEdit />} />
        
        <Route path="/businesses" element={
          <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
            <BusinessList />
          </ProtectedRoute>
        } />
        <Route path="/businesses/:businessId" element={
          <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
            <BusinessDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
            <UserList />
          </ProtectedRoute>
        } />
        <Route path="/users/:userId" element={
          <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
            <UserDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
            <PlatformAnalytics />
          </ProtectedRoute>
        } />
        
        <Route path="/conversations" element={<ConversationList />} />
        <Route path="/conversations/:conversationId" element={<ConversationDetail />} />
        
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/knowledge/upload" element={<KnowledgeUpload />} />
        
        <Route path="/help/documentation" element={<Documentation />} />
        <Route path="/help/support" element={<SupportTicket />} />
        
        <Route path="/settings" element={<SettingsLayout />}>
          <Route path="/settings/business/profile" element={<BusinessProfile />} />
          <Route path="/settings/business/team" element={<TeamSettings />} />
          <Route path="/settings/business/agents" element={<AgentSettings />} />
          <Route path="/settings/business/integrations" element={<IntegrationsSettings />} />
          <Route path="/settings/business/billing" element={<BusinessBillingSettings />} />
          <Route path="/settings/business/preferences" element={<PreferencesSettings />} />
          
          <Route path="/settings/platform/general" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <GeneralSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/platform/security" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <SecuritySettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/platform/llm-providers" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <LLMProvidersSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/platform/compliance" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <ComplianceSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/platform/billing" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <BillingSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/platform/customization" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <CustomizationSettings />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
