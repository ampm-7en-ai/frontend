
import { useQuery } from "@tanstack/react-query";
import { BASE_URL, getAuthHeaders } from "@/utils/api-config";
import { useAuth } from "@/context/AuthContext";

export interface AgentPerformanceSummary {
  avg_response_time: { value: number, change: number, change_direction: string };
  total_conversations: { value: number, change: number, change_direction: string };
  user_satisfaction: { value: number, change: number, change_direction: string };
}

export interface AgentPerformanceComparison {
  agent_name: string;
  conversations: number;
  avg_response_time: number;
  satisfaction: number;
}

export interface UsageHistoryItem {
  day: string;
  count: number;
}

export interface AdminDashboardData {
  my_agents: number;
  conversations: number;
  knowledge_base: number;
  team_members: number;
  agent_performance_summary: AgentPerformanceSummary;
  conversation_channels: Record<string, number>;
  agent_performance_comparison: AgentPerformanceComparison[];
  agent_use: {
    credits_used: number;
    credits_total: number;
    agents_used: number;
  };
  usage_history: UsageHistoryItem[];
}


async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
  if (!token) {
    throw new Error('Authentication token not found');
  }
  const response = await fetch(`${BASE_URL}dashboard/overview/`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin dashboard');
  }
  const resp = await response.json();
  return resp.data;
}

export function useAdminDashboard() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    enabled: isAuthenticated,
    staleTime: 60000
  });
}
