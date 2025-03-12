
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageSquare, Search, Filter, MoreHorizontal, Plus, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const ConversationList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [agentNameError, setAgentNameError] = useState(false);

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) {
      setAgentNameError(true);
      return;
    }
    
    setAgentNameError(false);
    toast({
      title: "Agent Created",
      description: `${newAgentName} has been successfully created.`,
      variant: "default"
    });
    
    setNewAgentName('');
    setIsCreateAgentOpen(false);
    navigate('/agents');
  };

  // Mock conversation data
  const conversations = [
    {
      id: 'conv1',
      customer: 'John Doe',
      email: 'john.doe@example.com',
      lastMessage: 'I need help with setting up my account',
      time: '2 hours ago',
      status: 'active',
      agent: 'Sales Bot',
      satisfaction: 'high'
    },
    {
      id: 'conv2',
      customer: 'Jane Smith',
      email: 'jane.smith@example.com',
      lastMessage: 'Can you tell me more about your pricing plans?',
      time: '3 hours ago',
      status: 'closed',
      agent: 'Support Bot',
      satisfaction: 'medium'
    },
    {
      id: 'conv3',
      customer: 'Robert Johnson',
      email: 'robert.j@example.com',
      lastMessage: 'Thank you for your help!',
      time: '1 day ago',
      status: 'closed',
      agent: 'Sales Bot',
      satisfaction: 'high'
    },
    {
      id: 'conv4',
      customer: 'Emily Williams',
      email: 'emily.w@example.com',
      lastMessage: 'I\'m still experiencing the same issue',
      time: '4 hours ago',
      status: 'active',
      agent: 'Support Bot',
      satisfaction: 'low'
    },
    {
      id: 'conv5',
      customer: 'Michael Brown',
      email: 'michael.b@example.com',
      lastMessage: 'Can we schedule a demo?',
      time: '5 hours ago',
      status: 'pending',
      agent: 'Sales Bot',
      satisfaction: 'medium'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Input 
            placeholder="Search conversations..." 
            className="pl-10" 
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Last 7 days
          </Button>
          <Button 
            variant="default" 
            onClick={() => setIsCreateAgentOpen(true)}
            className="flex items-center gap-1 ml-2"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full md:w-auto">
          <TabsTrigger value="all">All Conversations</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="hover:bg-accent/5 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground p-2 rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <Link to={`/conversations/${conversation.id}`} className="font-medium text-primary hover:underline">
                        {conversation.customer}
                      </Link>
                      <div className="text-sm text-muted-foreground">{conversation.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <div className="text-sm">{conversation.agent}</div>
                      <div className={`text-xs ${
                        conversation.satisfaction === 'high' ? 'text-green-600' : 
                        conversation.satisfaction === 'medium' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {conversation.satisfaction.charAt(0).toUpperCase() + conversation.satisfaction.slice(1)} satisfaction
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{conversation.time}</div>
                      <div className="text-xs">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          conversation.status === 'active' ? 'bg-green-100 text-green-800' : 
                          conversation.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pl-12 text-sm">{conversation.lastMessage}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {/* Similar card components for active conversations */}
          {conversations.filter(c => c.status === 'active').map((conversation) => (
            <Card key={conversation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground p-2 rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <Link to={`/conversations/${conversation.id}`} className="font-medium text-primary hover:underline">
                        {conversation.customer}
                      </Link>
                      <div className="text-sm text-muted-foreground">{conversation.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <div className="text-sm">{conversation.agent}</div>
                      <div className={`text-xs ${
                        conversation.satisfaction === 'high' ? 'text-green-600' : 
                        conversation.satisfaction === 'medium' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {conversation.satisfaction.charAt(0).toUpperCase() + conversation.satisfaction.slice(1)} satisfaction
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{conversation.time}</div>
                      <div className="text-xs">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pl-12 text-sm">{conversation.lastMessage}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {/* Similar card components for pending conversations */}
          {conversations.filter(c => c.status === 'pending').map((conversation) => (
            <Card key={conversation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground p-2 rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <Link to={`/conversations/${conversation.id}`} className="font-medium text-primary hover:underline">
                        {conversation.customer}
                      </Link>
                      <div className="text-sm text-muted-foreground">{conversation.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <div className="text-sm">{conversation.agent}</div>
                      <div className={`text-xs ${
                        conversation.satisfaction === 'high' ? 'text-green-600' : 
                        conversation.satisfaction === 'medium' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {conversation.satisfaction.charAt(0).toUpperCase() + conversation.satisfaction.slice(1)} satisfaction
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{conversation.time}</div>
                      <div className="text-xs">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pl-12 text-sm">{conversation.lastMessage}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="closed" className="space-y-4">
          {/* Similar card components for closed conversations */}
          {conversations.filter(c => c.status === 'closed').map((conversation) => (
            <Card key={conversation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground p-2 rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <Link to={`/conversations/${conversation.id}`} className="font-medium text-primary hover:underline">
                        {conversation.customer}
                      </Link>
                      <div className="text-sm text-muted-foreground">{conversation.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <div className="text-sm">{conversation.agent}</div>
                      <div className={`text-xs ${
                        conversation.satisfaction === 'high' ? 'text-green-600' : 
                        conversation.satisfaction === 'medium' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {conversation.satisfaction.charAt(0).toUpperCase() + conversation.satisfaction.slice(1)} satisfaction
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{conversation.time}</div>
                      <div className="text-xs">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                          Closed
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pl-12 text-sm">{conversation.lastMessage}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      
      {/* Create Agent Dialog */}
      <Dialog open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Create New Agent
            </DialogTitle>
            <DialogDescription>
              Give your agent a name to get started. You can configure additional settings later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  placeholder="Enter agent name"
                  value={newAgentName}
                  onChange={(e) => {
                    setNewAgentName(e.target.value);
                    setAgentNameError(false);
                  }}
                  className={agentNameError ? "border-red-500" : ""}
                />
                {agentNameError && (
                  <p className="text-sm text-red-500">Please enter an agent name</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAgentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent}>
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationList;
