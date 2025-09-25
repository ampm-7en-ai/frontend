
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, MessageSquare, Brain, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CubeNode from '@/components/icons/library/CubeNode';
import Bubbles from '@/components/icons/library/Bubbles';

export type AgentType = 'assistant' | 'chatbot';

interface AgentTypeSelectorProps {
  selectedType: AgentType | null;
  onTypeSelect: (type: AgentType) => void;
}

const AgentTypeSelector = ({ selectedType, onTypeSelect }: AgentTypeSelectorProps) => {
  const agentTypes = [
    {
      id: 'assistant' as AgentType,
      title: 'AI Assistant',
      description: 'Advanced guidance and help assistant',
      icon: CubeNode,
      features: [
        'Complex reasoning & analysis',
        'Multi-step task execution',
        'API & tool integrations',
        'Advanced conversation handling'
      ],
      bestFor: 'Research, analysis, help center, web search'
    },
    {
      id: 'chatbot' as AgentType,
      title: 'AI Chatbot',
      description: 'Quick responses and customer support',
      icon: Bubbles,
      features: [
        'Automatic ticket creation',
        'Seamless AI to AI agent handoff',
        'Supports third-party ticket providers',
        'Customer support focused'
      ],
      bestFor: 'Support, information retrieval, FAQs'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Choose Your Agent Type
        </h3>
        <p className="text-neutral-600 dark:text-muted-foreground">
          Select the type that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agentTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all duration-200 relative shadow-none border-2',
              selectedType === type.id
                ? 'border-[#f06425] ring-2 ring-[#f06425]/20'
                : 'border-muted hover:border-[#f06425]/30 hover:shadow-lg'
            )}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "transition-colors"
                )}>
                  <type.icon className={cn(
                    "h-8 w-8 transition-colors",
                    selectedType === type.id 
                      ? "text-primary" 
                      : "text-foreground"
                  )} type='plain' color='hsl(var(--primary))' />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">
                      {type.title}
                    </h4>
                  </div>
                  <p className="text-neutral-400 dark:text-neutral-500 text-xs">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-3">
                    Key Features
                  </h5>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-muted-foreground">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                          selectedType === type.id ? "bg-foreground" : "bg-muted-foreground/40"
                        )} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <div>
                    <span className="text-xs font-medium text-foreground">
                      Best for:
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-muted-foreground mt-1">
                      {type.bestFor}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentTypeSelector;
