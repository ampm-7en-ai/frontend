
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building, 
  Users, 
  Bot, 
  Link, 
  CreditCard, 
  Settings 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const BusinessSettingsNav = () => {
  const navItems = [
    { label: 'Business Profile', href: '/settings/business/profile', icon: Building },
    { label: 'Team Management', href: '/settings/business/team', icon: Users },
    { label: 'Agent Settings', href: '/settings/business/agents', icon: Bot },
    { label: 'Integrations', href: '/settings/business/integrations', icon: Link },
    { label: 'Billing', href: '/settings/business/billing', icon: CreditCard },
    { label: 'Preferences', href: '/settings/business/preferences', icon: Settings },
  ];

  return (
    <Card className="w-56 h-full border-border/40 shadow-sm">
      <div className="flex flex-col py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center py-2 px-4 text-sm rounded-md hover:bg-muted/50 transition-colors
              ${isActive 
                ? 'bg-muted font-medium text-primary border-l-2 border-primary' 
                : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </Card>
  );
};

export default BusinessSettingsNav;
