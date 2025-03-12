
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Settings, 
  Shield, 
  Cpu, 
  FileCheck, 
  CreditCard, 
  Palette 
} from 'lucide-react';

const PlatformSettingsNav = () => {
  const navItems = [
    { label: 'General', href: '/settings/platform/general', icon: Settings },
    { label: 'Security', href: '/settings/platform/security', icon: Shield },
    { label: 'LLM Providers', href: '/settings/platform/llm-providers', icon: Cpu },
    { label: 'Compliance', href: '/settings/platform/compliance', icon: FileCheck },
    { label: 'Billing', href: '/settings/platform/billing', icon: CreditCard },
    { label: 'Customization', href: '/settings/platform/customization', icon: Palette },
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

export default PlatformSettingsNav;
