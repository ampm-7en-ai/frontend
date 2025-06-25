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
        showToast({
          title: 'Success',
          description: `Knowledge base "${newKnowledgeBase.name}" created successfully!`,
          variant: 'success'
        });
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                  Knowledge Base
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Manage your knowledge sources and training data
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link to="/knowledge/upload">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Knowledge
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Sources</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.total}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Documents</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{stats.docs}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Websites</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.websites}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Spreadsheets</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{stats.csv}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Trained</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">{stats.trained}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Search knowledge bases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-56 h-12 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
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
            <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-16 text-center">
                <div className="p-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Database className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                  {searchTerm || filterType !== 'all' ? 'No matching knowledge bases found' : 'No knowledge bases yet'}
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by uploading your first knowledge source.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Link to="/knowledge/upload">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Knowledge
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredKnowledgeBases.map((kb: any) => {
                const sourceInfo = getSourceMetadataInfo(kb);
                
                return (
                  <Card key={kb.id} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTypeColor(kb.type)} shadow-lg`}>
                            {getTypeIcon(kb.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                              {kb.name}
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400 capitalize font-medium">
                              {kb.type === 'docs' ? 'Document' : kb.type}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={getStatusVariant(kb.training_status)} 
                          className="ml-2 px-3 py-1 rounded-full font-semibold text-xs shadow-sm"
                        >
                          {kb.training_status || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Source Info */}
                        <div className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Sources</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                            {kb.knowledge_sources?.length || 0}
                          </span>
                        </div>
                        
                        {sourceInfo.count && (
                          <div className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Content</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {sourceInfo.count}
                            </span>
                          </div>
                        )}
                        
                        {sourceInfo.size !== 'N/A' && (
                          <div className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Size</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {sourceInfo.size}
                            </span>
                          </div>
                        )}

                        <Separator className="my-4" />

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 h-10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 h-10 px-4"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 rounded-2xl transition-all duration-200 h-10 px-4"
                          >
                            <Trash2 className="h-4 w-4" />
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
