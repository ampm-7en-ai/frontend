
import React from 'react';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const dummyData = [
  {
    id: '1',
    customer: 'John Smith',
    subject: 'Product inquiry about AI capabilities',
    agent: 'Support Bot',
    time: '10 min ago',
    status: 'completed',
  },
  {
    id: '2',
    customer: 'Lisa Johnson',
    subject: 'Billing question regarding subscription',
    agent: 'Billing Bot',
    time: '25 min ago',
    status: 'active',
  },
  {
    id: '3',
    customer: 'Michael Brown',
    subject: 'Technical issue with integration',
    agent: 'Tech Support Bot',
    time: '1 hour ago',
    status: 'escalated',
  },
  {
    id: '4',
    customer: 'Sarah Wilson',
    subject: 'Feature request for analytics module',
    agent: 'Product Bot',
    time: '2 hours ago',
    status: 'completed',
  },
  {
    id: '5',
    customer: 'Robert Davis',
    subject: 'Login issues after password reset',
    agent: 'Security Bot',
    time: '3 hours ago',
    status: 'completed',
  }
];

type RecentConversationsTableProps = {
  className?: string;
  data?: typeof dummyData;
};

export function RecentConversationsTable({ className, data = dummyData }: RecentConversationsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-success">Completed</span>;
      case 'active':
        return <span className="status-info">Active</span>;
      case 'escalated':
        return <span className="status-warning">Escalated</span>;
      default:
        return <span className="status-info">{status}</span>;
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Conversations</h3>
        <Button variant="outline" size="sm" className="text-sm">
          View All
          <ExternalLink size={14} className="ml-1" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-dark-gray border-b border-medium-gray/20">
              <th className="py-2 px-4 font-medium text-sm">Customer</th>
              <th className="py-2 px-4 font-medium text-sm">Subject</th>
              <th className="py-2 px-4 font-medium text-sm">Agent</th>
              <th className="py-2 px-4 font-medium text-sm">Time</th>
              <th className="py-2 px-4 font-medium text-sm">Status</th>
              <th className="py-2 px-4 font-medium text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((conversation) => (
              <tr 
                key={conversation.id} 
                className="border-b border-medium-gray/10 hover:bg-light-gray/50"
              >
                <td className="py-3 px-4 text-sm">{conversation.customer}</td>
                <td className="py-3 px-4 text-sm">
                  <div className="max-w-[200px] truncate">{conversation.subject}</div>
                </td>
                <td className="py-3 px-4 text-sm">{conversation.agent}</td>
                <td className="py-3 px-4 text-sm text-dark-gray">{conversation.time}</td>
                <td className="py-3 px-4 text-sm">
                  {getStatusBadge(conversation.status)}
                </td>
                <td className="py-3 px-4 text-sm">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-dark-gray"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Conversation</DropdownMenuItem>
                      <DropdownMenuItem>Assign to Human</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Close Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
