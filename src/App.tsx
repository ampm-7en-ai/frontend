
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Business Settings (Admin)
import BusinessProfile from "./pages/settings/business/BusinessProfile";
import TeamSettings from "./pages/settings/business/TeamSettings";
import AgentSettings from "./pages/settings/business/AgentSettings";
import IntegrationsSettings from "./pages/settings/business/IntegrationsSettings";
import BusinessBillingSettings from "./pages/settings/business/BusinessBillingSettings";
import PreferencesSettings from "./pages/settings/business/PreferencesSettings";

// User Management
import UserList from "./pages/users/UserList";
import UserDetail from "./pages/users/UserDetail";

// Help & Support
import Documentation from "./pages/help/Documentation";
import SupportTicket from "./pages/help/SupportTicket";

// New pages for Knowledge Base and Agents
import KnowledgeBase from "./pages/knowledge/KnowledgeBase";
import KnowledgeUpload from "./pages/knowledge/KnowledgeUpload";
import AgentList from "./pages/agents/AgentList";
import AgentCreate from "./pages/agents/AgentCreate";
import AgentTest from "./pages/agents/AgentTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Knowledge Base */}
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/knowledge/upload" element={<KnowledgeUpload />} />
          
          {/* Agent Management */}
          <Route path="/agents" element={<AgentList />} />
          <Route path="/agents/create" element={<AgentCreate />} />
          <Route path="/agents/test" element={<AgentTest />} />
          
          {/* Settings Pages */}
          <Route path="/settings" element={<SettingsLayout />}>
            {/* Platform Settings (Super Admin) */}
            <Route path="platform/general" element={<GeneralSettings />} />
            <Route path="platform/security" element={<SecuritySettings />} />
            <Route path="platform/llm-providers" element={<LLMProvidersSettings />} />
            <Route path="platform/compliance" element={<ComplianceSettings />} />
            <Route path="platform/billing" element={<BillingSettings />} />
            <Route path="platform/customization" element={<CustomizationSettings />} />
            
            {/* Business Settings (Admin) */}
            <Route path="business/profile" element={<BusinessProfile />} />
            <Route path="business/team" element={<TeamSettings />} />
            <Route path="business/agents" element={<AgentSettings />} />
            <Route path="business/integrations" element={<IntegrationsSettings />} />
            <Route path="business/billing" element={<BusinessBillingSettings />} />
            <Route path="business/preferences" element={<PreferencesSettings />} />
          </Route>
          
          {/* User Management */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          
          {/* Help & Support */}
          <Route path="/help/documentation" element={<Documentation />} />
          <Route path="/help/support" element={<SupportTicket />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
