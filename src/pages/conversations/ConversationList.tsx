
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, Filter, MoreHorizontal, MessageSquare, Clock, 
  User, Bot, Send, Info, Users, Tag, ArrowRight, 
  ThumbsUp, ThumbsDown, HelpCircle, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const ConversationList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      satisfaction: 'high',
      priority: 'normal',
      duration: '2h 15m',
      handoffCount: 0,
      topic: 'Account Setup',
      messages: [
        { id: 'm1', content: 'Hello, I need help with setting up my account.', sender: 'user', timestamp: '2 hours ago' },
        { id: 'm2', content: 'Hi John! I\'d be happy to help you set up your account. Can you tell me what specific step you\'re having trouble with?', sender: 'bot', timestamp: '2 hours ago', agent: 'Sales Bot' },
        { id: 'm3', content: 'I\'m stuck at the verification step. It says my email is invalid.', sender: 'user', timestamp: '1 hour 58m ago' },
        { id: 'm4', content: 'I understand the frustration. Let me check your account details. Can you confirm the email you used for registration?', sender: 'bot', timestamp: '1 hour 57m ago', agent: 'Sales Bot' },
        { id: 'm5', content: 'I used john.doe@example.com', sender: 'user', timestamp: '1 hour 55m ago' },
        { id: 'm6', content: 'Thank you. I\'ve checked and there seems to be a verification issue. I\'ll send a new verification link to your email right away.', sender: 'bot', timestamp: '1 hour 54m ago', agent: 'Sales Bot' },
      ]
    },
    {
      id: 'conv2',
      customer: 'Jane Smith',
      email: 'jane.smith@example.com',
      lastMessage: 'Can you tell me more about your pricing plans?',
      time: '3 hours ago',
      status: 'closed',
      agent: 'Support Bot',
      satisfaction: 'medium',
      priority: 'normal',
      duration: '45m',
      handoffCount: 1,
      topic: 'Pricing Plans',
      messages: []
    },
    {
      id: 'conv3',
      customer: 'Robert Johnson',
      email: 'robert.j@example.com',
      lastMessage: 'Thank you for your help!',
      time: '1 day ago',
      status: 'closed',
      agent: 'Sales Bot',
      satisfaction: 'high',
      priority: 'normal',
      duration: '32m',
      handoffCount: 0,
      topic: 'General Inquiry',
      messages: []
    },
    {
      id: 'conv4',
      customer: 'Emily Williams',
      email: 'emily.w@example.com',
      lastMessage: 'I\'m still experiencing the same issue',
      time: '4 hours ago',
      status: 'active',
      agent: 'Support Bot',
      satisfaction: 'low',
      priority: 'high',
      duration: '4h 22m',
      handoffCount: 2,
      topic: 'Technical Support',
      messages: []
    },
    {
      id: 'conv5',
      customer: 'Michael Brown',
      email: 'michael.b@example.com',
      lastMessage: 'Can we schedule a demo?',
      time: '5 hours ago',
      status: 'pending',
      agent: 'Sales Bot',
      satisfaction: 'medium',
      priority: 'normal',
      duration: '1h 15m',
      handoffCount: 1,
      topic: 'Product Demo',
      messages: []
    },
  ];

  // Selected conversation details
  const activeConversation = conversations.find(c => c.id === selectedConversation) || null;

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Priority indicator
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-500"><AlertCircle className="h-3 w-3 mr-1" /> High</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="h-3 w-3 mr-1" /> Normal</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500"><ThumbsUp className="h-3 w-3 mr-1" /> Low</Badge>;
      default:
        return null;
    }
  };

  // Satisfaction indicator
  const getSatisfactionIndicator = (satisfaction: string) => {
    switch (satisfaction) {
      case 'high':
        return <div className="flex items-center text-green-600"><ThumbsUp className="h-4 w-4 mr-1" /> High</div>;
      case 'medium':
        return <div className="flex items-center text-amber-600"><CheckCircle className="h-4 w-4 mr-1" /> Medium</div>;
      case 'low':
        return <div className="flex items-center text-red-600"><ThumbsDown className="h-4 w-4 mr-1" /> Low</div>;
      default:
        return null;
    }
  };

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // In a real application, you'd send this to your backend
    toast({
      title: "Message sent",
      description: "Your message has been sent to the customer.",
    });
    
    setNewMessage('');
  };

  // Filter conversations based on search and filter criteria
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel - Conversation List */}
      <div className="w-80 border-r p-4 flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Conversations</h2>
          <div className="relative">
            <Input 
              placeholder="Search conversations..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex mt-2 gap-1">
            <Button 
              variant={filterStatus === 'all' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="flex-1"
            >
              All
            </Button>
            <Button 
              variant={filterStatus === 'active' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="flex-1"
            >
              Active
            </Button>
            <Button 
              variant={filterStatus === 'pending' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus('pending')}
              className="flex-1"
            >
              Pending
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className={cn(
                "mb-2 hover:bg-accent/5 transition-colors cursor-pointer",
                selectedConversation === conversation.id && "border-primary bg-primary/5"
              )}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      conversation.status === 'active' ? "bg-green-500" : 
                      conversation.status === 'pending' ? "bg-amber-500" : "bg-gray-500"
                    )} />
                    <div>
                      <h3 className="font-medium">{conversation.customer}</h3>
                      <div className="text-xs text-muted-foreground">{conversation.topic}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversation.time}
                  </div>
                </div>
                <div className="mt-2 text-sm line-clamp-2">
                  {conversation.lastMessage}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {conversation.duration}
                    </div>
                    {conversation.handoffCount > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {conversation.handoffCount}
                      </div>
                    )}
                  </div>
                  {getPriorityIndicator(conversation.priority)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Center Panel - Conversation Messages */}
      <div className="flex-1 flex flex-col h-full">
        {activeConversation ? (
          <>
            <div className="border-b p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold">{activeConversation.customer}</h2>
                  <div className="ml-3">{getStatusBadge(activeConversation.status)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {activeConversation.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="h-4 w-4 mr-1" />
                    {activeConversation.topic}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {activeConversation.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 mr-2 bg-primary">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg",
                      message.sender === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-white border border-gray-200 rounded-tl-none"
                    )}
                  >
                    {message.sender === 'bot' && message.agent && (
                      <div className="text-xs font-medium mb-1 text-muted-foreground">
                        {message.agent}
                      </div>
                    )}
                    <p className="break-words">{message.content}</p>
                    <div className="text-xs mt-1 opacity-70">
                      {message.timestamp}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 bg-purple-500">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-primary">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No conversation selected</h3>
              <p>Select a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Right Panel - Conversation Details */}
      <div className="w-72 border-l p-4 h-full overflow-y-auto">
        {activeConversation ? (
          <>
            <h2 className="text-xl font-bold mb-4">Details</h2>
            
            <div className="space-y-6">
              {/* Agent Information */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  Current Agent
                </h3>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2 bg-primary">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{activeConversation.agent}</div>
                      <div className="text-xs text-muted-foreground">AI Assistant</div>
                    </div>
                  </div>
                </div>
                
                {activeConversation.handoffCount > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Previous Agents:</div>
                    <div className="flex items-center text-xs">
                      <Avatar className="h-6 w-6 mr-1">
                        <AvatarFallback className="text-[10px]">JD</AvatarFallback>
                      </Avatar>
                      <span>John Doe (Support) → </span>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Customer Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Full Name</div>
                    <div className="text-sm">{activeConversation.customer}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-sm">{activeConversation.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                    <div className="text-sm">{getSatisfactionIndicator(activeConversation.satisfaction)}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Handoff Controls */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Handoff Controls
                </h3>
                
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Transfer to</div>
                  <select className="w-full text-sm border rounded p-1.5">
                    <option>Sales Team</option>
                    <option>Support Team</option>
                    <option>Technical Team</option>
                    <option>John Doe (Agent)</option>
                    <option>Jane Smith (Agent)</option>
                  </select>
                  
                  <div className="text-xs text-muted-foreground mt-2">Reason</div>
                  <select className="w-full text-sm border rounded p-1.5">
                    <option>Need specialized knowledge</option>
                    <option>Customer request</option>
                    <option>Technical escalation</option>
                    <option>Follow-up required</option>
                  </select>
                  
                  <Button className="w-full mt-2">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Transfer Conversation
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Topic Classification */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Topic Classification
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Account Setup</div>
                    <Badge variant="outline" className="text-xs">95%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Email Verification</div>
                    <Badge variant="outline" className="text-xs">88%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Technical Support</div>
                    <Badge variant="outline" className="text-xs">45%</Badge>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Adjust Topics
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Knowledge Gaps */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Knowledge Insights
                </h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                  <div className="font-medium text-amber-800">Potential Knowledge Gaps</div>
                  <ul className="list-disc pl-4 mt-1 text-amber-700 space-y-1">
                    <li>Detailed verification process</li>
                    <li>Account recovery options</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a conversation to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
