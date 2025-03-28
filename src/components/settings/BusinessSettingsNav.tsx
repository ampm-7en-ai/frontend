
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Settings, 
  Users, 
  CreditCard, 
  Database, 
  MessageSquare,
  Share2
} from 'lucide-react';

const BusinessSettingsNav = () => {
  const navItems = [
    { label: 'Profile', href: '/settings/business/profile', icon: Settings },
    { label: 'Team', href: '/settings/business/team', icon: Users },
    { label: 'Integrations', href: '/settings/business/integrations', icon: Share2 },
    { label: 'Chatbox', href: '/settings/business/chatbox', icon: MessageSquare },
    { label: 'Agent Settings', href: '/settings/business/agent-settings', icon: Database },
    { label: 'Billing', href: '/settings/business/billing', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center py-2 px-3 text-sm rounded-md transition-colors
            ${isActive 
              ? 'bg-primary text-white font-medium' 
              : 'text-muted-foreground hover:bg-muted/50'
            }`
          }
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export default BusinessSettingsNav;
