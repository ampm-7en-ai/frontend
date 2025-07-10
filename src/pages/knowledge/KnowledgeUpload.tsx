
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

const knowledgeTypeOptions = [
  { value: 'document', label: 'Document', description: 'PDF, Word, or text files' },
  { value: 'website', label: 'Website', description: 'Web pages and articles' },
  { value: 'api', label: 'API Data', description: 'Structured data from APIs' },
  { value: 'database', label: 'Database', description: 'Database records and tables' }
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' }
];

const KnowledgeUpload = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [knowledgeType, setKnowledgeType] = useState('document');
  const [language, setLanguage] = useState('en');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload
    newFiles.forEach(file => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            const newProgress = Math.min(f.progress + Math.random() * 20, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: 'processing' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      // Simulate processing completion
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'completed' } : f
        ));
        toast({
          title: "File Processed",
          description: `${file.name} has been successfully processed and added to your knowledge base.`,
        });
      }, 3000 + Math.random() * 2000);
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleWebsiteSubmit = () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid website URL.",
        variant: "destructive",
      });
      return;
    }

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Website: ${websiteUrl}`,
      size: 0,
      type: 'website',
      status: 'processing',
      progress: 100,
      url: websiteUrl
    };

    setFiles(prev => [...prev, newFile]);
    setWebsiteUrl('');

    // Simulate processing
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, status: 'completed' } : f
      ));
      toast({
        title: "Website Processed",
        description: "Website content has been successfully extracted and added to your knowledge base.",
      });
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <MainLayout 
      pageTitle="Knowledge Upload" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Knowledge Base', href: '/knowledge' },
        { label: 'Upload', href: '#' }
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Knowledge</CardTitle>
                <CardDescription>
                  Add documents, websites, or other data sources to your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={knowledgeType} onValueChange={setKnowledgeType}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="document">Documents</TabsTrigger>
                    <TabsTrigger value="website">Website</TabsTrigger>
                    <TabsTrigger value="api">API</TabsTrigger>
                    <TabsTrigger value="database">Database</TabsTrigger>
                  </TabsList>

                  <TabsContent value="document" className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      {isDragActive ? (
                        <p className="text-lg">Drop the files here...</p>
                      ) : (
                        <div>
                          <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                          <p className="text-sm text-muted-foreground">
                            Supports PDF, DOC, DOCX, TXT, CSV, JSON files
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="website" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="website-url">Website URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="website-url"
                            type="url"
                            placeholder="https://example.com"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={handleWebsiteSubmit}>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Add Website
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter a website URL to crawl and extract content for your knowledge base.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="api" className="space-y-4">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">API integration feature coming soon...</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="database" className="space-y-4">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Database integration feature coming soon...</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files</CardTitle>
                  <CardDescription>
                    {files.filter(f => f.status === 'completed').length} of {files.length} files processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <Badge variant="outline" className={getStatusColor(file.status)}>
                              {file.status}
                            </Badge>
                          </div>
                          {file.size > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                          {file.status === 'uploading' && (
                            <Progress value={file.progress} className="mt-2 h-1" />
                          )}
                          {file.error && (
                            <p className="text-xs text-red-600 mt-1">{file.error}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {file.status === 'completed' && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure how your knowledge is processed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <ModernDropdown
                    value={language}
                    onValueChange={setLanguage}
                    options={languageOptions}
                    placeholder="Select language"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Custom Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Provide specific instructions for how this knowledge should be used..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button className="w-full" disabled={files.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Process Knowledge
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Files:</span>
                  <span className="text-sm font-medium">{files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed:</span>
                  <span className="text-sm font-medium text-green-600">
                    {files.filter(f => f.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Processing:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {files.filter(f => ['uploading', 'processing'].includes(f.status)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Errors:</span>
                  <span className="text-sm font-medium text-red-600">
                    {files.filter(f => f.status === 'error').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default KnowledgeUpload;
