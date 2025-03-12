
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, ChevronRight, Clock, File, FileSpreadsheet, FileText, Filter, Globe, MoreHorizontal, Plus, Search, Upload, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');

  // Sample document data with multiple agents per document
  const documents = [
    {
      id: 'd1',
      title: 'Product Features Overview',
      type: 'pdf',
      sourceType: 'document',
      size: '2.4 MB',
      agents: ['Sales Bot', 'Support Bot', 'Marketing Bot'],
      uploadedAt: '2023-06-01T10:15:00',
    },
    {
      id: 'd2',
      title: 'Pricing Structure',
      type: 'docx',
      sourceType: 'document',
      size: '1.1 MB',
      agents: ['Sales Bot', 'Support Bot'],
      uploadedAt: '2023-06-02T14:30:00',
    },
    {
      id: 'd3',
      title: 'Technical Specifications',
      type: 'pdf',
      sourceType: 'document',
      size: '3.7 MB',
      agents: ['Support Bot', 'Technical Bot'],
      uploadedAt: '2023-06-05T09:45:00',
    },
    {
      id: 'd4',
      title: 'Company Website',
      type: 'url',
      sourceType: 'website',
      size: 'N/A',
      agents: ['Sales Bot', 'Marketing Bot'],
      uploadedAt: '2023-05-28T16:20:00',
    },
    {
      id: 'd5',
      title: 'Customer Data',
      type: 'csv',
      sourceType: 'spreadsheet',
      size: '0.8 MB',
      agents: ['Analytics Bot', 'Sales Bot'],
      uploadedAt: '2023-05-15T11:30:00',
    },
    {
      id: 'd6',
      title: 'Help Documentation',
      type: 'txt',
      sourceType: 'text',
      size: '0.3 MB',
      agents: ['Support Bot', 'Onboarding Bot'],
      uploadedAt: '2023-06-10T09:20:00',
    }
  ];

  // Filter documents based on search query and source type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.agents.some(agent => agent.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = sourceTypeFilter === 'all' || doc.sourceType === sourceTypeFilter;
    
    return matchesSearch && matchesType;
  });

  // Get count of each source type
  const documentCount = documents.filter(d => d.sourceType === 'document').length;
  const websiteCount = documents.filter(d => d.sourceType === 'website').length;
  const spreadsheetCount = documents.filter(d => d.sourceType === 'spreadsheet').length;
  const textCount = documents.filter(d => d.sourceType === 'text').length;

  // Helper function to render the appropriate icon based on document type
  const renderSourceIcon = (doc) => {
    switch (doc.sourceType) {
      case 'document':
        return doc.type === 'pdf' ? 
          <FileText className="h-4 w-4 text-blue-600" /> : 
          <File className="h-4 w-4 text-blue-600" />;
      case 'website':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case 'text':
        return <Book className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  // Helper function to get background color based on document type
  const getIconBackground = (doc) => {
    switch (doc.sourceType) {
      case 'document':
        return 'bg-blue-100';
      case 'website':
        return 'bg-green-100';
      case 'spreadsheet':
        return 'bg-emerald-100';
      case 'text':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Generate a random color for agent avatar fallbacks
  const getAgentColor = (agentName) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500'];
    const index = agentName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get agent initials for avatar fallback
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
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="website">Websites</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
              <SelectItem value="text">Text</SelectItem>
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <FileText className="h-4 w-4 text-blue-600" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documentCount}</div>
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
            <div className="text-3xl font-bold">{websiteCount}</div>
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
            <div className="text-3xl font-bold">{spreadsheetCount}</div>
            <div className="text-sm text-muted-foreground">CSV, Excel files</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <Book className="h-4 w-4 text-purple-600" />
              Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{textCount}</div>
            <div className="text-sm text-muted-foreground">Plain text files</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${getIconBackground(doc)}`}>
                        {renderSourceIcon(doc)}
                      </div>
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="uppercase">
                    {doc.sourceType}
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        {doc.agents.slice(0, 3).map((agent, index) => (
                          <TooltipProvider key={`${doc.id}-agent-${index}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className={getAgentColor(agent)}>
                                    {getAgentInitials(agent)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{agent}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                      {doc.agents.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.agents.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
