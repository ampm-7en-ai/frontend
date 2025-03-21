
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Flag, Zap, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import React from 'react';

export const useConversationUtils = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="h-4 w-4 text-amber-500" aria-label="High Priority" />;
      case 'normal':
        return <Star className="h-4 w-4 text-blue-400" aria-label="Normal Priority" />;
      case 'low':
        return <Flag className="h-4 w-4 text-gray-400" aria-label="Low Priority" />;
      default:
        return null;
    }
  };

  const getSatisfactionIndicator = (satisfaction: string) => {
    switch (satisfaction) {
      case 'high':
        return <div className="flex items-center text-green-600"><ThumbsUp className="h-4 w-4 mr-1" /> High</div>;
      case 'medium':
        return <div className="flex items-center text-amber-600"><CheckCircle className="h-4 w-4 mr-1" /> Medium</div>;
      case 'low':
        return <div className="flex items-center text-red-600"><ThumbsDown className="h-4 w-4 mr-1" /> Low</div>;
      default:
        return null;
    }
  };

  return {
    getStatusBadge,
    getPriorityIndicator,
    getSatisfactionIndicator
  };
};
