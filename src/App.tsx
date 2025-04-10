
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { TestPageLayout } from './components/layout/TestPageLayout';
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
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
        
        <Route path="/settings" element={<BusinessSettings />} />
        <Route path="/settings/business" element={<BusinessSettings />} />
        
        <Route 
          path="/settings/platform/billing" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <BillingSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/general" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/settings">
              <GeneralSettings />
            </ProtectedRoute>
          } 
        />
        <Route path="/settings/*" element={<Navigate to="/settings" replace />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<TestPageLayout />}>
        <Route path="/agents/:agentId/test" element={<AgentTest />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/invitation" element={<InviteRegistration />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}


export default App;
