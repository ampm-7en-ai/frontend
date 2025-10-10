
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { ArrowLeft } from 'lucide-react';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';
import ModernButton from '@/components/dashboard/ModernButton';

interface SubscriptionPlan {
  id?: number;
  name: string;
  description: string[];
  price: number;
  duration_days: number;
  for_type?: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  total_replies?: number;
}

const SubscriptionPlanEditor = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!planId;
  const queryClient = useQueryClient();
  
  // We don't need to fetch any subscription data here,
  // but we need access to the queryClient for refetching later
  const { refetchSubscriptionPlans } = useSubscription({ 
    fetchCurrent: false, 
    fetchAllPlans: false 
  });

  const [plan, setPlan] = useState<SubscriptionPlan>({
    name: '',
    description: [],
    price: 0,
    duration_days: 30,
    for_type: '',
    total_replies: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchPlanDetails();
    }
  }, [planId]);

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
      
      const result = await response.json();
      const planData = result.data;
      
      setPlan({
        id: planData.id,
        name: planData.name,
        description: Array.isArray(planData.description) ? planData.description : [],
        price: typeof planData.price === 'string' ? parseFloat(planData.price) : planData.price,
        duration_days: planData.duration_days,
        for_type: planData.for_type || planData.name,
        stripe_product_id: planData.stripe_product_id,
        stripe_price_id: planData.stripe_price_id,
        total_replies: planData.total_Replies
      });
      
      // Join array features back to text for editing
      const features = Array.isArray(planData.description) ? planData.description : [];
      setFeaturesText(features.join('\n'));
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
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeaturesText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Process features from text area (one feature per line)
      const features = featuresText
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.trim());
      
      // Prepare the payload according to the new API requirements
      const submitData = {
        name: plan.name,
        description: features, // Send as array
        price: plan.price, // Send as number
        duration_days: plan.duration_days,
        for_type: plan.for_type || plan.name, // Use plan name as default for_type
        total_replies: plan.total_replies
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
      
      // Invalidate and refetch subscription plans data after successful creation/update
      await queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      await refetchSubscriptionPlans();
      
      toast({
        title: isEditMode ? "Plan Updated" : "Plan Created",
        description: `Subscription plan has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      
      // Redirect back to billing settings page
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
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input 
                id="name"
                name="name"
                value={plan.name}
                onChange={handleChange}
                placeholder="e.g., Basic, Premium, Enterprise"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="for_type">Plan Type</Label>
              <Input 
                id="for_type"
                name="for_type"
                value={plan.for_type}
                onChange={handleChange}
                placeholder="e.g., Individual, Business, Enterprise"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Monthly Price ($)</Label>
              <Input 
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={plan.price}
                onChange={handleChange}
                placeholder="e.g., 19.99"
                required
              />
              <p className="text-xs text-muted-foreground">Enter price as a number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_replies">Total Replies</Label>
              <Input 
                id="total_replies"
                name="total_replies"
                type="number"
                min="1"
                value={plan.total_replies}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_days">Duration (days)</Label>
              <Input 
                id="duration_days"
                name="duration_days"
                type="number"
                min="1"
                value={plan.duration_days}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea 
                id="features"
                value={featuresText}
                onChange={handleFeaturesChange}
                placeholder="e.g., 5 Agents&#10;10GB Storage&#10;24/7 Support"
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter each feature on a separate line. These will be sent as an array to the API.
              </p>
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
