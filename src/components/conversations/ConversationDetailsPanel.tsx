
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MessageSquare, User, Star, TrendingUp, Phone, Mail, MapPin, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import HandoffHistory from './HandoffHistory';

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

  // Mock handoff data - in a real app this would come from the conversation data
  const mockHandoffs = [
    {
      id: '1',
      from: 'AI Assistant',
      to: 'Sarah Johnson',
      timestamp: '2:30 PM',
      reason: 'Customer requested human agent'
    },
    {
      id: '2', 
      from: 'Sarah Johnson',
      to: 'Mike Chen',
      timestamp: '3:15 PM',
      reason: 'Technical expertise needed'
    }
  ];

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
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100">AI Assistant</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Available 24/7</p>
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

        {/* Handoff History */}
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
              handoffs={mockHandoffs}
              onHandoffClick={onHandoffClick}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold mb-0.5 text-slate-900 dark:text-slate-100">Quick Actions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
              Available actions for this conversation
            </p>
          </div>
          
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-md flex items-center justify-center">
                  <Phone className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Available Actions</h3>
              </div>
            </div>

            <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-md p-2 border border-blue-200/60 dark:border-blue-800/60">
              <div className="flex items-center justify-center">
                <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  Create Support Ticket
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConversationDetailsPanel;
