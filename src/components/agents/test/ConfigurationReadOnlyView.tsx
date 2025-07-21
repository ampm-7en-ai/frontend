
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Settings2, 
  Thermometer, 
  Hash, 
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ConfigurationReadOnlyViewProps {
  config: {
    model?: string;
    temperature?: number;
    maxLength?: number;
    systemPrompt?: string;
  };
  cellId?: string | null;
}

export const ConfigurationReadOnlyView = ({
  config,
  cellId
}: ConfigurationReadOnlyViewProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} has been copied to your clipboard.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      

      {/* Model Configuration */}
      <div className="space-y-2 border-b border-border pb-2">
        <div className="flex items-center gap-3 mb-0 pb-0">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Model</h3>
            <p className="text-xs text-muted-foreground">AI model used for this query</p>
          </div>
        </div>
        
        <div className="px-0">
          <Badge variant="default" className="text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              {config?.model || 'No model selected'}
            </div>
          </Badge>
        </div>
      </div>

      {/* Temperature */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Thermometer className="h-4 w-4 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Temperature</h3>
            <p className="text-xs text-muted-foreground">Response creativity level</p>
          </div>
          <span className="text-sm font-medium text-foreground">
            {(config?.temperature || 0.7).toFixed(1)}
          </span>
        </div>
        
      </div>

      {/* Token Length */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Hash className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Max Token Length</h3>
            <p className="text-xs text-muted-foreground">Maximum response length</p>
          </div>
          <span className="text-sm font-medium text-foreground">
            {config?.maxLength || 8000}
          </span>
        </div>
      </div>

      {/* System Prompt */}
      <div className="space-y-4">
        <div className="flex gap-3 pb-2 border-none flex-col">
          <div className="flex gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
            <FileText className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">System Prompt</h3>
              <p className="text-xs text-muted-foreground">Agent behavior instructions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleCopy(config?.systemPrompt || '', 'System Prompt')}
            >
              {copiedField === 'System Prompt' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="px-0">
          <div className="text-sm text-foreground bg-muted/30 rounded-md p-3 border max-h-80 overflow-y-auto">
            {config?.systemPrompt || 'No system prompt configured'}
          </div>
        </div>
        </div>
        
        
      </div>
    </div>
  );
};
