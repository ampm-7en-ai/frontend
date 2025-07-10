
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MessageSquare, User, Star, TrendingUp, Phone, Mail, MapPin, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import HandoffHistory from './HandoffHistory';
import CreateSupportTicketModal from './CreateSupportTicketModal';

interface ConversationDetailsPanelProps {
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
}

const ConversationDetailsPanel = ({ 
  conversation, 
  selectedAgent, 
  onHandoffClick, 
  getSatisfactionIndicator 
}: ConversationDetailsPanelProps) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Extract real handoff data from messages
  const handoffData = useMemo(() => {
    if (!conversation?.messages) return { handoffs: [], currentAgent: 'AI Assistant' };

    const agents = new Set<string>();
    const handoffs: any[] = [];
    let previousAgent = 'AI Assistant';
    
    // Add initial AI agent
    agents.add('AI Assistant');

    // Go through messages to find agent changes
    conversation.messages.forEach((message: any, index: number) => {
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

    // Get the current agent (last agent from messages or default)
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const currentAgent = lastMessage?.agent || conversation.agent || 'AI Assistant';

    return { 
      handoffs, 
      currentAgent,
      allAgents: Array.from(agents)
    };
  }, [conversation?.messages, conversation?.agent]);

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'satisfied':
      case 'happy':
        return '😊';
      case 'frustrated':
      case 'angry':
        return '😤';
      case 'confused':
        return '😕';
      case 'excited':
        return '🤩';
      case 'neutral':
      default:
        return '😐';
    }
  };

  // Check if satisfaction data exists and is not empty
  const hasSatisfactionData = conversation?.satisfaction && conversation.satisfaction.trim() !== '';

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

  return (
    <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="p-3 space-y-3">
        {/* Current Agent Section */}
        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold mb-0.5 text-slate-900 dark:text-slate-100">Current Agent</h2>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
              Agent currently handling this conversation
            </p>
          </div>
          
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Agent Information</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 bg-blue-600">
                <AvatarFallback className="text-white text-[10px] font-medium">
                  {handoffData.currentAgent.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{handoffData.currentAgent}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  {handoffData.currentAgent === 'AI Assistant' ? 'Available 24/7' : 'Human Agent'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Information */}
        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold mb-0.5 text-slate-900 dark:text-slate-100">Customer Information</h2>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
              Details about the customer in this conversation
            </p>
          </div>
          
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Customer Details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-2 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-0.5 text-xs">Full Name</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">{conversation.customer || "Visitor"}</p>
              </div>
              
              {conversation.email && (
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-2 border border-slate-200/50 dark:border-slate-600/50">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-0.5 flex items-center gap-1.5 text-xs">
                    <Mail className="h-2.5 w-2.5" />
                    Email
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{conversation.email}</p>
                </div>
              )}
              
              {hasSatisfactionData && (
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-2 border border-slate-200/50 dark:border-slate-600/50">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-0.5 flex items-center gap-1.5 text-xs">
                    <Star className="h-2.5 w-2.5" />
                    Satisfaction
                  </h4>
                  <div>{getSatisfactionIndicator(conversation.satisfaction)}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Customer Sentiment - Only show if satisfaction data exists */}
        {hasSatisfactionData && (
          <section>
            <div className="mb-2">
              <h2 className="text-sm font-semibold mb-0.5 text-slate-900 dark:text-slate-100">Customer Sentiment</h2>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                Current customer satisfaction level
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Current Sentiment</h3>
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-md p-3 border border-slate-200/50 dark:border-slate-600/50 text-center">
                <div className="text-2xl mb-2">{getSentimentEmoji(conversation.satisfaction)}</div>
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {conversation.satisfaction}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Handoff History - Only show if there are handoffs */}
        {handoffData.handoffs.length > 0 && (
          <section>
            <div className="mb-2">
              <h2 className="text-sm font-semibold mb-0.5 text-slate-900 dark:text-slate-100">Agent Handoffs</h2>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                History of agent transfers for this conversation
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-md flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Handoff Timeline</h3>
                </div>
              </div>

              <HandoffHistory 
                handoffs={handoffData.handoffs}
                onHandoffClick={onHandoffClick}
              />
            </div>
          </section>
        )}

        {/* All Agents Section */}
        {handoffData.allAgents.length > 1 && (
          <section>
            <div className="mb-2">
              <h2 className="text-sm font-semibold mb-0.5 text-slate-900 dark:text-slate-100">All Agents</h2>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                Agents involved in this conversation
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
              <div className="flex flex-wrap gap-1">
                {handoffData.allAgents.map((agent, index) => (
                  <Badge 
                    key={index}
                    variant={agent === handoffData.currentAgent ? "default" : "outline"}
                    className="text-xs"
                  >
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

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
