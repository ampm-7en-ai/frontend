
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  Save, 
  BrainCircuit,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const AgentCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form state
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState('support');
  const [showCustomTypeDialog, setShowCustomTypeDialog] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  const [customTypeDescription, setCustomTypeDescription] = useState('');
  
  // Form validation
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  
  const handleAgentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(e.target.value);
    if (e.target.value.trim()) setNameError(false);
  };
  
  const handleAgentDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgentDescription(e.target.value);
    if (e.target.value.trim()) setDescriptionError(false);
  };
  
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
  
  const validateForm = () => {
    let isValid = true;
    
    if (!agentName.trim()) {
      setNameError(true);
      isValid = false;
    }
    
    if (!agentDescription.trim()) {
      setDescriptionError(true);
      isValid = false;
    }
    
    if (!isValid) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields before creating an agent.",
        variant: "destructive"
      });
    }
    
    return isValid;
  };
  
  const handleSaveAgent = () => {
    if (!validateForm()) {
      return;
    }
    
    // Save agent logic would go here
    toast({
      title: "Agent Created",
      description: `${agentName} has been successfully created.`,
      variant: "default"
    });
    
    // Navigate back to agent list
    navigate('/agents');
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/agents">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground">Configure your AI agent's basic information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
          <CardDescription>Define your agent's identity and purpose</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="flex items-center">
                Agent Name <span className="text-destructive ml-1">*</span>
              </Label>
              <Input 
                id="agent-name" 
                placeholder="e.g., Customer Support Assistant" 
                value={agentName}
                onChange={handleAgentNameChange}
                className={nameError ? "border-destructive" : ""}
              />
              {nameError && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Agent name is required
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent-description" className="flex items-center">
                Description <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea 
                id="agent-description" 
                placeholder="Describe what this agent does and how it helps users"
                className={`min-h-[100px] ${descriptionError ? "border-destructive" : ""}`}
                value={agentDescription}
                onChange={handleAgentDescriptionChange}
              />
              {descriptionError && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Agent description is required
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="mb-4 flex items-center">
              <BrainCircuit className="mr-2 h-5 w-5" />
              <h3 className="text-lg font-medium">Agent Type</h3>
            </div>
            
            <RadioGroup 
              defaultValue={selectedAgentType} 
              value={selectedAgentType}
              onValueChange={handleAgentTypeChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
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
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground flex items-center">
            <span className="text-destructive mr-1">*</span> Required fields
          </p>
          <Button onClick={handleSaveAgent} disabled={!agentName || !agentDescription}>
            <Save className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </CardFooter>
      </Card>

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
