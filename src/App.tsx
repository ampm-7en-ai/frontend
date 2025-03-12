import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Index from './pages/Index';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import NotFound from './pages/NotFound';
import AgentList from './pages/agents/AgentList';
import AgentCreate from './pages/agents/AgentCreate';
import AgentTest from './pages/agents/AgentTest';
import AgentEdit from './pages/agents/AgentEdit';
import BusinessSettings from './pages/settings/business/BusinessSettings';
import UserManagement from './pages/settings/platform/UserManagement';
import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
import AgentSettings from './pages/settings/business/AgentSettings';
import ChatbotSettings from './pages/settings/business/ChatboxSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="agents" element={<AgentList />} />
            <Route path="agents/create" element={<AgentCreate />} />
            <Route path="agents/:agentId/test" element={<AgentTest />} />
            <Route path="agents/:agentId/edit" element={<AgentEdit />} />
            <Route path="settings/business" element={<BusinessSettings />} />
            <Route path="settings/platform/users" element={<UserManagement />} />
            <Route path="settings/platform/compliance" element={<ComplianceSettings />} />
            <Route path="settings/business/agents" element={<AgentSettings />} />
            <Route path="settings/business/chatbox" element={<ChatbotSettings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
