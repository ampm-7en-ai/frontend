
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, ExternalLink, Shield, CheckCircle, Settings, Edit, Save, User, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { IntegrationStatusBadge } from '@/components/ui/integration-status-badge';
import { integrationApi } from '@/utils/api-config';

interface HubspotStatus {
  is_connected: boolean;
  account_name?: string;
  hub_id?: string;
  pipeline_label?: string;
  stage_label?: string;
}

interface Pipeline {
  pipelineId: string;
  label: string;
  stages: {
    stageId: string;
    label: string;
  }[];
}

interface PipelineData {
  pipelines: Pipeline[];
  selected: {
    pipelineId: string;
    pipelineLabel: string;
    stageId: string;
    stageLabel: string;
  };
}

const HubspotIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const [hubspotStatus, setHubspotStatus] = useState<HubspotStatus | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [oauthWindow, setOauthWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  // Check HubSpot connection status on component mount
  useEffect(() => {
    checkHubspotStatus();
  }, []);

  // Monitor OAuth window for completion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (oauthWindow && !oauthWindow.closed) {
      interval = setInterval(() => {
        if (oauthWindow.closed) {
          // OAuth window was closed, check if integration was successful
          setTimeout(() => {
            checkHubspotStatus();
          }, 1000);
          setOauthWindow(null);
          setIsConnecting(false);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [oauthWindow]);

  const checkHubspotStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await integrationApi.hubspot.getStatus();

      if (!response.ok) {
        throw new Error(`Failed to check HubSpot status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        const wasConnected = hubspotStatus?.is_connected || false;
        setHubspotStatus(result.data);
        
        // Show success badge if connection status changed from disconnected to connected
        if (!wasConnected && result.data.is_connected) {
          setShowSuccessBadge(true);
          setTimeout(() => {
            setShowSuccessBadge(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error checking HubSpot status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchPipelines = async () => {
    setIsLoadingPipelines(true);
    try {
      const response = await integrationApi.hubspot.getPipelines();

      if (!response.ok) {
        throw new Error(`Failed to fetch pipelines: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setPipelineData(result.data);
        setSelectedPipelineId(result.data.selected?.pipelineId || '');
        setSelectedStageId(result.data.selected?.stageId || '');
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pipeline configurations.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPipelines(false);
    }
  };

  const handleEditConfig = async () => {
    setIsEditingConfig(true);
    await fetchPipelines();
  };

  const handleSaveConfig = async () => {
    if (!selectedPipelineId || !selectedStageId) {
      toast({
        title: "Validation Error",
        description: "Please select both pipeline and stage.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingConfig(true);
    try {
      const response = await integrationApi.hubspot.updatePipeline({
        pipelineId: selectedPipelineId,
        stageId: selectedStageId
      });

      if (!response.ok) {
        throw new Error(`Failed to update configuration: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        // Update the status with new configuration
        setHubspotStatus(prev => prev ? {
          ...prev,
          pipeline_label: result.data.pipelineLabel,
          stage_label: result.data.stageLabel
        } : null);
        
        setIsEditingConfig(false);
        toast({
          title: "Configuration Updated",
          description: "Pipeline and stage settings have been saved.",
        });
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update pipeline configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await integrationApi.hubspot.getAuthUrl();

      if (!response.ok) {
        throw new Error(`Failed to get OAuth URL: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success' && result.data.auth_url) {
        // Open OAuth URL in a new window
        const popup = window.open(
          result.data.auth_url,
          'hubspot-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        if (popup) {
          setOauthWindow(popup);
          toast({
            title: "Authentication Started",
            description: "Please complete the authentication in the popup window.",
          });
        } else {
          throw new Error('Failed to open OAuth popup window');
        }
      } else {
        throw new Error('No OAuth URL received from server');
      }
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to start HubSpot OAuth flow. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const response = await integrationApi.hubspot.unlink();

      if (!response.ok) {
        throw new Error(`Failed to unlink HubSpot: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setHubspotStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "HubSpot integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking HubSpot:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect HubSpot integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleSuccessBadgeClose = () => {
    setShowSuccessBadge(false);
  };

  const isConnected = hubspotStatus?.is_connected || false;
  const selectedPipeline = pipelineData?.pipelines.find(p => p.pipelineId === selectedPipelineId);
  const stageOptions = selectedPipeline?.stages.map(stage => ({
    value: stage.stageId,
    label: stage.label
  })) || [];

  const pipelineOptions = pipelineData?.pipelines.map(pipeline => ({
    value: pipeline.pipelineId,
    label: pipeline.label
  })) || [];

  // Get display values from status or fallback to "Not configured"
  const getDisplayValue = (value: string | undefined, fallback: string = "Not configured") => {
    return value && value.trim() !== '' ? value : fallback;
  };

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking HubSpot status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Integration Success Badge */}
      <IntegrationStatusBadge
        isVisible={showSuccessBadge}
        integrationName="HubSpot"
        integrationLogo="https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true"
        onClose={handleSuccessBadgeClose}
      />

      {/* Current Configuration Cards */}
      {isConnected && hubspotStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Configuration</h3>
            {!isEditingConfig && (
              <ModernButton 
                onClick={handleEditConfig}
                variant="outline"
                size="sm"
                disabled={isLoadingPipelines}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Configuration
              </ModernButton>
            )}
          </div>

          {isEditingConfig ? (
            <div className="space-y-6">
              {isLoadingPipelines ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Loading pipelines..." />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-select">Pipeline</Label>
                      <ModernDropdown
                        value={selectedPipelineId}
                        onValueChange={(value) => {
                          setSelectedPipelineId(value);
                          setSelectedStageId(''); // Reset stage when pipeline changes
                        }}
                        options={pipelineOptions}
                        placeholder="Select a pipeline..."
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stage-select">Stage</Label>
                      <ModernDropdown
                        value={selectedStageId}
                        onValueChange={setSelectedStageId}
                        options={stageOptions}
                        placeholder="Select a stage..."
                        className="w-full"
                        disabled={!selectedPipelineId}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <ModernButton 
                      onClick={handleSaveConfig}
                      disabled={isSavingConfig || !selectedPipelineId || !selectedStageId}
                      variant="primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingConfig ? "Saving..." : "Save Configuration"}
                    </ModernButton>
                    <ModernButton 
                      onClick={() => setIsEditingConfig(false)}
                      variant="outline"
                      disabled={isSavingConfig}
                    >
                      Cancel
                    </ModernButton>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Pipeline</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {getDisplayValue(hubspotStatus.pipeline_label)}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Default Stage</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {getDisplayValue(hubspotStatus.stage_label)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connection Setup */}
      {!isConnected && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connect HubSpot CRM</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Integrate with HubSpot CRM to sync customer data and enhance sales workflows.
          </p>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Integration Benefits</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Automatic contact and lead synchronization</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Sales pipeline and deal tracking</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Marketing automation workflows</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Customer interaction history</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Advanced reporting and analytics</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>Email marketing integration</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <ModernButton 
                onClick={handleOAuthConnect}
                disabled={isConnecting}
                variant="primary"
              >
                {isConnecting ? "Connecting..." : "Connect HubSpot"}
              </ModernButton>
              <ModernButton 
                variant="outline" 
                onClick={() => window.open('https://developers.hubspot.com/docs/api/oauth/quickstart-guide', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Guide
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {isConnected 
            ? "Your HubSpot CRM integration is active and ready to sync customer data." 
            : "Connect your HubSpot account to enable automated customer data synchronization and enhanced sales workflows."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {isConnected ? (
            <ModernButton 
              onClick={handleUnlink}
              disabled={isUnlinking}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              size="sm"
            >
              {isUnlinking ? "Disconnecting..." : "Disconnect Integration"}
            </ModernButton>
          ) : (
            <ModernButton 
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              variant="primary"
            >
              {isConnecting ? "Connecting..." : "Connect HubSpot"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://developers.hubspot.com/docs/api/oauth/quickstart-guide', '_blank')}
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">HubSpot CRM Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your sales and marketing operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Contact and lead management",
            "Sales pipeline tracking", 
            "Deal and opportunity management",
            "Marketing automation workflows",
            "Email marketing campaigns",
            "Advanced analytics and reporting"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HubspotIntegration;
