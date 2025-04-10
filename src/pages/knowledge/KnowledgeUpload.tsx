
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { markKnowledgeSourceAdded } from '@/utils/knowledge-update-tracker';

const KnowledgeUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSuccess = () => {
    // Mark that a new knowledge source was added to trigger refetch in KnowledgeBase
    markKnowledgeSourceAdded();
    
    // Optionally invalidate the query if needed
    queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    
    toast({
      title: "Upload successful",
      description: "Your knowledge source has been successfully uploaded.",
    });
    
    navigate('/knowledge');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Knowledge Source</h1>
        <p className="text-muted-foreground">
          Add documents, websites, or other data to enhance your agents' knowledge.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload PDF, Word, or text files to add to your knowledge base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Document upload form content would go here */}
            <div className="border-2 border-dashed rounded-lg p-10 text-center">
              <p className="text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
              <Button onClick={handleUploadSuccess}>Simulate Upload</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Website Import</CardTitle>
            <CardDescription>
              Import content from websites by providing URLs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Website import form content would go here */}
            <div className="border-2 border-dashed rounded-lg p-10 text-center">
              <p className="text-muted-foreground mb-4">Enter website URLs to import</p>
              <Button onClick={handleUploadSuccess}>Simulate Import</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plain Text</CardTitle>
            <CardDescription>
              Add plain text content directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Plain text form content would go here */}
            <div className="border-2 border-dashed rounded-lg p-10 text-center">
              <p className="text-muted-foreground mb-4">Enter or paste text content</p>
              <Button onClick={handleUploadSuccess}>Simulate Addition</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeUpload;
