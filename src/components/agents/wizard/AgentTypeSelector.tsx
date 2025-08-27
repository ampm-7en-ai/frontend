
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, MessageSquare, Brain, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      icon: Brain,
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
      icon: MessageSquare,
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
        <p className="text-muted-foreground">
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
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/30 hover:shadow-lg'
            )}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                  "p-3 rounded-2xl transition-colors",
                  selectedType === type.id 
                    ? "bg-primary/10" 
                    : "bg-muted"
                )}>
                  <type.icon className={cn(
                    "h-6 w-6 transition-colors",
                    selectedType === type.id 
                      ? "text-primary" 
                      : "text-foreground"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-lg font-semibold text-foreground">
                      {type.title}
                    </h4>
                    {selectedType === type.id && (
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
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
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                          selectedType === type.id ? "bg-primary" : "bg-muted-foreground/40"
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
                    <p className="text-xs text-muted-foreground mt-1">
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
