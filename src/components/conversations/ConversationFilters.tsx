import React, { FC, Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ConversationFiltersProps {
  filterStatus: string;
  setFilterStatus: Dispatch<SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  dateRange: any;
  setDateRange: Dispatch<SetStateAction<any>>;
  channelFilter: string;
  setChannelFilter: Dispatch<SetStateAction<string>>;
  agentTypeFilter: string;
  setAgentTypeFilter: Dispatch<SetStateAction<string>>;
}

const ConversationFilters: FC<ConversationFiltersProps> = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  channelFilter,
  setChannelFilter,
  agentTypeFilter,
  setAgentTypeFilter
}) => {
  const handleClearFilters = () => {
    setFilterStatus('all');
    setSearchQuery('');
    setDateRange({ from: undefined, to: undefined });
    setChannelFilter('all');
    setAgentTypeFilter('all');
  };

  const hasActiveFilters = 
    filterStatus !== 'all' || 
    searchQuery !== '' || 
    dateRange.from !== undefined || 
    channelFilter !== 'all' || 
    agentTypeFilter !== 'all';

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-primary w-2 h-2" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Narrow down conversations by specific criteria
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={filterStatus} 
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="col-span-2 h-8">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="channel">Channel</Label>
                  <Select 
                    value={channelFilter} 
                    onValueChange={setChannelFilter}
                  >
                    <SelectTrigger className="col-span-2 h-8">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="widget">Widget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select 
                    value={agentTypeFilter} 
                    onValueChange={setAgentTypeFilter}
                  >
                    <SelectTrigger className="col-span-2 h-8">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="customer-support">Customer Support</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "col-span-2 h-8 justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filterStatus !== 'all' && (
            <Badge variant="outline" onDelete={() => setFilterStatus('all')}>
              Status: {filterStatus}
            </Badge>
          )}
          
          {channelFilter !== 'all' && (
            <Badge variant="outline" onDelete={() => setChannelFilter('all')}>
              Channel: {channelFilter}
            </Badge>
          )}
          
          {agentTypeFilter !== 'all' && (
            <Badge variant="outline" onDelete={() => setAgentTypeFilter('all')}>
              Agent Type: {agentTypeFilter}
            </Badge>
          )}
          
          {dateRange.from && (
            <Badge 
              variant="outline" 
              onDelete={() => setDateRange({ from: undefined, to: undefined })}
            >
              Date: {format(dateRange.from, "MMM d")}
              {dateRange.to && ` - ${format(dateRange.to, "MMM d")}`}
            </Badge>
          )}
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Missing Badge component
const Badge = ({ 
  children, 
  variant = 'default', 
  onDelete 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'outline'; 
  onDelete?: () => void;
}) => {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === 'default' 
        ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" 
        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
    )}>
      {children}
      {onDelete && (
        <button
          type="button"
          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={onDelete}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </div>
  );
};

export default ConversationFilters;
