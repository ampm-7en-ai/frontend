
import React from 'react';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';

const TeamSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Team Management</h2>
      </div>

      <BusinessSettingsNav />

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Team Members</h3>
        <p>Team management content will go here.</p>
      </div>
    </div>
  );
};

export default TeamSettings;
