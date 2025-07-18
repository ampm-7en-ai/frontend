import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, Search, FileText, Globe, Plus, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { knowledgeApi } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const FolderSources = () => {
  const { agentId } = useParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch sources for the agent's folder
  const { 
    data: folderData, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['folderSources', agentId],
    queryFn: async () => {
      // Dummy data for testing UI
      return {
        message: "Knowledge folder retrieved successfully",
        data: {
          folder_id: parseInt(agentId || '1'),
          folder_name: `Agent ${agentId} Knowledge Folder`,
          knowledge_sources: [
            {
              id: 5,
              url: "https://docs.company.com/api-guide",
              file: null,
              plain_text: null,
              google_drive_file_id: null,
              title: "API Documentation Guide",
              status: "active",
              agent_knowledge_folder: parseInt(agentId || '1'),
              parent_knowledge_source: null,
              metadata: {},
              owner: 1,
              is_selected: true,
              training_status: "Active",
              sub_urls: null
            },
            {
              id: 6,
              url: null,
              file: "http://localhost:8000/media/knowledge_sources/6_Company_Handbook.pdf",
              plain_text: null,
              google_drive_file_id: null,
              title: "Company Employee Handbook",
              status: "active",
              agent_knowledge_folder: parseInt(agentId || '1'),
              parent_knowledge_source: null,
              metadata: {
                format: "pdf",
                file_size: "2456789B",
                no_of_rows: null,
                no_of_chars: 125000,
                no_of_pages: 45,
                upload_date: "2025-07-18T04:59:02.449302+00:00"
              },
              owner: 1,
              is_selected: true,
              training_status: "Active",
              sub_urls: null
            },
            {
              id: 7,
              url: "https://support.company.com/faq",
              file: null,
              plain_text: null,
              google_drive_file_id: null,
              title: "Customer Support FAQ",
              status: "training",
              agent_knowledge_folder: parseInt(agentId || '1'),
              parent_knowledge_source: null,
              metadata: {},
              owner: 1,
              is_selected: false,
              training_status: "Training in progress",
              sub_urls: null
            },
            {
              id: 8,
              url: null,
              file: null,
              plain_text: "This is sample plain text content that was directly entered into the knowledge base system for testing purposes.",
              google_drive_file_id: null,
              title: "Sample Plain Text Entry",
              status: "failed",
              agent_knowledge_folder: parseInt(agentId || '1'),
              parent_knowledge_source: null,
              metadata: {
                no_of_chars: 115,
                upload_date: "2025-07-17T12:30:15.123456+00:00"
              },
              owner: 1,
              is_selected: false,
              training_status: "Training failed",
              sub_urls: null
            }
          ]
        },
        status: "success"
      };
    },
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const sources = folderData?.data?.knowledge_sources || [];
  const folderName = folderData?.data?.folder_name || 'Unknown Folder';

  const filteredSources = sources.filter(source => 
    source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const renderSourceIcon = (source) => {
    if (source.file) {
      return <FileText className="h-4 w-4 text-white" />;
    } else if (source.url) {
      return <Globe className="h-4 w-4 text-white" />;
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
      'pending': { label: 'Pending', variant: 'secondary' },
    };

    const config = statusConfig[status?.toLowerCase()] || { label: 'Unknown', variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFileInfo = (source) => {
    if (source.metadata) {
      const { format, file_size, no_of_pages } = source.metadata;
      const parts = [];
      
      if (format) parts.push(format.toUpperCase());
      if (file_size) parts.push(`${Math.round(parseInt(file_size) / 1024)} KB`);
      if (no_of_pages) parts.push(`${no_of_pages} pages`);
      
      return parts.join(' • ');
    }
    return '';
  };

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Error loading knowledge sources</h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading the knowledge sources for this folder.
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/knowledge">Knowledge Folders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{folderName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/knowledge">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Folders
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{folderName}</h1>
              <p className="text-muted-foreground">Knowledge sources for Agent {agentId}</p>
            </div>
          </div>
          <Button 
            className="gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Sources
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border border-border/50 bg-card/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted/50 animate-pulse"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-muted/50 rounded animate-pulse w-1/3"></div>
                        <div className="h-3 bg-muted/30 rounded animate-pulse w-1/2"></div>
                        <div className="h-3 bg-muted/30 rounded animate-pulse w-1/4"></div>
                      </div>
                      <div className="w-16 h-6 bg-muted/30 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {sources.length === 0 ? 'No knowledge sources found' : 'No sources match your search'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {sources.length === 0 
                  ? 'This folder doesn\'t have any knowledge sources yet.'
                  : 'Try adjusting your search query.'
                }
              </p>
              {sources.length === 0 && (
                <Button
                  className="gap-2"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Knowledge Sources
                </Button>
              )}
            </div>
          ) : (
            filteredSources.map((source, index) => (
              <Card 
                key={source.id} 
                className="group border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-border transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${getIconBackground(source)} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      {renderSourceIcon(source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                            {source.title}
                          </h3>
                          {source.file && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {source.file.split('/').pop()}
                            </p>
                          )}
                          {source.url && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {source.url}
                            </p>
                          )}
                          {source.plain_text && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Plain text content
                            </p>
                          )}
                          {getFileInfo(source) && (
                            <p className="text-xs text-muted-foreground/80 mt-2">
                              {getFileInfo(source)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(source.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            Selected: {source.is_selected ? 'Yes' : 'No'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                          <span className="text-xs text-muted-foreground">
                            ID: {source.id}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {source.training_status}
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

      {/* Add Sources Modal */}
      <AddSourcesModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        agentId={agentId || ''}
        onSuccess={() => {
          refetch(); // Refresh the sources list
        }}
      />
    </div>
  );
};

export default FolderSources;