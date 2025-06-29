import React from 'react';
import { Info, Phone, Video, MoreHorizontal, UserCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ConversationHeaderProps {
  conversation: {
    id: string;
    customer: string;
    status: string;
    channel?: string;
    agent?: string;
  };
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  onInfoClick: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  messageCount?: number;
}

const ConversationHeader = ({ 
  conversation, 
  selectedAgent, 
  setSelectedAgent, 
  onInfoClick, 
  getStatusBadge,
  messageCount = 0 
}: ConversationHeaderProps) => {
  const agents = ['Sarah Johnson', 'Mike Chen', 'Alex Rivera']; // Mock data

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Customer Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {conversation.customer}
              </h2>
              {getStatusBadge(conversation.status)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <span className="capitalize">{conversation.channel || 'Chat'}</span>
              {messageCount > 0 && (
                <>
                  <span>•</span>
                  <span>{messageCount} messages</span>
                </>
              )}
              {conversation.agent && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {conversation.agent}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Agent Filter */}
          {selectedAgent && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">Viewing:</span>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-40 h-8 text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <ModernButton
              variant="outline"
              size="sm"
              icon={Phone}
              className="p-0 w-8 h-8"
            />
            <ModernButton
              variant="outline"
              size="sm"
              icon={Video}
              className="p-0 w-8 h-8"
            />
            <ModernButton
              variant="outline"
              size="sm"
              icon={Info}
              onClick={onInfoClick}
              className="p-0 w-8 h-8"
            />
            
            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ModernButton
                  variant="outline"
                  size="sm"
                  icon={MoreHorizontal}
                  className="p-0 w-8 h-8"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Clock className="h-4 w-4 mr-2" />
                  Set Reminder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Agent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  Close Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
