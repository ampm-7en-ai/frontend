
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  ChevronRight, 
  Clock, 
  File, 
  FileText, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Upload 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample document data
  const documents = [
    {
      id: 'd1',
      title: 'Product Features Overview',
      type: 'pdf',
      size: '2.4 MB',
      status: 'processed',
      agent: 'Sales Bot',
      uploadedAt: '2023-06-01T10:15:00',
    },
    {
      id: 'd2',
      title: 'Pricing Structure',
      type: 'docx',
      size: '1.1 MB',
      status: 'processed',
      agent: 'Sales Bot',
      uploadedAt: '2023-06-02T14:30:00',
    },
    {
      id: 'd3',
      title: 'Technical Specifications',
      type: 'pdf',
      size: '3.7 MB',
      status: 'processing',
      agent: 'Support Bot',
      uploadedAt: '2023-06-05T09:45:00',
    },
    {
      id: 'd4',
      title: 'User Manual',
      type: 'pdf',
      size: '5.2 MB',
      status: 'processed',
      agent: 'Support Bot',
      uploadedAt: '2023-05-28T16:20:00',
    },
    {
      id: 'd5',
      title: 'Implementation Guide',
      type: 'docx',
      size: '1.8 MB',
      status: 'failed',
      agent: 'Support Bot',
      uploadedAt: '2023-06-06T11:10:00',
    },
    {
      id: 'd6',
      title: 'Integration Documentation',
      type: 'pdf',
      size: '2.9 MB',
      status: 'processed',
      agent: 'Sales Bot',
      uploadedAt: '2023-05-25T13:40:00',
    },
    {
      id: 'd7',
      title: 'FAQ Database',
      type: 'xlsx',
      size: '0.9 MB',
      status: 'processed',
      agent: 'Support Bot',
      uploadedAt: '2023-06-03T15:55:00',
    },
  ];

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.agent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout 
      pageTitle="Knowledge Base" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Knowledge Base', href: '/knowledge' }
      ]}
    >
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
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button asChild className="flex items-center gap-1">
              <Link to="/knowledge/upload">
                <Upload className="h-4 w-4" />
                Upload
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <Book className="h-4 w-4 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{documents.length}</div>
              <div className="text-sm text-muted-foreground">Total documents</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <FileText className="h-4 w-4 text-primary" />
                PDFs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{documents.filter(d => d.type === 'pdf').length}</div>
              <div className="text-sm text-muted-foreground">PDF documents</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <File className="h-4 w-4 text-primary" />
                Word Docs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{documents.filter(d => d.type === 'docx').length}</div>
              <div className="text-sm text-muted-foreground">Word documents</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                Recent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {documents.filter(d => new Date(d.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded ${
                              doc.type === 'pdf' ? 'bg-red-100' : 
                              doc.type === 'docx' ? 'bg-blue-100' : 
                              'bg-green-100'
                            }`}>
                              <FileText className={`h-4 w-4 ${
                                doc.type === 'pdf' ? 'text-red-600' : 
                                doc.type === 'docx' ? 'text-blue-600' : 
                                'text-green-600'
                              }`} />
                            </div>
                            <span className="font-medium">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">{doc.type}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              doc.status === 'processed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                              doc.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                              'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}
                          >
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.agent}</TableCell>
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
          </TabsContent>
          
          <TabsContent value="processed">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.filter(doc => doc.status === 'processed').map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded ${
                              doc.type === 'pdf' ? 'bg-red-100' : 
                              doc.type === 'docx' ? 'bg-blue-100' : 
                              'bg-green-100'
                            }`}>
                              <FileText className={`h-4 w-4 ${
                                doc.type === 'pdf' ? 'text-red-600' : 
                                doc.type === 'docx' ? 'text-blue-600' : 
                                'text-green-600'
                              }`} />
                            </div>
                            <span className="font-medium">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">{doc.type}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Processed
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.agent}</TableCell>
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
          </TabsContent>
          
          <TabsContent value="processing">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.filter(doc => doc.status === 'processing').map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded ${
                              doc.type === 'pdf' ? 'bg-red-100' : 
                              doc.type === 'docx' ? 'bg-blue-100' : 
                              'bg-green-100'
                            }`}>
                              <FileText className={`h-4 w-4 ${
                                doc.type === 'pdf' ? 'text-red-600' : 
                                doc.type === 'docx' ? 'text-blue-600' : 
                                'text-green-600'
                              }`} />
                            </div>
                            <span className="font-medium">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">{doc.type}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Processing
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.agent}</TableCell>
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
          </TabsContent>
          
          <TabsContent value="failed">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.filter(doc => doc.status === 'failed').map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded ${
                              doc.type === 'pdf' ? 'bg-red-100' : 
                              doc.type === 'docx' ? 'bg-blue-100' : 
                              'bg-green-100'
                            }`}>
                              <FileText className={`h-4 w-4 ${
                                doc.type === 'pdf' ? 'text-red-600' : 
                                doc.type === 'docx' ? 'text-blue-600' : 
                                'text-green-600'
                              }`} />
                            </div>
                            <span className="font-medium">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">{doc.type}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Failed
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.agent}</TableCell>
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
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default KnowledgeBase;
