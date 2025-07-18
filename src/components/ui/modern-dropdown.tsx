
import React, { useState, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModernDropdownOption {
  value: string;
  label: string;
  description?: string;
  logo?: string;
}

interface ModernDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ModernDropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  trigger?: React.ReactNode;
  renderOption?: (option: ModernDropdownOption) => React.ReactNode;
  align?: 'start' | 'center' | 'end';
  searchable?: boolean;
  searchPlaceholder?: string;
  maxHeight?: string;
  showSearch?: boolean;
}

export const ModernDropdown = ({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select option...",
  className,
  disabled = false,
  trigger,
  renderOption,
  align = 'start',
  searchable = false,
  searchPlaceholder = "Search...",
  maxHeight = "300px",
  showSearch = true
}: ModernDropdownProps) => {
  const selectedOption = options.find(option => option.value === value);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim() || !showSearch) {
      return options;
    }

    const query = searchQuery.toLowerCase().trim();
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      option.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable, showSearch]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-normal text-gray-900 hover:text-gray-950 dark:text-gray-100 px-3 py-2 h-10",
              className
            )}
          >
            <span className="truncate flex items-center gap-2">
              {selectedOption?.logo && (
                <img 
                  src={selectedOption.logo} 
                  alt={`${selectedOption.label} flag`}
                  className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={cn(
          "w-full min-w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[9999] pb-3",
          (searchable && showSearch) && "p-0"
        )}
        sideOffset={4}
        align={align}
      >
        {searchable && showSearch && (
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
        
        <div 
          className={cn(
            (searchable && showSearch) ? "p-1" : "",
            "w-full",
            // Only show scrollbar when showSearch is true
            showSearch && "[&::-webkit-scrollbar]:w-2",
            showSearch && "[&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:dark:bg-gray-800",
            showSearch && "[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600",
            showSearch && "[&::-webkit-scrollbar-thumb]:rounded-full",
            showSearch && "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400 [&::-webkit-scrollbar-thumb:hover]:dark:bg-gray-500"
          )}
          style={{ 
            maxHeight: showSearch ? maxHeight : "auto",
            overflowY: showSearch ? "auto" : "visible"
          }}
        >
          <div className="space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 font-normal text-gray-900 dark:text-gray-100 cursor-pointer px-3 py-2 rounded-lg mx-1 my-0.5 focus:bg-gray-100 dark:focus:bg-gray-700"
                  asChild={!!renderOption}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {option.logo && (
                          <img 
                            src={option.logo} 
                            alt={`${option.label} logo`}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.description && showSearch && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {option.value === value && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              searchable && searchQuery && showSearch && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No results found
                </div>
              )
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
