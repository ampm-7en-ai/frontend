
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

const CACHE_KEY = 'audit_logs_all';
const CACHE_EXPIRATION = 2 * 60 * 1000; // 2 minutes

export const useAuditLogs = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>('today');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedLogs = getFromCache<AuditLogEntry[]>(CACHE_KEY, CACHE_EXPIRATION);
      if (cachedLogs) {
        setLogs(cachedLogs);
        filterLogsByPeriod(cachedLogs, activePeriod);
        setIsLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl('admin/logs/'), {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data: AuditLogsResponse = await response.json();
      
      // Store in cache
      storeInCache(CACHE_KEY, data.data);
      
      setLogs(data.data);
      filterLogsByPeriod(data.data, activePeriod);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogsByPeriod = (allLogs: AuditLogEntry[], period: Period) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const filtered = allLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate;
    });

    setFilteredLogs(filtered);
  };

  const setPeriod = (period: Period) => {
    setActivePeriod(period);
    filterLogsByPeriod(logs, period);
  };

  useEffect(() => {
    fetchLogs();
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
    logs: filteredLogs,
    isLoading,
    activePeriod,
    setPeriod,
    refetch: fetchLogs,
    formatEventType,
    formatTimestamp
  };
};
