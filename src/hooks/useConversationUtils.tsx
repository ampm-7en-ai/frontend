
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import React from 'react';

export const useConversationUtils = () => {
  const getStatusBadge = (status: string) => {
    // Map 'completed' from API to 'resolved' for UI
    const mappedStatus = status === 'completed' ? 'resolved' : status;
    
    switch (mappedStatus) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-500 text-[10px] hover:bg-green-200">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500">Closed</Badge>;
      case 'unresolved':
        return <Badge className="bg-red-100 text-red-500 text-[10px] hover:bg-red-200">Unresolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
      case 'delighted':
        return <div className="flex items-center text-green-600"><ThumbsUp className="h-4 w-4 mr-1" /> Delighted</div>;
      case 'satisfied':
        return <div className="flex items-center text-green-600"><ThumbsUp className="h-4 w-4 mr-1" /> Satisfied</div>;
      case 'neutral':
        return <div className="flex items-center text-amber-600"><CheckCircle className="h-4 w-4 mr-1" /> Neutral</div>;
      case 'dissatisfied':
        return <div className="flex items-center text-red-600"><ThumbsDown className="h-4 w-4 mr-1" /> Dissatisfied</div>;
      case 'frustrated':
        return <div className="flex items-center text-red-600"><ThumbsDown className="h-4 w-4 mr-1" /> Frustrated</div>;
      default:
        return null;
    }
  };

  return {
    getStatusBadge,
    getSatisfactionIndicator
  };
};
