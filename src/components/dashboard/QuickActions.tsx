
import React from 'react';
import { 
  PlusCircle, 
  Database, 
  Upload, 
  Bot, 
  BarChart2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type QuickActionsProps = {
  className?: string;
};

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      icon: <PlusCircle size={14} />,
      label: 'Create Agent',
      href: '/agents/create',
    },
    {
      icon: <Database size={14} />,
      label: 'Add Knowledge',
      href: '/knowledge/upload',
    },
    {
      icon: <Upload size={14} />,
      label: 'Import Data',
      href: '/import',
    },
    {
      icon: <Bot size={14} />,
      label: 'Test Agent',
      href: '/agents/test',
    },
    {
      icon: <BarChart2 size={14} />,
      label: 'View Reports',
      href: '/analytics',
    },
  ];

  return (
    <div className={`card ${className}`}>
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 text-sm"
            asChild
          >
            <a href={action.href}>
              {action.icon}
              {action.label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
