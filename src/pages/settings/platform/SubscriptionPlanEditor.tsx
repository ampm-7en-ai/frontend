
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

interface SubscriptionPlan {
  id?: number;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  features?: string[];
  stripe_product_id?: string;
  stripe_price_id?: string;
}

const SubscriptionPlanEditor = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!planId;

  const [plan, setPlan] = useState<SubscriptionPlan>({
    name: '',
    description: '',
    price: '',
    duration_days: 30,
    features: []
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
        description: planData.description,
        price: planData.price.toString(),
        duration_days: planData.duration_days,
        features: planData.features || [],
        stripe_product_id: planData.stripe_product_id,
        stripe_price_id: planData.stripe_price_id
      });
      
      setFeaturesText(planData.features?.join('\n') || '');
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
      [name]: value
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
      
      const submitData = {
        ...plan,
        price: parseFloat(plan.price).toString(),
        features
      };
      
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
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} subscription plan`);
      }
      
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
        description: `Failed to ${isEditMode ? 'update' : 'create'} subscription plan.`,
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
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/settings/platform/billing')}
          className="px-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Billing Settings
        </Button>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Plan Details" : "New Subscription Plan"}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Update the information below to modify your subscription plan"
                : "Fill in the details below to create a new subscription plan"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
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
              <Label htmlFor="price">Monthly Price ($)</Label>
              <Input 
                id="price"
                name="price"
                value={plan.price}
                onChange={handleChange}
                placeholder="e.g., 19.99"
                required
                pattern="^\d+(\.\d{1,2})?$"
              />
              <p className="text-xs text-muted-foreground">Enter price without currency symbol</p>
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
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={plan.description}
                onChange={handleChange}
                placeholder="Describe the benefits of this plan"
                rows={3}
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
              />
              <p className="text-xs text-muted-foreground">
                Enter each feature on a separate line. These will be displayed as badges.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/settings/platform/billing')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update Plan' : 'Create Plan'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PlatformSettingsLayout>
  );
};

export default SubscriptionPlanEditor;
