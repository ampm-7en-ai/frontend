
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, FileText, Upload, X, Link, Globe, File, Table, AlignLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type SourceType = 'url' | 'document' | 'csv' | 'plainText';

interface SourceConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  acceptedTypes?: string;
  placeholder?: string;
}

const KnowledgeUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [plainText, setPlainText] = useState('');

  // Source type configurations
  const sourceConfigs: Record<SourceType, SourceConfig> = {
    url: {
      icon: <Globe className="h-5 w-5" />,
      title: "URL",
      description: "Crawl a webpage or multiple pages from a domain",
      placeholder: "https://example.com/page"
    },
    document: {
      icon: <FileText className="h-5 w-5" />,
      title: "Text Document",
      description: "Upload PDF, DOCX, or TXT files",
      acceptedTypes: ".pdf,.docx,.txt"
    },
    csv: {
      icon: <Table className="h-5 w-5" />,
      title: "CSV File",
      description: "Upload spreadsheet data (CSV, Excel)",
      acceptedTypes: ".csv,.xlsx,.xls"
    },
    plainText: {
      icon: <AlignLeft className="h-5 w-5" />,
      title: "Plain Text",
      description: "Enter text directly",
      placeholder: "Enter your text here..."
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileList]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        toast({
          title: "Upload complete",
          description: "Your knowledge source has been added successfully.",
        });
      }
    }, 200);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    let canUpload = false;
    
    // Validate based on source type
    switch(sourceType) {
      case 'url':
        canUpload = !!url;
        if (!canUpload) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid URL",
            variant: "destructive"
          });
        }
        break;
      
      case 'document':
      case 'csv':
        canUpload = files.length > 0;
        if (!canUpload) {
          toast({
            title: "Validation Error",
            description: "Please select at least one file to upload",
            variant: "destructive"
          });
        }
        break;
        
      case 'plainText':
        canUpload = !!plainText;
        if (!canUpload) {
          toast({
            title: "Validation Error",
            description: "Please enter some text",
            variant: "destructive"
          });
        }
        break;
    }
    
    if (!canUpload) return;
    
    setIsUploading(true);
    setProgress(0);
    
    // In a real application, you would upload to your backend
    console.log('Uploading:', {
      sourceType,
      documentName,
      files,
      url,
      plainText
    });
    
    // Simulate upload progress
    simulateProgress();
  };

  const renderSourceTypeContent = () => {
    switch(sourceType) {
      case 'url':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                type="url"
                placeholder={sourceConfigs.url.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of the webpage you want to crawl. For multiple pages, we'll automatically explore linked pages.
              </p>
            </div>
          </div>
        );
      
      case 'document':
      case 'csv':
        return (
          <div className="space-y-4">
            <Label>Upload Files</Label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
              {sourceConfigs[sourceType].icon}
              <p className="text-sm text-center font-medium mt-2 mb-1">Drag and drop your files here</p>
              <p className="text-xs text-center text-muted-foreground mb-4">
                {sourceType === 'document' ? 'PDF, DOCX, TXT up to 10MB' : 'CSV, XLSX, XLS up to 10MB'}
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
                accept={sourceConfigs[sourceType].acceptedTypes}
              />
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="border rounded-md divide-y">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        {sourceType === 'document' ? <FileText className="h-4 w-4 text-primary" /> : <Table className="h-4 w-4 text-primary" />}
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
        );
      
      case 'plainText':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plain-text">Text Content</Label>
              <Textarea 
                id="plain-text" 
                placeholder={sourceConfigs.plainText.placeholder}
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Paste or type the text you want to add to your knowledge base
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <RouterLink to="/knowledge" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Knowledge Base
        </RouterLink>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Knowledge Source</CardTitle>
          <CardDescription>
            Add content to your knowledge base to improve your AI responses.
            Choose a source type below.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document-name">Source Name (Optional)</Label>
              <Input 
                id="document-name" 
                placeholder="Enter a name for this knowledge source"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If left blank, a name will be generated automatically.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source-type">Source Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {Object.entries(sourceConfigs).map(([type, config]) => (
                  <div 
                    key={type}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary hover:shadow-sm ${sourceType === type ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSourceType(type as SourceType)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`rounded-full p-2 ${sourceType === type ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                        {config.icon}
                      </div>
                      <p className="font-medium text-sm">{config.title}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {renderSourceTypeContent()}
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <RouterLink to="/knowledge">Cancel</RouterLink>
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="flex items-center gap-1"
              >
                {isUploading ? 'Processing...' : 'Add to Knowledge Base'}
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="bg-muted/20 border-t px-6">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Processing Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uploaded content will be processed and indexed automatically.</li>
              <li>Large files or websites may take several minutes to process.</li>
              <li>You will be notified when processing is complete.</li>
              <li>You can manage all your knowledge sources from the Knowledge Base page.</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default KnowledgeUpload;
