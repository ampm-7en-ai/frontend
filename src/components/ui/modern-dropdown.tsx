
import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ModernDropdownOption {
  value: string;
  label: string;
  description?: string;
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
}

export const ModernDropdown = ({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select option...",
  className,
  disabled = false,
  trigger,
  renderOption
}: ModernDropdownProps) => {
  const selectedOption = options.find(option => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-normal text-gray-900 dark:text-gray-100 px-3 py-2 h-10",
              className
            )}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 font-normal text-gray-900 dark:text-gray-100 cursor-pointer px-3 py-2 rounded-lg mx-1 my-0.5"
            asChild={!!renderOption}
          >
            {renderOption ? (
              renderOption(option)
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  )}
                </div>
                {option.value === value && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
