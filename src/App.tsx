import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TrainingStatusProvider } from '@/context/TrainingStatusContext';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/layout/MainLayout';
import { TestPageLayout } from '@/components/layout/TestPageLayout';
import Login from './pages/Login';
import Verify from './pages/Verify';
import InviteRegistration from './pages/InviteRegistration';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import NotFound from './pages/NotFound';
import AgentList from './pages/agents/AgentList';
import AgentTest from './pages/agents/AgentTest';
import AgentEdit from './pages/agents/AgentEdit';
import BusinessSettings from './pages/settings/business/BusinessSettings';
import BillingSettings from './pages/settings/platform/BillingSettings';
import GeneralSettings from './pages/settings/platform/GeneralSettings';
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
import { ProtectedRoute } from './utils/routeUtils';
import { getDashboardPath } from './utils/routeUtils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Create a protected routes component
const ProtectedRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Routes>
      {/* Dashboard Routes */}
      <Route path="/dashboard/superadmin" element={
        <ProtectedRoute allowedRoles={['superadmin']} userRole={userRole} fallbackPath="/dashboard/admin">
          <MainLayout>
            <SuperAdminDashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole} fallbackPath="/dashboard/user">
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Agent Routes */}
      <Route path="/agents" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']} userRole={userRole}>
          <MainLayout>
            <AgentList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/agents/:agentId/edit" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <AgentEdit />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/agents/:agentId/test" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']} userRole={userRole}>
          <TestPageLayout>
            <AgentTest />
          </TestPageLayout>
        </ProtectedRoute>
      } />
      
      {/* Business Routes */}
      <Route path="/businesses" element={
        <ProtectedRoute allowedRoles={['superadmin']} userRole={userRole}>
          <MainLayout>
            <BusinessList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/businesses/:businessId" element={
        <ProtectedRoute allowedRoles={['superadmin']} userRole={userRole}>
          <MainLayout>
            <BusinessDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* User Routes */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <UserList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/users/:userId" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <UserDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Settings Routes */}
      <Route path="/settings/business" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <BusinessSettings />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/platform/general" element={
        <ProtectedRoute allowedRoles={['superadmin']} userRole={userRole}>
          <MainLayout>
            <GeneralSettings />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/platform/billing" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <BillingSettings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Analytics Routes */}
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <PlatformAnalytics />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Conversation Routes */}
      <Route path="/conversations" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']} userRole={userRole}>
          <MainLayout>
            <ConversationList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/conversations/:conversationId" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']} userRole={userRole}>
          <MainLayout>
            <ConversationDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Knowledge Base Routes */}
      <Route path="/knowledge" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <KnowledgeBase />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/knowledge/upload" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']} userRole={userRole}>
          <MainLayout>
            <KnowledgeUpload />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Help Routes */}
      <Route path="/help/docs" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']} userRole={userRole}>
          <MainLayout>
            <Documentation />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/help/support" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 'user']} userRole={userRole}>
          <MainLayout>
            <SupportTicket />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback routes */}
      <Route path="/" element={<Navigate to={getDashboardPath(userRole)} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TrainingStatusProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/invitation" element={<InviteRegistration />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
              <Toaster />
            </TrainingStatusProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
