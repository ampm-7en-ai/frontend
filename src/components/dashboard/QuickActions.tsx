
import React from 'react';
import { 
  PlusCircle, 
  Database, 
  Upload, 
  Bot, 
  BarChart2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type QuickActionsProps = {
  className?: string;
};

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      icon: <PlusCircle size={16} />,
      label: 'Create Agent',
      href: '/agents/create',
    },
    {
      icon: <Database size={16} />,
      label: 'Add Knowledge',
      href: '/knowledge/upload',
    },
    {
      icon: <Upload size={16} />,
      label: 'Import Data',
      href: '/knowledge/upload',
    },
    {
      icon: <Bot size={16} />,
      label: 'Test Agent',
      href: '/agents/test',
    },
    {
      icon: <BarChart2 size={16} />,
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
            <Link to={action.href}>
              {action.icon}
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
