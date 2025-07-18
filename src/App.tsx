
Import react from 'react';
Import { BrowserRouter as Router, Routes, route, navigate, useLocation } from 'react-router-dom';
Import { TooltipProvider } from '@/components/ui/tooltip';
Import { AuthProvider, useAuth } from './context/AuthContext';
Import { MainLayout } from './components/layout/MainLayout';
Import { TestPageLayout } from './components/layout/TestPageLayout';
Import Login from './pages/Login';
Import Verify from './pages/Verify';
Import ResetPassword from './pages/ResetPassword';
Import InviteRegistration from './pages/InviteRegistration';
Import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
Import AdminDashboard from './pages/dashboard/AdminDashboard';
Import NotFound from './pages/NotFound';
Import AgentList from './pages/agents/AgentList';
Import AgentBuilder from './pages/agents/AgentBuilder';
Import AgentTest from './pages/agents/AgentTest';
Import AgentEdit from './pages/agents/AgentEdit';
Import BusinessSettings from './pages/settings/business/BusinessSettings';
Import BillingSettings from './pages/settings/platform/BillingSettings';
Import GeneralSettings from './pages/settings/platform/GeneralSettings';
Import BusinessList from './pages/businesses/BusinessList';
Import BusinessDetail from './pages/businesses/BusinessDetail';
Import SystemHealth from './pages/system/SystemHealth';
Import PlatformAnalytics from './pages/analytics/PlatformAnalytics';
Import ConversationList from './pages/conversations/ConversationList';
Import ConversationDetail from './pages/conversations/ConversationDetail';
Import KnowledgeBase from './pages/knowledge/KnowledgeBase';
Import KnowledgeUpload from './pages/knowledge/KnowledgeUpload';
Import documentation from './pages/help/Documentation';
Import SupportTicket from './pages/help/SupportTicket';
Import { ProtectedRoute } from './utils/routeUtils';

Import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
Import { TrainingStatusProvider } from './context/TrainingStatusContext';
Import { NotificationProvider } from './context/NotificationContext';
Import { FloatingToastProvider } from './context/FloatingToastContext';
Import SecuritySettings from './pages/settings/platform/SecuritySettings';
Import LLMProvidersSettings from './pages/settings/platform/LLMProvidersSettings';
Import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
Import CustomizationSettings from './pages/settings/platform/CustomizationSettings';
Import SubscriptionPlanEditor from './pages/settings/platform/SubscriptionPlanEditor';
Import IntegrationsPage from './pages/integrations/IntegrationsPage';
Import ChatPreview from './pages/preview/ChatPreview';
Import SearchAssistant from './pages/chat/SearchAssistant';
Import PaymentHistory from './pages/settings/business/PaymentHistory';

const QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      Retry: 1,
    },
  },
});

