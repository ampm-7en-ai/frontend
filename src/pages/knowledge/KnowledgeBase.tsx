import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, Edit, FileSpreadsheet, FileText, Globe, MoreHorizontal, Plus, Search, Trash, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [newUrl, setNewUrl] = useState('');
  const [newFile, setNewFile] = useState(null);

  const documents = [
    {
      id: 'd1',
      title: 'Product Features Overview',
      type: 'pdf',
      sourceType: 'document',
      size: '2.4 MB',
      pages: 24,
      agents: ['Sales Bot', 'Support Bot', 'Marketing Bot'],
      uploadedAt: '2023-06-01T10:15:00',
      provider: null
    },
    {
      id: 'd2',
      title: 'Pricing Structure',
      type: 'docx',
      sourceType: 'document',
      size: '1.1 MB',
      pages: 12,
      agents: ['Sales Bot', 'Support Bot'],
      uploadedAt: '2023-06-02T14:30:00',
      provider: null
    },
    {
      id: 'd3',
      title: 'Technical Specifications',
      type: 'pdf',
      sourceType: 'document',
      size: '3.7 MB',
      pages: 48,
      agents: ['Support Bot', 'Technical Bot'],
      uploadedAt: '2023-06-05T09:45:00',
      provider: null
    },
    {
      id: 'd4',
      title: 'Company Website',
      type: 'url',
      sourceType: 'website',
      size: 'N/A',
      pageCount: 16,
      agents: ['Sales Bot', 'Marketing Bot'],
      uploadedAt: '2023-05-28T16:20:00',
      provider: null
    },
    {
      id: 'd5',
      title: 'Customer Data',
      type: 'csv',
      sourceType: 'spreadsheet',
      size: '0.8 MB',
      rowCount: 1250,
      agents: ['Analytics Bot', 'Sales Bot'],
      uploadedAt: '2023-05-15T11:30:00',
      provider: null
    },
    {
      id: 'd6',
      title: 'Help Documentation',
      type: 'txt',
      sourceType: 'plainText',
      size: '0.3 MB',
      pages: 8,
      agents: ['Support Bot', 'Onboarding Bot'],
      uploadedAt: '2023-06-10T09:20:00',
      provider: null
    },
    {
      id: 'd7',
      title: 'Sales Training Documents',
      type: 'gdrive',
      sourceType: 'thirdParty',
      size: '5.2 MB',
      pages: 45,
      agents: ['Sales Bot', 'Training Bot'],
      uploadedAt: '2023-06-15T14:20:00',
      provider: 'googleDrive'
    },
    {
      id: 'd8',
      title: 'Customer Support Channels',
      type: 'slack',
      sourceType: 'thirdParty',
      size: 'N/A',
      messages: 2500,
      agents: ['Support Bot'],
      uploadedAt: '2023-06-16T11:30:00',
      provider: 'slack'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.agents.some(agent => agent.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = sourceTypeFilter === 'all' || doc.sourceType === sourceTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const documentCount = documents.filter(d => d.sourceType === 'document').length;
  const websiteCount = documents.filter(d => d.sourceType === 'website').length;
  const spreadsheetCount = documents.filter(d => d.sourceType === 'spreadsheet').length;
  const plainTextCount = documents.filter(d => d.sourceType === 'plainText').length;

  const renderSourceIcon = (doc) => {
    switch (doc.sourceType) {
      case 'document':
        return doc.type === 'pdf' ? 
          <FileText className="h-4 w-4 text-blue-600" /> : 
          <FileText className="h-4 w-4 text-blue-600" />;
      case 'website':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case 'plainText':
        return <Book className="h-4 w-4 text-purple-600" />;
      case 'thirdParty':
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
      case 'document':
        return 'bg-blue-100';
      case 'website':
        return 'bg-green-100';
      case 'spreadsheet':
        return 'bg-emerald-100';
      case 'plainText':
        return 'bg-purple-100';
      case 'thirdParty':
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

  const renderMetric = (doc) => {
    switch (doc.sourceType) {
      case 'document':
      case 'plainText':
        return `${doc.pages} pages`;
      case 'website':
        return `${doc.pageCount} pages`;
      case 'spreadsheet':
        return `${doc.rowCount} rows`;
      case 'thirdParty':
        if (doc.messages) return `${doc.messages} messages`;
        return `${doc.pages} pages`;
      default:
        return doc.size;
    }
  };

  const handleEdit = (doc) => {
    setIsEditDialogOpen(true);
    setTimeout(() => {
      setEditingDocument(doc);
      setNewUrl(doc.sourceType === 'website' ? doc.title : '');
    }, 50);
  };

  const handleSaveEdit = () => {
    console.log('Saving edit:', {
      documentId: editingDocument?.id,
      newUrl,
      newFile,
      sourceType: editingDocument?.sourceType
    });
    
    setIsEditDialogOpen(false);
    setTimeout(() => {
      setEditingDocument(null);
      setNewUrl('');
      setNewFile(null);
    }, 300);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  const renderEditDialog = () => {
    return (
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (open) {
            setIsEditDialogOpen(true);
          } else {
            setIsEditDialogOpen(false);
            setTimeout(() => {
              setEditingDocument(null);
              setNewUrl('');
              setNewFile(null);
            }, 300);
          }
        }}
      >
        <DialogContent onClick={(e) => e.stopPropagation()}>
          {editingDocument && (
            <>
              <DialogHeader>
                <DialogTitle>Edit {editingDocument.title}</DialogTitle>
                <DialogDescription>Update your knowledge source</DialogDescription>
              </DialogHeader>
              
              {editingDocument.sourceType === 'website' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={newUrl}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="Enter new URL"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload New File</Label>
                    <Input
                      id="file"
                      type="file"
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleFileChange}
                      accept={editingDocument.type === 'csv' ? '.csv,.xlsx,.xls' : '.pdf,.docx,.txt'}
                    />
                    {newFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {newFile.name} ({(newFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveEdit();
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
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
              <SelectItem value="plainText">Plain Text</SelectItem>
              <SelectItem value="thirdParty">Third Party</SelectItem>
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
              Plain Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plainTextCount}</div>
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
            <div className="text-3xl font-bold">{documents.filter(d => d.sourceType === 'thirdParty').length}</div>
            <div className="text-sm text-muted-foreground">Google Drive, Slack, etc.</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Document Name</TableHead>
                <TableHead>Format</TableHead>
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
                          {renderMetric(doc)} • {doc.size}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {doc.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {doc.agents.slice(0, 3).map((agent, index) => (
                          <TooltipProvider key={`${doc.id}-agent-${index}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className={`${getAgentColor(agent)} text-white text-xs`}>
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
                        <Badge variant="secondary" className="ml-1 text-xs font-semibold">
                          +{doc.agents.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(doc);
                          }}
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
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
        </CardContent>
      </Card>

      {renderEditDialog()}
    </div>
  );
};

export default KnowledgeBase;
