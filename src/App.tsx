
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import Index from './pages/Index';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import NotFound from './pages/NotFound';
import AgentList from './pages/agents/AgentList';
import AgentCreate from './pages/agents/AgentCreate';
import AgentTest from './pages/agents/AgentTest';
import AgentEdit from './pages/agents/AgentEdit';
import AgentSettings from './pages/settings/business/AgentSettings';
import ComplianceSettings from './pages/settings/platform/ComplianceSettings';
import ChatbotSettings from './pages/settings/business/ChatboxSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<MainLayout pageTitle="Dashboard"><SuperAdminDashboard /></MainLayout>} />
          <Route path="/agents" element={<MainLayout pageTitle="Agents"><AgentList /></MainLayout>} />
          <Route path="/agents/create" element={<MainLayout pageTitle="Create Agent"><AgentCreate /></MainLayout>} />
          <Route path="/agents/:agentId/test" element={<MainLayout pageTitle="Test Agent"><AgentTest /></MainLayout>} />
          <Route path="/agents/:agentId/edit" element={<MainLayout pageTitle="Edit Agent"><AgentEdit /></MainLayout>} />
          <Route path="/settings/business/agents" element={<MainLayout pageTitle="Agent Settings"><AgentSettings /></MainLayout>} />
          <Route path="/settings/platform/compliance" element={<MainLayout pageTitle="Compliance Settings"><ComplianceSettings /></MainLayout>} />
          <Route path="/settings/business/chatbox" element={<MainLayout pageTitle="Chatbot Settings"><ChatbotSettings /></MainLayout>} />
          <Route path="*" element={<MainLayout pageTitle="Not Found"><NotFound /></MainLayout>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
