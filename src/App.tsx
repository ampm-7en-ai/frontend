
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SettingsLayout from "./pages/settings/SettingsLayout";

// Platform Settings (Super Admin)
import GeneralSettings from "./pages/settings/platform/GeneralSettings";
import SecuritySettings from "./pages/settings/platform/SecuritySettings";
import LLMProvidersSettings from "./pages/settings/platform/LLMProvidersSettings";
import ComplianceSettings from "./pages/settings/platform/ComplianceSettings";
import BillingSettings from "./pages/settings/platform/BillingSettings";
import CustomizationSettings from "./pages/settings/platform/CustomizationSettings";

// User Management (Super Admin)
import UserList from "./pages/users/UserList";
import UserDetail from "./pages/users/UserDetail";

// Business Settings (Admin)
import BusinessProfile from "./pages/settings/business/BusinessProfile";
import TeamSettings from "./pages/settings/business/TeamSettings";
import AgentSettings from "./pages/settings/business/AgentSettings";
import IntegrationsSettings from "./pages/settings/business/IntegrationsSettings";
import BusinessBillingSettings from "./pages/settings/business/BusinessBillingSettings";
import PreferencesSettings from "./pages/settings/business/PreferencesSettings";
import ChatboxSettings from "./pages/settings/business/ChatboxSettings";

// Business Management (Super Admin)
import BusinessList from "./pages/businesses/BusinessList";
import BusinessDetail from "./pages/businesses/BusinessDetail";

// Platform Analytics (Super Admin)
import PlatformAnalytics from "./pages/analytics/PlatformAnalytics";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";

// Knowledge Base and Agents
import KnowledgeBase from "./pages/knowledge/KnowledgeBase";
import KnowledgeUpload from "./pages/knowledge/KnowledgeUpload";
import AgentList from "./pages/agents/AgentList";
import AgentCreate from "./pages/agents/AgentCreate";
import AgentTest from "./pages/agents/AgentTest";

// Conversations
import ConversationList from "./pages/conversations/ConversationList";
import ConversationDetail from "./pages/conversations/ConversationDetail";

// Help & Support
import Documentation from "./pages/help/Documentation";
import SupportTicket from "./pages/help/SupportTicket";

const queryClient = new QueryClient();

// Route guards for role-based access
const ProtectedRoute = ({ children, allowedRoles = ["admin", "superadmin"] }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Wrapper for auth provider with router
const AppRoutes = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes with role-based dashboard */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {isSuperAdmin ? <SuperAdminDashboard /> : <Index />}
          </ProtectedRoute>
        } 
      />
      
      {/* Knowledge Base - Both roles */}
      <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
      <Route path="/knowledge/upload" element={<ProtectedRoute><KnowledgeUpload /></ProtectedRoute>} />
      
      {/* Agent Management - Both roles */}
      <Route path="/agents" element={<ProtectedRoute><AgentList /></ProtectedRoute>} />
      <Route path="/agents/create" element={<ProtectedRoute><AgentCreate /></ProtectedRoute>} />
      <Route path="/agents/test" element={<ProtectedRoute><AgentTest /></ProtectedRoute>} />
      
      {/* Conversations - Both roles */}
      <Route path="/conversations" element={<ProtectedRoute><ConversationList /></ProtectedRoute>} />
      <Route path="/conversations/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
      
      {/* Settings Pages */}
      <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
        {/* Platform Settings (Super Admin Only) */}
        <Route path="platform/general" element={<ProtectedRoute allowedRoles={["superadmin"]}><GeneralSettings /></ProtectedRoute>} />
        <Route path="platform/security" element={<ProtectedRoute allowedRoles={["superadmin"]}><SecuritySettings /></ProtectedRoute>} />
        <Route path="platform/llm-providers" element={<ProtectedRoute allowedRoles={["superadmin"]}><LLMProvidersSettings /></ProtectedRoute>} />
        <Route path="platform/compliance" element={<ProtectedRoute allowedRoles={["superadmin"]}><ComplianceSettings /></ProtectedRoute>} />
        <Route path="platform/billing" element={<ProtectedRoute allowedRoles={["superadmin"]}><BillingSettings /></ProtectedRoute>} />
        <Route path="platform/customization" element={<ProtectedRoute allowedRoles={["superadmin"]}><CustomizationSettings /></ProtectedRoute>} />
        
        {/* Business Settings (Admin Only) */}
        <Route path="business/profile" element={<ProtectedRoute allowedRoles={["admin"]}><BusinessProfile /></ProtectedRoute>} />
        <Route path="business/team" element={<ProtectedRoute allowedRoles={["admin"]}><TeamSettings /></ProtectedRoute>} />
        <Route path="business/agents" element={<ProtectedRoute allowedRoles={["admin"]}><AgentSettings /></ProtectedRoute>} />
        <Route path="business/integrations" element={<ProtectedRoute allowedRoles={["admin"]}><IntegrationsSettings /></ProtectedRoute>} />
        <Route path="business/billing" element={<ProtectedRoute allowedRoles={["admin"]}><BusinessBillingSettings /></ProtectedRoute>} />
        <Route path="business/preferences" element={<ProtectedRoute allowedRoles={["admin"]}><PreferencesSettings /></ProtectedRoute>} />
        <Route path="business/chatbox" element={<ProtectedRoute allowedRoles={["admin"]}><ChatboxSettings /></ProtectedRoute>} />
      </Route>
      
      {/* Business Management - Super Admin only */}
      <Route path="/businesses" element={<ProtectedRoute allowedRoles={["superadmin"]}><BusinessList /></ProtectedRoute>} />
      <Route path="/businesses/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><BusinessDetail /></ProtectedRoute>} />
      
      {/* User Management - Super Admin only */}
      <Route path="/users" element={<ProtectedRoute allowedRoles={["superadmin"]}><UserList /></ProtectedRoute>} />
      <Route path="/users/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><UserDetail /></ProtectedRoute>} />
      
      {/* Platform Analytics - Super Admin only */}
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={["superadmin"]}><PlatformAnalytics /></ProtectedRoute>} />
      
      {/* Help & Support - Both roles */}
      <Route path="/help/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
      <Route path="/help/support" element={<ProtectedRoute><SupportTicket /></ProtectedRoute>} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
