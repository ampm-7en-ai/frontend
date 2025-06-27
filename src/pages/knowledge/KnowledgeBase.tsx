
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Upload, 
  Globe, 
  FileText, 
  Trash2, 
  MoreHorizontal, 
  Calendar,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, getAccessToken, getAuthHeaders } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';

interface KnowledgeSource {
  id: number;
  name: string;
  type: 'document' | 'website' | 'text';
  size: string;
  lastUpdated: string;
  status: 'active' | 'processing' | 'error';
  url?: string;
}

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchKnowledgeSources = async (): Promise<KnowledgeSource[]> => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${BASE_URL}/api/knowledge-bases`, {
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch knowledge sources');
    }

    const data = await response.json();
    
    // Transform the API response to match our interface
    return data.data?.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      size: item.metadata?.size || 'N/A',
      lastUpdated: item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'N/A',
      status: item.status === 'active' ? 'active' : item.status === 'processing' ? 'processing' : 'error',
      url: item.url
    })) || [];
  };

  const { data: knowledgeSources = [], isLoading, error } = useQuery({
    queryKey: ['knowledgeSources'],
    queryFn: fetchKnowledgeSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDelete = async (id: number) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${BASE_URL}/api/knowledge-bases/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }

      toast({
        title: "Success",
        description: "Knowledge source deleted successfully",
      });

      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete knowledge source",
        variant: "destructive",
      });
    }
  };

  const filteredSources = knowledgeSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || source.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">Processing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-6xl pt-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Knowledge Base
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your knowledge sources and documentation
              </p>
            </div>
            <Button 
              onClick={() => navigate('/knowledge/upload')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Knowledge Source
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Search Knowledge Sources
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by Type
                </Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter" className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="website">Websites</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Knowledge Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                        <div>
                          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                          <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredSources.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No knowledge sources found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by adding your first knowledge source.'
                  }
                </p>
                <Button onClick={() => navigate('/knowledge/upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Knowledge Source
                </Button>
              </div>
            ) : (
              filteredSources.map((source) => (
                <Card key={source.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          {getTypeIcon(source.type)}
                        </div>
                        <div>
                          <CardTitle className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
                            {source.name}
                          </CardTitle>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {source.type}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <DropdownMenuItem className="dark:text-slate-200 dark:hover:bg-slate-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-400 dark:hover:bg-slate-700"
                            onClick={() => handleDelete(source.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                        {getStatusBadge(source.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Size</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{source.size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Updated</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{source.lastUpdated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
