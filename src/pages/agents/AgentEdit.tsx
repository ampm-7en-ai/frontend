
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GuidelinesSection } from '@/components/agents/edit/GuidelinesSection';
import { PlusCircle, X } from 'lucide-react';

// Mock data for demonstration
const getAgentData = (id: string) => {
  return {
    id: Number(id),
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support tickets',
    guidelines: 'Be polite and helpful. Try to resolve customer issues quickly.',
    model: 'GPT-4',
    role: 'support',
    suggestions: ['How do I reset my password?', 'What are your business hours?', 'How can I track my order?'],
  };
};

const AgentEdit = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState('');

  useEffect(() => {
    if (agentId) {
      const data = getAgentData(agentId);
      setAgent(data);
      setSuggestions(data.suggestions || []);
      setShowSuggestions(data.suggestions && data.suggestions.length > 0);
    }
  }, [agentId]);

  const handleAddSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion]);
      setNewSuggestion('');
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    const updatedSuggestions = [...suggestions];
    updatedSuggestions.splice(index, 1);
    setSuggestions(updatedSuggestions);
  };

  const handleUpdateSuggestion = (index: number, value: string) => {
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index] = value;
    setSuggestions(updatedSuggestions);
  };

  const handleSuggestionsToggle = (checked: boolean) => {
    setShowSuggestions(checked);
    if (!checked) {
      // If turning off suggestions, we might want to save the current ones in case user turns back on
      // But for now we'll just leave them as is
    }
  };

  if (!agent) {
    return <div className="flex h-screen items-center justify-center">Loading agent data...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Agent: {agent.name}</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Edit your agent's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={agent.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" defaultValue={agent.description} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={agent.role} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Suggested Questions</CardTitle>
              <CardDescription>Questions that will be shown to users to help them get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="suggestions-toggle" 
                  checked={showSuggestions}
                  onCheckedChange={handleSuggestionsToggle}
                />
                <Label htmlFor="suggestions-toggle">Enable suggested questions</Label>
              </div>
              
              {showSuggestions && (
                <div className="space-y-4 mt-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={suggestion} 
                        onChange={(e) => handleUpdateSuggestion(index, e.target.value)} 
                        placeholder="Suggested question"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveSuggestion(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2">
                    <Input 
                      value={newSuggestion} 
                      onChange={(e) => setNewSuggestion(e.target.value)} 
                      placeholder="Add a new suggested question"
                    />
                    <Button onClick={handleAddSuggestion} size="sm" variant="outline">
                      <PlusCircle className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="knowledge" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Sources</CardTitle>
              <CardDescription>Manage the knowledge sources for this agent</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Knowledge source management content goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guidelines" className="mt-4">
          <GuidelinesSection 
            initialGuidelines={agent.guidelines} 
            onGuidelinesChange={(guidelines: string) => {
              setAgent({...agent, guidelines});
            }} 
          />
        </TabsContent>
        
        <TabsContent value="advanced" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced settings for this agent</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Advanced settings content goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentEdit;
