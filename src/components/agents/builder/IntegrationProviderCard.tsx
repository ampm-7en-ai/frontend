
import React from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TICKETING_PROVIDERS } from '@/hooks/useTicketingIntegrations';
import { CheckCircle } from 'lucide-react';

interface IntegrationProviderCardProps {
  providerId: string;
  isEnabled: boolean;
  onToggle: (providerId: string, enabled: boolean) => void;
  isUpdating?: boolean;
}

export const IntegrationProviderCard: React.FC<IntegrationProviderCardProps> = ({
  providerId,
  isEnabled,
  onToggle,
  isUpdating = false
}) => {
  const providerInfo = TICKETING_PROVIDERS[providerId];
  
  if (!providerInfo) {
    return null;
  }

  const getProviderLogo = (providerId: string) => {
    return providerInfo.logo || `https://img.logo.dev/${providerId}.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true`;
  };

  return (
    <ModernCard className="p-3">
      <ModernCardContent className="p-0">
        <div className="flex items-center gap-3">
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
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {providerInfo.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            {/* Show capabilities */}
            <div className="flex items-center gap-1 mt-1">
              {providerInfo.capabilities.customFields && (
                <Badge variant="outline" className="text-xs">Custom Fields</Badge>
              )}
              {providerInfo.capabilities.attachments && (
                <Badge variant="outline" className="text-xs">Attachments</Badge>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => onToggle(providerId, checked)}
              disabled={isUpdating}
            />
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
