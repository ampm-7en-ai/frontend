
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Bot, 
  GitBranch, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Copy,
  Edit,
  Trash,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockTemplates = [
  {
    id: 't1',
    name: 'Customer Support Agent',
    type: 'agent',
    description: 'A general-purpose customer support agent that can handle common inquiries',
    category: 'Support',
    usedBy: 14,
    lastUpdated: '2 days ago',
  },
  {
    id: 't2',
    name: 'Finance Knowledge Base',
    type: 'knowledge',
    description: 'Knowledge base structure optimized for financial services',
    category: 'Finance',
    usedBy: 8,
    lastUpdated: '1 week ago',
  },
  {
    id: 't3',
    name: 'Lead Generation Workflow',
    type: 'workflow',
    description: 'Multi-agent workflow for qualifying and following up with leads',
    category: 'Sales',
    usedBy: 12,
    lastUpdated: '3 days ago',
  },
  {
    id: 't4',
    name: 'Healthcare Compliance Agent',
    type: 'agent',
    description: 'Agent pre-configured for healthcare compliance requirements',
    category: 'Healthcare',
    usedBy: 5,
    lastUpdated: '5 days ago',
  },
  {
    id: 't5',
    name: 'Product Catalog Structure',
    type: 'knowledge',
    description: 'Knowledge base structure for organizing product information',
    category: 'E-commerce',
    usedBy: 9,
    lastUpdated: '1 day ago',
  },
  {
    id: 't6',
    name: 'Customer Onboarding Flow',
    type: 'workflow',
    description: 'Guided workflow for onboarding new customers to a service',
    category: 'Customer Success',
    usedBy: 11,
    lastUpdated: '6 days ago',
  },
];

const GlobalTemplates = () => {
  return (
    <MainLayout 
      pageTitle="Global Templates" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Templates', href: '/templates' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="agents">Agent Templates</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base Templates</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {template.type === 'agent' && <Bot className="h-4 w-4 text-primary" />}
                        {template.type === 'knowledge' && <FileText className="h-4 w-4 text-primary" />}
                        {template.type === 'workflow' && <GitBranch className="h-4 w-4 text-primary" />}
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="capitalize">{template.type} Template</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
                    <div>Used by {template.usedBy} businesses</div>
                    <div>Updated {template.lastUpdated}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Placeholder content for other tabs */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.filter(t => t.type === 'agent').map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  {/* Same card structure as above */}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="capitalize">{template.type} Template</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
                    <div>Used by {template.usedBy} businesses</div>
                    <div>Updated {template.lastUpdated}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.filter(t => t.type === 'knowledge').map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  {/* Knowledge base template cards */}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="capitalize">{template.type} Template</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
                    <div>Used by {template.usedBy} businesses</div>
                    <div>Updated {template.lastUpdated}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.filter(t => t.type === 'workflow').map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  {/* Workflow template cards */}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="capitalize">{template.type} Template</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
                    <div>Used by {template.usedBy} businesses</div>
                    <div>Updated {template.lastUpdated}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GlobalTemplates;
