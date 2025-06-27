
import React from 'react';
import { Slack } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModernButton from '@/components/dashboard/ModernButton';
import { useNavigate } from 'react-router-dom';

const ConnectedAccountsSection = () => {
  const navigate = useNavigate();

  const handleConnectSlack = () => {
    navigate('/integrations');
  };

  return (
    <section className="p-8">
      <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100 pl-2">Connected Accounts</h2>
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Slack className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Slack</h3>
              <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                not connected
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect 7en.ai to your Slack workspace to enable automated responses and notifications.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ModernButton 
              variant="outline" 
              onClick={handleConnectSlack}
              className="font-medium"
            >
              Connect
            </ModernButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectedAccountsSection;
