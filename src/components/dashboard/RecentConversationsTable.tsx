
import React from 'react';
import { MoreHorizontal, ExternalLink, MessageSquare, Slack, Instagram, Mail, Phone, Check, X, ChevronRight } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// Enhanced data with channel and status information
const dummyData = [
  {
    id: '1',
    customer: 'John Smith',
    subject: 'Product inquiry about AI capabilities',
    agent: 'Support Bot',
    time: '10 min ago',
    status: 'completed',
    channel: 'whatsapp',
    email: 'john.smith@example.com',
    satisfaction: 'neutral',
    preview: 'Hi, I need help with my recent order #12345'
  },
  {
    id: '2',
    customer: 'Lisa Johnson',
    subject: 'Billing question regarding subscription',
    agent: 'Billing Bot',
    time: '25 min ago',
    status: 'active',
    channel: 'slack',
    email: 'lisa.johnson@example.com',
    satisfaction: 'satisfied',
    preview: 'I have a question about my recent charge on my account'
  },
  {
    id: '3',
    customer: 'Michael Brown',
    subject: 'Technical issue with integration',
    agent: 'Tech Support Bot',
    time: '1 hour ago',
    status: 'escalated',
    channel: 'freshdesk',
    email: 'michael.brown@example.com',
    satisfaction: 'frustrated',
    preview: 'I\'m still experiencing the same issue after talking to 3 different agents'
  },
  {
    id: '4',
    customer: 'Sarah Wilson',
    subject: 'Feature request for analytics module',
    agent: 'Product Bot',
    time: '2 hours ago',
    status: 'completed',
    channel: 'instagram',
    email: 'sarah.wilson@example.com',
    satisfaction: 'delighted',
    preview: 'When will the new product be available in my region?'
  },
  {
    id: '5',
    customer: 'Robert Davis',
    subject: 'Login issues after password reset',
    agent: 'Security Bot',
    time: '3 hours ago',
    status: 'completed',
    channel: 'phone',
    email: 'robert.davis@example.com',
    satisfaction: 'dissatisfied',
    preview: 'Thank you for resolving my payment issue so quickly.'
  }
];

type RecentConversationsTableProps = {
  className?: string;
  data?: typeof dummyData;
};

export function RecentConversationsTable({ className, data = dummyData }: RecentConversationsTableProps) {
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case 'escalated':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Escalated</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'slack':
        return <Slack className="h-4 w-4 text-purple-600" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'freshdesk':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSatisfactionIndicator = (satisfaction: string) => {
    switch (satisfaction) {
      case 'frustrated':
        return <span className="text-red-500">😠</span>;
      case 'dissatisfied':
        return <span className="text-amber-500">😟</span>;
      case 'neutral':
        return <span className="text-gray-500">😐</span>;
      case 'satisfied':
        return <span className="text-green-500">😊</span>;
      case 'delighted':
        return <span className="text-emerald-500">😄</span>;
      default:
        return <span className="text-gray-500">😐</span>;
    }
  };

  const handleTransfer = (conversationId: string) => {
    toast({
      title: "Transfer initiated",
      description: `Conversation ${conversationId} has been queued for transfer`,
    });
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Conversations</h3>
        <Button variant="outline" size="sm" className="text-sm" asChild>
          <Link to="/conversations">
            View All
            <ExternalLink size={14} className="ml-1" />
          </Link>
        </Button>
      </div>
      <ScrollArea className="h-[320px] w-full">
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Customer</TableHead>
                <TableHead className="w-[100px]">Channel</TableHead>
                <TableHead className="w-[200px]">Preview</TableHead>
                <TableHead className="w-[120px]">Agent</TableHead>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {getSatisfactionIndicator(conversation.satisfaction)}
                      <span className="ml-2">{conversation.customer}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[160px]">{conversation.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getChannelIcon(conversation.channel)}
                      <span className="ml-2 capitalize">{conversation.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[180px] truncate text-muted-foreground">{conversation.preview}</div>
                  </TableCell>
                  <TableCell>{conversation.agent}</TableCell>
                  <TableCell className="text-muted-foreground">{conversation.time}</TableCell>
                  <TableCell>
                    {getStatusBadge(conversation.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/conversations/${conversation.id}`}>
                            View Conversation
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTransfer(conversation.id)}>
                          Transfer to Human
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Close Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
