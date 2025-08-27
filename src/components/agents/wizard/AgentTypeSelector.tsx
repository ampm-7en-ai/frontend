
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, MessageSquare, Brain, Zap, CheckCircle2, Sparkles } from 'lucide-react';
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
      gradient: 'from-purple-500 via-indigo-500 to-blue-600',
      iconBg: 'from-purple-400 to-indigo-600',
      shadowColor: 'shadow-purple-200/40 dark:shadow-purple-900/40',
      features: [
        'Complex reasoning & analysis',
        'Multi-step task execution',
        'API & tool integrations',
        'Advanced conversation handling'
      ],
      bestFor: 'Research, analysis, complex workflows',
      badge: 'Advanced'
    },
    {
      id: 'chatbot' as AgentType,
      title: 'Chatbot',
      description: 'Quick responses and customer support',
      icon: MessageSquare,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      iconBg: 'from-emerald-400 to-teal-600',
      shadowColor: 'shadow-emerald-200/40 dark:shadow-emerald-900/40',
      features: [
        'Quick response times',
        'FAQ & knowledge queries',
        'Simple conversation flows',
        'Customer support focused'
      ],
      bestFor: 'Support, information retrieval, FAQs',
      badge: 'Popular'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
          Choose Your Agent Type
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          Select the type that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {agentTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-xl border-2 relative overflow-hidden group',
              selectedType === type.id
                ? 'border-blue-500 dark:border-blue-400 shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/50 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]',
              type.shadowColor
            )}
            onClick={() => onTypeSelect(type.id)}
          >
            {/* Background gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
              type.gradient
            )} />
            
            {/* Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white shadow-sm",
                type.gradient
              )}>
                {type.badge}
              </div>
            </div>

            <CardContent className="p-8 relative">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <div className={cn(
                    'p-4 rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110',
                    type.iconBg,
                    type.shadowColor
                  )}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  {selectedType === type.id && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {type.title}
                    </h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Key Features
                  </h5>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full bg-gradient-to-r flex-shrink-0",
                          type.gradient
                        )} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 h-4 rounded-full bg-gradient-to-b flex-shrink-0 mt-0.5",
                      type.gradient
                    )} />
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Best for:
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {type.bestFor}
                      </p>
                    </div>
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
