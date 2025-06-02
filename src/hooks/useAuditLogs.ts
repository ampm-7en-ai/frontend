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
const ITEMS_PER_PAGE = 10;

export const useAuditLogs = () => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [allLogs, setAllLogs] = useState<AuditLogEntry[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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
        setAllLogs(cachedLogs);
        setCurrentPage(1);
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
      
      setAllLogs(data.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
      setAllLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logs based on search term
  const getFilteredLogs = () => {
    if (!searchTerm) return allLogs;
    
    return allLogs.filter(log => {
      const searchLower = searchTerm.toLowerCase();
      const userString = log.user ? log.user.toString() : '';
      const nameString = log.details?.name ? log.details.name.toLowerCase() : '';
      
      return userString.includes(searchLower) || nameString.includes(searchLower);
    });
  };

  // Update displayed logs based on pagination and search
  useEffect(() => {
    const filtered = getFilteredLogs();
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    setDisplayedLogs(filtered.slice(startIndex, endIndex));
  }, [allLogs, currentPage, searchTerm]);

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasMore = () => {
    const filtered = getFilteredLogs();
    return currentPage * ITEMS_PER_PAGE < filtered.length;
  };

  const setPeriod = (period: Period) => {
    setActivePeriod(period);
    setSearchTerm('');
    setCurrentPage(1);
    fetchLogs(period);
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Get all logs for export (not just displayed ones)
      const logsToExport = getFilteredLogs();
      
      // Create CSV content
      const headers = ['Date & Time', 'User ID', 'Action', 'Entity', 'Details', 'Status', 'IP Address'];
      const csvContent = [
        headers.join(','),
        ...logsToExport.map(log => [
          `"${formatTimestamp(log.timestamp)}"`,
          log.user || 'N/A',
          `"${formatEventType(log.event_type)}"`,
          `"${log.entity_type} #${log.entity_id}"`,
          `"${log.details?.name || 'N/A'}"`,
          log.status,
          `"${log.ip_address || 'N/A'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${activePeriod}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Audit logs have been exported to CSV file.",
        variant: "default"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export audit logs.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
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
    logs: displayedLogs,
    isLoading,
    activePeriod,
    searchTerm,
    isExporting,
    setPeriod,
    setSearchTerm,
    loadMore,
    hasMore: hasMore(),
    exportToExcel,
    refetch: () => fetchLogs(activePeriod),
    formatEventType,
    formatTimestamp
  };
};
