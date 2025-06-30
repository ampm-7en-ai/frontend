
import React, { useState, useEffect } from 'react';
import { Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";
import { updateSettings } from "@/utils/api-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import ModernButton from '@/components/dashboard/ModernButton';
import GlobalAgentDisplay from '@/components/shared/GlobalAgentDisplay';

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
      
      <div className="flex items-center justify-end mb-6">
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
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
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
                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                        <SelectItem value="mistral-large-latest">Mistral Large (Mistral AI)</SelectItem>
                        <SelectItem value="mistral-medium-latest">Mistral Medium (Mistral AI)</SelectItem>
                        <SelectItem value="mistral-small-latest">Mistral Small (Mistral AI)</SelectItem>
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
                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl">
                        <SelectValue placeholder="Select context length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4000">4,000 tokens</SelectItem>
                        <SelectItem value="8000">8,000 tokens</SelectItem>
                        <SelectItem value="16000">16,000 tokens</SelectItem>
                        <SelectItem value="32000">32,000 tokens</SelectItem>
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
        </div>
      ) : (
        <GlobalAgentDisplay 
          settings={{
            response_model: globalSettingsForm.getValues().defaultModel,
            token_length: globalSettingsForm.getValues().maxContextLength,
            temperature: globalSettingsForm.getValues().defaultTemperature
          }}
        />
      )}
    </section>
  );
};

export default GlobalAgentSettingsSection;
