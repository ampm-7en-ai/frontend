
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  User, 
  Bot, 
  Star, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock conversation data
const mockConversation = {
  id: '1',
  customer: 'John Smith',
  agent: 'Support Assistant',
  status: 'active',
  priority: 'medium',
  startedAt: '2024-01-15T10:30:00Z',
  lastMessage: '2024-01-15T11:45:00Z',
  totalMessages: 24,
  satisfaction: 4.5,
  tags: ['billing', 'account-setup'],
  assignedTo: 'Sarah Johnson',
  messages: [
    {
      id: '1',
      type: 'customer',
      content: 'Hi, I need help setting up my account',
      timestamp: '2024-01-15T10:30:00Z',
      sender: 'John Smith'
    },
    {
      id: '2',
      type: 'agent',
      content: 'Hello! I\'d be happy to help you set up your account. Can you tell me what specific issue you\'re encountering?',
      timestamp: '2024-01-15T10:31:00Z',
      sender: 'Support Assistant'
    },
    {
      id: '3',
      type: 'customer',
      content: 'I\'m having trouble with the email verification step',
      timestamp: '2024-01-15T10:35:00Z',
      sender: 'John Smith'
    },
    {
      id: '4',
      type: 'agent',
      content: 'I can help with that. Let me check your account status and resend the verification email if needed.',
      timestamp: '2024-01-15T10:36:00Z',
      sender: 'Support Assistant'
    }
  ]
};

const statusOptions = [
  { value: 'active', label: 'Active', description: 'Conversation is ongoing' },
  { value: 'resolved', label: 'Resolved', description: 'Issue has been resolved' },
  { value: 'pending', label: 'Pending', description: 'Waiting for customer response' },
  { value: 'escalated', label: 'Escalated', description: 'Escalated to human agent' },
  { value: 'closed', label: 'Closed', description: 'Conversation ended' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Non-urgent inquiry' },
  { value: 'medium', label: 'Medium', description: 'Standard priority' },
  { value: 'high', label: 'High', description: 'Urgent issue' },
  { value: 'critical', label: 'Critical', description: 'Business critical' }
];

const ConversationDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [conversation, setConversation] = useState(mockConversation);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch conversation data here
    console.log('Loading conversation:', id);
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    setConversation(prev => ({ ...prev, status: newStatus }));
    toast({
      title: "Status Updated",
      description: `Conversation status changed to ${newStatus}`,
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    setConversation(prev => ({ ...prev, priority: newPriority }));
    toast({
      title: "Priority Updated",
      description: `Priority changed to ${newPriority}`,
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const message = {
        id: String(conversation.messages.length + 1),
        type: 'agent' as const,
        content: newMessage,
        timestamp: new Date().toISOString(),
        sender: 'You'
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        totalMessages: prev.totalMessages + 1
      }));
      
      setNewMessage('');
      setIsLoading(false);
      
      toast({
        title: "Message Sent",
        description: "Your message has been added to the conversation",
      });
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Pause className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <MainLayout 
      pageTitle="Conversation Details" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Conversations', href: '/conversations' },
        { label: `#${id}`, href: '#' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link to="/conversations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Conversations
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main conversation area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Conversation #{id}
                    </CardTitle>
                    <CardDescription>
                      Started {formatDate(conversation.startedAt)} • {conversation.totalMessages} messages
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(conversation.satisfaction) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {conversation.satisfaction}/5
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversation.messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.type === 'customer' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'agent' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {message.type === 'customer' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg p-3 ${message.type === 'customer' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.type === 'customer' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Label htmlFor="message">Send a message</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with conversation details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <ModernDropdown
                    value={conversation.status}
                    onValueChange={handleStatusChange}
                    options={statusOptions}
                    trigger={
                      <div className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
                        {getStatusIcon(conversation.status)}
                        <span className="capitalize">{conversation.status}</span>
                      </div>
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <ModernDropdown
                    value={conversation.priority}
                    onValueChange={handlePriorityChange}
                    options={priorityOptions}
                    trigger={
                      <div className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
                        <div className={`w-2 h-2 rounded-full ${conversation.priority === 'critical' ? 'bg-red-500' : conversation.priority === 'high' ? 'bg-orange-500' : conversation.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className="capitalize">{conversation.priority}</span>
                      </div>
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{conversation.customer}</p>
                      <p className="text-sm text-muted-foreground">Customer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{conversation.agent}</p>
                      <p className="text-sm text-muted-foreground">AI Agent</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Last Activity</p>
                      <p className="text-sm text-muted-foreground">{formatTime(conversation.lastMessage)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {conversation.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConversationDetail;
