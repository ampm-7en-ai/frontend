
import { useQuery } from "@tanstack/react-query";
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { apiGet } from '@/utils/api-interceptor';
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
  efficiency: number;
  resolved: number;
  pending: number;
  csat?: number;
  nps?: number;
}

export interface UsageHistoryItem {
  day: string;
  count: number;
}

export interface SatisfactionTrendItem {
  name: string;
  satisfaction: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceDataItem {
  name: string;
  queries: number;
  website_queries?: number;
  facebook_queries?: number;
  whatsapp_queries?: number;
  instagram_queries?: number;
  playground_queries?: number;
  ticketing_queries?: number;
}

export interface WeeklyPerformanceItem {
  name: string;
  queries: number;
  conversions?: number;
}

export interface PastSixMonthsItem {
  month: string;
  replies: number;
}

export interface HumanXAiItem {
  month: string;
  ai: number;
  human: number;
}

export interface AdminDashboardData {
  my_agents: number;
  conversations: number;
  knowledge_base: number;
  team_members: number;
  conversation_channels: Record<string, number>;
  agent_performance_comparison: AgentPerformanceComparison[];
  usage_history: UsageHistoryItem[];
  satisfaction_trends: SatisfactionTrendItem[];
  credit_used: number;
  total_credits: number;
  chart_data: {
    agent_distribution: ChartDataItem[];
    satisfaction_breakdown: number[];
    daily_performance: PerformanceDataItem[];
    weekly_performance: PerformanceDataItem[];
    monthly_performance: PerformanceDataItem[];
    yearly_performance: PerformanceDataItem[];
    past_6_months: PastSixMonthsItem[];
    human_x_ai_: HumanXAiItem[];
  };
}

async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiGet(getApiUrl(API_ENDPOINTS.DASHBOARD_OVERVIEW));

  if (!response.ok) {
    throw new Error('Failed to fetch admin dashboard');
  }
  const resp = await response.json();
  return resp.data;
}

export function useAdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-dashboard', user?.id], // 🔒 SECURITY: User-specific cache key
    queryFn: fetchAdminDashboard,
    enabled: isAuthenticated && !!user?.id,
    staleTime: 60000
  });
}
