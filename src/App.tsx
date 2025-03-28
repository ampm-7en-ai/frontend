import React from 'react';
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
import Settings from './pages/settings/Settings';
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

import GeneralSettings from './pages/settings/platform/GeneralSettings';
import SecuritySettings from './pages/settings/platform/SecuritySettings';
import LLMProvidersSettings from './pages/settings/platform/LLMProvidersSettings';
import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
import BillingSettings from './pages/settings/platform/BillingSettings';
import CustomizationSettings from './pages/settings/platform/CustomizationSettings';

import BusinessProfile from './pages/settings/business/BusinessProfile';
import TeamSettings from './pages/settings/business/TeamSettings';
import IntegrationsSettings from './pages/settings/business/IntegrationsSettings';
import ChatboxSettings from './pages/settings/business/ChatboxSettings';
import AgentSettings from './pages/settings/business/AgentSettings';
import BusinessBillingSettings from './pages/settings/business/BusinessBillingSettings';

import { ProtectedRoute } from './utils/routeUtils';

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
        <Route 
          path="/dashboard/superadmin" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']} userRole={user?.role} fallbackPath="/dashboard">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/agents" element={<AgentList />} />
        <Route path="/agents/:agentId/test" element={<AgentTest />} />
        <Route path="/agents/:agentId/edit" element={<AgentEdit />} />
        
        <Route 
          path="/businesses" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <BusinessList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/businesses/:businessId" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <BusinessDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/:userId" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <UserDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <PlatformAnalytics />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/conversations" element={<ConversationList />} />
        <Route path="/conversations/:conversationId" element={<ConversationDetail />} />
        
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/knowledge/upload" element={<KnowledgeUpload />} />
        
        <Route path="/help/documentation" element={<Documentation />} />
        <Route path="/help/support" element={<SupportTicket />} />
        
        <Route path="/settings" element={<Settings />}>
          <Route path="business/profile" element={<BusinessProfile />} />
          <Route path="business/team" element={<TeamSettings />} />
          <Route path="business/integrations" element={<IntegrationsSettings />} />
          <Route path="business/chatbox" element={<ChatboxSettings />} />
          <Route path="business/agent-settings" element={<AgentSettings />} />
          <Route path="business/billing" element={<BusinessBillingSettings />} />
          
          <Route path="platform/general" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <GeneralSettings />
            </ProtectedRoute>
          } />
          <Route path="platform/security" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <SecuritySettings />
            </ProtectedRoute>
          } />
          <Route path="platform/llm-providers" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <LLMProvidersSettings />
            </ProtectedRoute>
          } />
          <Route path="platform/compliance" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <ComplianceSettings />
            </ProtectedRoute>
          } />
          <Route path="platform/billing" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <BillingSettings />
            </ProtectedRoute>
          } />
          <Route path="platform/customization" element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
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
