
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Settings2, 
  Bot,
  User,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';
import { useBuilder } from './BuilderContext';
import GuidelinesSection from '../edit/GuidelinesSection';

export const GuidelinesPanel = () => {
  const { state, updateAgentData } = useBuilder();
  const { agentData } = state;
  
  // Agent category state - determines if ticket configurations are available
  const [agentCategory, setAgentCategory] = useState<'Assistant' | 'Chatbot'>('Assistant');
  
  // Ticket configuration states (only for Chatbot category)
  const [ticketAutoReply, setTicketAutoReply] = useState(true);
  const [handoffEnabled, setHandoffEnabled] = useState(false);
  const [searchOtherAgents, setSearchOtherAgents] = useState(false);

  const handleGuidelinesChange = (guidelines: { dos: string[]; donts: string[] }) => {
    updateAgentData({ 
      guidelines: {
        dos: guidelines.dos,
        donts: guidelines.donts
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
            <FileText className="h-3 w-3 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Guidelines & Configuration</h2>
        </div>
        
        {/* Agent Category Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Category</Label>
          <Select value={agentCategory} onValueChange={(value: 'Assistant' | 'Chatbot') => setAgentCategory(value)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assistant">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Assistant</span>
                </div>
              </SelectItem>
              <SelectItem value="Chatbot">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-green-600" />
                  <span>Chatbot</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {agentCategory === 'Assistant' 
              ? 'General purpose assistant without ticketing integration'
              : 'Customer service chatbot with ticketing and handoff capabilities'
            }
          </p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Guidelines Section */}
          <GuidelinesSection
            initialGuidelines={agentData.guidelines}
            onChange={handleGuidelinesChange}
          />

          {/* Ticket Configuration Section - Only for Chatbot category */}
          {agentCategory === 'Chatbot' && (
            <>
              <Separator className="my-4" />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-blue-600" />
                    Ticket Configuration
                    <Badge variant="secondary" className="ml-2">
                      Chatbot Only
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Integration Status Check */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Integration Status</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Configure your ticketing integration (Freshdesk/Zendesk/Hubspot/Zoho) to enable ticket creation
                    </p>
                  </div>

                  {/* Auto Reply Option */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Auto Reply to Tickets</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically respond to new tickets when integration is enabled
                      </p>
                    </div>
                    <Switch
                      checked={ticketAutoReply}
                      onCheckedChange={setTicketAutoReply}
                    />
                  </div>

                  {/* Handoff Configuration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Enable Agent Handoff</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Allow customers to request human assistance
                        </p>
                      </div>
                      <Switch
                        checked={handoffEnabled}
                        onCheckedChange={setHandoffEnabled}
                      />
                    </div>

                    {/* Search Other Agents Option - Only when handoff is enabled */}
                    {handoffEnabled && (
                      <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Search Other Agents</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Search other agents before human handoff
                            </p>
                          </div>
                          <Switch
                            checked={searchOtherAgents}
                            onCheckedChange={setSearchOtherAgents}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Handoff Behavior Preview */}
                  {handoffEnabled && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Handoff Flow</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Customer requests human help</span>
                        </div>
                        {searchOtherAgents && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span>Search answer in other agents first</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                          <span>Reply: "I am sorry. Human will help." and set tag "Unanswered"</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Assistant Category Info */}
          {agentCategory === 'Assistant' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <User className="h-8 w-8 text-blue-600 mx-auto" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Assistant Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This agent is configured as a general assistant without ticketing integration capabilities.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
