
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ConversationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const ConversationFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus 
}: ConversationFiltersProps) => {
  return (
    <div className="p-3 border-b">
      <div className="relative">
        <Input 
          placeholder="Search..." 
          className="pl-9 h-9" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex mt-2 gap-1">
        <Button 
          variant={filterStatus === 'all' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterStatus('all')}
          className="flex-1 h-8"
        >
          All
        </Button>
        <Button 
          variant={filterStatus === 'active' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterStatus('active')}
          className="flex-1 h-8"
        >
          Active
        </Button>
        <Button 
          variant={filterStatus === 'pending' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterStatus('pending')}
          className="flex-1 h-8"
        >
          Pending
        </Button>
      </div>
    </div>
  );
};

export default ConversationFilters;
