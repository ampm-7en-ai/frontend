
import React from 'react';
import { 
  MessagesSquare, 
  Database, 
  Upload, 
  Users, 
  BarChart2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type QuickActionsProps = {
  className?: string;
};

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      icon: <MessagesSquare size={16} />,
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
      href: '/import',
    },
    {
      icon: <Users size={16} />,
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
    <div className={`card rounded-xl hover:shadow-md transition-shadow duration-200 ${className}`}>
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-light-gray hover:bg-[#E4E6EB] text-dark-gray"
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
