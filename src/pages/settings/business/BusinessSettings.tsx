
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
import { CurrentPlanCard } from '@/components/settings/business/CurrentPlanCard';
import { PaymentStatusBanner } from '@/components/settings/PaymentStatusBanner';
import { useAppTheme } from '@/hooks/useAppTheme';

const BusinessSettings = () => {
  const { data: settingsData, isLoading, error } = useSettings();
  const { theme } = useAppTheme();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
    // Default to true if can_manage_business_details is undefined
    isAllowed: settingsData?.permissions?.can_manage_business_details !== undefined 
      ? settingsData?.permissions?.can_manage_business_details 
      : true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Organization Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Manage your organization details, subscription plan, integrations, and team settings all in one place.
          </p>
        </div>

        {/* Payment Status Banner */}
        <div className="mb-8">
          <PaymentStatusBanner />
        </div>

        {/* Current Plan Card */}
        <div className="mb-8">
          <CurrentPlanCard />
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Usage Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <UsageSection usageMetrics={settingsData?.usage_metrics || {
              websites_crawled: 0,
              tokens_used: 0,
              credits_used: 0
            }}/>
          </div>

          {/* Connected Accounts Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <ConnectedAccountsSection />
          </div>

          {/* API Keys Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <ApiKeysSection />
          </div>

          {/* Business Profile Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <BusinessProfileSection initialData={initialProfileData} />
          </div>

          {/* Team Management Section */}
          {settingsData?.permissions.can_manage_team && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <TeamManagementSection />
            </div>
          )}

          {/* Global Agent Settings Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <GlobalAgentSettingsSection initialSettings={settingsData?.global_agent_settings || {
              response_model: "default_model",
              token_length: 512,
              temperature: 0.7
            }}/>
          </div>
        </div>
        
        <PricingModal />
      </div>
    </div>
  );
};

export default BusinessSettings;
