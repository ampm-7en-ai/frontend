
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Upload } from 'lucide-react';

const KnowledgeUpload = () => {
  return (
    <MainLayout 
      pageTitle="Upload Knowledge" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Knowledge Base', href: '/knowledge' },
        { label: 'Upload', href: '/knowledge/upload' }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Knowledge Source</CardTitle>
            <CardDescription>
              Add documents to your knowledge base to train your AI agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Source Name</Label>
              <Input id="source-name" placeholder="e.g., Product Documentation" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source-type">Source Type</Label>
              <Select>
                <SelectTrigger id="source-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documents">Documents (PDF, DOCX)</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="api">API Connection</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-10 text-center space-y-4">
              <div className="flex justify-center">
                <FileUp className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Drag and drop files here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: PDF, DOCX, TXT, CSV, MD (Max 20MB)
                </p>
              </div>
              <Button variant="outline" className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Upload and Process</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default KnowledgeUpload;
