
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, ExternalLink, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TicketInformationProps {
  ticketBy: string;
  ticketId: string;
}

const TicketInformation = ({ ticketBy, ticketId }: TicketInformationProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Ticket ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy ticket ID",
        variant: "destructive"
      });
    }
  };

  const getTicketLogo = (provider: string) => {
    const logos = {
      hubspot: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
      zendesk: 'https://d1eipm3vz40hy0.cloudfront.net/images/AMER/zendesk-logo.png',
      freshdesk: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Freshworks_logo.png',
      jira: 'https://wac-cdn.atlassian.com/dam/jcr:8f27f14d-1382-4107-9247-f2e5f7f5b8b3/favicon-32x32.png',
      servicenow: 'https://logos-world.net/wp-content/uploads/2021/02/ServiceNow-Logo.png'
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
              <Ticket className="h-3 w-3 text-white" />
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
                className="text-xs h-7 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketInformation;
