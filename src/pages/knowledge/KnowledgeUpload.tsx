
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, FileText, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const KnowledgeUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileList]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // In a real application, you would upload the files to your backend
    setTimeout(() => {
      console.log('Uploading files:', files);
      console.log('Document name:', documentName);
      console.log('Document type:', documentType);
      console.log('Selected agent:', selectedAgent);
      
      // Reset form after uploading
      setIsUploading(false);
      setFiles([]);
      setDocumentName('');
      setDocumentType('');
      
      // In a real app, you would navigate to the knowledge base after successful upload
      // history.push('/knowledge');
    }, 2000);
  };

  return (
    <MainLayout 
      pageTitle="Upload Knowledge Documents" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Knowledge Base', href: '/knowledge' },
        { label: 'Upload', href: '/knowledge/upload' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link to="/knowledge" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Knowledge Base
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Add documents to your knowledge base to improve your AI agents' responses.
              Supported file types: PDF, DOCX, TXT, CSV, XLSX.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-name">Document Name (Optional)</Label>
                <Input 
                  id="document-name" 
                  placeholder="Enter a name for this document"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, the filename will be used.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Documentation</SelectItem>
                      <SelectItem value="technical">Technical Specifications</SelectItem>
                      <SelectItem value="support">Support Articles</SelectItem>
                      <SelectItem value="faq">FAQs</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-select">Assign to Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger id="agent-select">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Bot</SelectItem>
                      <SelectItem value="support">Support Bot</SelectItem>
                      <SelectItem value="product">Product Specialist</SelectItem>
                      <SelectItem value="all">All Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Upload Files</Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-center font-medium mb-1">Drag and drop your files here</p>
                  <p className="text-xs text-center text-muted-foreground mb-4">
                    PDF, DOCX, TXT, CSV, XLSX up to 10MB
                  </p>
                  <Button variant="outline" className="flex items-center gap-1" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-4 w-4" />
                    Select Files
                  </Button>
                  <input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".pdf,.docx,.txt,.csv,.xlsx"
                  />
                </div>
                
                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({files.length})</Label>
                    <div className="border rounded-md divide-y">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link to="/knowledge">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={files.length === 0 || isUploading}
                  className="flex items-center gap-1"
                >
                  {isUploading ? 'Uploading...' : 'Upload Documents'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t px-6">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Processing Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Uploaded documents will be processed to extract information.</li>
                <li>Large documents may take several minutes to process.</li>
                <li>You will be notified when processing is complete.</li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default KnowledgeUpload;
