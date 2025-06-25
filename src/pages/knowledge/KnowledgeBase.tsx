import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, ChevronRight, FileSpreadsheet, FileText, Globe, MoreHorizontal, Plus, Search, Trash, Upload, File, Download, Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { getNewKnowledgeBase, clearNewKnowledgeBase, hasNewKnowledgeBase } from '@/utils/knowledgeStorage';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
  const [viewMode, setViewMode] = useState('main'); // 'main' or 'detail'
  const [hasProcessedLocalStorage, setHasProcessedLocalStorage] = useState(false);

  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Fetching knowledge bases from API');
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}?status=active&status=issues`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  useEffect(() => {
    if (data && !hasProcessedLocalStorage) {
      // Check if there's a newly added knowledge base in localStorage
      const newKnowledgeBase = getNewKnowledgeBase();
      
      if (newKnowledgeBase) {
        console.log('Found new knowledge base in localStorage:', newKnowledgeBase.id);
        
        // Check if this knowledge base already exists in our data
        const exists = data.some(kb => kb.id === newKnowledgeBase.id);
        
        if (!exists) {
          // Add the new knowledge base to our existing data
          const updatedData = [newKnowledgeBase, ...data];
          setKnowledgeBases(updatedData);
          console.log('Added new knowledge base from localStorage');
          
          // Update the React Query cache with the new data
          queryClient.setQueryData(['knowledgeBases'], updatedData);
        }
        
        // Clear the storage to prevent adding it multiple times
        clearNewKnowledgeBase();
      } else {
        setKnowledgeBases(data);
      }
      
      setHasProcessedLocalStorage(true);
    }
  }, [data, hasProcessedLocalStorage, queryClient]);

  useEffect(() => {
    if (data && hasProcessedLocalStorage) {
      // Only update if we've already processed localStorage data
      // This prevents overwriting our merged data on subsequent renders
      setKnowledgeBases(data);
      
      if (selectedKnowledgeBase) {
        const updatedKnowledgeBase = data.find(kb => kb.id === selectedKnowledgeBase.id);
        if (updatedKnowledgeBase) {
          setSelectedKnowledgeBase(updatedKnowledgeBase);
        }
      }
    }
  }, [data, selectedKnowledgeBase, hasProcessedLocalStorage]);

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

  const filteredDocuments = isLoading ? [] : documents.filter(doc => {
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
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'website':
        return <Globe className="h-5 w-5 text-green-600" />;
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
      case 'plain_text':
        return <File className="h-5 w-5 text-purple-600" />;
      case 'thirdparty':
        if (doc.provider === 'googleDrive') {
          return (
            <svg className="h-5 w-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2-4.5h-27.502l5.852 11.5z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
          );
        } else if (doc.provider === 'slack') {
          return (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E01E5A">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.521-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
          );
        }
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getIconBackground = (doc) => {
    switch (doc.sourceType) {
      case 'docs':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200';
      case 'website':
        return 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200';
      case 'csv':
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200';
      case 'plain_text':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200';
      case 'thirdparty':
        switch (doc.provider) {
          case 'googleDrive':
            return 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200';
          case 'slack':
            return 'bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200';
          default:
            return 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200';
        }
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200';
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

  const handleDeleteFile = async (sourceId) => {
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
      
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
      
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

  const handleDeleteKnowledgeBase = async (knowledgeBaseId) => {
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
      
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
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
    const deletedFiles = doc.knowledge_sources.length > 0 ? doc.knowledge_sources.filter(source => source.status === "deleted").length : 0; 
    if (doc.sourceType === 'website') {
      const subUrls = doc.metadata?.sub_urls;
      const pagesCount = subUrls ? 
        (Array.isArray(subUrls?.children) ? subUrls.children.length : 0) : 
        0;
      const totalChars = subUrls ? subUrls.chars || 0 : 0;
      
      return (
        <div className="text-sm text-slate-500 mt-1 font-medium">
          {pagesCount} pages • {totalChars.toLocaleString()} characters
        </div>
      );
    } else if (doc.sourceType === 'plain_text') {
      const chars = doc.metadata?.no_of_chars || 0;
      
      return (
        <div className="text-sm text-slate-500 mt-1 font-medium">
          {chars.toLocaleString()} characters
        </div>
      );
    } else {
      return (
        <div className="text-sm text-slate-500 mt-1 font-medium">
          {doc.fileCount > 0 ? 
            `${doc.fileCount - deletedFiles} ${(doc.fileCount - deletedFiles) === 1 ? 'file' : 'files'}` : 
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Knowledge Base</h1>
              <p className="text-slate-600 text-lg">Manage your AI knowledge sources and content</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Input 
                  placeholder="Search knowledge sources..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full sm:w-80 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <Select 
                value={sourceTypeFilter} 
                onValueChange={setSourceTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-48 py-3 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500">
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
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3 rounded-xl font-semibold transition-all duration-200">
                <Link to="/knowledge/upload">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Source
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{isLoading ? "..." : knowledgeStats.totalSources}</div>
              <div className="text-sm text-slate-500 font-medium">All knowledge sources</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                  <Book className="h-5 w-5 text-blue-600" />
                </div>
                Document Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-1">{isLoading ? "..." : knowledgeStats.documentFiles}</div>
              <div className="text-sm text-blue-600 font-medium">From {knowledgeStats.documentSources} sources</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                Websites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-1">{isLoading ? "..." : knowledgeStats.websiteSources}</div>
              <div className="text-sm text-green-600 font-medium">URLs, Webpages</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                Spreadsheet Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 mb-1">{isLoading ? "..." : knowledgeStats.spreadsheetFiles}</div>
              <div className="text-sm text-emerald-600 font-medium">From {knowledgeStats.spreadsheetSources} sources</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                Plain Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-1">{isLoading ? "..." : knowledgeStats.plainTextSources}</div>
              <div className="text-sm text-purple-600 font-medium">
                {knowledgeStats.plainTextChars > 0 ? 
                  `${knowledgeStats.plainTextChars.toLocaleString()} characters` : 
                  "Plain text files"}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Knowledge Sources Table */}
        <Card className="bg-white border-slate-200 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                <span className="ml-4 text-slate-600 font-medium">Loading knowledge bases...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-6">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No knowledge sources found</h3>
                <p className="text-slate-500 mb-6 text-center max-w-md">
                  {searchQuery || sourceTypeFilter !== 'all' ? 
                    "Try adjusting your search or filter criteria" : 
                    "Get started by adding your first knowledge source"}
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3 rounded-xl font-semibold">
                  <Link to="/knowledge/upload">
                    <Upload className="h-5 w-5 mr-2" />
                    Add Source
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Knowledge Source</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Agents</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Upload Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc, index) => (
                      <TableRow key={doc.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                        <TableCell className="py-4 px-6">
                          <div 
                            className={`flex items-center gap-4 ${canShowNestedView(doc.sourceType) ? 'cursor-pointer hover:text-blue-600 transition-colors duration-150' : ''}`}
                            onClick={() => canShowNestedView(doc.sourceType) && handleKnowledgeBaseClick(doc)}
                          >
                            <div className={`p-3 rounded-xl ${getIconBackground(doc)} shadow-sm`}>
                              {renderSourceIcon(doc)}
                            </div>
                            <div className="flex flex-col">
                              <span className={`font-semibold text-slate-900 ${canShowNestedView(doc.sourceType) ? 'hover:underline' : ''}`}>
                                {doc.title}
                              </span>
                              {getMetadataDisplay(doc)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="font-semibold text-xs px-3 py-1 rounded-full border-2">
                            {doc.sourceType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center">
                            {doc.agents && doc.agents.length > 0 ? (
                              <>
                                <div className="flex -space-x-2">
                                  {doc.agents.slice(0, 3).map((agentName, idx) => (
                                    <TooltipProvider key={`${doc.id}-agent-${idx}`}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Avatar className="h-9 w-9 border-3 border-white shadow-md">
                                            <AvatarFallback className={`${getAgentColor(agentName)} text-white text-xs font-semibold`}>
                                              {getAgentInitials(agentName)}
                                            </AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="font-medium">{agentName}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                                {doc.agents.length > 3 && (
                                  <Badge variant="secondary" className="ml-3 text-xs font-semibold px-2 py-1 rounded-full">
                                    +{doc.agents.length - 3}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-slate-400 font-medium">No agents</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-slate-600 font-medium">{doc.uploadedAt}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-lg">
                                <MoreHorizontal className="h-5 w-5 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-lg border border-slate-200 rounded-xl">
                              <DropdownMenuItem 
                                className="flex items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer py-2 px-3 rounded-lg"
                                onClick={() => handleDeleteKnowledgeBase(doc.id)}
                              >
                                <Trash className="h-4 w-4" />
                                Delete Source
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDetailView = () => {
    if (!selectedKnowledgeBase) return null;

    const knowledgeSources = selectedKnowledgeBase.knowledge_sources.filter(source => source.status !== "deleted") || [];
    const sourceType = selectedKnowledgeBase.sourceType || selectedKnowledgeBase.type || "unknown";
    
    const formattedSourceType = sourceType.charAt(0).toUpperCase() + sourceType.slice(1);

    return (
      <div className="space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button 
                    onClick={handleBackToMainView} 
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors duration-150"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Knowledge Sources
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-900 font-semibold">
                  {selectedKnowledgeBase.title || selectedKnowledgeBase.name || "Untitled Knowledge Base"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${getIconBackground({sourceType: sourceType})} shadow-lg`}>
                {renderSourceIcon({sourceType: sourceType})}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {selectedKnowledgeBase.title || selectedKnowledgeBase.name || "Untitled Knowledge Base"}
                </h2>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-semibold text-sm px-3 py-1 rounded-full border-2">
                    {formattedSourceType}
                  </Badge>
                  <span className="text-slate-600 font-medium">
                    {knowledgeSources ? 
                      `${knowledgeSources.length} ${knowledgeSources.length === 1 ? 'file' : 'files'}` : 
                      "0 files"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3 rounded-xl font-semibold relative overflow-hidden transition-all duration-200">
                <input 
                  type="file" 
                  className="cursor-pointer absolute inset-0 opacity-0" 
                  accept={getFileAcceptTypes(selectedKnowledgeBase.sourceType || selectedKnowledgeBase.type || "unknown")}
                  onChange={handleFileUpload}
                />
                <Upload className="h-5 w-5 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <Card className="bg-white border-slate-200 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {!knowledgeSources || knowledgeSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-6">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No files found</h3>
                <p className="text-slate-500 mb-6 text-center">
                  Add some files to this knowledge source to get started
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3 rounded-xl font-semibold relative overflow-hidden">
                  <input 
                    type="file" 
                    className="cursor-pointer absolute inset-0 opacity-0" 
                    accept={getFileAcceptTypes(selectedKnowledgeBase.sourceType || selectedKnowledgeBase.type || "unknown")}
                    onChange={handleFileUpload}
                  />
                  <Upload className="h-5 w-5 mr-2" />
                  Upload File
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">File Name</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Size</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Format</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Content</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Upload Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {knowledgeSources.map((source) => (
                      <TableRow key={source.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${getIconBackground({sourceType: sourceType})} shadow-sm`}>
                              {renderSourceIcon({sourceType: sourceType})}
                            </div>
                            <div className="font-semibold text-slate-900">
                              {source.title || source.name || "Untitled"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-slate-600 font-medium">
                            {formatFileSizeToMB(source.metadata?.file_size || source.metadata?.size)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="font-mono uppercase text-xs font-semibold px-3 py-1 rounded-full border-2">
                            {source.metadata?.format || source.type || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-slate-600 font-medium">
                            {getContentMeasure(source)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-slate-600 font-medium">
                            {formatDate(source.metadata?.upload_date)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-9 px-3 rounded-lg border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors duration-150"
                              onClick={() => handleDownloadFile(source)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-9 px-3 rounded-lg border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors duration-150"
                              onClick={() => handleDeleteFile(source.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'main' ? renderMainView() : renderDetailView()}
      </div>
    </div>
  );
};

export default KnowledgeBase;
