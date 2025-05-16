
import React from 'react';

type LandingLayoutProps = {
  children: React.ReactNode;
};

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  return <div className="min-h-screen">{children}</div>;
};
