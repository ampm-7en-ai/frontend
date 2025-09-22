import React, { useState, useEffect } from 'react';
import { Edit, Pen, Save, Settings } from 'lucide-react';
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
import { useAIModels } from '@/hooks/useAIModels';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/icons';

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

const GlobalAgentSettingsSection = ({ initialSettings }: GlobalAgentSettingsProps) => {
  const [isEditingGlobalSettings, setIsEditingGlobalSettings] = useState(false);
  const { modelOptionsForDropdown, isLoading: isLoadingModels } = useAIModels();

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
          defaultModel: res.data.global_agent_settings.response_model || "gpt-4-turbo",
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
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Configure default settings that will apply to all your AI agents
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
              <Icon type='plain' name={`Magic`} color='hsl(var(--primary))' className='h-5 w-5' />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agent Configuration</h3>
          </div>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={() => setIsEditingGlobalSettings(!isEditingGlobalSettings)}
            icon={isEditingGlobalSettings ? undefined : Pen}
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
                      {isLoadingModels ? (
                        <div className="flex items-center gap-2 p-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-gray-500">Loading models...</span>
                        </div>
                      ) : (
                        <ModernDropdown
                          value={field.value}
                          onValueChange={field.onChange}
                          options={modelOptionsForDropdown}
                          placeholder="Select model"
                          className="bg-white/80 border-slate-200 rounded-xl"
                        />
                      )}
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
                    <FormLabel>Maximum Context Length</FormLabel>
                    {/* <FormControl>
                      <ModernDropdown
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                        options={[
                          { value: "4000", label: "4,000 tokens" },
                          { value: "8000", label: "8,000 tokens" },
                          { value: "16000", label: "16,000 tokens" },
                          { value: "32000", label: "32,000 tokens" }
                        ]}
                        placeholder="Select context length"
                        className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl"
                      />
                    </FormControl> */}
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
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input 
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          {...field}
                          variant='modern'
                          className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <ModernButton type="submit" variant="primary" icon={Save}>
                  Save Settings
                </ModernButton>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-neutral-200/50 dark:border-neutral-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Default Response Model</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {modelOptionsForDropdown.find(option => option.value === globalSettingsForm.getValues().defaultModel)?.label || globalSettingsForm.getValues().defaultModel}
                </p>
              </div>
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-neutral-200/50 dark:border-neutral-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Default Temperature</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">{globalSettingsForm.getValues().defaultTemperature}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalAgentSettingsSection;
