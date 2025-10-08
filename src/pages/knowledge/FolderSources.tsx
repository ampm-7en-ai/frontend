import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ModernInput } from '@/components/ui/modern-input';
import ModernButton from '@/components/dashboard/ModernButton';
import { Search, FileText, Globe, Plus, ArrowLeft, MoreHorizontal, Download, Trash2, Database, File, FileSpreadsheet, Layers, Eye, Link2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import AddSourcesModal from '@/components/agents/knowledge/AddSourcesModal';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import KnowledgeStatsCard from '@/components/dashboard/KnowledgeStatsCard';
import { ModernModal } from '@/components/ui/modern-modal';
import PlainTextViewerModal from '@/components/agents/knowledge/PlainTextViewerModal';
import UrlsViewerModal from '@/components/agents/knowledge/UrlsViewerModal';
import { Icon } from '@/components/icons';

const FolderSources = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<any>(null);
  const [plainTextViewerOpen, setPlainTextViewerOpen] = useState(false);
  const [selectedPlainTextSource, setSelectedPlainTextSource] = useState<any>(null);
  const [urlsViewerOpen, setUrlsViewerOpen] = useState(false);
  const [selectedUrlsSource, setSelectedUrlsSource] = useState<any>(null);

  // Fetch sources for the agent's folder
  const { 
    data: folderData, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['folderSources', agentId],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}agents/${agentId}/knowledge-folder/`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge sources');
      }

      const data = await response.json();
      console.log('Folder API response:', data);
      
      return data;
    },
    enabled: !!agentId,
    staleTime: 1 * 60 * 1000,
    gcTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Handle different possible data structures and filter out deleted sources
  const sources = (folderData?.data?.knowledge_sources?.knowledge_sources || 
                  folderData?.data?.knowledge_sources || 
                  folderData?.knowledge_sources || 
                  []).filter(source => source.status !== 'Deleted');
  
  const folderName = folderData?.data?.folder_name || `Agent ${agentId} Knowledge Sources`;

  const filteredSources = sources.filter ? sources.filter(source => {
    const matchesSearch = source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.url?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'docs' && source.type === 'docs') ||
      (typeFilter === 'website' && source.type === 'website') ||
      (typeFilter === 'csv' && source.type === 'csv') ||
      (typeFilter === 'plain_text' && source.type === 'plain_text') ||
      (typeFilter === 'third_party' && source.type === 'custom');
    
    return matchesSearch && matchesType;
  }) : [];

  const typeFilterOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'docs', label: 'Documents' },
    { value: 'website', label: 'Websites' },
    { value: 'csv', label: 'Spreadsheets' },
    { value: 'plain_text', label: 'Plain Text' },
    { value: 'third_party', label: 'Third Party' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const renderSourceIcon = (source) => {
    
    if(source.type === 'custom') {
      const { mimeType, size} = source.metadata;
      switch (mimeType) {
        case 'application/vnd.google-apps.document':
          return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
        case 'application/vnd.google-apps.spreadsheet':
          return <Icon name="SheetFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
        default:
          return <File className="h-4 w-4 text-white" />;
          }
    }else {
        switch (source.type) {
          case 'docs':
            return <Icon name="TextFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'website':
            return <Icon name="WebPage" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'csv':
            return <Icon name="SheetFile" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'plain_text':
            return <Icon name="Typing" type='plain' color='hsl(var(--primary))' className="h-5 w-5" />;
          case 'third_party':
            return <Layers className="h-4 w-4 text-white" />;
          default:
            return <File className="h-4 w-4 text-white" />;
        }
    }
  };

  const getIconBackground = (source) => {
    return 'bg-transparent';
    switch (source.type) {
      case 'docs':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'website':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'csv':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'plain_text':
        return 'bg-gradient-to-br from-orange-500 to-orange-600';
      case 'third_party':
        return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Active', className: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
      'success': { label: 'Trained', className: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/60 dark:text-blue-400 dark:border-blue-700' },
      'failed': { label: 'Failed', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'deleted': { label: 'Deleted', className: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
      'pending' : { label: 'Pending', className: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' },
    };

    const config = statusConfig[status?.toLowerCase()] || { label: 'Unknown', className: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' };
    return <Badge className={`${config.className} text-xs font-medium`}>{config.label}</Badge>;
  };

  const getFileInfo = (source) => {

    if (source.metadata) {
      if(source.type === 'custom') {
        const { mimeType, size} = source.metadata;
        const parts = [];
      
        if (mimeType) parts.push(`${mimeType}`);
        if (size) parts.push(`${(size/1024).toFixed(2)} KB`);
         return parts.join(' • ');
      }else {
        const { format, file_size, no_of_pages, no_of_chars } = source.metadata;
        const parts = [];
      
        if (no_of_pages) parts.push(`${no_of_pages} pages`);
        if(format === "url" && no_of_pages) return '';
        if (no_of_chars) parts.push(`${no_of_chars.toLocaleString()} characters`);
        if (file_size) parts.push(`${(file_size.slice(0,-1)/1024).toFixed(2)} KB`);
        if (format && !no_of_pages && !no_of_chars && !file_size) parts.push(format.toUpperCase());
         return parts.join(' • ');
        
      }
      
      
     
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

  const handleDeleteClick = (source) => {
    setSourceToDelete(source);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete) return;

    try {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}knowledgesource/${sourceToDelete.id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }

      toast({
        title: "Knowledge source deleted",
        description: `"${sourceToDelete.title}" has been successfully deleted.`,
      });

      refetch();
    } catch (error) {
      console.error('Error deleting knowledge source:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the knowledge source.",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSourceToDelete(null);
    }
  };

  const handleBack = () => {
    navigate('/knowledge');
  };

  const handleViewPlainText = (source) => {
    setSelectedPlainTextSource(source);
    setPlainTextViewerOpen(true);
  };

  const renderUrls = (urls: string[], source: any) => {
    if (!urls || urls.length === 0) return null;
    
    return (
      <>
        <span 
        onClick={() => {
            setSelectedUrlsSource(source);
            setUrlsViewerOpen(true);
          }}
        className="text-xs text-black dark:text-white cursor-pointer">
          {urls.length} URL{urls.length !== 1 ? 's' : ''}
        </span>
        
      </>
    );
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
      {/* Back Button */}
      <div className="mb-6">
        <ModernButton
          variant="outline"
          icon={ArrowLeft}
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground"
          size='sm'
        >
          Back
        </ModernButton>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">          
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{folderName}</h1>
              <p className="text-muted-foreground">Knowledge sources</p>
            </div>
          </div>
          <ModernButton 
            variant="primary"
            icon={Plus}
            size='sm'
            onClick={() => setIsAddModalOpen(true)}
          >
            Add
          </ModernButton>
        </div>

        {/* Knowledge Stats Card */}
        <div className="mb-6">
          <KnowledgeStatsCard sources={sources} />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -tranneutral-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 rounded-xl h-10 flex w-full px-4 py-3 text-sm transition-all duration-200 border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-neutral-300/80 dark:hover:border-neutral-500/80 pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <ModernDropdown
              value={typeFilter}
              onValueChange={setTypeFilter}
              options={typeFilterOptions}
              placeholder="All Sources"
              className="w-full h-10"
              searchable={false}
              showSearch={false}
            />
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/50 dark:bg-neutral-700/50 rounded-xl p-4 border border-neutral-200/50 dark:border-0 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-xl"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-5 h-5 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <Icon name={`TextFile`} type='plain' color='hsl(var(--primary))' className='w-8 h-8' />
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
                className="bg-white/50 dark:bg-neutral-800/70 rounded-xl p-4 hover:bg-white transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center ${getIconBackground(source.type === 'custom' ? {...source,type:'docs'} : source )}`}>
                      {renderSourceIcon( source )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {source.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed">
                      {getFileInfo(source) || (source.urls ? renderUrls(source.urls, source) : 'Plain text')} • {formatDate(source?.metadata?.upload_date)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {source.type === 'custom' && source.metadata && (
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        iconOnly={true}
                        className="h-10 w-10 hover:bg-blue-100 dark:hover:bg-neutral-900/20 rounded-lg hover:text-neutral-600"
                        onClick={(e) => window.open(source.metadata.webViewLink, '_blank', 'noopener,noreferrer')
                        }
                      />
                    )}
                    {source.type === 'plain_text' && source.plain_text && (
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        iconOnly={true}
                        className="h-10 w-10 hover:bg-neutral-100 dark:hover:bg-neutral-900/20 rounded-lg hover:text-neutral-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPlainText(source);
                        }}
                      />
                    )}
                    {source.file && (
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        icon={Download}
                        iconOnly={true}
                        className="h-10 w-10 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg"
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
                      className="h-10 w-10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg hover:!text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(source);
                      }}
                    />
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

      {/* Delete Confirmation Modal */}
      <ModernModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Knowledge Source"
        description={`Are you sure you want to delete "${sourceToDelete?.title}"? This action cannot be undone.`}
        size="md"
        type='alert'
        footer={
          <div className="flex gap-3">
            <ModernButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </ModernButton>
            <ModernButton 
              variant="primary" 
              onClick={handleDeleteConfirm}
              className="!bg-red-600 hover:!bg-red-700 focus:ring-red-600 !text-white"
            >
              Delete
            </ModernButton>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-muted-foreground dark:text-muted-foreground">
            This will permanently remove the knowledge source from your agent.
          </p>
        </div>
      </ModernModal>

      {/* Plain Text Viewer Modal */}
      {selectedPlainTextSource && (
        <PlainTextViewerModal
          open={plainTextViewerOpen}
          onOpenChange={setPlainTextViewerOpen}
          title={selectedPlainTextSource.title}
          content={selectedPlainTextSource.plain_text || ''}
        />
      )}

      {/* URLs Viewer Modal */}
      {selectedUrlsSource && (
        <UrlsViewerModal
          open={urlsViewerOpen}
          onOpenChange={setUrlsViewerOpen}
          urls={selectedUrlsSource.urls || []}
          title={selectedUrlsSource.title}
        />
      )}
    </div>
  );
};

export default FolderSources;
