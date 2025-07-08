
import React from 'react';
import { useBuilder } from './BuilderContext';
import { Database, FileText, Globe, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ModernButton from '@/components/dashboard/ModernButton';

export const BuilderSidebar = () => {
  const { state } = useBuilder();

  const mockKnowledgeSources = [
    {
      id: '1',
      name: 'Company Website',
      type: 'website',
      status: 'active',
      files: [
        { name: 'About Us', url: '/about' },
        { name: 'Services', url: '/services' },
        { name: 'Contact', url: '/contact' }
      ]
    },
    {
      id: '2',
      name: 'Product Documentation',
      type: 'document',
      status: 'active',
      files: [
        { name: 'User Guide.pdf', size: '2.4 MB' },
        { name: 'API Reference.pdf', size: '1.8 MB' }
      ]
    },
    {
      id: '3',
      name: 'FAQ Database',
      type: 'database',
      status: 'training',
      files: [
        { name: 'Common Questions', entries: 45 },
        { name: 'Technical Support', entries: 23 }
      ]
    }
  ];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'website': return <Globe className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'training': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Knowledge Base
          </h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100%-80px)]">
        <div className="p-4 space-y-4">
          {mockKnowledgeSources.map((source) => (
            <Card key={source.id} className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                      {getSourceIcon(source.type)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                      <CardDescription className={`text-xs capitalize ${getStatusColor(source.status)}`}>
                        {source.status}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {source.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 pl-4">
                      <ChevronRight className="h-3 w-3" />
                      <span className="flex-1 truncate">
                        {file.name || file.url}
                      </span>
                      {file.size && (
                        <span className="text-gray-500 dark:text-gray-500">
                          {file.size}
                        </span>
                      )}
                      {file.entries && (
                        <span className="text-gray-500 dark:text-gray-500">
                          {file.entries} entries
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {mockKnowledgeSources.length === 0 && (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No knowledge sources added yet</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge Source
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
