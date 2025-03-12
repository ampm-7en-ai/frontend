
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Send, Paperclip, ThumbsUp, ThumbsDown, Bot, User2, MoreHorizontal, Clock, Tag, HelpCircle } from 'lucide-react';

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [newMessage, setNewMessage] = useState('');
  
  // Mock conversation data
  const conversation = {
    id: conversationId,
    customer: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    agent: 'Sales Bot',
    satisfaction: 'high',
    startedAt: '2023-06-10T14:30:00',
    duration: '45 minutes',
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
        timestamp: '2023-06-10T14:33:00',
      },
      {
        id: 'm5',
        sender: 'user',
        content: 'I just received it about an hour ago.',
        timestamp: '2023-06-10T14:34:00',
      },
      {
        id: 'm6',
        sender: 'bot',
        content: 'Thanks for confirming. In that case, let\'s try requesting a new verification email. Would you like me to do that for you?',
        timestamp: '2023-06-10T14:35:00',
      },
      {
        id: 'm7',
        sender: 'user',
        content: 'Yes, please. That would be helpful.',
        timestamp: '2023-06-10T14:36:00',
      },
      {
        id: 'm8',
        sender: 'bot',
        content: 'Great! I\'ve sent a new verification email to john.doe@example.com. Please check your inbox (and spam folder, just in case) in the next few minutes. Let me know if you receive it and if you\'re able to complete the verification process.',
        timestamp: '2023-06-10T14:37:00',
      },
    ],
    tags: ['Account Setup', 'Email Verification', 'New User'],
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // In a real application, you would send this message to your backend
    console.log('Sending message:', newMessage);
    
    // Clear the input
    setNewMessage('');
  };

  // Helper function to determine badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'; // Use default instead of success
      case 'pending':
        return 'secondary'; // Use secondary instead of warning
      default:
        return 'secondary';
    }
  };

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
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="mb-4">
            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className={message.sender === 'user' ? 'bg-secondary' : 'bg-primary'}>
                        <AvatarFallback>
                          {message.sender === 'user' ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="button" variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Customer</h3>
                <p>{conversation.customer}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p>{conversation.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Satisfaction</h3>
                <div className="flex items-center gap-1">
                  {conversation.satisfaction === 'high' ? (
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                  ) : conversation.satisfaction === 'medium' ? (
                    <div className="text-amber-600">Neutral</div>
                  ) : (
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={conversation.satisfaction === 'high' 
                    ? 'text-green-600' 
                    : conversation.satisfaction === 'medium' 
                      ? 'text-amber-600' 
                      : 'text-red-600'
                  }>
                    {conversation.satisfaction.charAt(0).toUpperCase() + conversation.satisfaction.slice(1)}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Started
                </h3>
                <p>{new Date(conversation.startedAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Duration</h3>
                <p>{conversation.duration}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {conversation.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Agent Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{conversation.agent}</div>
                  <div className="text-xs text-muted-foreground">AI Assistant</div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Response Time:</span> 30 seconds
                </div>
                <div className="text-sm">
                  <span className="font-medium">Accuracy Rating:</span> 95%
                </div>
                <div className="text-sm">
                  <span className="font-medium">Knowledge Base:</span> Sales & Support
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
