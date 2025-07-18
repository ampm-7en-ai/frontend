import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Settings2, 
  Thermometer, 
  Hash, 
  FileText,
  Eye
} from 'lucide-react';

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
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Historical Configuration</span>
        {cellId && (
          <Badge variant="secondary" className="text-xs ml-auto">
            {cellId}
          </Badge>
        )}
      </div>

      {/* Model */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium text-foreground">Model</Label>
          </div>
          <Badge variant="default" className="text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              {config?.model || 'No model selected'}
            </div>
          </Badge>
        </CardContent>
      </Card>

      {/* Temperature */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium text-foreground">Temperature</Label>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {(config?.temperature || 0.7).toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            {config?.temperature === 0 ? 'Deterministic' : 
             config?.temperature && config.temperature <= 0.3 ? 'Conservative' :
             config?.temperature && config.temperature <= 0.7 ? 'Balanced' : 'Creative'}
          </div>
        </CardContent>
      </Card>

      {/* Token Length */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium text-foreground">Max Token Length</Label>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {config?.maxLength || 8000}
          </div>
          <div className="text-xs text-muted-foreground">
            tokens maximum response length
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium text-foreground">System Prompt</Label>
          </div>
          <div className="text-sm text-foreground bg-background/50 rounded-md p-3 border max-h-32 overflow-y-auto">
            {config?.systemPrompt || 'No system prompt configured'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};