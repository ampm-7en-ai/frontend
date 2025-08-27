
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
      description: 'Advanced reasoning and multi-step workflows',
      icon: Brain,
      features: [
        'Complex reasoning & analysis',
        'Multi-step task execution',
        'API & tool integrations',
        'Advanced conversation handling'
      ],
      bestFor: 'Research, analysis, complex workflows'
    },
    {
      id: 'chatbot' as AgentType,
      title: 'Chatbot',
      description: 'Quick responses and customer support',
      icon: MessageSquare,
      features: [
        'Quick response times',
        'FAQ & knowledge queries',
        'Simple conversation flows',
        'Customer support focused'
      ],
      bestFor: 'Support, information retrieval, FAQs'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Choose Your Agent Type
        </h3>
        <p className="text-muted-foreground">
          Select the type that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {agentTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-colors duration-200 border-2 relative',
              selectedType === type.id
                ? 'border-primary bg-accent/50'
                : 'border-border hover:border-muted-foreground/20'
            )}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted">
                  <type.icon className="h-6 w-6 text-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-medium text-foreground">
                      {type.title}
                    </h4>
                    {selectedType === type.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2">
                    Key Features
                  </h5>
                  <ul className="space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border">
                  <div>
                    <span className="text-xs font-medium text-foreground">
                      Best for:
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
