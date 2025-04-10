
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, File, FileText, Globe, Upload } from 'lucide-react';
import { markKnowledgeSourceAdded } from '@/utils/knowledge-update-tracker';

const KnowledgeUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState('');
  const [plainText, setPlainText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSuccess = () => {
    // Mark that a new knowledge source was added to trigger refetch in KnowledgeBase
    markKnowledgeSourceAdded();
    
    // Invalidate the query if needed
    queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    
    toast({
      title: "Upload successful",
      description: "Your knowledge source has been successfully uploaded.",
    });
    
    navigate('/knowledge');
  };

  const handleDocumentUpload = () => {
    setIsUploading(true);
    // Simulate API call for uploading files
    setTimeout(() => {
      setIsUploading(false);
      handleUploadSuccess();
    }, 1500);
  };

  const handleWebsiteImport = () => {
    if (!urls.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one URL to import.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    // Simulate API call for importing websites
    setTimeout(() => {
      setIsUploading(false);
      handleUploadSuccess();
    }, 1500);
  };

  const handleTextAdd = () => {
    if (!plainText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text content to add.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    // Simulate API call for adding plain text
    setTimeout(() => {
      setIsUploading(false);
      handleUploadSuccess();
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/knowledge')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Knowledge Base
        </Button>
        <h1 className="text-3xl font-bold">Upload Knowledge Source</h1>
        <p className="text-muted-foreground">
          Add documents, websites, or other data to enhance your agents' knowledge.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload PDF, Word, or text files to add to your knowledge base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">Click to upload files</p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF, Word, TXT up to 10MB
                </p>
              </label>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected</p>
                  <ul className="text-left text-sm max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="py-1 px-2 rounded flex items-center">
                        <File className="h-4 w-4 mr-2 text-blue-500" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleDocumentUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Documents"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-green-500" />
              Website Import
            </CardTitle>
            <CardDescription>
              Import content from websites by providing URLs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="urls">Enter website URLs (one per line)</Label>
                <Textarea
                  id="urls"
                  placeholder="https://example.com&#10;https://another-site.com"
                  className="min-h-[150px]"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  We'll crawl these websites and extract relevant information to add to your knowledge base.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleWebsiteImport}
              disabled={!urls.trim() || isUploading}
            >
              {isUploading ? "Importing..." : "Import Websites"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-500" />
              Plain Text
            </CardTitle>
            <CardDescription>
              Add plain text content directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="plain-text">Enter or paste text content</Label>
                <Textarea
                  id="plain-text"
                  placeholder="Paste or type your text content here..."
                  className="min-h-[150px]"
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Text will be processed and added to your knowledge base as a separate source.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleTextAdd}
              disabled={!plainText.trim() || isUploading}
            >
              {isUploading ? "Adding..." : "Add Text Content"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeUpload;
