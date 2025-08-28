
import React from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import ModernButton from '@/components/dashboard/ModernButton';
import { TICKETING_PROVIDERS_LOGOS } from '@/utils/integrationUtils';

interface IntegrationProviderCardProps {
  providerId: string;
  isEnabled: boolean;
  onToggle: (providerId: string, enabled: boolean) => void;
  isUpdating?: boolean;
  defaultProvider: string;
}

export const IntegrationProviderCard: React.FC<IntegrationProviderCardProps> = ({
  providerId,
  isEnabled,
  onToggle,
  isUpdating = false,
  defaultProvider
}) => {
  const providerInfo = TICKETING_PROVIDERS_LOGOS[providerId];
  
  if (!providerInfo) {
    return null;
  }

  const getProviderLogo = (providerId: string) => {
    return providerInfo.logo || `https://img.logo.dev/${providerId}.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true`;
  };

  return (
    <ModernCard className={`p-2 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm ${isUpdating && `opacity-50 cursor-none pointer-events-none `}`}>
      <ModernCardContent className="p-0">
        <div className="flex items-center gap-3 group">
          <div className="flex-shrink-0">
            <img 
              src={getProviderLogo(providerId)} 
              alt={`${providerInfo.name} logo`}
              className="w-8 h-8 rounded-lg object-contain bg-white p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-xs text-gray-900 dark:text-gray-100">
                {providerInfo.name}
              </h3>
            </div>
          </div>
          
          <div className="flex-shrink-0">
           <ModernButton
           variant="outline"
           size='sm'
           className={`text-xs hidden ${providerId === defaultProvider ? `!block` : `group-hover:block` }`}
           disabled={providerId === defaultProvider}
           onClick={()=> onToggle(providerId,isEnabled)}
           >
           Default
           </ModernButton>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
