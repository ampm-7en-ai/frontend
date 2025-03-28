
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationTab from '@/components/agents/IntegrationTab';

const AgentEdit = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Agent</h1>
        <p className="text-muted-foreground mt-2">
          Customize your agent's settings, knowledge, and integrations.
        </p>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="text-center p-12 text-muted-foreground">
            Basic settings content goes here
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <div className="text-center p-12 text-muted-foreground">
            Knowledge content goes here
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationTab />
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="text-center p-12 text-muted-foreground">
            Advanced settings content goes here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentEdit;
