
import React, { useState, useEffect } from 'react';
import { Edit, Save, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { toast } from "@/hooks/use-toast";
import { updateSettings } from "@/utils/api-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import ModernButton from '@/components/dashboard/ModernButton';

interface GlobalAgentSettingsProps {
  initialSettings?: {
    response_model: string;
    token_length: number;
    temperature: number;
  };
}

const globalSettingsSchema = z.object({
  defaultModel: z.string().min(2, "Select a model"),
  maxContextLength: z.coerce.number().int().min(4000, "Must be >= 4000"),
  defaultTemperature: z.coerce.number().min(0, "Must be >= 0").max(1, "Must be <= 1"),
});
type GlobalSettingsFormValues = z.infer<typeof globalSettingsSchema>;

const modelOptions = [
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
];

const GlobalAgentSettingsSection = ({ initialSettings }: GlobalAgentSettingsProps) => {
  const [isEditingGlobalSettings, setIsEditingGlobalSettings] = useState(false);

  const globalSettingsForm = useForm<GlobalSettingsFormValues>({
    resolver: zodResolver(globalSettingsSchema),
    defaultValues: {
      defaultModel: initialSettings?.response_model || 'gpt-4-turbo',
      maxContextLength: initialSettings?.token_length || 8000,
      defaultTemperature: initialSettings?.temperature || 0.7,
    },
  });

  // Reset form when prop changes
  useEffect(() => {
    if (initialSettings) {
      console.log('Global settings updated:', initialSettings);
      globalSettingsForm.reset({
        defaultModel: initialSettings?.response_model || 'gpt-4-turbo',
        maxContextLength: initialSettings?.token_length || 8000,
        defaultTemperature: initialSettings?.temperature || 0.7,
      });
    }
  }, [initialSettings]);

  const onGlobalSettingsSubmit = async (data: GlobalSettingsFormValues) => {
    try {
      const payload = {
        global_agent_settings: {
          response_model: data.defaultModel,
          token_length: data.maxContextLength,
          temperature: data.defaultTemperature,
        },
      };

      const res = await updateSettings(payload);
      toast({
        title: "Global settings updated",
        description: res.message || "Your global agent settings have been updated successfully.",
      });

      // Update form values with response data if present
      if (res.data && res.data.global_agent_settings) {
        globalSettingsForm.reset({
          defaultModel: "gpt-4-turbo",
          maxContextLength: res.data.global_agent_settings.token_length || 8000,
          defaultTemperature: res.data.global_agent_settings.temperature ?? 0.7,
        });
      }

      setIsEditingGlobalSettings(false);
    } catch (error: any) {
      toast({
        title: "Error updating global agent settings",
        description: error?.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Global Agent Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Configure default settings that will apply to all your AI agents
        </p>
      </div>
      
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agent Configuration</h3>
          </div>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={() => setIsEditingGlobalSettings(!isEditingGlobalSettings)}
            icon={isEditingGlobalSettings ? undefined : Edit}
          >
            {isEditingGlobalSettings ? 'Cancel' : 'Edit'}
          </ModernButton>
        </div>

        {isEditingGlobalSettings ? (
          <Form {...globalSettingsForm}>
            <form onSubmit={globalSettingsForm.handleSubmit(onGlobalSettingsSubmit)} className="space-y-4">
              <FormField
                control={globalSettingsForm.control}
                name="defaultModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Response Model</FormLabel>
                    <FormControl>
                      <ModernDropdown
                        value={field.value}
                        onValueChange={field.onChange}
                        options={modelOptions}
                        placeholder="Select model"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={globalSettingsForm.control}
                name="maxContextLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Context Length (tokens)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={globalSettingsForm.control}
                name="defaultTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Temperature</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="0.7"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <ModernButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingGlobalSettings(false)}
                >
                  Cancel
                </ModernButton>
                <ModernButton type="submit" icon={Save}>
                  Save Settings
                </ModernButton>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Default Model</Label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {globalSettingsForm.getValues('defaultModel') || 'Not set'}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Max Context Length</Label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {globalSettingsForm.getValues('maxContextLength')} tokens
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Default Temperature</Label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {globalSettingsForm.getValues('defaultTemperature')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalAgentSettingsSection;
