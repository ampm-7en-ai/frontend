
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
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
        return <Badge variant="outline" className="border-red-500 text-red-500"><AlertCircle className="h-3 w-3 mr-1" /> High</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="h-3 w-3 mr-1" /> Normal</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500"><ThumbsUp className="h-3 w-3 mr-1" /> Low</Badge>;
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
