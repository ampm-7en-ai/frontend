
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { ArrowLeft } from 'lucide-react';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAIModels } from '@/hooks/useAIModels';
import { Checkbox } from '@/components/ui/checkbox';

interface PlanConfig {
  limits: {
    ai_agents: number;
    team_seats: number;
    training_per_agent_mb: number;
    integration: number;
  };
  handoffs: {
    to_email: boolean;
    to_agent: boolean;
    to_integration: boolean;
  };
  toggles: {
    embed_unlimited_websites: boolean;
    weblink_training: number;
    analytics: boolean;
  };
  integrations: {
    freshdesk: boolean;
    zendesk: boolean;
    slack: boolean;
    zoho: boolean;
    zapier: boolean;
    salesforce: boolean;
    whatsapp: boolean;
    messenger: boolean;
    instagram: boolean;
  };
  models: Record<string, boolean>;
}

interface SubscriptionPlan {
  id?: number;
  name: string;
  description: string;
  for_type: string;
  total_replies: number;
  price_monthly: number;
  duration_days_monthly: number;
  price_annual: number;
  duration_days_annual: number;
  config: PlanConfig;
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  status?: string;
}

const SubscriptionPlanEditor = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!planId;
  const queryClient = useQueryClient();
  
  const { refetchSubscriptionPlans } = useSubscription({ 
    fetchCurrent: false, 
    fetchAllPlans: false 
  });

  const { allModelOptions, isLoading: modelsLoading } = useAIModels(true);

  const [plan, setPlan] = useState<SubscriptionPlan>({
    name: '',
    description: '',
    for_type: 'Individual',
    total_replies: 0,
    price_monthly: 0,
    duration_days_monthly: 30,
    price_annual: 0,
    duration_days_annual: 365,
    config: {
      limits: {
        ai_agents: 1,
        team_seats: 1,
        training_per_agent_mb: 100,
        integration: 0
      },
      handoffs: {
        to_email: false,
        to_agent: false,
        to_integration: false
      },
      toggles: {
        embed_unlimited_websites: false,
        weblink_training: 0,
        analytics: false
      },
      integrations: {
        freshdesk: false,
        zendesk: false,
        slack: false,
        zoho: false,
        zapier: false,
        salesforce: false,
        whatsapp: false,
        messenger: false,
        instagram: false
      },
      models: {}
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFree, setFree] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchPlanDetails();
    }
  }, [planId]);

  // Initialize models when they're loaded
  useEffect(() => {
    if (!modelsLoading && allModelOptions.length > 0 && Object.keys(plan.config.models).length === 0) {
      const initialModels: Record<string, boolean> = {};
      allModelOptions.forEach(model => {
        initialModels[model.value] = false;
      });
      setPlan(prev => ({
        ...prev,
        config: {
          ...prev.config,
          models: initialModels
        }
      }));
    }
  }, [modelsLoading, allModelOptions]);

  const fetchPlanDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${BASE_URL}subscriptions/plan/${planId}`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plan details');
      }
      
      const planData = await response.json();
      
      setPlan({
        id: planData.id,
        name: planData.name,
        description: planData.description || '',
        for_type: planData.for_type,
        total_replies: planData.total_replies,
        price_monthly: typeof planData.price_monthly === 'string' ? parseFloat(planData.price_monthly) : planData.price_monthly,
        duration_days_monthly: planData.duration_days_monthly,
        price_annual: typeof planData.price_annual === 'string' ? parseFloat(planData.price_annual) : planData.price_annual,
        duration_days_annual: planData.duration_days_annual,
        config: planData.config,
        stripe_product_id: planData.stripe_product_id,
        stripe_price_id_monthly: planData.stripe_price_id_monthly,
        stripe_price_id_annual: planData.stripe_price_id_annual,
        status: planData.status
      });
    } catch (error) {
      console.error('Error fetching plan details:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plan details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlan(prev => ({
      ...prev,
      [name]: ['price_monthly', 'price_annual'].includes(name) ? parseFloat(value) || 0 : 
              ['duration_days_monthly', 'duration_days_annual', 'total_replies'].includes(name) ? parseInt(value) || 0 :
              value
    }));
  };

  const handleConfigChange = (section: keyof PlanConfig, key: string, value: any) => {
    setPlan(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [section]: {
          ...prev.config[section],
          [key]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const submitData = {
        name: plan.name,
        description: plan.description,
        for_type: plan.for_type,
        total_replies: plan.total_replies,
        price_monthly: plan.price_monthly,
        duration_days_monthly: plan.duration_days_monthly,
        price_annual: plan.price_annual,
        duration_days_annual: plan.duration_days_annual,
        config: plan.config
      };
      
      console.log('Submitting plan data:', submitData);
      
      const url = isEditMode 
        ? `${BASE_URL}subscriptions/update/${planId}/`
        : `${BASE_URL}subscriptions/create/`;
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} subscription plan`);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      await refetchSubscriptionPlans();
      
      toast({
        title: isEditMode ? "Plan Updated" : "Plan Created",
        description: `Subscription plan has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      
      navigate('/settings/platform/billing');
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} plan:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} subscription plan.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PlatformSettingsLayout
      title={isEditMode ? "Edit Subscription Plan" : "Create Subscription Plan"}
      description={isEditMode 
        ? "Modify your subscription plan details" 
        : "Add a new subscription plan to your platform"
      }
    >
      <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
      <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <ModernButton
              variant="outline"
              onClick={() => navigate('/settings/platform/billing')}
              size='sm'
              iconOnly
              className="h-10 w-10 flex"
            >
              <ArrowLeft className="h-5 w-5" />
            </ModernButton>
            
          </div>
        </div>
      
      <Card className='dark:text-gray-200 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none p-2'>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={plan.name}
                    onChange={handleChange}
                    placeholder="e.g., Core, Pro, Enterprise"
                    required
                  />
                </div>
                
                
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={plan.description}
                  onChange={handleChange}
                  placeholder="Short description of the plan"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_replies">Total Replies</Label>
                <Input 
                  id="total_replies"
                  name="total_replies"
                  type="number"
                  min="0"
                  value={plan.total_replies}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className='flex justify-between'>
                <h3 className="text-lg font-semibold">Pricing & Duration</h3>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id="free"
                    checked={isFree}
                    className="rounded-[4px]"
                    onCheckedChange={(checked) => setFree(!!checked)}
                  />
                  <label htmlFor='free' className="cursor-pointer">Free</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Monthly</h4>
                  <div className="space-y-2">
                    <Label htmlFor="price_monthly">Price ($)</Label>
                    <Input 
                      id="price_monthly"
                      name="price_monthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={isFree ? 0 : plan.price_monthly}
                      onChange={handleChange}
                      disabled={isFree}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_days_monthly">Duration (days)</Label>
                    <Input 
                      id="duration_days_monthly"
                      name="duration_days_monthly"
                      type="number"
                      min="1"
                      value={plan.duration_days_monthly}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Annual</h4>
                  <div className="space-y-2">
                    <Label htmlFor="price_annual">Price ($)</Label>
                    <Input 
                      id="price_annual"
                      name="price_annual"
                      type="number"
                      step="0.01"
                      min="0"
                      value={isFree ? 0 : plan.price_annual}
                      onChange={handleChange}
                      disabled={isFree}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_days_annual">Duration (days)</Label>
                    <Input 
                      id="duration_days_annual"
                      name="duration_days_annual"
                      type="number"
                      min="1"
                      value={plan.duration_days_annual}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Agents</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={plan.config.limits.ai_agents}
                    onChange={(e) => handleConfigChange('limits', 'ai_agents', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Seats</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={plan.config.limits.team_seats}
                    onChange={(e) => handleConfigChange('limits', 'team_seats', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Training per Agent (MB)</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={plan.config.limits.training_per_agent_mb}
                    onChange={(e) => handleConfigChange('limits', 'training_per_agent_mb', parseInt(e.target.value) || 0)}
                  />
                </div>
                
              </div>
            </div>

            {/* Handoffs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Handoffs</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="handoff-email"
                    checked={plan.config.handoffs.to_email}
                    onCheckedChange={(checked) => handleConfigChange('handoffs', 'to_email', !!checked)}
                  />
                  <span>To Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="handoff-agent"
                    checked={plan.config.handoffs.to_agent}
                    onCheckedChange={(checked) => handleConfigChange('handoffs', 'to_agent', !!checked)}
                  />
                  <span>To Agent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="handoff-integration"
                    checked={plan.config.handoffs.to_integration}
                    onCheckedChange={(checked) => handleConfigChange('handoffs', 'to_integration', !!checked)}
                  />
                  <span>To Integration</span>
                </label>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Feature Toggles</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="embed-unlimited"
                    checked={plan.config.toggles.embed_unlimited_websites}
                    onCheckedChange={(checked) => handleConfigChange('toggles', 'embed_unlimited_websites', !!checked)}
                  />
                  <span>Embed Unlimited Websites</span>
                </label>
                <div className="space-y-2">
                  <Label>Weblink Training</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={plan.config.toggles.weblink_training}
                    onChange={(e) => handleConfigChange('toggles', 'weblink_training', parseInt(e.target.value) || 0)}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="analytics"
                    checked={plan.config.toggles.analytics}
                    onCheckedChange={(checked) => handleConfigChange('toggles', 'analytics', !!checked)}
                  />
                  <span>Analytics</span>
                </label>
              </div>
            </div>

            {/* Integrations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Integrations</h3>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    id="select-all-integrations"
                    checked={Object.values(plan.config.integrations).every(v => v)}
                    onCheckedChange={(checked) => {
                      const allChecked = !!checked;
                      const updatedIntegrations = Object.keys(plan.config.integrations).reduce((acc, key) => ({
                        ...acc,
                        [key]: allChecked
                      }), {} as typeof plan.config.integrations);
                      setPlan(prev => ({
                        ...prev,
                        config: {
                          ...prev.config,
                          integrations: updatedIntegrations
                        }
                      }));
                    }}
                  />
                  <span>Select All</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.keys(plan.config.integrations).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id={`integration-${key}`}
                      checked={plan.config.integrations[key as keyof typeof plan.config.integrations]}
                      onCheckedChange={(checked) => handleConfigChange('integrations', key, !!checked)}
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Models */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Models</h3>
                {!modelsLoading && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      id="select-all-models"
                      checked={Object.values(plan.config.models).every(v => v)}
                      onCheckedChange={(checked) => {
                        const allChecked = !!checked;
                        const updatedModels = Object.keys(plan.config.models).reduce((acc, key) => ({
                          ...acc,
                          [key]: allChecked
                        }), {} as typeof plan.config.models);
                        setPlan(prev => ({
                          ...prev,
                          config: {
                            ...prev.config,
                            models: updatedModels
                          }
                        }));
                      }}
                    />
                    <span>Select All</span>
                  </label>
                )}
              </div>
              {modelsLoading ? (
                <div className="text-sm text-muted-foreground">Loading models...</div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {allModelOptions.map((model) => (
                    <label key={model.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        id={`model-${model.value}`}
                        checked={plan.config.models[model.value] || false}
                        onCheckedChange={(checked) => handleConfigChange('models', model.value, !!checked)}
                      />
                      <span className="text-sm">{model.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-4">
            <ModernButton 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/settings/platform/billing')}
            >
              Cancel
            </ModernButton>
            <ModernButton type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update Plan' : 'Create Plan'}
            </ModernButton>
          </CardFooter>
        </form>
      </Card>
      </section>
    </PlatformSettingsLayout>
  );
};

export default SubscriptionPlanEditor;
