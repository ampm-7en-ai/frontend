import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, FileText, Globe, Table, AlignLeft, ExternalLink, 
  Download, Trash2, ChevronLeft, Settings, Moon, Sun, Filter, SortAsc
} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllKnowledgeBases, deleteKnowledgeBase } from '@/utils/api-config';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import ModernButton from '@/components/dashboard/ModernButton';
import { useKnowledgeTheme } from '@/hooks/useKnowledgeTheme';

interface KnowledgeSource {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  status: 'ready' | 'training' | 'error';
  metadata?: any;
}

type KnowledgeTheme = 'light' | 'dark';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useKnowledgeTheme();
  const navigate = useNavigate();

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      setIsLoading(true);
      try {
        const data = await getAllKnowledgeBases();
        setSources(data);
      } catch (error) {
        console.error('Error fetching knowledge bases:', error);
        toast({
          title: "Error",
          description: "Failed to load knowledge sources.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBases();
  }, [toast]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Globe className="h-5 w-5 text-blue-500" />;
      case 'docs':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'csv':
        return <Table className="h-5 w-5 text-yellow-500" />;
      case 'plain_text':
        return <AlignLeft className="h-5 w-5 text-gray-500" />;
      default:
        return <ExternalLink className="h-5 w-5 text-purple-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">Ready</Badge>;
      case 'training':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800">Training</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const filteredSources = sources.filter(source => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatches = source.name.toLowerCase().includes(searchTermLower);

    let statusMatches = true;
    if (statusFilter !== 'all') {
      statusMatches = source.status === statusFilter;
    }

    return nameMatches && statusMatches;
  });

  const sortedSources = [...filteredSources].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'updated') {
      return a.lastUpdated.localeCompare(b.lastUpdated);
    } else if (sortBy === 'size') {
      return a.size.localeCompare(b.size);
    }
    return 0;
  });

  const filteredAndSortedSources = sortedSources;

  const handleDownload = (source: KnowledgeSource) => {
    console.log('Downloading:', source.name);
    toast({
      title: "Download started",
      description: `Downloading ${source.name}...`,
    });
  };

  const handleDelete = async (source: KnowledgeSource) => {
    console.log('Deleting:', source.name);
    
    try {
      await deleteKnowledgeBase(source.id);
      setSources(prev => prev.filter(s => s.id !== source.id));
      toast({
        title: "Success",
        description: `${source.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the knowledge source.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Knowledge Base</h1>
            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              {sources.length} sources
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ModernButton variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </ModernButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <DropdownMenuItem onClick={toggleTheme} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Switch to Dark
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Switch to Light
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ModernButton onClick={() => navigate('/knowledge/upload')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge Source
            </ModernButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder="Search knowledge sources..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ModernButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </ModernButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                All Sources
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('ready')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                Ready
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('training')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                Training
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('error')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                Error
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ModernButton variant="outline">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </ModernButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <DropdownMenuItem onClick={() => setSortBy('name')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('updated')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                Last Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                Size
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Knowledge Sources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedSources.length === 0 ? (
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matches found' : 'No knowledge sources yet'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first knowledge source to build your knowledge base'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <ModernButton onClick={() => navigate('/knowledge/upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Source
                </ModernButton>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedSources.map((source) => (
              <Card key={source.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                        {getSourceIcon(source.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {source.name}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          {source.type === 'website' ? 'Website' : 
                           source.type === 'docs' ? 'Documents' :
                           source.type === 'csv' ? 'Spreadsheet' :
                           source.type === 'plain_text' ? 'Plain Text' :
                           source.type}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <ModernButton
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => handleDownload(source)}
                      >
                        <Download className="h-4 w-4" />
                      </ModernButton>
                      
                      <ModernButton
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => handleDelete(source)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ModernButton>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Size</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{source.size}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Updated</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{source.lastUpdated}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                      {getStatusBadge(source.status)}
                    </div>
                    
                    {source.metadata?.website && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{source.metadata.website}</span>
                        </div>
                      </div>
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
