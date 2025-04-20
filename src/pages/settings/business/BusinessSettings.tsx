
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Building, Users, Lock, Settings, CreditCard, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from "@/hooks/useSettings";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import BusinessProfileSection from "@/components/settings/business/BusinessProfileSection";
import GlobalAgentSettingsSection from "@/components/settings/business/GlobalAgentSettingsSection";
import TeamManagementSection from "@/components/settings/business/TeamManagementSection";
import UsageSection from "@/components/settings/business/UsageSection";

const BusinessSettings = () => {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("Business settings component mounted, fetching data...");
    refetch();
  }, [refetch]);
  
  useEffect(() => {
    if (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error loading settings",
        description: error instanceof Error ? error.message : "Failed to load settings. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading settings..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Settings Found</AlertTitle>
          <AlertDescription>
            No business settings found. Please refresh or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">Business Settings</h1>
      
      <Tabs defaultValue="business">
        <TabsList className="mb-4 w-full max-w-md">
          <TabsTrigger value="business" className="flex-1">Business Profile</TabsTrigger>
          <TabsTrigger value="agent" className="flex-1">Agent Settings</TabsTrigger>
          {settings?.permissions.can_manage_team && (
            <TabsTrigger value="team" className="flex-1">Team Management</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="business" className="space-y-6">
          <BusinessProfileSection initialData={{
            businessName: settings.business_details.business_name || "",
            adminEmail: settings.business_details.email || ""
          }} />
          
          <UsageSection usageMetrics={settings.usage_metrics} />
        </TabsContent>
        
        <TabsContent value="agent" className="space-y-6">
          <GlobalAgentSettingsSection 
            initialSettings={{
              defaultModel: settings.global_agent_settings.response_model,
              maxContextLength: settings.global_agent_settings.token_length,
              defaultTemperature: settings.global_agent_settings.temperature
            }}
          />
        </TabsContent>
        
        {settings?.permissions.can_manage_team && (
          <TabsContent value="team" className="space-y-6">
            <TeamManagementSection />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessSettings;
