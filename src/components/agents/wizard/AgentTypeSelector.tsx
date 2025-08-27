
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, MessageSquare, Brain, Zap, CheckCircle2 } from 'lucide-react';
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
      color: 'from-purple-500 to-indigo-600',
      features: [
        'Complex reasoning and analysis',
        'Multi-step task execution',
        'API and tool integrations',
        'Advanced conversation handling'
      ],
      bestFor: 'Research, analysis, complex workflows'
    },
    {
      id: 'chatbot' as AgentType,
      title: 'Chatbot',
      description: 'Quick responses and customer support',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Quick response times',
        'FAQ and knowledge base queries',
        'Simple conversation flows',
        'Customer support focused'
      ],
      bestFor: 'Support, information retrieval, FAQs'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Choose Your Agent Type
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select the type that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
              selectedType === type.id
                ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            )}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  'p-3 rounded-xl bg-gradient-to-br shadow-sm',
                  type.color
                )}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {type.title}
                    </h4>
                    {selectedType === type.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                    Key Features
                  </h5>
                  <ul className="space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Best for:</span> {type.bestFor}
                  </p>
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