const ProtectedRoutes = () => {
  const { USER, needsVerification, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  If (isLoading) {
    Return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  If (!isAuthenticated || !user) {
    Return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  If (needsVerification || USER.isVerified === false) {
    If (location.pathname === '/Verify') {
      Return (
        <Routes>
          <route path="/Verify" Element={<Verify />} />
        </Routes>
      );
    }
    Return <navigate to="/Verify" replace />;
  }
  
  return (
    <Routes>
      <route path="/" Element={<MainLayout />}>
        <route path="/" Element={<navigate to="/dashboard" replace />} />
        <route path="/dashboard" Element={
          USER.Role === 'superadmin' ? <SuperAdminDashboard /> : <AdminDashboard />
        } />
        <route 
          path="/dashboard/superadmin" 
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={USER?.Role} fallbackPath="/dashboard">
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <route 
          path="/dashboard/admin" 
          Element={
            <ProtectedRoute allowedRoles={['USER']} userRole={USER?.Role} fallbackPath="/dashboard">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <route path="/Agents" Element={<AgentList />} />
        <route path="/agents/builder/:id" Element={<AgentBuilder />} />
        <route path="/agents/:agentId/edit" Element={<AgentEdit />} />
        

const ProtectedRoutes = () => {
  const { USER, needsVerification, isAuthenticated, isLoading } = useAuth();
  const { USER, needsVerification, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  If (isLoading) {
    Return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  If (!isAuthenticated || !user) {
    Return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  if (needsVerification || user.isVerified === false) {
    if (location.pathname === '/verify') {
      return (
  If (needsVerification || USER.isVerified === false) {
    If (location.pathname === '/Verify') {
      Return (
        <Routes>
          <Route path="/verify" element={<Verify />} />
          <route path="/Verify" Element={<Verify />} />
        </Routes>
      );
    }
    return <Navigate to="/verify" replace />;
    Return <navigate to="/Verify" replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          user.role === 'SUPERADMIN' ? <SuperAdminDashboard /> : <AdminDashboard />
      <route path="/" Element={<MainLayout />}>
        <route path="/" Element={<navigate to="/dashboard" replace />} />
        <route path="/dashboard" Element={
          USER.Role === 'superadmin' ? <SuperAdminDashboard /> : <AdminDashboard />
        } />
        <route 
        <route 
          path="/dashboard/superadmin" 
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={USER?.Role} fallbackPath="/dashboard">
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={USER?.Role} fallbackPath="/dashboard">
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <route 
        <route 
          path="/dashboard/admin" 
          Element={
            <ProtectedRoute allowedRoles={['USER']} userRole={USER?.Role} fallbackPath="/dashboard">
          Element={
            <ProtectedRoute allowedRoles={['USER']} =USER?.Role} fallbackPath="/dashboard">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <route path="/Agents" Element={<AgentList />} />
        <route path="/agents/builder/:id" Element={<AgentBuilder />} />
        <route path="/agents/:agentId/edit" Element={<AgentEdit />} />
        <route path="/Agents" Element={<AgentList />} />
        <route path="/agents/builder/:id" Element={<AgentBuilder />} />
        <route path="/agents/:agentId/edit" Element={<AgentEdit />} />
        
        <route 
          path="/Businesses" 
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={USER?.Role} fallbackPath="/dashboard">
        <route 
          path="/Businesses" 
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={USER?.Role} fallbackPath="/dashboard">
              <BusinessList />
        <route 
          path="/Businesses" 
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={USER?.Role} fallbackPath="/dashboard">
              <BusinessList />
            </ProtectedRoute>
          } 
        />
        <route 
          path="/businesses/:businessId" 
          Element={
            <ProtectedRoute allowedRoles={['superadmin']} userRole={user?.role} fallbackPath="/dashboard">
              <BusinessDetail />
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
        <Route path="/settings/business/payment-history" element={<PaymentHistory />} />
        
        {/* New route for integrations */}
        <Route path="/integrations" element={<IntegrationsPage />} />
        
        <Route 
          path="/settings/platform/billing" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <BillingSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/subscription-plan" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <SubscriptionPlanEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/subscription-plan/:planId" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <SubscriptionPlanEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/general" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <GeneralSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/security" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <SecuritySettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/llm-providers" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <LLMProvidersSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/compliance" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <ComplianceSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/platform/customization" 
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']} userRole={user?.role} fallbackPath="/settings">
              <CustomizationSettings />
            </ProtectedRoute>
          } 
        />
        
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <FloatingToastProvider>
                <TrainingStatusProvider>
                  <Routes>
                    {/* Public routes that don't require authentication */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/invitation" element={<InviteRegistration />} />
                    <Route path="/chat/preview/:agentId" element={<ChatPreview />} />
                    <Route path="/chat/assistant/:agentId" element={<SearchAssistant />} />
                    
                    {/* Protected routes that require authentication */}
                    <Route path="/*" element={<ProtectedRoutes />} />
                  </Routes>
                </TrainingStatusProvider>
              </FloatingToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
