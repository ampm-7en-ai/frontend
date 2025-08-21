
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MessageSquare, User, Star, TrendingUp, Phone, Mail, MapPin, Calendar, Tag, Plus, Ticket, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import HandoffHistory from './HandoffHistory';
import CreateSupportTicketModal from './CreateSupportTicketModal';
import { analyzeSentiment } from '@/lib/sentiment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ConversationDetailsPanelProps {
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
  sentimentData: {  
    sentimentScores: Array<{
      messageId: string;
      content: string;
      score: number;
      timestamp: string;
    }>;
    averageSentiment: number | null;
  };
}

const ConversationDetailsPanel = ({ 
  conversation, 
  selectedAgent, 
  onHandoffClick, 
  getSatisfactionIndicator ,
  sentimentData
}: ConversationDetailsPanelProps) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { sentimentScores, averageSentiment } = sentimentData;
  const scores = sentimentScores.map(item => item.score);
  const {weightedAverage, sentimentCategory, movingAverages, trend } = analyzeSentiment(scores);

  // Extract real handoff data from messages
  const handoffData = useMemo(() => {
    // Add proper null checks to prevent errors
    if (!conversation?.messages || !Array.isArray(conversation.messages) || conversation.messages.length === 0) {
      return { handoffs: [], currentAgent: 'AI Assistant', allAgents: ['AI Assistant'] };
    }

    const agents = new Set<string>();
    const handoffs: any[] = [];
    let previousAgent = 'AI Assistant';
    
    // Add initial AI agent
    agents.add('AI Assistant');

    // Go through messages to find agent changes
    conversation.messages.forEach((message: any, index: number) => {
      if (!message) return; // Skip null/undefined messages
      
      const currentAgent = message.agent || (message.sender === 'user' ? null : 'AI Assistant');
      
      if (currentAgent && currentAgent !== previousAgent) {
        agents.add(currentAgent);
        
        handoffs.push({
          id: `handoff_${index}`,
          from: previousAgent,
          to: currentAgent,
          timestamp: message.timestamp || new Date().toISOString(),
          reason: `Agent change detected in message flow`
        });
        
        previousAgent = currentAgent;
      }
    });

    // Get the current agent from the conversation object or last message
    const currentAgent = conversation.agent || conversation.assignedAgent || handoffData?.currentAgent || 'AI Assistant';
    if (currentAgent) {
      agents.add(currentAgent);
    }

    return { 
      handoffs, 
      currentAgent,
      allAgents: Array.from(agents)
    };
  }, [conversation?.messages, conversation?.agent, conversation?.assignedAgent]);

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'Frustrated':
        return '😤 Frustrated';
      case 'Satisfied':
        return '😊 Satisfied';
      case 'Neutral':
      default:
        return '😐 Neutral';
    }
  };

  // Check if satisfaction data exists and is not empty
  const hasSatisfactionData = conversation?.satisfaction && conversation.satisfaction.trim() !== '';
  
  // Check if ticketing should be disabled (for human agents)
  const isTicketingDisabled = conversation?.agentType === 'human';

  // Check if ticket information exists
  const hasTicketInfo = conversation?.ticket_by && conversation?.ticket_id;

  if (!conversation) {
    return (
      <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xs font-medium text-gray-900 dark:text-slate-100 mb-1">No conversation selected</h3>
          <p className="text-[10px] text-gray-500 dark:text-slate-400">Select a conversation to view details</p>
        </div>
      </div>
    );
  }

  // Get the real assigned agent from conversation data
  const assignedAgent = conversation.agent || conversation.assignedAgent || handoffData.currentAgent;

  //logo
  const getTicketLogo = (provider: string) => {
    const logos = {
      hubspot: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      zendesk: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      freshdesk: 'https://img.logo.dev/freshworks.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      jira: 'https://img.logo.dev/atlassian.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      servicenow: 'https://img.logo.dev/servicenow.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
    };
    
    return logos[provider.toLowerCase() as keyof typeof logos] || null;
  };

  const logoUrl = getTicketLogo(conversation.ticket_by);

  // Transform data for Recharts
  const chartData = scores.map((score, index) => ({
    index: index + 1,
    score: score,
    movingAverage: index >= 2 ? movingAverages[index - 2] : null
  }));


  return (
    <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Additional Information</h1>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-4 space-y-4">
          {/* Ticket Information Section - Show if ticket info exists */}
          {hasTicketInfo && (
            
            <div className="border rounded-lg bg-white dark:bg-gray-800 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${logoUrl ? "p-0" : "p-2"} rounded-xl bg-gradient-to-br from-red-500 to-red-600`}>
                  {
                    logoUrl ? (
                      <img 
                      src={logoUrl} 
                      alt={`${conversation.ticket_by} logo`} 
                      className="h-8 w-8 rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    ) : (
                    <Ticket className="h-4 w-4 text-white" />
                  )
                  }
                  
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ticket Information</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2 text-sm">
                    <ExternalLink className="h-3 w-3" />
                    Provider
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">{conversation.ticket_by}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">Ticket ID</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">{conversation.ticket_id}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">Priority</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">{conversation.priority}</p>
                </div>
              </div>
            </div>

          )}

          {/* Agent Information Section */}
          <div className="border rounded-lg bg-white dark:bg-gray-800 px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Current Agent Info</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-slate-300 dark:bg-slate-600 p-[1px]">
                <AvatarFallback className="text-gray-500 text-sm font-medium bg-slate-100 dark:bg-slate-800">
                  {assignedAgent.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{assignedAgent}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Agent</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg bg-white dark:bg-gray-800 px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Customer Information</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">Full Name</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{conversation.customer || "Visitor"}</p>
              </div>
              
              {conversation.email && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3" />
                    Email
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{conversation.email}</p>
                </div>
              )}
              
              {hasSatisfactionData && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2 text-sm">
              
                    Satisfaction
                  </h4>
                  <div>{getSentimentEmoji(sentimentCategory)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Sentiment - Only show if satisfaction data exists */}
          {hasSatisfactionData && (
            <div className="border rounded-lg bg-white dark:bg-gray-800 px-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Customer Sentiment Journey</h3>
                  </div>
                </div>

                <div className="text-center py-4">
                  <div className="scale-90">
                    <LineChart
                      width={400}
                      height={300}
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      className="pb-4"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="index"
                        label={{ value: "No. of Messages", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis
                        domain={[0, 10]}
                        label={{ value: "Score", angle: -90, position: "insideLeft" }}
                        ticks={[0, 2, 4, 6, 8, 10]}
                      />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4CAF50"
                        strokeWidth={2}
                        name="Sentiment Score"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="movingAverage"
                        stroke="#2196F3"
                        strokeWidth={2}
                        name="3-Message Moving Average"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
              </div>
            </div>
          )}

          {/* Handoff History - Only show if there are handoffs */}
          {handoffData.handoffs.length > 0 && (
            <div className="border rounded-lg bg-white dark:bg-gray-800 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Agent Handoffs</h3>
                </div>
              </div>

              <HandoffHistory 
                handoffs={handoffData.handoffs}
                onHandoffClick={onHandoffClick}
              />
            </div>
          )}

          {/* All Agents Section */}
          {handoffData.allAgents.length > 1 && (
            <div className="border rounded-lg bg-white dark:bg-gray-800 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Agents</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {handoffData.allAgents.map((agent, index) => (
                  <Badge 
                    key={index}
                    variant={agent === handoffData.currentAgent ? "default" : "outline"}
                    className="text-sm"
                  >
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Support Ticket Modal */}
      <CreateSupportTicketModal
        open={isTicketModalOpen}
        onOpenChange={setIsTicketModalOpen}
        conversation={conversation}
      />
    </div>
  );
};

export default ConversationDetailsPanel;
