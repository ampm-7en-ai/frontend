
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, SendHorizontal, User, Bot, Calendar, 
  Clock, MoreVertical, Save, Download, Trash2
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  senderName: string;
};

const ConversationDetail = () => {
  const { id } = useParams();
  const [inputMessage, setInputMessage] = useState('');
  
  // Sample conversation data
  const conversation = {
    id: Number(id),
    title: 'Product inquiry about pricing plans',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    agentName: 'Sales Assistant',
    status: 'Active',
    startedAt: new Date('2023-06-10T14:30:00'),
    lastUpdatedAt: new Date('2023-06-10T15:45:00'),
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm interested in your product, but I'm having trouble understanding the difference between your pricing plans. Can you help me understand what's included in each tier?",
      sender: 'user',
      timestamp: new Date('2023-06-10T14:30:00'),
      senderName: 'Sarah Johnson'
    },
    {
      id: 2,
      content: "Hello Sarah! I'd be happy to explain our pricing plans to you. We have three tiers: Basic, Pro, and Enterprise. The Basic plan includes core features like X, Y, and Z and costs $9.99/month. The Pro plan includes everything in Basic plus advanced features like A, B, and C for $29.99/month. The Enterprise plan is customized for large organizations with additional needs like dedicated support and custom integrations. Would you like me to go into more detail about any specific plan?",
      sender: 'agent',
      timestamp: new Date('2023-06-10T14:32:00'),
      senderName: 'Sales Assistant'
    },
    {
      id: 3,
      content: "Thanks for that overview. I'm particularly interested in the Pro plan. How many users are included, and is there a limit to the number of projects we can create?",
      sender: 'user',
      timestamp: new Date('2023-06-10T14:35:00'),
      senderName: 'Sarah Johnson'
    },
    {
      id: 4,
      content: "Great question! The Pro plan includes up to 10 user accounts, and there's no limit to the number of projects you can create. If you need more than 10 user accounts, you can add additional users for $5 per user per month. Is there anything else you'd like to know about the Pro plan?",
      sender: 'agent',
      timestamp: new Date('2023-06-10T14:38:00'),
      senderName: 'Sales Assistant'
    },
    {
      id: 5,
      content: "That sounds promising. What about storage limits? We have quite a lot of data that we'd need to store in your system.",
      sender: 'user',
      timestamp: new Date('2023-06-10T14:42:00'),
      senderName: 'Sarah Johnson'
    },
    {
      id: 6,
      content: "The Pro plan includes 100GB of storage. If you need more storage, you can purchase additional storage in 50GB increments for $10/month. For customers with very large storage needs, the Enterprise plan might be more cost-effective as it includes 1TB of storage with the option to add more. Would you like me to prepare a custom quote based on your specific needs?",
      sender: 'agent',
      timestamp: new Date('2023-06-10T14:45:00'),
      senderName: 'Sales Assistant'
    }
  ]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: 'You'
    };
    
    setMessages([...messages, userMessage]);
    setInputMessage('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentMessage: Message = {
        id: messages.length + 2,
        content: "Thank you for your inquiry. I'm pulling up more details about our storage options and pricing for your specific use case. We do offer custom solutions for businesses with larger data requirements. Would it help if I scheduled a call with one of our solution architects to discuss your specific needs in more detail?",
        sender: 'agent',
        timestamp: new Date(),
        senderName: conversation.agentName
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout 
      pageTitle="Conversation Detail" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Conversations', href: '/conversations' },
        { label: `Conversation #${id}`, href: `/conversations/${id}` }
      ]}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link to="/conversations">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">{conversation.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              {conversation.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Save className="mr-2 h-4 w-4" />
                  Save Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{conversation.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{conversation.customerName}</h3>
                      <p className="text-xs text-muted-foreground">{conversation.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(conversation.startedAt)}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        {message.sender === 'user' ? (
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {message.sender === 'user' ? message.senderName : 'AI Assistant'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        
                        <div className={cn(
                          "p-3 rounded-lg text-sm",
                          message.sender === 'user' 
                            ? "bg-muted" 
                            : "bg-primary/10"
                        )}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-h-[80px] resize-none"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="h-10 w-10">
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agent:</span>
                    <span className="font-medium flex items-center">
                      <Bot className="h-3.5 w-3.5 mr-1 text-primary" />
                      {conversation.agentName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {conversation.customerName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="font-medium">{formatDate(conversation.startedAt)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Activity:</span>
                    <span className="font-medium">{formatDate(conversation.lastUpdatedAt)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1h 15m</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="mr-2 h-3.5 w-3.5" />
                      View Customer Profile
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bot className="mr-2 h-3.5 w-3.5" />
                      View Agent Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Related Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="link" className="h-auto p-0 text-sm justify-start">
                    Pricing Documentation
                  </Button>
                  <Button variant="link" className="h-auto p-0 text-sm justify-start">
                    Storage Policy
                  </Button>
                  <Button variant="link" className="h-auto p-0 text-sm justify-start">
                    Enterprise Solutions Guide
                  </Button>
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
