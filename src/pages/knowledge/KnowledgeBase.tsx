
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, FolderPlus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const KnowledgeBase = () => {
  // Sample knowledge sources
  const knowledgeSources = [
    { id: 1, name: 'Product Documentation', files: 24, lastUpdated: '2 hours ago' },
    { id: 2, name: 'FAQ Database', files: 56, lastUpdated: '1 day ago' },
    { id: 3, name: 'Customer Support Tickets', files: 183, lastUpdated: '4 hours ago' },
    { id: 4, name: 'Training Materials', files: 42, lastUpdated: '3 days ago' }
  ];

  return (
    <MainLayout 
      pageTitle="Knowledge Base" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Knowledge Base', href: '/knowledge' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">Manage your AI knowledge sources</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/knowledge/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Link>
            </Button>
            <Button asChild>
              <Link to="/knowledge/upload">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Knowledge Source
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeSources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-4 w-4 text-primary" />
                  {source.name}
                </CardTitle>
                <CardDescription>{source.files} files</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Last updated: {source.lastUpdated}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default KnowledgeBase;
