
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
  // For now we'll just create a simple component skeleton
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('website');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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
              <WebsiteInput />
            </TabsContent>
            <TabsContent value="document">
              <DocumentUpload />
            </TabsContent>
            <TabsContent value="text">
              <PlainTextInput />
            </TabsContent>
            <TabsContent value="spreadsheet">
              <SpreadsheetUpload />
            </TabsContent>
          </CardContent>
        </Card>

        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Uploaded Files</h2>
            <UploadedFiles files={uploadedFiles} />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default KnowledgeUpload;
