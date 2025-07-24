import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  MessageSquare,
  Zap,
  Database,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Shield,
  Building
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { IntegrationStatusBadge } from '@/components/ui/integration-status-badge';
import { useIntegrations } from '@/hooks/useIntegrations';

// Import individual integration components
import HubspotIntegration from '@/components/integrations/HubspotIntegration';
import ZendeskIntegration from '@/components/integrations/ZendeskIntegration';
import FreshdeskIntegration from '@/components/integrations/FreshdeskIntegration';
import SalesforceIntegration from '@/components/integrations/SalesforceIntegration';
import ZohoIntegration from '@/components/integrations/ZohoIntegration';
import SlackIntegration from '@/components/integrations/SlackIntegration';
import WhatsAppIntegration from '@/components/integrations/WhatsAppIntegration';
import MessengerIntegration from '@/components/integrations/MessengerIntegration';
import InstagramIntegration from '@/components/integrations/InstagramIntegration';
import GoogleDriveIntegration from '@/components/integrations/GoogleDriveIntegration';
import ZapierIntegration from '@/components/integrations/ZapierIntegration';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  logo?: string;
}

const IntegrationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const { toast } = useToast();
  
  const { 
    ticketingProviders, 
    communicationProviders, 
    productivityProviders, 
    automationProviders,
    isLoading,
    error 
  } = useIntegrations();

  // Handle URL-based integration selection and success detection
  useEffect(() => {
    const integration = searchParams.get('integration');
    const status = searchParams.get('status');
    
    if (integration) {
      setSelectedIntegration(integration);
    }
    
    // Handle OAuth success callback
    if (status === 'success' && integration) {
      setShowSuccessBadge(true);
      
      // Send success message to the integration component
      window.postMessage({
        type: `${integration.toUpperCase()}_OAUTH_SUCCESS`,
        integration
      }, window.location.origin);
      
      // Remove status from URL after processing
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('status');
      setSearchParams(newSearchParams, { replace: true });
      
      // Hide success badge after 5 seconds
      setTimeout(() => setShowSuccessBadge(false), 5000);
    }
  }, [searchParams, setSearchParams]);

  // Update URL when integration is selected
  const handleIntegrationSelect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setSearchParams({ integration: integrationId });
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedIntegration(null);
    setSearchParams({});
  };

  const allIntegrations: Integration[] = [
    ...ticketingProviders.map(provider => ({
      id: provider.id,
      name: provider.name,
      description: `Connect ${provider.name} to streamline customer support.`,
      category: 'ticketing',
      status: provider.status,
      logo: provider.logo
    })),
    ...communicationProviders.map(provider => ({
      id: provider.id,
      name: provider.name,
      description: `Integrate ${provider.name} for seamless communication workflows.`,
      category: 'communication',
      status: provider.status,
      logo: provider.logo
    })),
    ...productivityProviders.map(provider => ({
      id: provider.id,
      name: provider.name,
      description: `Enhance productivity with ${provider.name} integration.`,
      category: 'productivity',
      status: provider.status,
      logo: provider.logo
    })),
    ...automationProviders.map(provider => ({
      id: provider.id,
      name: provider.name,
      description: `Automate tasks with ${provider.name} integration.`,
      category: 'automation',
      status: provider.status,
      logo: provider.logo
    }))
  ];

  const filteredIntegrations = allIntegrations.filter(integration => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTermLower) ||
      integration.description.toLowerCase().includes(searchTermLower);

    const matchesCategory =
      selectedCategory === 'all' || integration.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderIntegrationConfig = (integrationId: string) => {
    const integrationComponents: Record<string, React.ComponentType> = {
      hubspot: HubspotIntegration,
      zendesk: ZendeskIntegration,
      freshdesk: FreshdeskIntegration,
      salesforce: SalesforceIntegration,
      zoho: ZohoIntegration,
      slack: SlackIntegration,
      whatsapp: WhatsAppIntegration,
      messenger: MessengerIntegration,
      instagram: InstagramIntegration,
      googledrive: GoogleDriveIntegration,
      zapier: ZapierIntegration
    };

    const Component = integrationComponents[integrationId];
    if (!Component) {
      return <div>Integration configuration not found</div>;
    }

    return <Component />;
  };

  const categoryFilters = [
    { id: 'all', label: 'All' },
    { id: 'ticketing', label: 'Ticketing' },
    { id: 'communication', label: 'Communication' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'automation', label: 'Automation' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading integrations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading integrations</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* URL-based Success Badge */}
      <IntegrationStatusBadge
        isVisible={showSuccessBadge}
        integrationName={selectedIntegration ? 
          allIntegrations.find(i => i.id === selectedIntegration)?.name || 'Integration' : 
          'Integration'
        }
        onClose={() => setShowSuccessBadge(false)}
      />

      {/* Integration Configuration View */}
      {selectedIntegration ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Integrations
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {allIntegrations.find(i => i.id === selectedIntegration)?.name} Integration
                </h1>
                <p className="text-gray-600">
                  Configure and manage your {allIntegrations.find(i => i.id === selectedIntegration)?.name} integration
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {renderIntegrationConfig(selectedIntegration)}
          </div>
        </div>
      ) : (
        // Integration List View
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600">Connect and manage integrations to enhance your workflow</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search integrations..."
                  className="pl-10 pr-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              {categoryFilters.map(filter => (
                <TabsTrigger
                  key={filter.id}
                  value={filter.id}
                  onClick={() => setSelectedCategory(filter.id)}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md text-sm font-medium px-4 py-2 focus:outline-none"
                >
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredIntegrations.map(integration => (
                <Card key={integration.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      {integration.name}
                      {integration.status === 'connected' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    {integration.description}
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
                        {integration.category}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIntegrationSelect(integration.id)}
                      >
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
