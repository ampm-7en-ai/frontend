
import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

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
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
};

export default PlatformSettingsLayout;
