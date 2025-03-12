
import React from 'react';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';

const AgentSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Agent Settings</h2>
      </div>

      <BusinessSettingsNav />

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Agent Configuration</h3>
        <p>Agent settings content will go here.</p>
      </div>
    </div>
  );
};

export default AgentSettings;
