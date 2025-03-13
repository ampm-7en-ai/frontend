
import React from 'react';
import { CalendarClock, MessageSquare } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AgentActionsDropdown from './AgentActionsDropdown';
import AgentModelBadge from './AgentModelBadge';
import AgentKnowledgeSection from './AgentKnowledgeSection';
import AgentFooterActions from './AgentFooterActions';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    conversations: number;
    lastModified: string;
    averageRating: number;
    knowledgeSources: Array<{
      id: number;
      name: string;
      type: string;
      icon: string;
      hasError: boolean;
    }>;
    model: string;
    isDeployed: boolean;
  };
  getModelBadgeColor: (model: string) => string;
}

// Function to get a random avatar color
const getRandomAvatarColor = () => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 
    'bg-purple-500', 'bg-teal-500', 'bg-orange-500',
    'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const AgentCard = ({ agent, getModelBadgeColor }: AgentCardProps) => {
  const formattedDate = new Date(agent.lastModified).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Generate random color and initials for avatar
  const avatarColor = getRandomAvatarColor();
  const initials = getInitials(agent.name);

  return (
    <Card className="overflow-hidden border flex flex-col w-full h-full">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start">
          {/* Avatar and basic info */}
          <div className="flex items-start space-x-3">
            <Avatar className={`w-11 h-11 ${avatarColor} text-white`}>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg mb-0.5">{agent.name}</CardTitle>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/80" />
                  <span className="font-medium text-muted-foreground">{agent.conversations.toLocaleString()}</span>
                  <span>conversations</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground/80" />
                  <span>Updated <span className="font-medium">{formattedDate}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions dropdown */}
          <AgentActionsDropdown agentId={agent.id} />
        </div>
        
        <CardDescription className="line-clamp-2 mt-2.5">{agent.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3 pt-0 px-6 flex-1">
        <div className="space-y-4">
          <div>
            <AgentModelBadge model={agent.model} getModelBadgeColor={getModelBadgeColor} />
          </div>
          
          <AgentKnowledgeSection 
            agentId={agent.id} 
            knowledgeSources={agent.knowledgeSources} 
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 p-4 pt-2 mt-auto border-t bg-muted/30">
        <AgentFooterActions agent={agent} />
      </CardFooter>
    </Card>
  );
};

export default AgentCard;
