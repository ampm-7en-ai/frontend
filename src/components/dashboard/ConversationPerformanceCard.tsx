// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AgentPerformance {
  name: string;
  closed: number;
  open: number;
  total: number;
}

interface ConversationPerformanceCardProps {
  agents?: AgentPerformance[];
}

const ConversationPerformanceCard: React.FC<ConversationPerformanceCardProps> = ({ agents }) => {
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);
  
  const defaultAgents: AgentPerformance[] = [
    { name: 'Agent SPSS', closed: 51, open: 45, total: 96 },
    { name: 'Agent HMIE', closed: 754, open: 255, total: 1009 },
    { name: 'Agent QCPL', closed: 354, open: 91, total: 445 }
  ];

  const agentData = agents || defaultAgents;

  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-neutral-800/60 border-0 shadow-card rounded-lg h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Conversation performance
            </CardTitle>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {agentData.map((agent, index) => {
            const closedPercentage = (agent.closed / agent.total) * 100;
            const isHovered = hoveredAgent === index;
            
            return (
              <div 
                key={index} 
                className="space-y-2 transition-all duration-200"
                onMouseEnter={() => setHoveredAgent(index)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium transition-colors ${isHovered ? 'text-primary' : 'text-foreground'}`}>
                    {agent.name}
                  </h4>
                  <span className="text-sm text-muted-foreground">{agent.total} conversations</span>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`w-full bg-muted rounded-full h-2 cursor-pointer transition-all duration-200 ${isHovered ? 'h-3' : 'h-2'}`}>
                      <div 
                        className={`bg-primary rounded-full transition-all duration-500 ${isHovered ? 'h-3 shadow-lg' : 'h-2'}`}
                        style={{ width: `${closedPercentage}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{agent.name}</p>
                      <p>Closed: {agent.closed} ({Math.round(closedPercentage)}%)</p>
                      <p>Open: {agent.open} ({Math.round((agent.open / agent.total) * 100)}%)</p>
                      <p>Total: {agent.total} conversations</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className={`transition-colors ${isHovered ? 'text-primary font-medium' : 'text-primary'}`}>
                    Closed: {agent.closed}
                  </span>
                  <span className={`transition-colors ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Open: {agent.open}
                  </span>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-border">
            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline">
              See all
            </button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ConversationPerformanceCard;