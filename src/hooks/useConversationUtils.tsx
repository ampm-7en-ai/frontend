
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import React from 'react';

export const useConversationUtils = () => {
  const getStatusBadge = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();
    
    // Map 'completed' from API to 'resolved' for UI
    const mappedStatus = normalizedStatus === 'completed' ? 'resolved' : normalizedStatus;
    
    switch (mappedStatus) {
      case 'active':
        return <Badge className="!text-[14px] bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="!text-[14px] bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">Pending</Badge>;
      case 'resolved':
        return <Badge className="!text-[14px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="!text-[14px] bg-gray-500">Closed</Badge>;
      case 'unresolved':
        return <Badge className="!text-[14px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">Unresolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSatisfactionIndicator = (satisfaction: string) => {
    // Normalize satisfaction to lowercase for comparison
    const normalizedSatisfaction = satisfaction.toLowerCase();
    
    switch (normalizedSatisfaction) {
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

  // Utility function to normalize status for consistent handling
  const normalizeStatus = (status: string) => {
    const normalized = status.toLowerCase();
    return normalized === 'completed' ? 'resolved' : normalized;
  };

  return {
    getStatusBadge,
    getSatisfactionIndicator,
    normalizeStatus
  };
};
