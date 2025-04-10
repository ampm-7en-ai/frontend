
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, ChevronRight, FileSpreadsheet, FileText, Globe, MoreHorizontal, Plus, Search, Trash, Upload, File, Download, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo, deleteKnowledgeSource, deleteKnowledgeBase, addFileToKnowledgeBase } from '@/utils/api-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StatCard } from '@/components/dashboard/StatCard';

// Define a custom event for knowledge base updates
const KNOWLEDGE_BASE_UPDATED_EVENT = 'knowledgeBaseUpdated';

// Custom event interface
interface KnowledgeBaseUpdatedEvent extends CustomEvent {
  detail: {
    knowledgeBase: any;
  };
}

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
  const [viewMode, setViewMode] = useState('main'); // 'main' or 'detail'
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState(Date.now());

  // Event listener for knowledge base updates
  useEffect(() => {
    const handleKnowledgeBaseUpdated = (event: KnowledgeBaseUpdatedEvent) => {
      console.log('Knowledge base updated event received:', event.detail);
      
      // Trigger a refresh of knowledge bases
      setLastRefreshTimestamp(Date.now());
      
      if (event.detail?.knowledgeBase) {
        // Append the new knowledge base to the existing list if it's not already there
        setKnowledgeBases(prevBases => {
          const existingBaseIndex = prevBases.findIndex(kb => kb.id === event.detail.knowledgeBase.id);
          if (existingBaseIndex >= 0) {
            // Update existing knowledge base
            const updatedBases = [...prevBases];
            updatedBases[existingBaseIndex] = event.detail.knowledgeBase;
            return updatedBases;
          } else {
            // Add new knowledge base
            return [...prevBases, event.detail.knowledgeBase];
          }
        });
      }
    };

    // Add event listener
    window.addEventListener(KNOWLEDGE_BASE_UPDATED_EVENT, handleKnowledgeBaseUpdated as EventListener);

    // Check for state passed from KnowledgeUpload component
    if (location.state?.newKnowledgeBase) {
      console.log('New knowledge base received from navigation state:', location.state.newKnowledgeBase);
      
      const newKnowledgeBase = location.state.newKnowledgeBase;
      
      // Dispatch custom event to update knowledge bases
      const event = new CustomEvent(KNOWLEDGE_BASE_UPDATED_EVENT, {
        detail: { knowledgeBase: newKnowledgeBase }
      });
      window.dispatchEvent(event);
      
      // Clear the location state to prevent duplicate handling
      window.history.replaceState({}, document.title);
    }

    // Cleanup
    return () => {
      window.removeEventListener(KNOWLEDGE_BASE_UPDATED_EVENT, handleKnowledgeBaseUpdated as EventListener);
    };
  }, [location.state]);

  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}?status=active&timestamp=${lastRefreshTimestamp}`, {
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

  // Modified to prevent automatic fetching on component mount and refresh when lastRefreshTimestamp changes
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['knowledgeBases', lastRefreshTimestamp],
    queryFn: fetchKnowledgeBases,
    enabled: shouldFetchData // Only fetch when explicitly enabled
  });

  // Function to manually load data when needed (e.g., when first viewing the page)
  const loadDataIfNeeded = () => {
    if (!data && !isLoading) {
      setShouldFetchData(true);
      setTimeout(() => {
        refetch();
      }, 0);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadDataIfNeeded();
  }, []);

  // Handle updates to data from query
  useEffect(() => {
    if (data) {
      setKnowledgeBases(data);
      
      if (selectedKnowledgeBase) {
        const updatedKnowledgeBase = data.find(kb => kb.id === selectedKnowledgeBase.id);
        if (updatedKnowledgeBase) {
          setSelectedKnowledgeBase(updatedKnowledgeBase);
        }
      }
    }
  }, [data, selectedKnowledgeBase]);

  // Function to manually refresh the knowledge base data
  const refreshKnowledgeBases = () => {
    console.log('Manually refreshing knowledge bases');
    setLastRefreshTimestamp(Date.now());
    queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    refetch();
  };

  // Expose a method for other components to trigger a refresh
  useEffect(() => {
    // Make refreshKnowledgeBases available globally
    window.refreshKnowledgeBases = refreshKnowledgeBases;
    
    return () => {
      // Clean up
      delete window.refreshKnowledgeBases;
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading knowledge bases",
        description: "There was a problem loading your knowledge bases. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const formatKnowledgeBaseData = (apiData) => {
    if (!apiData || apiData.length === 0) return [];

    return apiData.map(kb => {
      const firstSource = kb.knowledge_sources && kb.knowledge_sources.length > 0 
        ? kb.knowledge_sources[0] 
        : null;

      const metadataInfo = firstSource ? getSourceMetadataInfo({
        type: kb.type,
        metadata: firstSource.metadata
      }) : { count: '', size: 'N/A' };
      
      const uploadDate = firstSource && firstSource.metadata && firstSource.metadata.upload_date 
        ? formatDate(firstSource.metadata.upload_date) 
        : formatDate(kb.last_updated);

      const fileFormat = firstSource && firstSource.metadata && firstSource.metadata.format 
        ? firstSource.metadata.format 
        : 'N/A';

      const agentNames = kb.agents && kb.agents.length > 0
        ? kb.agents.map(agent => agent.name)
        : [];

      return {
        id: kb.id,
        title: kb.name,
        type: kb.type,
        sourceType: kb.type,
        fileFormat: fileFormat,
        size: metadataInfo.size,
        pages: metadataInfo.count,
        agents: agentNames,
        uploadedAt: uploadDate,
        provider: null,
        status: kb.status,
        trainingStatus: kb.training_status,
        knowledge_sources: kb.knowledge_sources || [],
        fileCount: kb.knowledge_sources ? kb.knowledge_sources.length : 0,
        metadata: firstSource?.metadata || {}
      };
    });
  };

  const documents = isLoading ? [] : formatKnowledgeBaseData(knowledgeBases);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = sourceTypeFilter === 'all' || doc.sourceType === sourceTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const knowledgeStats = useMemo(() => {
    if (isLoading || !documents.length) {
      return {
        totalSources: 0,
        documentSources: 0,
        documentFiles: 0,
        websiteSources: 0,
        spreadsheetSources: 0,
        spreadsheetFiles: 0,
        plainTextSources: 0,
        plainTextChars: 0
      };
    }

    const stats = {
      totalSources: documents.length || 0,
      documentSources: 0,
      documentFiles: 0,
      websiteSources: 0,
      spreadsheetSources: 0,
      spreadsheetFiles: 0,
      plainTextSources: 0,
      plainTextChars: 0
    };

    documents.forEach(source => {
      if (source.sourceType === 'docs') {
        stats.documentSources++;
        if (source.knowledge_sources) {
          stats.documentFiles += source.knowledge_sources.length;
        }
      } else if (source.sourceType === 'website') {
        stats.websiteSources++;
      } else if (source.sourceType === 'csv') {
        stats.spreadsheetSources++;
        if (source.knowledge_sources) {
          stats.spreadsheetFiles += source.knowledge_sources.length;
        }
      } else if (source.sourceType === 'plain_text') {
        stats.plainTextSources++;
        if (source.knowledge_sources && source.knowledge_sources[0]?.metadata?.no_of_chars) {
          stats.plainTextChars += parseInt(source.knowledge_sources[0].metadata.no_of_chars) || 0;
        }
      }
    });

    return stats;
  }, [documents, isLoading]);

  const canShowNestedView = (sourceType) => {
    return sourceType !== 'website' && sourceType !== 'plain_text';
  };

  const renderSourceIcon = (doc) => {
    switch (doc.sourceType) {
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'website':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case 'plain_text':
        return <File className="h-4 w-4 text-purple-600" />;
      case 'thirdparty':
        if (doc.provider === 'googleDrive') {
          return (
            <svg className="h-4 w-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
          );
        } else if (doc.provider === 'slack') {
          return (
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E01E5A">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.521-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
          );
        }
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getIconBackground = (doc) => {
    switch (doc.sourceType) {
      case 'docs':
        return 'bg-blue-100';
      case 'website':
        return 'bg-green-100';
      case 'csv':
        return 'bg-emerald-100';
      case 'plain_text':
        return 'bg-purple-100';
      case 'thirdparty':
        switch (doc.provider) {
          case 'googleDrive':
            return 'bg-blue-50';
          case 'slack':
            return 'bg-pink-50';
          default:
            return 'bg-gray-100';
        }
      default:
        return 'bg-gray-100';
    }
  };

  const getAgentColor = (agentName) => {
    if (!agentName || typeof agentName !== 'string') return 'bg-blue-500';
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500'];
    const charCode = agentName.charCodeAt(0) || 0;
    const index = Math.floor(charCode % colors.length);
    return colors[index];
  };

  const getAgentInitials = (agentName) => {
    if (!agentName || typeof agentName !== 'string') return '';
    return agentName.split(' ').map(n => n[0] || '').join('').toUpperCase();
  };

  const handleKnowledgeBaseClick = (doc) => {
    if (!canShowNestedView(doc.sourceType)) {
      toast({
        title: "Info",
        description: `${doc.sourceType === 'website' ? 'Website' : 'Plain text'} sources don't have nested files view.`
      });
      return;
    }
    
    setSelectedKnowledgeBase(doc);
    setViewMode('detail');
  };

  const handleBackToMainView = () => {
    setSelectedKnowledgeBase(null);
    setViewMode('main');
  };

  const getFileAcceptTypes = (sourceType) => {
    switch (sourceType) {
      case 'docs':
        return '.pdf,.docx,.txt';
      case 'csv':
        return '.csv,.xlsx,.xls';
      default:
        return '*';
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!selectedKnowledgeBase || !selectedKnowledgeBase.id) {
      toast({
        title: "Error",
        description: "Cannot upload file: No knowledge base selected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Uploading file...",
        description: "Please wait while the file is being uploaded."
      });
      
      await addFileToKnowledgeBase(selectedKnowledgeBase.id, file);
      
      toast({
        title: "Success",
        description: "File has been successfully uploaded."
      });
      
      await refetch();
      
      if (data) {
        const updatedKnowledgeBase = data.find(kb => kb.id === selectedKnowledgeBase.id);
        if (updatedKnowledgeBase) {
          setSelectedKnowledgeBase(updatedKnowledgeBase);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (sourceId: number) => {
    if (!sourceId) {
      toast({
        title: "Error",
        description: "Cannot delete file: Missing source ID",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Deleting file...",
        description: "Please wait while the file is being deleted."
      });

      await deleteKnowledgeSource(sourceId);
      
      toast({
        title: "Success",
        description: "File has been successfully deleted."
      });
      
      refreshKnowledgeBases();
      
      if (selectedKnowledgeBase && 
          selectedKnowledgeBase.knowledge_sources && 
          selectedKnowledgeBase.knowledge_sources.length === 1) {
        handleBackToMainView();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteKnowledgeBase = async (knowledgeBaseId: number) => {
    if (!knowledgeBaseId) {
      toast({
        title: "Error",
        description: "Cannot delete knowledge base: Missing ID",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Deleting knowledge base...",
        description: "Please wait while the knowledge base is being deleted."
      });

      await deleteKnowledgeBase(knowledgeBaseId);
      
      toast({
        title: "Success",
        description: "Knowledge base has been successfully deleted."
      });
      
      refreshKnowledgeBases();
    } catch (error) {
      console.error("Error deleting knowledge base:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting the knowledge base. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadFile = (file) => {
    if (!file || !file.file) {
      toast({
        title: "Download error",
        description: "No file URL available for download.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Downloading file",
      description: `Downloading file: ${file.title || 'Unnamed file'}`
    });
    
    try {
      window.open(file.file, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file.",
        variant: "destructive"
      });
    }
  };

  const getMetadataDisplay = (doc) => {
    if (doc.sourceType === 'website') {
      const subUrls = doc.metadata?.sub_urls;
      const pagesCount = subUrls ? 
        (Array.isArray(subUrls?.children) ? subUrls.children.length : 0) : 
        0;
      const totalChars = subUrls ? subUrls.chars || 0 : 0;
      
      return (
        <div className="text-xs text-muted-foreground mt-0.5">
          {pagesCount} pages • {totalChars.toLocaleString()} characters
        </div>
      );
    } else if (doc.sourceType === 'plain_text') {
      const chars = doc.metadata?.no_of_chars || 0;
      
      return (
        <div className="text-xs text-muted-foreground mt-0.5">
          {chars.toLocaleString()} characters
        </div>
      );
    } else {
      return (
        <div className="text-xs text-muted-foreground mt-0.5">
          {doc.fileCount > 0 ? 
            `${doc.fileCount} ${doc.fileCount === 1 ? 'file' : 'files'}` : 
            'No files'
          }
        </div>
      );
    }
  };

  const getContentMeasure = (source) => {
    if (!source || !source.metadata) return "N/A";
    
    const format = source.metadata.format?.toLowerCase();
    
    if (format === 'csv' || format === 'xlsx' || format === 'xls') {
      return source.metadata.no_of_rows ? `${source.metadata.no_of_rows} rows` : "N/A";
    } else if (format === 'txt' || format === 'plain_text') {
      return source.metadata.no_of_chars ? `${source.metadata.no_of_chars.toLocaleString()} chars` : "N/A";
    } else if (format === 'pdf' || format === 'docx' || format === 'doc') {
      return source.metadata.no_of_pages ? `${source.metadata.no_of_pages} pages` : "N/A";
    }
    
    return source.metadata.no_of_pages || "N/A";
  };

  const renderMainView = () => {
    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Input 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10" 
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <Select 
              value={sourceTypeFilter} 
              onValueChange={setSourceTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="docs">Documents</SelectItem>
                <SelectItem value="website">Websites</SelectItem>
                <SelectItem value="csv">Spreadsheets</SelectItem>
                <SelectItem value="plain_text">Plain Text</SelectItem>
                <SelectItem value="thirdparty">Third Party</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild className="flex items-center gap-1">
              <Link to="/knowledge/upload">
                <Upload className="h-4 w-4" />
                Add Source
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <Layers className="h-4 w-4 text-primary" />
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : knowledgeStats.totalSources}</div>
              <div className="text-sm text-muted-foreground">All knowledge sources</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <Book className="h-4 w-4 text-blue-600" />
                Document Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : knowledgeStats.documentFiles}</div>
              <div className="text-sm text-muted-foreground">From {knowledgeStats.documentSources} sources</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <Globe className="h-4 w-4 text-green-600" />
                Websites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : knowledgeStats.websiteSources}</div>
              <div className="text-sm text-muted-foreground">URLs, Webpages</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Spreadsheet Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : knowledgeStats.spreadsheetFiles}</div>
              <div className="text-sm text-muted-foreground">From {knowledgeStats.spreadsheetSources} sources</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <FileText className="h-4 w-4 text-purple-600" />
                Plain Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "..." : knowledgeStats.plainTextSources}</div>
              <div className="text-sm text-muted-foreground">
                {knowledgeStats.plainTextChars > 0 ? 
                  `${knowledgeStats.plainTextChars.toLocaleString()} characters` : 
                  "Plain text files"}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading knowledge bases...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No knowledge sources found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || sourceTypeFilter !== 'all' ? 
                    'Try adjusting your search or filters' : 
                    'Get started by adding your first knowledge source'}
                </p>
                <Button asChild>
                  <Link to="/knowledge/upload">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Knowledge Source
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium" noWrap>
                        <div className="flex items-center gap-2">
                          <div className={`rounded-md p-1 mr-1 ${getIconBackground(doc)}`}>
                            {renderSourceIcon(doc)}
                          </div>
                          <div>
                            <div>{doc.title}</div>
                            {getMetadataDisplay(doc)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell noWrap>
                        <Badge variant="outline" className="capitalize">
                          {doc.sourceType}
                        </Badge>
                      </TableCell>
                      <TableCell noWrap>{doc.size}</TableCell>
                      <TableCell noWrap>{doc.uploadedAt}</TableCell>
                      <TableCell>
                        <div className="flex -space-x-2 overflow-hidden">
                          {doc.agents && doc.agents.length > 0 ? (
                            doc.agents.slice(0, 3).map((agent, index) => (
                              <TooltipProvider key={`${doc.id}-agent-${index}`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-6 w-6 border border-background">
                                      <AvatarFallback className={`text-[10px] ${getAgentColor(agent)}`}>
                                        {getAgentInitials(agent)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{agent}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground px-1">Not linked to any agents</span>
                          )}
                          {doc.agents && doc.agents.length > 3 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Avatar className="h-6 w-6 border border-background">
                                    <AvatarFallback className="text-[10px] bg-muted">
                                      +{doc.agents.length - 3}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{doc.agents.slice(3).join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-1">
                          {canShowNestedView(doc.sourceType) && (
                            <Button variant="ghost" size="icon" onClick={() => handleKnowledgeBaseClick(doc)}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteKnowledgeBase(doc.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  const renderDetailView = () => {
    if (!selectedKnowledgeBase) return null;

    return (
      <>
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleBackToMainView} className="cursor-pointer">Knowledge Sources</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedKnowledgeBase.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`rounded-md p-1 ${getIconBackground(selectedKnowledgeBase)}`}>
                  {renderSourceIcon(selectedKnowledgeBase)}
                </div>
                {selectedKnowledgeBase.title}
              </CardTitle>
              <CardDescription>
                {selectedKnowledgeBase.fileCount > 0 ? (
                  `${selectedKnowledgeBase.fileCount} ${selectedKnowledgeBase.fileCount === 1 ? 'file' : 'files'}`
                ) : (
                  'No files'
                )}
              </CardDescription>
            </div>
            <div>
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <Upload className="h-4 w-4" />
                Add File
              </Button>
              <input
                id="file-upload"
                type="file"
                accept={getFileAcceptTypes(selectedKnowledgeBase.sourceType)}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            {selectedKnowledgeBase.knowledge_sources?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No files found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a file to this knowledge source
                </p>
                <Button onClick={() => document.getElementById('file-upload').click()}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload File
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedKnowledgeBase.knowledge_sources?.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">
                        {source.file_name || source.id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {source.metadata?.format || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {source.metadata?.size ? formatFileSizeToMB(source.metadata.size) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getContentMeasure(source)}
                      </TableCell>
                      <TableCell>
                        {source.metadata?.upload_date ? formatDate(source.metadata.upload_date) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-1">
                          {source.file && (
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(source)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteFile(source.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
      </div>
      {viewMode === 'main' ? renderMainView() : renderDetailView()}
    </div>
  );
};

export default KnowledgeBase;

// Add the window interface extension
declare global {
  interface Window {
    refreshKnowledgeBases?: () => void;
  }
}
