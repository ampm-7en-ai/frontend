
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
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-lg">{description}</p>
        )}
      </div>
      
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
};

export default PlatformSettingsLayout;
