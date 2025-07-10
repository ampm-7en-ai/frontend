
import React, { useState, useEffect } from 'react';
import { Edit, Save, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger variant="modern" className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent variant="modern">
                        <SelectItem value="gpt-4o" variant="modern">GPT-4o (OpenAI)</SelectItem>
                        <SelectItem value="gpt-4-turbo" variant="modern">GPT-4 Turbo (OpenAI)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo" variant="modern">GPT-3.5 Turbo (OpenAI)</SelectItem>
                        <SelectItem value="mistral-large-latest" variant="modern">Mistral Large (Mistral AI)</SelectItem>
                        <SelectItem value="mistral-medium-latest" variant="modern">Mistral Medium (Mistral AI)</SelectItem>
                        <SelectItem value="mistral-small-latest" variant="modern">Mistral Small (Mistral AI)</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger variant="modern" className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl">
                        <SelectValue placeholder="Select context length" />
                      </SelectTrigger>
                      <SelectContent variant="modern">
                        <SelectItem value="4000" variant="modern">4,000 tokens</SelectItem>
                        <SelectItem value="8000" variant="modern">8,000 tokens</SelectItem>
                        <SelectItem value="16000" variant="modern">16,000 tokens</SelectItem>
                        <SelectItem value="32000" variant="modern">32,000 tokens</SelectItem>
                      </SelectContent>
                    </Select>
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
                          className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl"
                        />
                      </FormControl>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Lower values produce more deterministic responses, higher values produce more creative ones.
                      </span>
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
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Default Response Model</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  {globalSettingsForm.getValues().defaultModel === 'gpt-4o' ? 'GPT-4o (OpenAI)' :
                   globalSettingsForm.getValues().defaultModel === 'gpt-4-turbo' ? 'GPT-4 Turbo (OpenAI)' :
                   globalSettingsForm.getValues().defaultModel === 'gpt-3.5-turbo' ? 'GPT-3.5 Turbo (OpenAI)' :
                   globalSettingsForm.getValues().defaultModel === 'mistral-large-latest' ? 'Mistral Large (Mistral AI)' :
                   globalSettingsForm.getValues().defaultModel === 'mistral-medium-latest' ? 'Mistral Medium (Mistral AI)' :
                   globalSettingsForm.getValues().defaultModel === 'mistral-small-latest' ? 'Mistral Small (Mistral AI)' :
                   globalSettingsForm.getValues().defaultModel}
                </p>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Maximum Context Length</h4>
                <p className="text-slate-600 dark:text-slate-400">{globalSettingsForm.getValues().maxContextLength?.toLocaleString()} tokens</p>
              </div>
              <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Default Temperature</h4>
                <p className="text-slate-600 dark:text-slate-400">{globalSettingsForm.getValues().defaultTemperature}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalAgentSettingsSection;
