import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, Filter, MoreHorizontal, MessageSquare, Clock, 
  User, Bot, Send, Info, Users, Tag, ArrowRight, 
  ThumbsUp, ThumbsDown, HelpCircle, AlertCircle, CheckCircle, 
  ChevronRight, X, Maximize2, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import HandoffHistory from '@/components/conversations/HandoffHistory';

const ConversationList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTablet = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [highlightedHandoffId, setHighlightedHandoffId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      customer: 'Michael Brown',
      email: 'michael.b@example.com',
      lastMessage: 'I\'m still experiencing the same issue after talking to 3 different agents',
      time: '5 minutes ago',
      status: 'pending',
      agent: 'Senior Support Agent',
      satisfaction: 'low',
      priority: 'high',
      duration: '3h 30m',
      handoffCount: 3,
      topic: 'Billing Issue',
      messages: [
        { id: 'm1', content: 'Hello, I need help with my subscription. I was charged twice this month.', sender: 'user', timestamp: '3 hours ago' },
        { id: 'm2', content: 'Hi Michael! I\'m the General Bot. I understand you\'re having billing concerns. Let me check your account details.', sender: 'bot', timestamp: '3 hours ago', agent: 'General Bot' },
        { id: 'm3', content: 'I can see two charges on your account from our system. Let me transfer you to our Technical Support Bot who can better assist with this issue.', sender: 'bot', timestamp: '2 hours 55m ago', agent: 'General Bot' },
        { id: 'transfer1', type: 'transfer', from: 'General Bot', to: 'Technical Support Bot', reason: 'Technical expertise needed for billing investigation', timestamp: '2 hours 50m ago' },
        { id: 'm4', content: 'Hello Michael, I\'m the Technical Support Bot. I\'ve reviewed your account and can see the duplicate charge. This appears to be a system glitch.', sender: 'bot', timestamp: '2 hours 45m ago', agent: 'Technical Support Bot' },
        { id: 'm5', content: 'Can you please help me get a refund for the duplicate charge?', sender: 'user', timestamp: '2 hours 40m ago' },
        { id: 'm6', content: 'I\'ll need to check if this requires approval from our billing department. Let me transfer you to a Billing Specialist who can process the refund for you.', sender: 'bot', timestamp: '2 hours 35m ago', agent: 'Technical Support Bot' },
        { id: 'transfer2', type: 'transfer', from: 'Technical Support Bot', to: 'Billing Specialist', reason: 'Refund authorization required', timestamp: '2 hours 30m ago' },
        { id: 'm7', content: 'Hello Michael, I\'m Sam from the Billing team. I\'m looking at your account now.', sender: 'bot', timestamp: '2 hours 25m ago', agent: 'Billing Specialist' },
        { id: 'm8', content: 'I see the duplicate charge, but our system shows this might be for two different subscription tiers. Are you using multiple features of our platform?', sender: 'bot', timestamp: '2 hours 20m ago', agent: 'Billing Specialist' },
        { id: 'm9', content: 'No, I only have one account and one subscription. I should only be charged once per month according to my plan.', sender: 'user', timestamp: '2 hours 15m ago' },
        { id: 'm10', content: 'I understand. This seems more complex than I initially thought. Let me transfer you to one of our Senior Support Agents who has higher authorization levels to resolve this.', sender: 'bot', timestamp: '2 hours 10m ago', agent: 'Billing Specialist' },
        { id: 'transfer3', type: 'transfer', from: 'Billing Specialist', to: 'Senior Support Agent', reason: 'Complex billing issue requiring senior authorization', timestamp: '2 hours 5m ago' },
        { id: 'm11', content: 'Hi Michael, I\'m Alex, a Senior Support Agent. I apologize for all the transfers. I\'m reviewing your entire case history now.', sender: 'bot', timestamp: '2 hours ago', agent: 'Senior Support Agent' },
        { id: 'm12', content: 'I can confirm there is indeed a duplicate charge. I\'ll need to check with our finance department about why this happened and how to prevent it in the future.', sender: 'bot', timestamp: '1 hour 55m ago', agent: 'Senior Support Agent' },
        { id: 'm13', content: 'So will I get my refund today? This has been very frustrating to deal with.', sender: 'user', timestamp: '1 hour 50m ago' },
        { id: 'm14', content: 'I understand your frustration, Michael. I\'ve submitted the refund request, but it typically takes 3-5 business days to process. I\'ll mark this as urgent, but I cannot guarantee it will be processed today.', sender: 'bot', timestamp: '1 hour 45m ago', agent: 'Senior Support Agent' },
        { id: 'm15', content: 'I\'m still experiencing the same issue after talking to 3 different agents. All I want is my money back for a service I didn\'t sign up for twice.', sender: 'user', timestamp: '5 minutes ago' },
      ]
    },
    {
      id: 'conv3',
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
      id: 'conv4',
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
      id: 'conv5',
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
  ];

  const activeConversation = conversations.find(c => c.id === selectedConversation) || null;

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    toast({
      title: "Message sent",
      description: "Your message has been sent to the customer.",
    });
    
    setNewMessage('');
  };

  const handleHandoffClick = (handoff: any) => {
    setSelectedAgent(handoff.from);

    const transferId = `transfer-${handoff.id}`;
    
    setHighlightedHandoffId(handoff.id);
    
    setTimeout(() => {
      const element = document.getElementById(transferId);
      if (element && messageContainerRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      setTimeout(() => {
        setHighlightedHandoffId(null);
      }, 2000);
    }, 100);
    
    toast({
      title: `Viewing messages from ${handoff.from}`,
      description: `Scrolled to conversation segment with ${handoff.from}`,
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const isDesktop = windowWidth >= 1024;

  const renderMessageItem = (message: any) => {
    const isHighlighted = selectedAgent && message.sender === 'bot' && message.agent === selectedAgent;
    const isHandoffHighlighted = message.type === 'transfer' && message.id === highlightedHandoffId;

    if (message.type === 'transfer') {
      const isTransferHighlighted = selectedAgent && 
        (message.from === selectedAgent || message.to === selectedAgent);
      
      return (
        <div 
          key={message.id} 
          id={`transfer-${message.id}`}
          className="flex justify-center my-4"
        >
          <div className={cn(
            "bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 max-w-[80%] transition-all duration-300",
            isTransferHighlighted && "bg-amber-100 border-amber-300 shadow-md",
            isHandoffHighlighted && "ring-2 ring-primary shadow-md"
          )}>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <div>
                <span className="font-medium">Conversation transferred</span>
                <div className="text-xs">
                  From: <span className={cn(
                    "font-medium", 
                    message.from === selectedAgent && "text-primary"
                  )}>{message.from}</span> → 
                  To: <span className={cn(
                    "font-medium",
                    message.to === selectedAgent && "text-primary"
                  )}>{message.to}</span>
                </div>
                {message.reason && (
                  <div className="text-xs mt-1">
                    Reason: {message.reason}
                  </div>
                )}
                <div className="text-xs mt-1 text-amber-700">
                  {message.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={message.id} 
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
        id={`message-${message.id}`}
      >
        {message.sender === 'bot' && (
          <Avatar className={cn(
            "h-8 w-8 mr-2",
            isHighlighted ? "bg-primary ring-2 ring-primary/30" : "bg-primary"
          )}>
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        <div 
          className={cn(
            "max-w-[80%] p-3 rounded-lg transition-all",
            message.sender === 'user' 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : isHighlighted
                ? "bg-primary/5 border-2 border-primary/20 rounded-tl-none"
                : "bg-white border border-gray-200 rounded-tl-none"
          )}
        >
          {message.sender === 'bot' && message.agent && (
            <div className={cn(
              "text-xs font-medium mb-1",
              isHighlighted ? "text-primary" : "text-muted-foreground"
            )}>
              {message.agent}
            </div>
          )}
          <p className="break-words text-sm">{message.content}</p>
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
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      {isDesktop ? (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="border-r flex flex-col h-full">
              <div className="p-3 border-b">
                <h2 className="text-lg font-semibold mb-2">Conversations</h2>
                <div className="relative">
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 h-9" 
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
                    className="flex-1 h-8"
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterStatus === 'active' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                    className="flex-1 h-8"
                  >
                    Active
                  </Button>
                  <Button 
                    variant={filterStatus === 'pending' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                    className="flex-1 h-8"
                  >
                    Pending
                  </Button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2">
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
                            <h3 className="font-medium text-sm">{conversation.customer}</h3>
                            <div className="text-xs text-muted-foreground">{conversation.topic}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conversation.time}
                        </div>
                      </div>
                      <div className="mt-1 text-xs line-clamp-1 text-muted-foreground">
                        {conversation.lastMessage}
                      </div>
                      <div className="mt-1 flex justify-between items-center">
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
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50}>
            <div className="flex flex-col h-full">
              {activeConversation ? (
                <>
                  <div className="border-b p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <h2 className="text-base font-semibold">{activeConversation.customer}</h2>
                      <div className="ml-2">{getStatusBadge(activeConversation.status)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAgent && (
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1 border-primary/30 text-primary"
                        >
                          <Bot className="h-3 w-3" />
                          Viewing: {selectedAgent}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAgent(null);
                            }}
                          />
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {activeConversation.duration}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setSidebarOpen(true)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    ref={messageContainerRef}
                    className="flex-1 overflow-y-auto p-3 bg-slate-50"
                  >
                    {activeConversation.messages.map((message) => (
                      renderMessageItem(message)
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" className="rounded-full h-9 w-9">
                        <Send className="h-4 w-4" />
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
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30}>
            <div className="border-l h-full overflow-y-auto">
              {activeConversation ? (
                <div className="p-4 space-y-6">
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
                      <div className="mt-4">
                        <HandoffHistory 
                          handoffs={activeConversation.messages
                            .filter(msg => msg.type === 'transfer')
                            .map(transfer => ({
                              id: transfer.id,
                              from: transfer.from,
                              to: transfer.to,
                              timestamp: transfer.timestamp,
                              reason: transfer.reason
                            }))}
                          onHandoffClick={handleHandoffClick}
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                  <div className="text-center">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Select a conversation to view details</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex h-full">
          <div className="w-72 border-r flex flex-col h-full">
            <div className="p-3 border-b">
              <h2 className="text-lg font-semibold mb-2">Conversations</h2>
              <div className="relative">
                <Input 
                  placeholder="Search..." 
                  className="pl-9 h-9" 
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
                  className="flex-1 h-8"
                >
                  All
                </Button>
                <Button 
                  variant={filterStatus === 'active' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className="flex-1 h-8"
                >
                  Active
                </Button>
                <Button 
                  variant={filterStatus === 'pending' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                  className="flex-1 h-8"
                >
                  Pending
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
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
                          <h3 className="font-medium text-sm">{conversation.customer}</h3>
                          <div className="text-xs text-muted-foreground">{conversation.topic}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conversation.time}
                      </div>
                    </div>
                    <div className="mt-1 text-xs line-clamp-1 text-muted-foreground">
                      {conversation.lastMessage}
                    </div>
                    <div className="mt-1 flex justify-between items-center">
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
          
          <div className="flex-1 flex flex-col h-full">
            {activeConversation ? (
              <>
                <div className="border-b p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-base font-semibold">{activeConversation.customer}</h2>
                    <div className="ml-2">{getStatusBadge(activeConversation.status)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgent && (
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1 border-primary/30 text-primary"
                      >
                        <Bot className="h-3 w-3" />
                        Viewing: {selectedAgent}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgent(null);
                          }}
                        />
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {activeConversation.duration}
                    </div>
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[350px] sm:w-[450px]">
                        <SheetHeader>
                          <SheetTitle>Conversation Details</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
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
                          </div>
                          
                          <Separator />
                          
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
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 bg-slate-50">
                  {activeConversation.messages.map((message) => (
                    renderMessageItem(message)
                  ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="rounded-full h-9 w-9">
                      <Send className="h-4 w-4" />
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
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        main {
          padding: 0 !important;
          max-width: none !important;
        }
      `}} />
    </div>
  );
};

export default ConversationList;
