
import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import UsageSection from '@/components/settings/business/UsageSection';
import ConnectedAccountsSection from '@/components/settings/business/ConnectedAccountsSection';
import ApiKeysSection from '@/components/settings/business/ApiKeysSection';
import BusinessProfileSection from '@/components/settings/business/BusinessProfileSection';
import TeamManagementSection from '@/components/settings/business/TeamManagementSection';
import GlobalAgentSettingsSection from '@/components/settings/business/GlobalAgentSettingsSection';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PricingModal } from '@/components/settings/PricingModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { usePricingModal } from '@/hooks/usePricingModal';

const BusinessSettings = () => {
  const { data: settingsData, isLoading, error } = useSettings();
  const { openPricingModal } = usePricingModal();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>Error loading settings: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const initialProfileData = {
    businessName: settingsData?.business_details?.business_name || '',
    adminEmail: settingsData?.business_details?.email || '',
    adminPhone: settingsData?.business_details?.phone_number || '',
    adminWebsite: settingsData?.business_details?.website || '',
    // Default to true if can_manage_business_details is undefined
    isAllowed: settingsData?.permissions?.can_manage_business_details !== undefined 
      ? settingsData?.permissions?.can_manage_business_details 
      : true
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Settings for your organization. You can manage your organization details, plan, connected accounts, and API keys here.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Free Tier</h2>
              <p className="text-muted-foreground">$0/month</p>
            </div>
            <Button 
              onClick={openPricingModal}
              className="flex items-center gap-1"
            >
              Upgrade Plan <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <UsageSection usageMetrics={settingsData?.usage_metrics || {
          websites_crawled: 0,
          tokens_used: 0,
          credits_used: 0
        }}/>
        <ConnectedAccountsSection />
        <ApiKeysSection />
        <BusinessProfileSection initialData={initialProfileData} />
        {
          settingsData?.permissions.can_manage_team && <TeamManagementSection />
        }
        <GlobalAgentSettingsSection initialSettings={settingsData?.global_agent_settings || {
          response_model: "default_model",
          token_length: 512,
          temperature: 0.7
        }}/>
      </div>
      
      <PricingModal />
    </div>
  );
};

export default BusinessSettings;
