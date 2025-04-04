
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Book, FileSpreadsheet, FileText, Globe, MoreHorizontal, Plus, Search, Trash, Upload, 
  FileIcon, File, ChevronDown, ChevronRight, SortAsc, SortDesc, Check, Filter, Download, Share2, Star, StarOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { 
  BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, 
  formatFileSizeToMB, getSourceMetadataInfo 
} from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [starredItems, setStarredItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
  });

  useEffect(() => {
    if (data) {
      setKnowledgeBases(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading knowledge bases",
        description: "There was a problem loading your knowledge bases. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleStar = (e, id) => {
    e.stopPropagation();
    setStarredItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />;
  };

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

      // Get file format from metadata
      const fileFormat = firstSource && firstSource.metadata && firstSource.metadata.format 
        ? firstSource.metadata.format 
        : 'N/A';

      // Extract agent names from the agents array
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
        knowledge_sources: kb.knowledge_sources || [] // Include the knowledge_sources array
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

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortField === 'type') {
      return sortDirection === 'asc'
        ? a.sourceType.localeCompare(b.sourceType)
        : b.sourceType.localeCompare(a.sourceType);
    }
    if (sortField === 'date') {
      const dateA = new Date(a.uploadedAt);
      const dateB = new Date(b.uploadedAt);
      return sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }
    if (sortField === 'size') {
      // Extract numeric size for comparison
      const getSizeValue = (size) => {
        if (!size || size === 'N/A') return 0;
        const match = size.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      };
      const sizeA = getSizeValue(a.size);
      const sizeB = getSizeValue(b.size);
      return sortDirection === 'asc'
        ? sizeA - sizeB
        : sizeB - sizeA;
    }
    return 0;
  });

  // Bring starred items to top
  const finalDocuments = [...sortedDocuments].sort((a, b) => {
    const aStarred = starredItems.has(a.id) ? 1 : 0;
    const bStarred = starredItems.has(b.id) ? 1 : 0;
    return bStarred - aStarred;
  });

  const documentCount = documents.filter(d => d.sourceType === 'docs').length;
  const websiteCount = documents.filter(d => d.sourceType === 'website').length;
  const spreadsheetCount = documents.filter(d => d.sourceType === 'csv').length;
  const plainTextCount = documents.filter(d => d.sourceType === 'plain_text').length;
  const thirdPartyCount = documents.filter(d => d.sourceType === 'thirdparty').length;

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
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
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
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500'];
    // Fix: Convert string to number for modulo operation
    const index = agentName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getAgentInitials = (agentName) => {
    // Fix: Handle case when agentName might be undefined
    if (!agentName) return '';
    return agentName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Filter menu options
  const filterOptions = [
    { label: "All Types", value: "all" },
    { label: "Documents", value: "docs" },
    { label: "Websites", value: "website" },
    { label: "Spreadsheets", value: "csv" },
    { label: "Plain Text", value: "plain_text" },
    { label: "Third Party", value: "thirdparty" },
  ];

  // Breadcrumb navigation
  const breadcrumbs = [
    { name: "My Drive", path: "/knowledge" },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <FileText className="h-4 w-4 text-blue-600" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : documentCount}</div>
            <div className="text-sm text-muted-foreground">PDF, DOCX, etc.</div>
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
            <div className="text-3xl font-bold">{isLoading ? "..." : websiteCount}</div>
            <div className="text-sm text-muted-foreground">URLs, Webpages</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Spreadsheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : spreadsheetCount}</div>
            <div className="text-sm text-muted-foreground">CSV, Excel files</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <File className="h-4 w-4 text-purple-600" />
              Plain Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : plainTextCount}</div>
            <div className="text-sm text-muted-foreground">Plain text files</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <svg className="h-4 w-4 text-blue-600" viewBox="0 0 87.3 78">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="currentColor"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="currentColor"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="currentColor"/>
              </svg>
              Third Party
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : thirdPartyCount}</div>
            <div className="text-sm text-muted-foreground">Google Drive, Slack, etc.</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Breadcrumb and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <Link 
                to={crumb.path} 
                className="text-blue-600 hover:underline font-medium"
              >
                {crumb.name}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Input 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10" 
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>{filterOptions.find(opt => opt.value === sourceTypeFilter)?.label || "All Types"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {filterOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value} 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setSourceTypeFilter(option.value)}
                >
                  {sourceTypeFilter === option.value && <Check className="h-4 w-4" />}
                  <span className={sourceTypeFilter === option.value ? "font-medium" : ""}>
                    {option.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'list' ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <line x1="3" x2="21" y1="6" y2="6"></line>
                <line x1="3" x2="21" y1="12" y2="12"></line>
                <line x1="3" x2="21" y1="18" y2="18"></line>
              </svg>
            </Button>
            <Button
              variant={viewMode === 'grid' ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('grid')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <rect width="7" height="7" x="3" y="3"></rect>
                <rect width="7" height="7" x="14" y="3"></rect>
                <rect width="7" height="7" x="14" y="14"></rect>
                <rect width="7" height="7" x="3" y="14"></rect>
              </svg>
            </Button>
          </div>
          
          <Button asChild className="flex items-center gap-1">
            <Link to="/knowledge/upload">
              <Upload className="h-4 w-4" />
              Add Source
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading knowledge bases...</span>
            </div>
          ) : finalDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No knowledge sources found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || sourceTypeFilter !== 'all' ? 
                  "Try adjusting your search or filter" : 
                  "Add your first knowledge source to get started"}
              </p>
              <Button asChild>
                <Link to="/knowledge/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Source
                </Link>
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">
                    <button 
                      className="flex items-center font-medium"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center font-medium"
                      onClick={() => handleSort('type')}
                    >
                      Type {getSortIcon('type')}
                    </button>
                  </TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center font-medium"
                      onClick={() => handleSort('date')}
                    >
                      Last modified {getSortIcon('date')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center font-medium"
                      onClick={() => handleSort('size')}
                    >
                      File size {getSortIcon('size')}
                    </button>
                  </TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalDocuments.map((doc) => (
                  <React.Fragment key={doc.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/80"
                      onClick={() => doc.knowledge_sources && doc.knowledge_sources.length > 1 ? toggleRow(doc.id) : null}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            <button 
                              className="p-1 hover:bg-muted rounded-full"
                              onClick={(e) => toggleStar(e, doc.id)}
                            >
                              {starredItems.has(doc.id) ? (
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                              ) : (
                                <StarOff className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            {doc.knowledge_sources && doc.knowledge_sources.length > 1 && (
                              <button
                                className="p-0 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(doc.id);
                                }}
                              >
                                {expandedRows[doc.id] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className={`p-2 rounded ${getIconBackground(doc)} mr-2 flex-shrink-0`}>
                            {renderSourceIcon(doc)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{doc.title}</span>
                            {doc.knowledge_sources && doc.knowledge_sources.length > 1 && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {doc.knowledge_sources.length} files
                              </div>
                            )}
                            {doc.knowledge_sources && doc.knowledge_sources.length <= 1 && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {doc.pages} {doc.pages && doc.size ? '•' : ''} {doc.size}
                                {doc.fileFormat !== 'N/A' && ` • ${doc.fileFormat}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {doc.sourceType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {doc.agents && doc.agents.length > 0 ? (
                            <>
                              <div className="flex -space-x-2">
                                {doc.agents.slice(0, 3).map((agentName, index) => (
                                  <TooltipProvider key={`${doc.id}-agent-${index}`}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Avatar className="h-8 w-8 border-2 border-background">
                                          <AvatarFallback className={`${getAgentColor(agentName)} text-white text-xs`}>
                                            {getAgentInitials(agentName)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{agentName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                              {doc.agents.length > 3 && (
                                <Badge variant="secondary" className="ml-1 text-xs font-semibold">
                                  +{doc.agents.length - 3} more
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.uploadedAt}
                      </TableCell>
                      <TableCell>
                        {doc.size}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Share2 className="h-4 w-4" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Download className="h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 text-destructive cursor-pointer">
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {doc.knowledge_sources && doc.knowledge_sources.length > 1 && expandedRows[doc.id] && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Collapsible open={true}>
                            <CollapsibleContent>
                              <div className="pl-12 pr-4 py-2 bg-muted/20">
                                <h4 className="text-sm font-medium mb-2">Files</h4>
                                <div className="space-y-2">
                                  {doc.knowledge_sources.map((source, index) => (
                                    <div key={index} className="flex items-center justify-between py-1 border-b border-dashed border-gray-200 last:border-0">
                                      <div className="flex items-center">
                                        <div className={`p-1.5 rounded ${getIconBackground(doc)} mr-2 flex-shrink-0`}>
                                          {renderSourceIcon(doc)}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium">{source.title}</span>
                                          <div className="text-xs text-muted-foreground">
                                            {source.metadata?.file_size && formatFileSizeToMB(source.metadata.file_size)}
                                            {source.metadata?.no_of_pages && ` • ${source.metadata.no_of_pages} pages`}
                                            {source.metadata?.format && ` • ${source.metadata.format}`}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {finalDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => doc.knowledge_sources && doc.knowledge_sources.length > 1 ? toggleRow(doc.id) : null}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-3 rounded ${getIconBackground(doc)} mr-2 flex-shrink-0`}>
                      {renderSourceIcon(doc)}
                    </div>
                    <button 
                      className="p-1 hover:bg-muted rounded-full"
                      onClick={(e) => toggleStar(e, doc.id)}
                    >
                      {starredItems.has(doc.id) ? (
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-sm truncate" title={doc.title}>{doc.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {doc.sourceType.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {doc.uploadedAt}
                    </div>
                    {doc.knowledge_sources && doc.knowledge_sources.length > 1 && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        <span>{doc.knowledge_sources.length} files</span>
                      </div>
                    )}
                  </div>
                  
                  {expandedRows[doc.id] && doc.knowledge_sources && doc.knowledge_sources.length > 1 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="files" className="border-t border-dashed">
                        <AccordionTrigger className="py-2 text-xs">View Files</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {doc.knowledge_sources.map((source, index) => (
                              <div key={index} className="flex items-start justify-between py-1">
                                <div className="flex items-center">
                                  <div className={`p-1 rounded ${getIconBackground(doc)} mr-1.5 flex-shrink-0`}>
                                    {renderSourceIcon(doc)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium truncate max-w-[120px]" title={source.title}>
                                      {source.title}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
