import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronLeft, 
  Database, 
  Save, 
  Upload,
  BrainCircuit,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Add new imports for the checkbox
import { Checkbox } from "@/components/ui/checkbox";
import { File, Globe } from "lucide-react";

const AgentCreate = () => {
  const [selectedAgentType, setSelectedAgentType] = useState('support');
  const [showCustomTypeDialog, setShowCustomTypeDialog] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  const [customTypeDescription, setCustomTypeDescription] = useState('');
  
  const handleAgentTypeChange = (value: string) => {
    setSelectedAgentType(value);
    if (value === 'custom') {
      setShowCustomTypeDialog(true);
    }
  };
  
  const handleCreateCustomType = () => {
    // Here you would typically save the custom type to your backend
    // For now, we'll just close the dialog
    setShowCustomTypeDialog(false);
  };
  
  interface KnowledgeSource {
    id: string;
    name: string;
    type: 'document' | 'webpage';
    size: string;
    lastUpdated: string;
    icon: typeof File | typeof Globe;
  }
  
  const knowledgeSources: KnowledgeSource[] = [
    {
      id: "product-docs",
      name: "Product Documentation",
      type: "document",
      size: "2.4 MB",
      lastUpdated: "2023-12-15",
      icon: File
    },
    {
      id: "faqs",
      name: "FAQs",
      type: "webpage",
      size: "0.8 MB",
      lastUpdated: "2023-12-20",
      icon: Globe
    },
    {
      id: "support-guidelines",
      name: "Customer Support Guidelines",
      type: "document",
      size: "1.5 MB",
      lastUpdated: "2023-12-10",
      icon: File
    },
    {
      id: "pricing",
      name: "Pricing Information",
      type: "document",
      size: "0.3 MB",
      lastUpdated: "2023-12-25",
      icon: File
    }
  ];
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/agents">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground">Configure your AI agent's capabilities and behavior</p>
        </div>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="agent-type">Agent Type</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
              <CardDescription>Define your agent's identity and purpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input id="agent-name" placeholder="e.g., Customer Support Assistant" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Textarea 
                  id="agent-description" 
                  placeholder="Describe what this agent does and how it helps users"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agent-type" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5" />
                Agent Type
              </CardTitle>
              <CardDescription>Define the agent's role and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <RadioGroup 
                    defaultValue={selectedAgentType} 
                    value={selectedAgentType}
                    onValueChange={handleAgentTypeChange}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="support" id="support" />
                      <Label htmlFor="support" className="flex flex-col cursor-pointer">
                        <span className="font-medium flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                          Customer Support
                        </span>
                        <span className="text-xs text-muted-foreground">Assists with user questions and problems</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="sales" id="sales" />
                      <Label htmlFor="sales" className="flex flex-col cursor-pointer">
                        <span className="font-medium flex items-center">
                          <ShieldAlert className="h-4 w-4 mr-2 text-blue-500" />
                          Sales Assistant
                        </span>
                        <span className="text-xs text-muted-foreground">Helps convert leads and answer product questions</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical" className="flex flex-col cursor-pointer">
                        <span className="font-medium flex items-center">
                          <ShieldQuestion className="h-4 w-4 mr-2 text-purple-500" />
                          Technical Support
                        </span>
                        <span className="text-xs text-muted-foreground">Helps with technical problems and troubleshooting</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/10">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="flex flex-col cursor-pointer">
                        <span className="font-medium flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-gray-500" />
                          Custom
                        </span>
                        <span className="text-xs text-muted-foreground">Create a custom agent type</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="knowledge" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Sources</CardTitle>
              <CardDescription>
                Select which knowledge your agent can access to improve its responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                {knowledgeSources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <div
                      key={source.id}
                      className="flex items-start space-x-4 border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    >
                      <Checkbox id={source.id} className="mt-1" />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={source.id}
                          className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          {source.name}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          Type: {source.type}
                          <span className="mx-2">•</span>
                          Size: {source.size}
                          <span className="mx-2">•</span>
                          Last updated: {source.lastUpdated}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link to="/agents">Cancel</Link>
        </Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Agent
        </Button>
      </div>

      {/* Custom Agent Type Dialog */}
      <Dialog open={showCustomTypeDialog} onOpenChange={setShowCustomTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Agent Type</DialogTitle>
            <DialogDescription>
              Define your custom agent type with a name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-type-name">Type Name</Label>
              <Input 
                id="custom-type-name" 
                placeholder="e.g., Product Expert"
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-type-description">Description</Label>
              <Textarea 
                id="custom-type-description"
                placeholder="Describe what this agent type does"
                value={customTypeDescription}
                onChange={(e) => setCustomTypeDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomTypeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomType}>
              Create Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentCreate;
