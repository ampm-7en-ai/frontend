
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { PermissionProvider } from '@/context/PermissionContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TrainingStatusProvider } from '@/context/TrainingStatusContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationToastProvider } from '@/context/NotificationToastContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { TestPageLayout } from '@/components/layout/TestPageLayout';
import Login from '@/pages/Login';
import Verify from '@/pages/Verify';
import ResetPassword from '@/pages/ResetPassword';
import InviteRegistration from '@/pages/InviteRegistration';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Agents from '@/pages/agents/Agents';
import NewAgent from '@/pages/agents/NewAgent';
import EditAgent from '@/pages/agents/EditAgent';
import AgentDetails from '@/pages/agents/AgentDetails';
import Knowledge from '@/pages/knowledge/Knowledge';
import KnowledgeUpload from '@/pages/knowledge/KnowledgeUpload';
import KnowledgeDetails from '@/pages/knowledge/KnowledgeDetails';
import Settings from '@/pages/Settings';
import Billing from '@/pages/Billing';
import Training from '@/pages/Training';
import Playground from '@/pages/Playground';
import AgentPlayground from '@/pages/agents/AgentPlayground';
import AgentTraining from '@/pages/agents/AgentTraining';
import AgentSettings from '@/pages/agents/AgentSettings';
import AgentBilling from '@/pages/agents/AgentBilling';
import Users from '@/pages/users/Users';
import NewUser from '@/pages/users/NewUser';
import EditUser from '@/pages/users/EditUser';
import UserDetails from '@/pages/users/UserDetails';
import Logs from '@/pages/Logs';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
            <TrainingStatusProvider>
              <NotificationProvider>
                <NotificationToastProvider>
                  <Router>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/verify" element={<Verify />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/invite/:token" element={<InviteRegistration />} />
                      <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                      <Route path="/agents" element={<MainLayout><Agents /></MainLayout>} />
                      <Route path="/agents/new" element={<MainLayout><NewAgent /></MainLayout>} />
                      <Route path="/agents/:agentId" element={<MainLayout><AgentDetails /></MainLayout>} />
                      <Route path="/agents/:agentId/edit" element={<MainLayout><EditAgent /></MainLayout>} />
                      <Route path="/agents/:agentId/playground" element={<MainLayout><AgentPlayground /></MainLayout>} />
                      <Route path="/agents/:agentId/training" element={<MainLayout><AgentTraining /></MainLayout>} />
                      <Route path="/agents/:agentId/settings" element={<MainLayout><AgentSettings /></MainLayout>} />
                      <Route path="/agents/:agentId/billing" element={<MainLayout><AgentBilling /></MainLayout>} />
                      <Route path="/knowledge" element={<MainLayout><Knowledge /></MainLayout>} />
                      <Route path="/knowledge/upload" element={<MainLayout><KnowledgeUpload /></MainLayout>} />
                      <Route path="/knowledge/:knowledgeId" element={<MainLayout><KnowledgeDetails /></MainLayout>} />
                      <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
                      <Route path="/billing" element={<MainLayout><Billing /></MainLayout>} />
                      <Route path="/training" element={<MainLayout><Training /></MainLayout>} />
                      <Route path="/playground" element={<MainLayout><Playground /></MainLayout>} />
                      <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
                      <Route path="/users/new" element={<MainLayout><NewUser /></MainLayout>} />
                      <Route path="/users/:userId" element={<MainLayout><UserDetails /></MainLayout>} />
                      <Route path="/users/:userId/edit" element={<MainLayout><EditUser /></MainLayout>} />
                      <Route path="/logs" element={<MainLayout><Logs /></MainLayout>} />
                      <Route path="/test-page" element={<TestPageLayout />} />
                      <Route path="/404" element={<MainLayout><NotFound /></MainLayout>} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                    <Toaster />
                  </Router>
                </NotificationToastProvider>
              </NotificationProvider>
            </TrainingStatusProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
