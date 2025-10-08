
import React, { ReactNode } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';

interface PlatformSettingsLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const PlatformSettingsLayout = ({ 
  children, 
  title, 
  description 
}: PlatformSettingsLayoutProps) => {
  return (
    <div className="container max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
};

export default PlatformSettingsLayout;
