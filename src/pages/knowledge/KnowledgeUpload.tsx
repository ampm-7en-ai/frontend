
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadedFiles } from '@/components/knowledge/UploadedFiles';
import { UploadedFile } from '@/types/knowledge';
import { WebsiteInput } from '@/components/knowledge/WebsiteInput';
import { DocumentUpload } from '@/components/knowledge/DocumentUpload';
import { PlainTextInput } from '@/components/knowledge/PlainTextInput';
import { SpreadsheetUpload } from '@/components/knowledge/SpreadsheetUpload';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createKnowledgeBase, addFileToKnowledgeBase } from '@/utils/api';

const KnowledgeUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('website');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const generateFileId = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const handleAddWebsite = (url: string, name: string) => {
    toast({
      title: 'Website added',
      description: `Adding ${name} to knowledge base...`,
    });

    const newFile: UploadedFile = {
      id: generateFileId(),
      name: name,
      type: 'website',
      size: 'Unknown',
      progress: 100,
      status: 'success',
      url: url
    };

    setUploadedFiles([...uploadedFiles, newFile]);
  };

  const handleUploadDocuments = (files: File[]) => {
    const newFiles = files.map(file => {
      return {
        id: generateFileId(),
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 100,
        status: 'success' as const
      };
    });

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    
    toast({
      title: 'Files uploaded',
      description: `Added ${files.length} file(s) to knowledge base`,
    });
  };

  const handleAddText = (text: string, name: string) => {
    const newFile: UploadedFile = {
      id: generateFileId(),
      name: name,
      type: 'text',
      size: `${(text.length / 1024).toFixed(2)} KB`,
      progress: 100,
      status: 'success'
    };

    setUploadedFiles([...uploadedFiles, newFile]);
    
    toast({
      title: 'Text added',
      description: `Added "${name}" to knowledge base`,
    });
  };

  const handleRemoveFile = (fileId: number) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
    
    toast({
      title: 'File removed',
      description: 'Removed file from upload queue',
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/knowledge')} className="mb-4 flex items-center gap-1 pl-0">
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Base
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add Knowledge Source</h1>
        <p className="text-muted-foreground mt-1">
          Upload documents, websites, or text to create AI knowledge sources
        </p>
      </div>

      <Tabs defaultValue="website" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="text">Plain Text</TabsTrigger>
          <TabsTrigger value="spreadsheet">Spreadsheet</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="pt-6">
            <TabsContent value="website">
              <WebsiteInput onAddWebsite={handleAddWebsite} />
            </TabsContent>
            <TabsContent value="document">
              <DocumentUpload onUpload={handleUploadDocuments} />
            </TabsContent>
            <TabsContent value="text">
              <PlainTextInput onAddText={handleAddText} />
            </TabsContent>
            <TabsContent value="spreadsheet">
              <SpreadsheetUpload onUpload={handleUploadDocuments} />
            </TabsContent>
          </CardContent>
        </Card>

        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Uploaded Files</h2>
            <UploadedFiles files={uploadedFiles} onRemoveFile={handleRemoveFile} />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default KnowledgeUpload;
