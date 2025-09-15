// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MoreHorizontal } from 'lucide-react';

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
  const defaultAgents: AgentPerformance[] = [
    { name: 'Agent SPSS', closed: 51, open: 45, total: 96 },
    { name: 'Agent HMIE', closed: 754, open: 255, total: 1009 },
    { name: 'Agent QCPL', closed: 354, open: 91, total: 445 }
  ];

  const agentData = agents || defaultAgents;

  return (
    <Card className="bg-card dark:bg-card border-border dark:border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Conversation performance
          </CardTitle>
          <MoreHorizontal className="h-5 w-5 text-muted-foreground cursor-pointer" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {agentData.map((agent, index) => {
          const closedPercentage = (agent.closed / agent.total) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{agent.name}</h4>
                <span className="text-sm text-muted-foreground">{agent.total} conversations</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${closedPercentage}%` }}
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="text-orange-500">Closed: {agent.closed}</span>
                <span className="text-muted-foreground">Open: {agent.open}</span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-border">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            See all
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationPerformanceCard;