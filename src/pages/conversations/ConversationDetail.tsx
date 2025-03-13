
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Send, Paperclip, ThumbsUp, ThumbsDown, Bot, User2, MoreHorizontal, Clock, Tag, HelpCircle, 
  ExternalLink, UserPlus, RefreshCw, PhoneForwarded, FileText, AlertTriangle, Maximize2, BellRing, 
  TicketCheck, MessageSquare, ArrowRightLeft, Activity } from 'lucide-react';
import { AgentHandoffNotification } from '@/components/conversations/AgentHandoffNotification';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const [isHandoffDialogOpen, setIsHandoffDialogOpen] = useState(false);
  const [handoffType, setHandoffType] = useState<'ai' | 'internal' | 'external'>('ai');
  const [handoffDestination, setHandoffDestination] = useState('');
  const [handoffNotes, setHandoffNotes] = useState('');
  const [handoffPriority, setHandoffPriority] = useState('medium');
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial conversation state with mock data
  const [conversation, setConversation] = useState({
    id: conversationId,
    customer: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    agent: 'Sales Bot',
    satisfaction: 'high',
    startedAt: '2023-06-10T14:30:00',
    duration: '45 minutes',
    category: 'Account Setup',
    priority: 'medium',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        content: 'Hello, I need help with setting up my account.',
        timestamp: '2023-06-10T14:30:00',
      },
      {
        id: 'm2',
        sender: 'bot',
        content: 'Hi John! I\'d be happy to help you set up your account. Can you tell me what specific step you\'re having trouble with?',
        timestamp: '2023-06-10T14:31:00',
        agent: 'General Bot'
      },
      {
        id: 'm3',
        sender: 'user',
        content: 'I can\'t seem to verify my email address. I\'ve clicked the link in the email multiple times but it says the link is invalid.',
        timestamp: '2023-06-10T14:32:00',
      },
      {
        id: 'm4',
        sender: 'bot',
        content: 'I understand the frustration. Let me help you with that. Sometimes the verification links can expire after 24 hours. When did you receive the verification email?',
        timestamp: '2023-06-10T14:34:00',
        agent: 'Sales Bot'
      },
      {
        id: 'm5',
        sender: 'user',
        content: 'I just received it about an hour ago.',
        timestamp: '2023-06-10T14:35:00',
      },
      {
        id: 'm6',
        sender: 'bot',
        content: 'Thanks for confirming. In that case, let\'s try requesting a new verification email. Would you like me to do that for you?',
        timestamp: '2023-06-10T14:37:00',
        agent: 'Technical Support Bot'
      },
      {
        id: 'm7',
        sender: 'user',
        content: 'Yes, please. That would be helpful.',
        timestamp: '2023-06-10T14:38:00',
      },
      {
        id: 'm8',
        sender: 'bot',
        content: 'Great! I\'ve sent a new verification email to john.doe@example.com. Please check your inbox (and spam folder, just in case) in the next few minutes. Let me know if you receive it and if you\'re able to complete the verification process.',
        timestamp: '2023-06-10T14:39:00',
        agent: 'Technical Support Bot'
      },
    ],
    tags: ['Account Setup', 'Email Verification', 'New User'],
    handoffHistory: [
      {
        id: 'h1',
        from: 'General Bot',
        to: 'Sales Bot',
        timestamp: '2023-06-10T14:33:00',
        reason: 'Topic specialized to sales inquiries',
        type: 'ai-to-ai'
      },
      {
        id: 'h2',
        from: 'Sales Bot',
        to: 'Technical Support Bot',
        timestamp: '2023-06-10T14:36:00',
        reason: 'Technical troubleshooting required',
        type: 'ai-to-ai'
      }
    ]
  });

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // Mock responses based on user input
  const generateBotResponse = (userMessage: string) => {
    let responseContent = "Thank you for your message. How else can I assist you today?";
    const currentAgent = conversation.messages.filter(m => m.sender === 'bot').pop()?.agent || conversation.agent;
    
    // Simple response logic based on user message content
    if (userMessage.toLowerCase().includes('email') || userMessage.toLowerCase().includes('verification')) {
      responseContent = "I see you're still having issues with email verification. Let me check the status of your account. It appears that the new verification email has been sent successfully. Please allow up to 5 minutes for it to arrive.";
    } else if (userMessage.toLowerCase().includes('thank')) {
      responseContent = "You're welcome! Is there anything else you need help with today?";
    } else if (userMessage.toLowerCase().includes('password')) {
      responseContent = "If you need to reset your password, I can help with that. Would you like me to send a password reset link to your email address?";
    } else if (userMessage.toLowerCase().includes('account')) {
      responseContent = "Your account is currently in the verification stage. Once you verify your email, you'll have full access to all features of our platform.";
    }
    
    return {
      id: `m${Date.now()}`,
      sender: 'bot',
      content: responseContent,
      timestamp: new Date().toISOString(),
      agent: currentAgent
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Add user message to conversation
    const userMessage = {
      id: `m${Date.now()}`,
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    // Update conversation with new user message
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    
    // Clear input field
    setNewMessage('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.content);
      
      // Update conversation with bot response
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, botResponse]
      }));
      
      // Trigger toast notification for new message
      toast({
        title: "New message",
        description: `${botResponse.agent || conversation.agent} has responded to your message.`,
        duration: 3000,
      });
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds for realism
  };

  // Handle initiating a handoff to another agent
  const handleHandoffSubmit = () => {
    if (!handoffDestination) {
      toast({
        title: "Error",
        description: "Please select a destination for the handoff",
        variant: "destructive",
      });
      return;
    }
    
    // Create handoff record
    const handoffId = `h${Date.now()}`;
    const currentAgent = conversation.messages.filter(m => m.sender === 'bot').pop()?.agent || conversation.agent;
    const newHandoffType = handoffDestination.includes('Bot') ? 'ai-to-ai' : 
                       handoffDestination.includes('External') ? 'external' : 'ai-to-human';
    
    // Add handoff record to history
    const handoffRecord = {
      id: handoffId,
      from: currentAgent,
      to: handoffDestination,
      timestamp: new Date().toISOString(),
      reason: handoffNotes || `Transferred to ${handoffDestination}`,
      type: newHandoffType as 'ai-to-ai' | 'ai-to-human' | 'external'
    };
    
    // Update conversation with handoff information
    setConversation(prev => ({
      ...prev,
      handoffHistory: [...prev.handoffHistory, handoffRecord],
      agent: handoffDestination // Update current agent
    }));
    
    // Simulate response from new agent
    setTimeout(() => {
      const welcomeMessage = {
        id: `m${Date.now()}`,
        sender: 'bot',
        content: `Hi there, I'm ${handoffDestination}. I've been briefed on your conversation and I'm ready to help. Let me review your case...`,
        timestamp: new Date().toISOString(),
        agent: handoffDestination
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, welcomeMessage]
      }));
    }, 2000);
    
    toast({
      title: "Handoff successful",
      description: `Conversation transferred to ${handoffDestination}`,
    });
    
    // Reset handoff form and close dialog
    setHandoffNotes('');
    setHandoffDestination('');
    setIsHandoffDialogOpen(false);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'critical':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'busy':
        return 'text-amber-600';
      case 'away':
        return 'text-gray-400';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHandoffColor = (to: string) => {
    if (to.includes('Freshdesk') || to.includes('External')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (to.includes('Support')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const renderMessageItem = (item: any) => {
    return (
      <div
        key={item.id}
        className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`flex gap-3 max-w-[80%] ${item.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <Avatar className={item.sender === 'user' ? 'bg-secondary' : 'bg-primary'}>
            <AvatarFallback>
              {item.sender === 'user' ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium">
                {item.sender === 'user' ? conversation.customer : item.agent || conversation.agent}
              </span>
              {item.sender === 'bot' && (
                <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">
                  AI
                </Badge>
              )}
            </div>
            <div
              className={`rounded-lg p-3 ${
                item.sender === 'user'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {item.content}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {item.sender === 'bot' && (
                <div className="flex space-x-1">
                  <button className="hover:text-primary transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Define available agents for handoff
  const availableAgents = {
    ai: [
      { id: 'ai1', name: 'General Bot', specialization: 'General Knowledge' },
      { id: 'ai2', name: 'Sales Bot', specialization: 'Sales' },
      { id: 'ai3', name: 'Technical Support Bot', specialization: 'Tech Support' },
      { id: 'ai4', name: 'Billing Bot', specialization: 'Billing' },
      { id: 'ai5', name: 'Customer Service Bot', specialization: 'Customer Service' },
    ],
    internal: [
      { id: 'human1', name: 'Sarah Johnson', department: 'Support', status: 'available' },
      { id: 'human2', name: 'Michael Brown', department: 'Sales', status: 'busy' },
      { id: 'human3', name: 'Emily Davis', department: 'Technical', status: 'available' },
      { id: 'human4', name: 'David Miller', department: 'Billing', status: 'away' },
      { id: 'human5', name: 'Jessica Wilson', department: 'Customer Success', status: 'available' },
    ],
    external: [
      { id: 'ext1', name: 'Freshdesk Support', type: 'Ticketing', status: 'connected' },
      { id: 'ext2', name: 'Zendesk Chat', type: 'Live Chat', status: 'connected' },
      { id: 'ext3', name: 'External CRM', type: 'CRM', status: 'disconnected' },
      { id: 'ext4', name: 'Intercom', type: 'Customer Messaging', status: 'connected' },
    ]
  };

  // Return component JSX structure
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/conversations" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Conversations
          </Link>
        </Button>
        <div className="flex gap-2">
          <Badge variant={getBadgeVariant(conversation.status)}>
            {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor(conversation.priority)}>
            {conversation.priority.charAt(0).toUpperCase() + conversation.priority.slice(1)} Priority
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}
          >
            {isContextPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-120px)]">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          <Card className="h-full flex flex-col rounded-r-none border-r-0">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Active Conversations</CardTitle>
                <Badge variant="outline" className="ml-2">{15}</Badge>
              </div>
              <div className="relative">
                <Input 
                  type="search" 
                  placeholder="Search conversations..."
                  className="w-full pr-8"
                />
              </div>
            </CardHeader>
            <Tabs defaultValue="all" className="px-4">
              <TabsList className="mb-2 w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                <TabsTrigger value="urgent" className="flex-1">Urgent</TabsTrigger>
              </TabsList>
            </Tabs>
            <CardContent className="flex-grow overflow-auto space-y-2 pb-0">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer hover:bg-accent/50 transition-colors ${index === 0 ? 'bg-accent/50 border-primary' : ''}`}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{index % 2 === 0 ? 'JD' : 'SA'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{index % 2 === 0 ? 'John Doe' : 'Sarah Adams'}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {index * 5 + 2} mins
                          </div>
                        </div>
                      </div>
                      {index % 3 === 0 && (
                        <Badge variant="destructive" className="ml-2 text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {index % 2 === 0 
                        ? "I'm having trouble with my account setup. Can you help me?" 
                        : "The payment failed and I'm not sure why. I've tried multiple times."}
                    </p>
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        {index % 2 === 0 ? (
                          <Badge variant="outline" className="text-xs">Account</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Billing</Badge>
                        )}
                        {index % 3 === 0 && (
                          <Badge variant="outline" className="text-xs">New User</Badge>
                        )}
                      </div>
                      {index % 4 === 0 && (
                        <Badge variant="secondary" className="text-xs flex items-center">
                          <ArrowRightLeft className="h-2.5 w-2.5 mr-1" />
                          2
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <Card className="h-full flex flex-col rounded-none border-x-0">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <CardTitle className="text-lg">{conversation.customer}</CardTitle>
                      <Badge variant="outline" className="ml-2 text-xs">#{conversationId}</Badge>
                    </div>
                    <CardDescription>{conversation.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsHandoffDialogOpen(true)}>
                    <PhoneForwarded className="h-4 w-4 mr-1" />
                    Handoff
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Started: {new Date(conversation.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  {conversation.category}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {conversation.messages.filter(m => !m.type).length} messages
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  {conversation.handoffHistory.length} handoffs
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-y-auto">
              <div className="p-4 space-y-4">
                {conversation.messages.map(message => renderMessageItem(message))}
                
                {/* Insert handoff notifications between messages based on timestamps */}
                {conversation.handoffHistory.map((handoff, index) => {
                  // Find the messages that come before and after this handoff based on timestamp
                  const handoffTime = new Date(handoff.timestamp).getTime();
                  
                  // Find the index where this handoff should be inserted
                  let insertPosition = conversation.messages.findIndex(
                    msg => new Date(msg.timestamp).getTime() > handoffTime
                  );
                  
                  // If no message is found after this handoff, place it at the end
                  insertPosition = insertPosition === -1 ? conversation.messages.length : insertPosition;
                  
                  // Check if this is the current position in the message array
                  const isInsertionPoint = index === 0 ? 
                    insertPosition === 3 : // First handoff after first 3 messages
                    insertPosition === 5;  // Second handoff after 5 messages
                  
                  return isInsertionPoint ? (
                    <AgentHandoffNotification
                      key={handoff.id}
                      from={handoff.from}
                      to={handoff.to}
                      reason={handoff.reason}
                      timestamp={handoff.timestamp}
                      type={handoff.type}
                    />
                  ) : null;
                })}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow min-h-[60px] max-h-[120px]"
                />
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="icon" className="rounded-full">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="icon" className="rounded-full">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={25} minSize={20}>
          <Card className="h-full rounded-l-none border-l-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Current Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{conversation.agent}</p>
                  <p className="text-xs text-muted-foreground">AI Agent</p>
                </div>
              </div>
              
              {conversation.handoffHistory.length > 0 && (
                <>
                  <Separator className="my-1" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Handoff History</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {conversation.handoffHistory.map((handoff) => (
                        <AgentHandoffNotification
                          key={handoff.id}
                          from={handoff.from}
                          to={handoff.to}
                          reason={handoff.reason}
                          timestamp={handoff.timestamp}
                          type={handoff.type}
                          compact={true}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <PhoneForwarded className="h-4 w-4 mr-2" />
                    Handoff Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Destination Type</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={handoffType === 'ai' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setHandoffType('ai')}
                        className="justify-start"
                      >
                        <Bot className="h-3.5 w-3.5 mr-1" />
                        AI Agent
                      </Button>
                      <Button 
                        variant={handoffType === 'internal' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setHandoffType('internal')}
                        className="justify-start"
                      >
                        <User2 className="h-3.5 w-3.5 mr-1" />
                        Human
                      </Button>
                      <Button 
                        variant={handoffType === 'external' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setHandoffType('external')}
                        className="justify-start"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        External
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Destination</Label>
                    {handoffType === 'ai' && (
                      <Select onValueChange={setHandoffDestination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAgents.ai.map((agent) => (
                            <SelectItem key={agent.id} value={agent.name}>
                              <div className="flex items-center">
                                <span>{agent.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {agent.specialization}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {handoffType === 'internal' && (
                      <Select onValueChange={setHandoffDestination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAgents.internal.map((agent) => (
                            <SelectItem key={agent.id} value={agent.name}>
                              <div className="flex items-center justify-between">
                                <span>{agent.name}</span>
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    {agent.department}
                                  </Badge>
                                  <div className={`h-2 w-2 rounded-full ${getAgentStatusColor(agent.status)}`}></div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {handoffType === 'external' && (
                      <Select onValueChange={setHandoffDestination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select external system" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAgents.external.map((system) => (
                            <SelectItem 
                              key={system.id} 
                              value={system.name}
                              disabled={system.status === 'disconnected'}
                            >
                              <div className="flex items-center justify-between">
                                <span>{system.name}</span>
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    {system.type}
                                  </Badge>
                                  {system.status === 'disconnected' && (
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Handoff Notes</Label>
                    <Textarea
                      placeholder="Provide context for the handoff..."
                      className="h-20 resize-none"
                      value={handoffNotes}
                      onChange={(e) => setHandoffNotes(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleHandoffSubmit}
                    disabled={!handoffDestination}
                  >
                    <PhoneForwarded className="h-4 w-4 mr-2" />
                    Initiate Handoff
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Customer Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium">Account Status</p>
                    <Badge variant="outline" className="mt-1">Premium Account</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Previous Interactions</p>
                    <p className="text-xs text-muted-foreground">3 conversations in the last 30 days</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium">Detected Topics</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {conversation.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Customer Sentiment</p>
                    <div className="mt-2">
                      <Progress value={70} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Frustrated</span>
                        <span>Neutral</span>
                        <span>Satisfied</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <Dialog open={isHandoffDialogOpen} onOpenChange={setIsHandoffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Handoff to Another Agent</DialogTitle>
            <DialogDescription>
              Transfer this conversation to another agent or external system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Handoff Type</Label>
              <RadioGroup defaultValue="ai" value={handoffType} onValueChange={(value: any) => setHandoffType(value)}>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-2 border rounded-md p-3 flex-1">
                    <RadioGroupItem value="ai" id="ai" />
                    <Label htmlFor="ai" className="flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      AI Agent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 flex-1">
                    <RadioGroupItem value="internal" id="internal" />
                    <Label htmlFor="internal" className="flex items-center">
                      <User2 className="h-4 w-4 mr-2" />
                      Human
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 flex-1">
                    <RadioGroupItem value="external" id="external" />
                    <Label htmlFor="external" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      External
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Select Destination</Label>
              {handoffType === 'ai' && (
                <Select onValueChange={setHandoffDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.ai.map((agent) => (
                      <SelectItem key={agent.id} value={agent.name}>
                        {agent.name} - {agent.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {handoffType === 'internal' && (
                <Select onValueChange={setHandoffDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.internal.map((agent) => (
                      <SelectItem key={agent.id} value={agent.name}>
                        {agent.name} - {agent.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {handoffType === 'external' && (
                <Select onValueChange={setHandoffDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select external system" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.external.map((system) => (
                      <SelectItem key={system.id} value={system.name} disabled={system.status === 'disconnected'}>
                        {system.name} ({system.status === 'disconnected' ? 'Unavailable' : 'Available'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Handoff Notes (Optional)</Label>
              <Textarea
                placeholder="Provide context for the handoff..."
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeAttachments">Include Attachments</Label>
                <Switch
                  id="includeAttachments"
                  checked={includeAttachments}
                  onCheckedChange={setIncludeAttachments}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="includeMetadata">Include Metadata</Label>
                <Switch
                  id="includeMetadata"
                  checked={includeMetadata}
                  onCheckedChange={setIncludeMetadata}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHandoffDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleHandoffSubmit} disabled={!handoffDestination}>
              <PhoneForwarded className="h-4 w-4 mr-2" />
              Transfer Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationDetail;
