
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  BookOpen, 
  Globe, 
  FileText, 
  Database,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  Upload,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, getSourceMetadataInfo } from '@/utils/api-config';
import { getNewKnowledgeBase, clearNewKnowledgeBase, hasNewKnowledgeBase } from '@/utils/knowledgeStorage';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();
  const { showToast } = useFloatingToast();

  // Fetch knowledge bases
  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}?status=active`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const { data: knowledgeBases, isLoading, error } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
    staleTime: 5 * 60 * 1000,
  });

  // Check for newly created knowledge base
  useEffect(() => {
    if (hasNewKnowledgeBase()) {
      const newKnowledgeBase = getNewKnowledgeBase();
      if (newKnowledgeBase) {
        showToast(`Knowledge base "${newKnowledgeBase.name}" created successfully!`, 'success');
        clearNewKnowledgeBase();
        
        // Refetch knowledge bases to include the new one
        queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
      }
    }
  }, [showToast, queryClient]);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'docs':
        return <FileText className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'plain_text':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'docs':
        return 'from-blue-500 to-blue-600';
      case 'website':
        return 'from-green-500 to-green-600';
      case 'csv':
        return 'from-purple-500 to-purple-600';
      case 'plain_text':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'trained':
        return 'success';
      case 'training':
        return 'waiting';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Filter knowledge bases
  const filteredKnowledgeBases = knowledgeBases?.filter((kb: any) => {
    const matchesSearch = kb.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || kb.type === filterType;
    return matchesSearch && matchesFilter;
  }) || [];

  // Calculate stats
  const stats = {
    total: knowledgeBases?.length || 0,
    docs: knowledgeBases?.filter((kb: any) => kb.type === 'docs').length || 0,
    websites: knowledgeBases?.filter((kb: any) => kb.type === 'website').length || 0,
    csv: knowledgeBases?.filter((kb: any) => kb.type === 'csv').length || 0,
    trained: knowledgeBases?.filter((kb: any) => kb.training_status === 'trained').length || 0,
  };

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading knowledge bases</h1>
            <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] })}>
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Knowledge Base
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your knowledge sources and training data
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Link to="/knowledge/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Knowledge
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Sources</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Documents</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.docs}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Websites</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.websites}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Spreadsheets</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.csv}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                      <FileSpreadsheet className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Trained</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.trained}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search knowledge bases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-48 border-slate-200 dark:border-slate-700 rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="docs">Documents</SelectItem>
                      <SelectItem value="website">Websites</SelectItem>
                      <SelectItem value="csv">Spreadsheets</SelectItem>
                      <SelectItem value="plain_text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Base Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredKnowledgeBases.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Database className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {searchTerm || filterType !== 'all' ? 'No matching knowledge bases found' : 'No knowledge bases yet'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by uploading your first knowledge source.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-2xl">
                    <Link to="/knowledge/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Knowledge
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKnowledgeBases.map((kb: any) => {
                const sourceInfo = getSourceMetadataInfo(kb);
                
                return (
                  <Card key={kb.id} className="bg-white dark:bg-slate-800 border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${getTypeColor(kb.type)}`}>
                            {getTypeIcon(kb.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {kb.name}
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400 capitalize">
                              {kb.type === 'docs' ? 'Document' : kb.type}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(kb.training_status)} className="ml-2">
                          {kb.training_status || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Source Info */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Sources</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {kb.knowledge_sources?.length || 0}
                          </span>
                        </div>
                        
                        {sourceInfo.count && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Content</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {sourceInfo.count}
                            </span>
                          </div>
                        )}
                        
                        {sourceInfo.size !== 'N/A' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Size</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {sourceInfo.size}
                            </span>
                          </div>
                        )}

                        <Separator className="my-3" />

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Eye className="h-3 w-3 mr-1.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default KnowledgeBase;
