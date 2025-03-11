import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Bot, User, Calendar, Filter, PlusCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      unread: true,
      avatar: '/lovable-uploads/ab4f3745-ead8-45d2-8590-619f42a14956.png'
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
  const [activeFilters, setActiveFilters] = useState(['Friends', 'Best Club']);

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success/20 text-success';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-warning/20 text-warning';
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Conversations</h1>
            <p className="text-muted-foreground">Manage and monitor customer conversations with AI agents</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-blue-400 hover:from-primary-hover hover:to-blue-500" asChild>
            <Link to="/conversations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Conversation
            </Link>
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Filtered Search</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    </div>
                    <span className="text-sm font-medium">Agent</span>
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Search by agent..." 
                      className="pl-8 border-blue-100 focus:border-blue-300"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    </div>
                    <span className="text-sm font-medium">Customer</span>
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Search by customer..." 
                      className="pl-8 border-blue-100 focus:border-blue-300" 
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    </div>
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Filter by status..." 
                      className="pl-8 border-blue-100 focus:border-blue-300" 
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    </div>
                    <span className="text-sm font-medium">Date Range</span>
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Select date range..." 
                      className="pl-8 border-blue-100 focus:border-blue-300" 
                    />
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    </div>
                    <span className="text-sm font-medium">Topic</span>
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Filter by topic..." 
                      className="pl-8 border-blue-100 focus:border-blue-300" 
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-transparent"></div>
                    </div>
                    <span className="text-sm font-medium">Unread Only</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                  {filter}
                  <button onClick={() => removeFilter(filter)} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-blue-50/50 border-b border-blue-100 rounded-lg p-1 mb-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4">
              All Conversations
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4">
              Active
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4">
              Resolved
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4">
              Pending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {conversations.map((conversation) => (
              <Link to={`/conversations/${conversation.id}`} key={conversation.id}>
                <Card className={`transition-all hover:shadow-md ${conversation.unread ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'} bg-gradient-to-br from-white to-blue-50/30`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 border-2 border-blue-100">
                          <AvatarImage src={conversation.avatar} alt={conversation.customerName} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {conversation.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium truncate">
                              {conversation.title}
                              {conversation.unread && (
                                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">New</Badge>
                              )}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{conversation.snippet}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center text-xs text-blue-600">
                              <Bot className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.agentName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.customerName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Badge className={getStatusColor(conversation.status)}>
                          {conversation.status}
                        </Badge>
                        <MessageSquare className="h-5 w-5 text-blue-400 ml-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {conversations.filter(c => c.status.toLowerCase() === 'active').map((conversation) => (
              <Link to={`/conversations/${conversation.id}`} key={conversation.id}>
                <Card className={`transition-all hover:shadow-md ${conversation.unread ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'} bg-gradient-to-br from-white to-blue-50/30`}>
                  <CardContent className="p-4">
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 border-2 border-blue-100">
                          <AvatarImage src={conversation.avatar} alt={conversation.customerName} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {conversation.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium truncate">
                              {conversation.title}
                              {conversation.unread && (
                                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">New</Badge>
                              )}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{conversation.snippet}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center text-xs text-blue-600">
                              <Bot className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.agentName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.customerName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Badge className={getStatusColor(conversation.status)}>
                          {conversation.status}
                        </Badge>
                        <MessageSquare className="h-5 w-5 text-blue-400 ml-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </TabsContent>

          
          <TabsContent value="resolved" className="space-y-4">
            {conversations.filter(c => c.status.toLowerCase() === 'resolved').map((conversation) => (
              <Link to={`/conversations/${conversation.id}`} key={conversation.id}>
                <Card className="transition-all hover:shadow-md border-l-4 border-l-transparent bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="p-4">
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 border-2 border-blue-100">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {conversation.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium truncate">{conversation.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{conversation.snippet}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center text-xs text-blue-600">
                              <Bot className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.agentName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.customerName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Badge className={getStatusColor(conversation.status)}>
                          {conversation.status}
                        </Badge>
                        <MessageSquare className="h-5 w-5 text-blue-400 ml-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {conversations.filter(c => c.status.toLowerCase() === 'pending').map((conversation) => (
              <Link to={`/conversations/${conversation.id}`} key={conversation.id}>
                <Card className="transition-all hover:shadow-md border-l-4 border-l-transparent bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="p-4">
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 border-2 border-blue-100">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {conversation.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium truncate">{conversation.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{conversation.snippet}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center text-xs text-blue-600">
                              <Bot className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.agentName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.customerName}</span>
                            </div>
                            <div className="flex items-center text-xs text-blue-600">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{conversation.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Badge className={getStatusColor(conversation.status)}>
                          {conversation.status}
                        </Badge>
                        <MessageSquare className="h-5 w-5 text-blue-400 ml-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConversationList;
