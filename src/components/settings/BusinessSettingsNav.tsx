
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
    <div className="w-48 py-4">
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
    </div>
  );
};

export default BusinessSettingsNav;
