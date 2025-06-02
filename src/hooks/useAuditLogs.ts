
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { getFromCache, storeInCache } from '@/utils/cacheUtils';

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  details: {
    name?: string;
    [key: string]: any;
  };
  status: string;
  ip_address: string | null;
  device_info: string | null;
  correlation_id: string | null;
  user: number;
}

interface AuditLogsResponse {
  message: string;
  data: AuditLogEntry[];
  status: string;
}

type Period = 'today' | 'week' | 'month' | '3months';

const CACHE_EXPIRATION = 2 * 60 * 1000; // 2 minutes

export const useAuditLogs = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>('today');

  const getCacheKey = (period: Period) => `audit_logs_${period}`;

  const getApiEndpoint = (period: Period) => {
    const baseUrl = 'admin/logs/';
    if (period === 'today') {
      return baseUrl;
    }
    return `${baseUrl}?period=${period}`;
  };

  const fetchLogs = async (period: Period = activePeriod) => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const cacheKey = getCacheKey(period);
      const cachedLogs = getFromCache<AuditLogEntry[]>(cacheKey, CACHE_EXPIRATION);
      if (cachedLogs) {
        setLogs(cachedLogs);
        setIsLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const endpoint = getApiEndpoint(period);
      const response = await fetch(getApiUrl(endpoint), {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data: AuditLogsResponse = await response.json();
      
      // Store in cache
      storeInCache(cacheKey, data.data);
      
      setLogs(data.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setPeriod = (period: Period) => {
    setActivePeriod(period);
    fetchLogs(period);
  };

  useEffect(() => {
    fetchLogs('today'); // Load today's logs by default
  }, []);

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return {
    logs,
    isLoading,
    activePeriod,
    setPeriod,
    refetch: () => fetchLogs(activePeriod),
    formatEventType,
    formatTimestamp
  };
};
