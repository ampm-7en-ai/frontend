
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Filter, FileText, Globe, Table, Upload, MoreHorizontal, Trash2, Edit, Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { fetchKnowledgeBases, deleteKnowledgeBase } from '@/utils/api-config';
import { getStoredKnowledgeBases, removeKnowledgeBase } from '@/utils/knowledgeStorage';
import { useFloatingToast } from '@/context/FloatingToastContext';

interface KnowledgeSource {
  id: number;
  name: string;
  type: 'website' | 'docs' | 'csv' | 'plain_text' | 'thirdparty';
  status: 'processing' | 'completed' | 'failed';
  documents_count: number;
  created_at: string;
  metadata?: {
    website?: string;
    text_content?: string;
    crawl_more?: string;
  };
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { showToast } = useFloatingToast();
  const navigate = useNavigate();
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch knowledge bases from API
  const fetchKnowledgeData = async () => {
    try {
      console.log('Fetching knowledge bases from API');
      const response = await fetchKnowledgeBases();
      
      if (response && response.data) {
        setKnowledgeSources(response.data);
      }
      
      // Check for any new knowledge bases in localStorage
      const storedKnowledgeBases = getStoredKnowledgeBases();
      if (storedKnowledgeBases.length > 0) {
        console.log('Found new knowledge base in localStorage:', storedKnowledgeBases[0].id);
        // Add the new knowledge base to the list if it's not already there
        setKnowledgeSources(prev => {
          const existingIds = prev.map(kb => kb.id);
          const newKnowledgeBases = storedKnowledgeBases.filter(kb => !existingIds.includes(kb.id));
          return [...prev, ...newKnowledgeBases];
        });
      }
      
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      showToast({
        title: "Error",
        description: "Failed to fetch knowledge bases",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteKnowledgeBase(id);
      removeKnowledgeBase(id);
      
      setKnowledgeSources(prev => prev.filter(source => source.id !== id));
      
      showToast({
        title: "Success",
        description: `"${name}" has been deleted successfully`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
      showToast({
        title: "Error",
        description: "Failed to delete knowledge source",
        variant: "error"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'docs':
        return <FileText className="h-4 w-4" />;
      case 'csv':
        return <Table className="h-4 w-4" />;
      case 'plain_text':
        return <FileText className="h-4 w-4" />;
      case 'thirdparty':
        return <Upload className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'website':
        return 'Website';
      case 'docs':
        return 'Documents';
      case 'csv':
        return 'Spreadsheet';
      case 'plain_text':
        return 'Plain Text';
      case 'thirdparty':
        return 'Integration';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredSources = knowledgeSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || source.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Knowledge Base
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your AI knowledge sources and training data
              </p>
            </div>
            <Link to="/knowledge/upload">
              <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge Source
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search knowledge sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="rounded-lg"
            >
              All
            </Button>
            <Button
              variant={filterType === 'website' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('website')}
              className="rounded-lg"
            >
              <Globe className="h-3 w-3 mr-1" />
              Website
            </Button>
            <Button
              variant={filterType === 'docs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('docs')}
              className="rounded-lg"
            >
              <FileText className="h-3 w-3 mr-1" />
              Documents
            </Button>
            <Button
              variant={filterType === 'csv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('csv')}
              className="rounded-lg"
            >
              <Table className="h-3 w-3 mr-1" />
              Spreadsheet
            </Button>
          </div>
        </div>

        {/* Knowledge Sources */}
        {filteredSources.length === 0 ? (
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-slate-800/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {searchTerm || filterType !== 'all' ? 'No matches found' : 'No knowledge sources yet'}
              </h3>
              <p className="text-slate-500 text-center mb-6 max-w-md">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add your first knowledge source to start training your AI assistant'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Link to="/knowledge/upload">
                  <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Knowledge Source
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSources.map((source) => (
              <Card key={source.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg shadow-slate-200/20 dark:shadow-slate-800/20 hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                        {getTypeIcon(source.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {source.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                          {getTypeLabel(source.type)}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Knowledge Source</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{source.name}"? This action cannot be undone and will remove all associated training data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(source.id, source.name)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                      {getStatusBadge(source.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Documents</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {source.documents_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {new Date(source.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {source.metadata?.website && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 truncate">
                            {source.metadata.website}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
