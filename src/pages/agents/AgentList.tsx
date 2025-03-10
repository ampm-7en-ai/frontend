
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertCircle, Plus, Search, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgentList = () => {
  // Sample agents data
  const agents = [
    { 
      id: 1, 
      name: 'Customer Support Agent', 
      description: 'Handles customer inquiries and troubleshooting',
      status: 'Active',
      type: 'Standard',
      performance: { accuracy: '92%', response: '1.2s' },
      lastUpdated: '2 hours ago'
    },
    { 
      id: 2, 
      name: 'Sales Assistant', 
      description: 'Provides product recommendations and answers sales questions',
      status: 'Active',
      type: 'Premium',
      performance: { accuracy: '89%', response: '0.9s' },
      lastUpdated: '1 day ago'
    },
    { 
      id: 3, 
      name: 'Technical Support', 
      description: 'Resolves technical issues and provides guidance',
      status: 'Inactive',
      type: 'Standard',
      performance: { accuracy: '87%', response: '1.5s' },
      lastUpdated: '3 days ago'
    },
    { 
      id: 4, 
      name: 'Onboarding Guide', 
      description: 'Helps new users navigate the platform',
      status: 'Draft',
      type: 'Basic',
      performance: { accuracy: 'N/A', response: 'N/A' },
      lastUpdated: '5 hours ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout 
      pageTitle="Agent Management" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Agents', href: '/agents' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Agent Management</h1>
            <p className="text-muted-foreground">Create and manage your AI agents</p>
          </div>
          <Button asChild>
            <Link to="/agents/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Agent
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search agents..." className="pl-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-2 p-2 rounded-full bg-primary/10">
                      {agent.status === 'Active' ? (
                        <Bot className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium flex items-center">
                      {agent.type}
                      {agent.type === 'Premium' && <Star className="ml-1 h-3.5 w-3.5 text-amber-500" />}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-medium">{agent.performance.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-medium">{agent.performance.response}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t pt-3 mt-3">
                  <span className="text-xs text-muted-foreground">Updated {agent.lastUpdated}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    {agent.status === 'Active' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/agents/test">
                          <Zap className="mr-1 h-3.5 w-3.5" />
                          Test
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentList;
