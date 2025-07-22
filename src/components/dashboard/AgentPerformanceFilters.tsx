
import React from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface AgentFilters {
  search: string;
  performanceLevel: string;
  volumeLevel: string;
  responseTimeLevel: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  perPage: number;
  showFilters: boolean;
}

interface AgentPerformanceFiltersProps {
  filters: AgentFilters;
  onFiltersChange: (filters: Partial<AgentFilters>) => void;
  totalAgents: number;
  filteredCount: number;
  onReset: () => void;
}

const AgentPerformanceFilters: React.FC<AgentPerformanceFiltersProps> = ({
  filters,
  onFiltersChange,
  totalAgents,
  filteredCount,
  onReset,
}) => {
  const hasActiveFilters = filters.search || 
    filters.performanceLevel !== 'all' || 
    filters.volumeLevel !== 'all' || 
    filters.responseTimeLevel !== 'all';

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.performanceLevel !== 'all') count++;
    if (filters.volumeLevel !== 'all') count++;
    if (filters.responseTimeLevel !== 'all') count++;
    return count;
  };

  return (
    <Card className="p-4 mb-4 bg-white dark:bg-gray-800/50 border-0 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Collapsible 
            open={filters.showFilters} 
            onOpenChange={(open) => onFiltersChange({ showFilters: open })}
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredCount} of {totalAgents} agents
        </div>
      </div>

      <Collapsible 
        open={filters.showFilters} 
        onOpenChange={(open) => onFiltersChange({ showFilters: open })}
      >
        <CollapsibleContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search agents..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10 rounded-xl border-slate-200 dark:border-slate-600"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Performance Level */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Performance Level
              </label>
              <Select
                value={filters.performanceLevel}
                onValueChange={(value) => onFiltersChange({ performanceLevel: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High (&gt;80% efficiency)</SelectItem>
                  <SelectItem value="medium">Medium (50-80%)</SelectItem>
                  <SelectItem value="low">Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Volume Level */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Conversation Volume
              </label>
              <Select
                value={filters.volumeLevel}
                onValueChange={(value) => onFiltersChange({ volumeLevel: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volumes</SelectItem>
                  <SelectItem value="high">High Volume</SelectItem>
                  <SelectItem value="medium">Medium Volume</SelectItem>
                  <SelectItem value="low">Low Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Response Time Level */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Response Time
              </label>
              <Select
                value={filters.responseTimeLevel}
                onValueChange={(value) => onFiltersChange({ responseTimeLevel: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Response Times</SelectItem>
                  <SelectItem value="fast">Fast (&lt;30s)</SelectItem>
                  <SelectItem value="medium">Medium (30s-2min)</SelectItem>
                  <SelectItem value="slow">Slow (&gt;2min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort & Per Page */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Show Per Page
              </label>
              <Select
                value={filters.perPage.toString()}
                onValueChange={(value) => onFiltersChange({ perPage: parseInt(value) })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 agents</SelectItem>
                  <SelectItem value="15">15 agents</SelectItem>
                  <SelectItem value="20">20 agents</SelectItem>
                  <SelectItem value="50">50 agents</SelectItem>
                  <SelectItem value="999">All agents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">Quick filters:</span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => onFiltersChange({ 
                performanceLevel: 'high', 
                volumeLevel: 'all', 
                responseTimeLevel: 'all' 
              })}
            >
              Top Performers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => onFiltersChange({ 
                performanceLevel: 'low', 
                volumeLevel: 'all', 
                responseTimeLevel: 'slow' 
              })}
            >
              Needs Attention
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => onFiltersChange({ 
                performanceLevel: 'all', 
                volumeLevel: 'high', 
                responseTimeLevel: 'all' 
              })}
            >
              High Volume
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AgentPerformanceFilters;
