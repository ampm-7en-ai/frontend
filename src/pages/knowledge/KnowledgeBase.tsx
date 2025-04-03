
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, FileSpreadsheet, FileText, Globe, MoreHorizontal, Plus, Search, Trash, Upload, FileIcon, File } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken, formatFileSizeToMB, getSourceMetadataInfo } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [knowledgeBases, setKnowledgeBases] = useState([]);

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
        trainingStatus: kb.training_status
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
    const index = agentName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getAgentInitials = (agentName) => {
    return agentName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Document Name</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`p-2 rounded ${getIconBackground(doc)} mr-2 flex-shrink-0`}>
                          {renderSourceIcon(doc)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{doc.title}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {doc.pages} {doc.pages && doc.size ? '•' : ''} {doc.size}
                            {doc.fileFormat !== 'N/A' && ` • ${doc.fileFormat}`}
                          </div>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2 text-destructive cursor-pointer">
                            <Trash className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
