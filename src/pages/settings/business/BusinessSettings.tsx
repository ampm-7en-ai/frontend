
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import UsageSection from '@/components/settings/business/UsageSection';
import ConnectedAccountsSection from '@/components/settings/business/ConnectedAccountsSection';
import ApiKeysSection from '@/components/settings/business/ApiKeysSection';
import BusinessProfileSection from '@/components/settings/business/BusinessProfileSection';
import TeamManagementSection from '@/components/settings/business/TeamManagementSection';
import GlobalAgentSettingsSection from '@/components/settings/business/GlobalAgentSettingsSection';

const BusinessSettings = () => {
  const { user } = useAuth();
  
  const initialProfileData = {
    businessName: user?.role === 'admin' ? 'Your Business' : 'Platform Admin',
    adminEmail: user?.email || '',
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Settings for your organization. You can manage your organization details, plan, connected accounts, and API keys here.
        </p>
      </div>

      <div className="space-y-8">
        
        <ConnectedAccountsSection />
        <ApiKeysSection />
        <BusinessProfileSection initialData={initialProfileData} />
        <TeamManagementSection />
        <GlobalAgentSettingsSection />
      </div>
    </div>
  );
};

export default BusinessSettings;
