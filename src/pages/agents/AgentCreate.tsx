import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { createAgent } from '@/utils/api';

const AgentCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form state
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSaveAgent = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting agent creation...");
    
    try {
      console.log("Sending agent creation request with:", { agentName, agentDescription });
      const data = await createAgent(agentName, agentDescription);
      
      console.log("Agent creation successful:", data);
      
      // Show success toast with message from response
      toast({
        title: "Agent Created Successfully",
        description: data.message || `${agentName} has been successfully created.`,
        variant: "default"
      });
      
      // Navigate back to agent list
      navigate('/agents');
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while creating the agent.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {descriptionError && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Agent description is required
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground flex items-center">
            <span className="text-destructive mr-1">*</span> Required fields
          </p>
          <Button 
            onClick={handleSaveAgent} 
            disabled={isSubmitting || !agentName || !agentDescription}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Agent
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentCreate;
