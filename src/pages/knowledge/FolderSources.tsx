import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ModernInput } from '@/components/ui/modern-input';
import ModernButton from '@/components/dashboard/ModernButton';
import { Search, FileText, Globe, Plus, ArrowLeft, MoreHorizontal, Download, Trash2, Database, File } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { knowledgeApi } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import KnowledgeStatsCard from '@/components/dashboard/KnowledgeStatsCard';
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
  const [typeFilter, setTypeFilter] = useState('all');
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
              metadata: {
                no_of_pages: 12,
                no_of_chars: 4041,
                upload_date: "2025-07-07T04:59:02.449302+00:00"
              },
              owner: 1,
              is_selected: true,
              training_status: "Active",
              sub_urls: null,
              type: 'website'
            },
            {
              id: 6,
              url: null,
              file: "http://localhost:8000/media/knowledge_sources/6_Company_Handbook.pdf",
              plain_text: null,
              google_drive_file_id: null,
              title: "payling-api-documentation.pdf",
              status: "active",
              agent_knowledge_folder: parseInt(agentId || '1'),
              parent_knowledge_source: null,
              metadata: {
                format: "pdf",
                file_size: "12.3 KB",
                no_of_rows: null,
                no_of_chars: 125000,
                no_of_pages: 4,
                upload_date: "2025-07-18T04:59:02.449302+00:00"
              },
              owner: 1,
              is_selected: true,
              training_status: "Active",
              sub_urls: null,
              type: 'document'
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
              metadata: {
                no_of_pages: 8,
                no_of_chars: 2340,
                upload_date: "2025-07-15T12:30:15.123456+00:00"
              },
              owner: 1,
              is_selected: false,
              training_status: "Training in progress",
              sub_urls: null,
              type: 'website'
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
              sub_urls: null,
              type: 'plain_text'
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

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.url?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'documents' && source.type === 'document') ||
      (typeFilter === 'websites' && source.type === 'website') ||
      (typeFilter === 'spreadsheets' && source.type === 'spreadsheet') ||
      (typeFilter === 'plain_text' && source.type === 'plain_text') ||
      (typeFilter === 'third_party' && source.type === 'third_party');
    
    return matchesSearch && matchesType;
  });

  const typeFilterOptions = [
    { value: 'all', label: 'All Sources', description: 'Show all source types' },
    { value: 'documents', label: 'Documents', description: 'PDFs, Word docs, etc.' },
    { value: 'websites', label: 'Websites', description: 'Web pages and URLs' },
    { value: 'spreadsheets', label: 'Spreadsheets', description: 'Excel, CSV files' },
    { value: 'plain_text', label: 'Plain Text', description: 'Text content' },
    { value: 'third_party', label: 'Third Party', description: 'External integrations' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const renderSourceIcon = (source) => {
    if (source.file || source.type === 'document') {
      return <FileText className="h-4 w-4 text-white" />;
    } else if (source.url || source.type === 'website') {
      return <Globe className="h-4 w-4 text-white" />;
    } else if (source.type === 'spreadsheet') {
      return <Database className="h-4 w-4 text-white" />;
    }
    return <File className="h-4 w-4 text-white" />;
  };

  const getIconBackground = (source) => {
    if (source.file || source.type === 'document') {
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    } else if (source.url || source.type === 'website') {
      return 'bg-gradient-to-br from-green-500 to-green-600';
    } else if (source.type === 'spreadsheet') {
      return 'bg-gradient-to-br from-purple-500 to-purple-600';
    }
    return 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Active', variant: 'success' },
      'training': { label: 'Training', variant: 'waiting' },
      'failed': { label: 'Failed', variant: 'destructive' },
      'pending': { label: 'Pending', variant: 'secondary' },
    };

    const config = statusConfig[status?.toLowerCase()] || { label: 'Unknown', variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFileInfo = (source) => {
    if (source.metadata) {
      const { format, file_size, no_of_pages, no_of_chars } = source.metadata;
      const parts = [];
      
      if (no_of_pages) parts.push(`${no_of_pages} pages`);
      if (no_of_chars) parts.push(`${no_of_chars.toLocaleString()} characters`);
      if (file_size) parts.push(file_size);
      if (format && !no_of_pages && !no_of_chars && !file_size) parts.push(format.toUpperCase());
      
      return parts.join(' • ');
    }
    return '';
  };

  const handleDownload = (source) => {
    if (source.file) {
      window.open(source.file, '_blank');
    } else {
      toast({
        title: "Download not available",
        description: "This source doesn't have a downloadable file.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (source) => {
    toast({
      title: "Delete confirmation",
      description: `Are you sure you want to delete "${source.title}"?`,
    });
  };

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Error loading knowledge sources</h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading the knowledge sources for this folder.
          </p>
          <ModernButton onClick={() => refetch()}>Try Again</ModernButton>
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">{folderName}</h1>
              <p className="text-muted-foreground">Knowledge sources for Agent {agentId}</p>
            </div>
          </div>
          <ModernButton 
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Sources
          </ModernButton>
        </div>

        {/* Knowledge Stats Card */}
        <div className="mb-6">
          <KnowledgeStatsCard sources={sources} />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl h-11 flex w-full px-4 py-3 text-sm transition-all duration-200 border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80 pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <ModernDropdown
              value={typeFilter}
              onValueChange={setTypeFilter}
              options={typeFilterOptions}
              placeholder="All Sources"
              className="w-full"
              searchable={false}
            />
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-card-foreground bg-white dark:bg-slate-800 rounded-xl overflow-hidden border-0 shadow-none px-2 animate-pulse">
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-7 h-7 rounded-xl bg-muted/50"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-muted/50 rounded w-1/3 mb-1"></div>
                          <div className="h-3 bg-muted/30 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="w-16 h-6 bg-muted/30 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {sources.length === 0 ? 'No knowledge sources found' : 'No sources match your filter'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {sources.length === 0 
                  ? 'This folder doesn\'t have any knowledge sources yet.'
                  : 'Try adjusting your search query or filter settings.'
                }
              </p>
              {sources.length === 0 && (
                <ModernButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Knowledge Sources
                </ModernButton>
              )}
            </div>
          ) : (
            filteredSources.map((source, index) => (
              <div 
                key={source.id}
                className="text-card-foreground bg-white dark:bg-slate-800 rounded-xl overflow-hidden border-0 shadow-none px-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-1.5 rounded-xl ${getIconBackground(source)}`}>
                        {renderSourceIcon(source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate transition-colors duration-200">
                            {source.title}
                          </h3>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {getFileInfo(source) || (source.url ? 'Web URL' : 'Plain text')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center px-4 min-w-0">
                      {getStatusBadge(source.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                          {formatDate(source.metadata?.upload_date)}
                        </span>
                      </div>
                      {source.file && (
                        <ModernButton
                          variant="ghost"
                          size="sm"
                          icon={Download}
                          iconOnly={true}
                          className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(source);
                          }}
                        />
                      )}
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        iconOnly={true}
                        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(source);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
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
