
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Import all your route components here
import Index from './pages/Index';
import Login from './pages/Login';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';

// Agent pages
import AgentList from './pages/agents/AgentList';
import AgentCreate from './pages/agents/AgentCreate';
import AgentEdit from './pages/agents/AgentEdit';
import AgentTest from './pages/agents/AgentTest';
import AgentPlayground from './pages/agents/AgentPlayground';

// Conversation pages
import ConversationList from './pages/conversations/ConversationList';
import ConversationDetail from './pages/conversations/ConversationDetail';

// Analytics pages
import PlatformAnalytics from './pages/analytics/PlatformAnalytics';

// Knowledge pages
import KnowledgeBase from './pages/knowledge/KnowledgeBase';
import KnowledgeUpload from './pages/knowledge/KnowledgeUpload';

// Settings pages
import GeneralSettings from './pages/settings/platform/GeneralSettings';
import SecuritySettings from './pages/settings/platform/SecuritySettings';
import LLMProvidersSettings from './pages/settings/platform/LLMProvidersSettings';
import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
import BillingSettings from './pages/settings/platform/BillingSettings';
import CustomizationSettings from './pages/settings/platform/CustomizationSettings';

// Business settings
import BusinessSettings from './pages/settings/business/BusinessSettings';
import AgentSettings from './pages/settings/business/AgentSettings';

// User pages
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';

// Business pages
import BusinessList from './pages/businesses/BusinessList';
import BusinessDetail from './pages/businesses/BusinessDetail';

// Template pages
import GlobalTemplates from './pages/templates/GlobalTemplates';

// Help pages
import Documentation from './pages/help/Documentation';
import SupportTicket from './pages/help/SupportTicket';

// Create a query client with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<Verify />} />
              
              {/* Protected routes with MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                
                {/* Dashboard routes */}
                <Route path="dashboard/admin" element={<AdminDashboard />} />
                <Route path="dashboard/super-admin" element={<SuperAdminDashboard />} />
                
                {/* Agent routes */}
                <Route path="agents" element={<AgentList />} />
                <Route path="agents/create" element={<AgentCreate />} />
                <Route path="agents/:id/edit" element={<AgentEdit />} />
                <Route path="agents/:id/test" element={<AgentTest />} />
                <Route path="agents/playground" element={<AgentPlayground />} />
                
                {/* Conversation routes */}
                <Route path="conversations" element={<ConversationList />} />
                <Route path="conversations/:id" element={<ConversationDetail />} />
                
                {/* Analytics routes */}
                <Route path="analytics" element={<PlatformAnalytics />} />
                
                {/* Knowledge routes */}
                <Route path="knowledge" element={<KnowledgeBase />} />
                <Route path="knowledge/upload" element={<KnowledgeUpload />} />
                
                {/* Settings routes */}
                <Route path="settings/platform/general" element={<GeneralSettings />} />
                <Route path="settings/platform/security" element={<SecuritySettings />} />
                <Route path="settings/platform/llm-providers" element={<LLMProvidersSettings />} />
                <Route path="settings/platform/compliance" element={<ComplianceSettings />} />
                <Route path="settings/platform/billing" element={<BillingSettings />} />
                <Route path="settings/platform/customization" element={<CustomizationSettings />} />
                
                {/* Business settings routes */}
                <Route path="settings/business" element={<BusinessSettings />} />
                <Route path="settings/business/agents" element={<AgentSettings />} />
                
                {/* User routes */}
                <Route path="users" element={<UserList />} />
                <Route path="users/:id" element={<UserDetail />} />
                
                {/* Business routes */}
                <Route path="businesses" element={<BusinessList />} />
                <Route path="businesses/:id" element={<BusinessDetail />} />
                
                {/* Template routes */}
                <Route path="templates" element={<GlobalTemplates />} />
                
                {/* Help routes */}
                <Route path="help/documentation" element={<Documentation />} />
                <Route path="help/support" element={<SupportTicket />} />
              </Route>
              
              {/* 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
