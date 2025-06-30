
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
  if (!conversation) {
    return (
      <div className="h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">No conversation selected</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Select a conversation to view details</p>
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
    <div className="h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Current Agent Section */}
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">Current Agent</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Agent currently handling this conversation
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Agent Information</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-blue-600">
                <AvatarFallback className="text-white text-xs font-medium">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Assistant</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Available 24/7</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Information */}
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">Customer Information</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Details about the customer in this conversation
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-sm">Full Name</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">{conversation.customer || "Visitor"}</p>
              </div>
              
              {conversation.email && (
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    Email
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{conversation.email}</p>
                </div>
              )}
              
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 text-sm">
                  <Star className="h-3 w-3" />
                  Satisfaction
                </h4>
                <div>{getSatisfactionIndicator(conversation.satisfaction)}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Context */}
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">Customer Context</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Additional context and insights about this customer
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Context & Insights</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Account Status */}
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 text-sm">
                  <User className="h-3 w-3" />
                  Account Status
                </h4>
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs font-medium px-2 py-0.5">
                  Premium Account
                </Badge>
              </div>

              {/* Previous Interactions */}
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  Previous Interactions
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">3 conversations this month</p>
              </div>

              {/* Detected Topics */}
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 text-sm">
                  <Tag className="h-3 w-3" />
                  Detected Topics
                </h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {conversation.topic?.slice(0, 3).map((topic: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                    >
                      {topic}
                    </Badge>
                  )) || (
                    <Badge 
                      variant="outline" 
                      className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                    >
                      General Inquiry
                    </Badge>
                  )}
                </div>
              </div>

              {/* Customer Sentiment */}
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3" />
                  Customer Sentiment
                </h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] px-1.5 py-0.5">
                    Frustrated
                  </Badge>
                  <Badge className="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border-gray-200 dark:border-slate-600 text-[10px] px-1.5 py-0.5">
                    Neutral
                  </Badge>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0.5">
                    Satisfied
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Handoff History */}
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">Agent Handoffs</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              History of agent transfers for this conversation
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Handoff Timeline</h3>
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
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">Quick Actions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Available actions for this conversation
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Available Actions</h3>
              </div>
            </div>

            <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg p-3 border border-blue-200/60 dark:border-blue-800/60">
              <div className="flex items-center justify-center">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
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
