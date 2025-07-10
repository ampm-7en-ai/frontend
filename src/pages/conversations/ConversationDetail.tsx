
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
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatMessagesWebSocket } from '@/hooks/useChatMessagesWebSocket';
import ConversationHeader from '@/components/conversations/ConversationHeader';
import { useConversationUtils } from '@/hooks/useConversationUtils';

// Define interface for message to include optional type property
interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  agent?: string;
  type?: string;
}

// Define interface for handoff record to use the HandoffType
interface HandoffRecord {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  reason?: string;
  type: 'ai-to-ai' | 'ai-to-human' | 'human-to-ai' | 'human-to-human' | 'external';
}

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
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use conversation utils for badges
  const { getStatusBadge } = useConversationUtils();
  
  // Use the WebSocket hook for chat sessions to get session details
  const { 
    sessions, 
    isLoading: isLoadingSessions 
  } = useChatSessions();
  
  // Find the current conversation from the sessions
  const [conversation, setConversation] = useState<any>(null);
  
  // Set conversation when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && conversationId) {
      const currentConversation = sessions.find(s => s.id === conversationId);
      if (currentConversation) {
        setConversation({
          id: currentConversation.id,
          customer: currentConversation.customer,
          email: currentConversation.email,
          status: currentConversation.status,
          agent: currentConversation.agent,
          satisfaction: currentConversation.satisfaction || 'medium',
          startedAt: new Date().toISOString(), // Use current time as fallback
          duration: currentConversation.duration || '0 minutes',
          category: 'Support', // Default category
          priority: currentConversation.priority || 'medium',
          tags: [],
          handoffHistory: []
        });
      }
    }
  }, [sessions, conversationId]);
  
  // Use the WebSocket hook for specific conversation messages
  const { 
    sendMessage: sendWebSocketMessage,
    isTyping
  } = useChatMessagesWebSocket({
    sessionId: conversationId || null,
    autoConnect: !!conversationId
  });

  // Handle conversation update (for resolve functionality)
  const handleConversationUpdate = (updatedConversation: any) => {
    setConversation(updatedConversation);
  };
  
  // Handle sending new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Send the message via WebSocket
    sendWebSocketMessage(newMessage);
    
    // Clear input field
    setNewMessage('');
    
    // Show toast notification
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
      duration: 3000,
    });
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
    
    // Determine the handoff type based on destination
    let newHandoffType: 'ai-to-ai' | 'ai-to-human' | 'human-to-ai' | 'human-to-human' | 'external';
    
    if (handoffDestination.includes('Bot')) {
      newHandoffType = 'ai-to-ai';
    } else if (handoffDestination.includes('External')) {
      newHandoffType = 'external';
    } else {
      newHandoffType = 'ai-to-human';
    }
    
    // Add handoff record to history
    const handoffRecord: HandoffRecord = {
      id: handoffId,
      from: currentAgent,
      to: handoffDestination,
      timestamp: new Date().toISOString(),
      reason: handoffNotes || `Transferred to ${handoffDestination}`,
      type: newHandoffType
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
          {conversation && (
            <>
              <Badge variant={getBadgeVariant(conversation.status)}>
                {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
              </Badge>
              <Badge className={getPriorityColor(conversation.priority)}>
                {conversation.priority.charAt(0).toUpperCase() + conversation.priority.slice(1)} Priority
              </Badge>
            </>
          )}
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
            {conversation && (
              <ConversationHeader
                conversation={conversation}
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                onInfoClick={() => setIsContextPanelOpen(true)}
                getStatusBadge={getStatusBadge}
                messageCount={conversation?.messages?.length || 0}
                onConversationUpdate={handleConversationUpdate}
              />
            )}
            <CardContent className="p-0 flex-grow overflow-y-auto">
              <div className="p-4 space-y-4">
                {conversation?.messages?.map((message: any) => renderMessageItem(message))}
                
                {/* Insert handoff notifications between messages based on timestamps */}
                {conversation?.handoffHistory?.map((handoff: any, index: number) => {
                  // Find the messages that come before and after this handoff based on timestamp
                  const handoffTime = new Date(handoff.timestamp).getTime();
                  
                  // Find the index where this handoff should be inserted
                  let insertPosition = conversation.messages?.findIndex(
                    (msg: any) => new Date(msg.timestamp).getTime() > handoffTime
                  );
                  
                  // If no message is found after this handoff, place it at the end
                  insertPosition = insertPosition === -1 ? conversation.messages?.length : insertPosition;
                  
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
                  <p className="font-medium text-sm">{conversation?.agent}</p>
                  <p className="text-xs text-muted-foreground">AI Assistant</p>
                </div>
              </div>
              
              {conversation?.handoffCount > 0 && (
                <>
                  <Separator className="my-1" />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Handoff History</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {conversation?.handoffHistory?.map((handoff: any) => (
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
                      {conversation?.tags?.map((tag: string) => (
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
                      <SelectItem key={system.id} value={system.name}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Handoff Priority</Label>
              <Select value={handoffPriority} onValueChange={setHandoffPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Handoff Notes</Label>
              <Textarea
                placeholder="Provide context for the handoff..."
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
                className="h-20"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-attachments"
                  checked={includeAttachments}
                  onCheckedChange={setIncludeAttachments}
                />
                <Label htmlFor="include-attachments">Include attachments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={setIncludeMetadata}
                />
                <Label htmlFor="include-metadata">Include metadata</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHandoffDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleHandoffSubmit} disabled={!handoffDestination}>
              <PhoneForwarded className="h-4 w-4 mr-2" />
              Initiate Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationDetail;
