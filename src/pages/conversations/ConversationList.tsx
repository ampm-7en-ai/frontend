
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Bot, User, Calendar, Filter, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConversationList = () => {
  // Sample conversations data
  const conversations = [
    {
      id: 1,
      title: 'Product inquiry about pricing plans',
      snippet: 'Customer asked about our premium plan features and how they compare to the basic plan...',
      agentName: 'Sales Assistant',
      customerName: 'Sarah Johnson',
      date: '2 hours ago',
      status: 'Active',
      unread: true
    },
    {
      id: 2,
      title: 'Technical support for API integration',
      snippet: 'Developer needs help with authentication tokens and webhook setup for our API...',
      agentName: 'Technical Support',
      customerName: 'Michael Chen',
      date: '1 day ago',
      status: 'Resolved',
      unread: false
    },
    {
      id: 3,
      title: 'Billing discrepancy resolution',
      snippet: 'Customer reporting incorrect charges on their latest invoice from last month...',
      agentName: 'Customer Support Agent',
      customerName: 'Emma Wilson',
      date: '3 days ago',
      status: 'Pending',
      unread: false
    },
    {
      id: 4,
      title: 'Onboarding assistance for new team',
      snippet: 'Enterprise customer needs help setting up accounts for their new department...',
      agentName: 'Onboarding Guide',
      customerName: 'James Parker',
      date: '5 days ago',
      status: 'Closed',
      unread: false
    }
  ];

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout 
      pageTitle="Conversations" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Conversations', href: '/conversations' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">Manage and monitor customer conversations with AI agents</p>
          </div>
          <Button asChild>
            <Link to="/conversations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Conversation
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              Date Range
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link to={`/conversations/${conversation.id}`} key={conversation.id}>
              <Card className={`transition-all hover:border-primary/50 hover:shadow-md ${conversation.unread ? 'border-l-4 border-l-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="font-medium truncate">
                          {conversation.title}
                          {conversation.unread && (
                            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">New</Badge>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{conversation.snippet}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Bot className="h-3.5 w-3.5 mr-1" />
                          <span>{conversation.agentName}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>{conversation.customerName}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{conversation.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Badge className={getStatusColor(conversation.status)}>
                        {conversation.status}
                      </Badge>
                      <MessageSquare className="h-5 w-5 text-muted-foreground ml-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ConversationList;
