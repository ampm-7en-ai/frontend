
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MessageSquare, User, Star, TrendingUp, Phone, Mail, MapPin, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import HandoffHistory from './HandoffHistory';
import GlobalAgentDisplay from '@/components/shared/GlobalAgentDisplay';
import { useSettings } from '@/hooks/useSettings';

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
  const { data: settings } = useSettings();

  if (!conversation) {
    return (
      <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">No conversation selected</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Select a conversation to view details</p>
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
      <div className="p-6 space-y-6">
        {/* Global Agent Settings */}
        <GlobalAgentDisplay 
          settings={settings?.global_agent_settings}
          compact={true}
        />

        {/* Current Agent Section */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">Current Agent</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-blue-600">
                <AvatarFallback className="text-white text-xs font-medium">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">AI Assistant</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">Customer Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Full Name</span>
                <span className="text-sm text-gray-900 dark:text-slate-100 font-medium">{conversation.customer || "Visitor"}</span>
              </div>
              
              {conversation.email && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </span>
                  <span className="text-sm text-gray-900 dark:text-slate-100">{conversation.email}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-slate-300 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Satisfaction
                </span>
                <div>{getSatisfactionIndicator(conversation.satisfaction)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Context */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">Customer Context</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Account Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <User className="h-3 w-3" />
                Account Status
              </div>
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs font-medium px-2 py-1">
                Premium Account
              </Badge>
            </div>

            {/* Previous Interactions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <Clock className="h-3 w-3" />
                Previous Interactions
              </div>
              <div className="text-sm text-gray-900 dark:text-slate-100">3 conversations this month</div>
            </div>

            {/* Detected Topics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <Tag className="h-3 w-3" />
                Detected Topics
              </div>
              <div className="flex flex-wrap gap-1">
                {conversation.topic?.slice(0, 3).map((topic: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                  >
                    {topic}
                  </Badge>
                )) || (
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                  >
                    General Inquiry
                  </Badge>
                )}
              </div>
            </div>

            {/* Customer Sentiment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                <TrendingUp className="h-3 w-3" />
                Customer Sentiment
              </div>
              <div className="flex gap-1">
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs px-2 py-1">
                  Frustrated
                </Badge>
                <Badge className="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border-gray-200 dark:border-slate-600 text-xs px-2 py-1">
                  Neutral
                </Badge>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 text-xs px-2 py-1">
                  Satisfied
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handoff History */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">Agent Handoffs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <HandoffHistory 
              handoffs={mockHandoffs}
              onHandoffClick={onHandoffClick}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg p-4 border border-blue-200/60 dark:border-blue-800/60">
              <div className="flex items-center justify-center">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  Create Support Ticket
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationDetailsPanel;
