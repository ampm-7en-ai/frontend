
import React from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import ModernButton from '@/components/dashboard/ModernButton';

interface IntegrationProviderCardProps {
  providerId: string;
  isEnabled: boolean;
  onToggle: (providerId: string, enabled: boolean) => void;
  isUpdating?: boolean;
  defaultProvider: string;
}
const integrationsList = {
      "whatsapp" : {
        name: 'WhatsApp Business',
        logo: 'https://img.logo.dev/whatsapp.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      },
      "messenger" : {
        name: 'Facebook Messenger',
        logo: 'https://img.logo.dev/facebook.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
      },
      "slack": {
        name: 'Slack',
        logo: 'https://img.logo.dev/slack.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
      },
      "instagram":{
        name: 'Instagram',
        logo: 'https://img.logo.dev/instagram.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
      },
      "zapier": {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your AI Agent with thousands of apps through Zapier automation.',
      logo: 'https://img.logo.dev/zapier.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Automation',
      type: 'automation'
    },
    "zendesk":{
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Connect your AI Agent with Zendesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Support',
      type: 'ticketing'
    },
    "freshdesk": {
      id: 'freshdesk',
      name: 'Freshdesk',
      description: 'Connect your AI Agent with Freshdesk to automate ticket management and customer support.',
      logo: 'https://img.logo.dev/freshdesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Support',
      type: 'ticketing'
    },
    "zoho":{
      id: 'zoho',
      name: 'Zoho Desk',
      description: 'Connect your AI Agent with Zoho Desk to streamline customer support and ticket handling.',
      logo: 'https://img.logo.dev/zoho.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'Support',
      type: 'ticketing'
    },
    "salesforce":{
      id: 'salesforce',
      name: 'Salesforce Service Cloud',
      description: 'Connect your AI Agent with Salesforce to enhance customer service and case management.',
      logo: 'https://img.logo.dev/salesforce.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'CRM & Support',
      type: 'ticketing'
    },
    "hubspot":{
      id: 'hubspot',
      name: 'HubSpot Service Hub',
      description: 'Connect your AI Agent with HubSpot to automate customer support and ticketing workflows.',
      logo: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      category: 'CRM & Support',
      type: 'ticketing'
    },
    "google_drive": {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Connect your AI Agent with Google Drive to access and manage your documents and files.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
      category: 'Storage',
      type: 'storage'
    }
  };

export const IntegrationProviderCard: React.FC<IntegrationProviderCardProps> = ({
  providerId,
  isEnabled,
  onToggle,
  isUpdating = false,
  defaultProvider
}) => {
  const providerInfo = integrationsList[providerId];
  
  if (!providerInfo) {
    return null;
  }

  const getProviderLogo = (providerId: string) => {
    return providerInfo.logo || `https://img.logo.dev/${providerId}.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true`;
  };

  return (
    <ModernCard className={`p-2 ${isUpdating && `opacity-50 cursor-none pointer-events-none`}`}>
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
           variant="ghost"
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
