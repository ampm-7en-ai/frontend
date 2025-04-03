
import React from 'react';
import { Outlet } from 'react-router-dom';

export function TestPageLayout() {
  return (
    <div className="min-h-screen w-full">
      <div className="dotted-background min-h-screen">
        <main className="max-w-[1400px] mx-auto p-4">
          <Outlet />
        </main>
      </div>
      
      {/* Add the dotted background pattern styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dotted-background {
          background-color: #f8f9fa;
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />
    </div>
  );
}
