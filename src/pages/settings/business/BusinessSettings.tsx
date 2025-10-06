
import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import UsageSection from '@/components/settings/business/UsageSection';
import ConnectedAccountsSection from '@/components/settings/business/ConnectedAccountsSection';
import ApiKeysSection from '@/components/settings/business/ApiKeysSection';
import BusinessProfileSection from '@/components/settings/business/BusinessProfileSection';
import TeamManagementSection from '@/components/settings/business/TeamManagementSection';
import GlobalAgentSettingsSection from '@/components/settings/business/GlobalAgentSettingsSection';
import GdprSettingsSection from '@/components/settings/business/GdprSettingsSection';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PricingModal } from '@/components/settings/PricingModal';
import { CurrentPlanCard } from '@/components/settings/business/CurrentPlanCard';
import { PaymentStatusBanner } from '@/components/settings/PaymentStatusBanner';
import { useAppTheme } from '@/hooks/useAppTheme';

const BusinessSettings = () => {
  const { data: settingsData, isLoading, error } = useSettings();
  const { theme } = useAppTheme();
  
  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-[hsla(0,0%,0%,0.95)]">
        <div className="container mx-auto py-12 flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading settings..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto py-12 max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <p className="font-medium">Error loading settings</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  const initialProfileData = {
    businessName: settingsData?.business_details?.business_name || '',
    adminEmail: settingsData?.business_details?.email || '',
    adminPhone: settingsData?.business_details?.phone_number || '',
    adminWebsite: settingsData?.business_details?.website || '',
    privacyUrl: settingsData?.business_details?.privacy_url || '',
    // Default to true if can_manage_business_details is undefined
    isAllowed: settingsData?.permissions?.can_manage_business_details !== undefined 
      ? settingsData?.permissions?.can_manage_business_details 
      : true
  }

  return (
    <div className="min-h-screen dark:bg-[hsla(0,0%,0%,0.95)]">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        
        {/* Payment Status Banner */}
        <div className="mb-8">
          <PaymentStatusBanner />
        </div>

        {/* Current Plan Card */}
        <div className="mb-8 px-8">
          <CurrentPlanCard />
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Usage Section */}
          <div className="rounded-2xl overflow-hidden">
            <UsageSection usageMetrics={settingsData?.usage_metrics || {
              websites_crawled: 0,
              tokens_used: 0,
              credits_used: 0,
              remaining_credits: 0,
              total_credits: 0
            }}/>
          </div>


          {/* API Keys Section */}
          <div className="rounded-2xl overflow-hidden">
            <ApiKeysSection />
          </div>

          {/* Business Profile Section */}
          <div className="rounded-2xl overflow-hidden">
            <BusinessProfileSection initialData={initialProfileData} />
          </div>

          {/* Team Management Section */}
          {settingsData?.permissions.can_manage_team && (
            <div className="rounded-2xl overflow-hidden">
              <TeamManagementSection />
            </div>
          )}

          {/* Global Agent Settings Section */}
          <div className="rounded-2xl overflow-hidden">
            <GlobalAgentSettingsSection initialSettings={settingsData?.global_agent_settings || {
              response_model: "default_model",
              token_length: 512,
              temperature: 0.7
            }}/>
          </div>

          {/* GDPR Settings Section */}
          <div className="rounded-2xl overflow-hidden">
            <GdprSettingsSection initialSettings={settingsData?.gdpr_settings || {
              data_retention_days: null
            }}/>
          </div>
        </div>
        
        <PricingModal />
      </div>
    </div>
  );
};

export default BusinessSettings;
