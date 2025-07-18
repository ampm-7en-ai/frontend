import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book, ChevronRight, Search, Bot, FolderOpen, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { knowledgeApi } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAppTheme } from '@/hooks/useAppTheme';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useAppTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('main'); // 'main' or 'detail'
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderSources, setFolderSources] = useState([]);

  // Fetch all knowledge folders
  const { 
    data: folders, 
    isLoading: foldersLoading, 
    error: foldersError 
  } = useQuery({
    queryKey: ['knowledgeFolders'],
    queryFn: async () => {
      // Dummy data for testing UI
      return {
        message: "List of AgentKnowledgeFolders for your team owner",
        data: [
          {
            id: 1,
            name: "Marketing Agent Knowledge",
            agent: 1,
            owner: 1,
            created_at: "2025-07-17T11:14:41.680411Z",
            updated_at: "2025-07-17T11:14:41.680411Z"
          },
          {
            id: 2,
            name: "Customer Support Bot",
            agent: 2,
            owner: 1,
            created_at: "2025-07-16T09:30:15.123456Z",
            updated_at: "2025-07-18T14:22:33.987654Z"
          },
          {
            id: 3,
            name: "Sales Assistant AI",
            agent: 3,
            owner: 1,
            created_at: "2025-07-15T16:45:22.555777Z",
            updated_at: "2025-07-18T10:15:44.111222Z"
          },
          {
            id: 4,
            name: "Product Documentation Helper",
            agent: 4,
            owner: 1,
            created_at: "2025-07-14T08:20:11.333444Z",
            updated_at: "2025-07-17T13:55:28.666888Z"
          }
        ],
        status: "success"
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch sources for selected folder
  const { 
    data: folderData, 
    isLoading: sourcesLoading,
    refetch: refetchSources
  } = useQuery({
    queryKey: ['folderSources', selectedFolder?.agent],
    queryFn: () => knowledgeApi.folders.getSourcesForAgent(selectedFolder?.agent?.toString()),
    enabled: !!selectedFolder?.agent,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (folderData?.data?.knowledge_sources) {
      setFolderSources(folderData.data.knowledge_sources);
    }
  }, [folderData]);

  const filteredFolders = folders?.data?.filter((folder: any) => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getAgentInitials = (agentName) => {
    if (!agentName || typeof agentName !== 'string') return 'A';
    return agentName.split(' ').map(n => n[0] || '').join('').toUpperCase();
  };

  const handleFolderClick = async (folder) => {
    setSelectedFolder(folder);
    setViewMode('detail');
  };

  const handleBackToMainView = () => {
    setSelectedFolder(null);
    setFolderSources([]);
    setViewMode('main');
  };

  const renderSourceIcon = (source) => {
    if (source.file) {
      return <FileText className="h-4 w-4 text-white" />;
    } else if (source.url) {
      return <FolderOpen className="h-4 w-4 text-white" />;
    }
    return <FileText className="h-4 w-4 text-white" />;
  };

  const getIconBackground = (source) => {
    if (source.file) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    } else if (source.url) {
      return 'bg-gradient-to-br from-green-500 to-green-600';
    }
    return 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Active', variant: 'success' },
      'training': { label: 'Training', variant: 'warning' },
      'failed': { label: 'Failed', variant: 'destructive' },
    };

    const config = statusConfig[status?.toLowerCase()] || { label: 'Unknown', variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderMainView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Folders</h1>
          <p className="text-muted-foreground">Manage your agent-specific knowledge folders</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {foldersLoading ? (
          // Loading state
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredFolders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No knowledge folders found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query.' : 'Create an agent to get started with knowledge folders.'}
            </p>
          </div>
        ) : (
          filteredFolders.map((folder) => (
            <Card 
              key={folder.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">Agent ID: {folder.agent}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Created: {formatDate(folder.created_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderDetailView = () => (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBackToMainView} className="gap-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Folders
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{selectedFolder?.name}</h1>
          <p className="text-muted-foreground">Knowledge sources for this folder</p>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sourcesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading sources...</p>
          </div>
        ) : folderSources.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No knowledge sources found</h3>
            <p className="text-muted-foreground mb-4">
              This folder doesn't have any knowledge sources yet.
            </p>
            <Link to={`/knowledge/sources/${selectedFolder?.agent}`}>
              <Button>View Knowledge Sources</Button>
            </Link>
          </div>
        ) : (
          folderSources.map((source) => (
            <Card key={source.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getIconBackground(source)} flex items-center justify-center flex-shrink-0`}>
                    {renderSourceIcon(source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{source.title}</h3>
                    {source.file && (
                      <p className="text-sm text-muted-foreground">File: {source.file.split('/').pop()}</p>
                    )}
                    {source.url && (
                      <p className="text-sm text-muted-foreground">URL: {source.url}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(source.status)}
                      <span className="text-xs text-muted-foreground">
                        Training: {source.training_status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>
              {viewMode === 'main' ? 'Knowledge Folders' : selectedFolder?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {viewMode === 'main' ? renderMainView() : renderDetailView()}
    </div>
  );
};

export default KnowledgeBase;