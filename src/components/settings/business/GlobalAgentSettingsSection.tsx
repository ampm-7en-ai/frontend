
import React, { useState, useEffect } from 'react';
import { Edit, Save } from 'lucide-react';
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
      defaultModel: initialSettings?.response_model || 'GPT-4',
      maxContextLength: initialSettings?.token_length || 8000,
      defaultTemperature: initialSettings?.temperature || 0.7,
    },
    values: {
      defaultModel: initialSettings?.response_model || 'GPT-4',
      maxContextLength: initialSettings?.token_length || 8000,
      defaultTemperature: initialSettings?.temperature || 0.7,
    }
  });

  // Reset form when prop changes
  useEffect(() => {
    if (initialSettings) {
      globalSettingsForm.reset({
        defaultModel: initialSettings?.response_model || 'GPT-4',
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
          defaultModel: res.data.global_agent_settings.response_model || "GPT-4",
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
    <section>
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        <span>Global Agent Settings</span>
        {!isEditingGlobalSettings ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditingGlobalSettings(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditingGlobalSettings(false)}
            className="flex items-center gap-1"
          >
            Cancel
          </Button>
        )}
      </h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
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
                        defaultValue='gpt4'
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="defaultModel">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="gpt4">GPT-4 (OpenAI)</SelectItem>
                              <SelectItem value="gpt35">GPT-3.5 Turbo (OpenAI)</SelectItem>
                              <SelectItem value="claude">Claude 3 (Anthropic)</SelectItem>
                              <SelectItem value="gemini">Gemini Pro (Google)</SelectItem>
                              <SelectItem value="mistral">Mistral Large (Mistral AI)</SelectItem>
                              <SelectItem value="llama">Llama 2 (Meta AI)</SelectItem>
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
                        <SelectTrigger id="maxContext">
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
                            id="defaultTemp"
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            {...field}
                          />
                        </FormControl>
                        <span className="text-sm text-muted-foreground">
                          Lower values produce more deterministic responses, higher values produce more creative ones.
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="flex items-center gap-1">
                    <Save className="h-4 w-4" /> Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              <div>
                <h3 className="font-medium">Default Response Model</h3>
                <p className="text-muted-foreground">{globalSettingsForm.getValues().defaultModel}</p>
              </div>
              <div>
                <h3 className="font-medium">Maximum Context Length</h3>
                <p className="text-muted-foreground">{globalSettingsForm.getValues().maxContextLength?.toLocaleString()} tokens</p>
              </div>
              <div>
                <h3 className="font-medium">Default Temperature</h3>
                <p className="text-muted-foreground">{globalSettingsForm.getValues().defaultTemperature}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default GlobalAgentSettingsSection;
