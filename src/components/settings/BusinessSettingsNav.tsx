
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Building, 
  Users, 
  Bot, 
  Link, 
  CreditCard, 
  Settings 
} from 'lucide-react';

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
    <Card className="mb-6 border-border/40">
      <div className="flex overflow-x-auto py-1 px-1 gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm rounded-md whitespace-nowrap
              ${isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
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
