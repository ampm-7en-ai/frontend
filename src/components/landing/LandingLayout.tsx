
import React from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';

type LandingLayoutProps = {
  children: React.ReactNode;
};

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader transparent={true} />
      <main className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
};
