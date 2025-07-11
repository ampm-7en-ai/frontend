
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useFloatingToast } from '@/context/FloatingToastContext';
import ModernButton from '@/components/dashboard/ModernButton';

interface TicketInformationProps {
  ticketBy: string;
  ticketId: string;
}

const TicketInformation = ({ ticketBy, ticketId }: TicketInformationProps) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useFloatingToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      showToast({
        title: "Copied!",
        description: "Ticket ID copied to clipboard",
        variant: "success"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to copy ticket ID",
        variant: "error"
      });
    }
  };

  const getTicketLogo = (provider: string) => {
    const logos = {
      hubspot: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      zendesk: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      freshdesk: 'https://img.logo.dev/freshworks.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      jira: 'https://img.logo.dev/atlassian.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      servicenow: 'https://img.logo.dev/servicenow.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
    };
    
    return logos[provider.toLowerCase() as keyof typeof logos] || null;
  };

  const logoUrl = getTicketLogo(ticketBy);

  return (
    <section>
      <div className="mb-2">
        <h2 className="text-md font-semibold mb-0.5 text-slate-900 dark:text-slate-100">Ticket Information</h2>
      </div>
      
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${ticketBy} logo`} 
                  className="h-4 w-4 rounded-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <ExternalLink className="h-3 w-3 text-white" />
              )}
            </div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Support Ticket</h3>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-2 border border-slate-200/50 dark:border-slate-600/50 pyb-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-0 flex items-center gap-1.5 text-xs">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${ticketBy} logo`} 
                  className="h-6 w-6 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <ExternalLink className="h-2.5 w-2.5" />
              )}
              <p className="text-slate-600 dark:text-slate-400 text-xs capitalize">{ticketBy}</p>
            </h4>
            
          </div>
          
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-2 border border-slate-200/50 dark:border-slate-600/50">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-xs">
              Ticket ID
            </h4>
            <div className="flex items-center gap-1">
              <Input
                value={ticketId}
                readOnly
                variant="modern"
                size="sm"
                className="text-xs h-7"
              />
              <ModernButton
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-7 w-7 p-0 flex-shrink-0"
                iconOnly
                icon={copied ? Check : Copy}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketInformation;
