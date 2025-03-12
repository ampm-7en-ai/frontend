
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

// Settings
import SettingsLayout from '@/pages/settings/SettingsLayout';
import BusinessProfile from '@/pages/settings/business/BusinessProfile';
import TeamSettings from '@/pages/settings/business/TeamSettings';
import AgentSettings from '@/pages/settings/business/AgentSettings';
import IntegrationsSettings from '@/pages/settings/business/IntegrationsSettings';
import BusinessBillingSettings from '@/pages/settings/business/BusinessBillingSettings';
import PreferencesSettings from '@/pages/settings/business/PreferencesSettings';
import ChatboxSettings from '@/pages/settings/business/ChatboxSettings';

// Platform Settings
import GeneralSettings from '@/pages/settings/platform/GeneralSettings';
import SecuritySettings from '@/pages/settings/platform/SecuritySettings';
import LLMProvidersSettings from '@/pages/settings/platform/LLMProvidersSettings';
import ComplianceSettings from '@/pages/settings/platform/ComplianceSettings';
import BillingSettings from '@/pages/settings/platform/BillingSettings';
import CustomizationSettings from '@/pages/settings/platform/CustomizationSettings';

// Auth Provider
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
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

            {/* Settings routes */}
            <Route path="/settings" element={<SettingsLayout />}>
              {/* Business Settings */}
              <Route path="business/profile" element={<BusinessProfile />} />
              <Route path="business/team" element={<TeamSettings />} />
              <Route path="business/agents" element={<AgentSettings />} />
              <Route path="business/integrations" element={<IntegrationsSettings />} />
              <Route path="business/billing" element={<BusinessBillingSettings />} />
              <Route path="business/preferences" element={<PreferencesSettings />} />
              <Route path="business/chatbox" element={<ChatboxSettings />} />

              {/* Platform Settings */}
              <Route path="platform/general" element={<GeneralSettings />} />
              <Route path="platform/security" element={<SecuritySettings />} />
              <Route path="platform/llm-providers" element={<LLMProvidersSettings />} />
              <Route path="platform/compliance" element={<ComplianceSettings />} />
              <Route path="platform/billing" element={<BillingSettings />} />
              <Route path="platform/customization" element={<CustomizationSettings />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
