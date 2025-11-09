
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/utils/api-config';
import { apiGet, apiPut } from '@/utils/api-interceptor';

interface EmailTemplate {
  id: number;
  template_type: string;
  name: string;
  subject: string;
  content: string;
  is_html: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  allowed_placeholders: string[];
}

interface EmailTemplateType {
  type: string;
  name: string;
  placeholders: string[];
}

interface UpdateEmailTemplatePayload {
  name: string;
  subject: string;
  content: string;
  is_html: boolean;
  is_active: boolean;
  format?: string;
}

// Fetch all email template types
export const useEmailTemplateTypes = () => {
  return useQuery({
    queryKey: ['emailTemplateTypes'],
    queryFn: async (): Promise<EmailTemplateType[]> => {
      const response = await apiGet(getApiUrl('admin/email-templates/'));

      if (!response.ok) {
        throw new Error('Failed to fetch email template types');
      }

      const result = await response.json();
      return result.data;
    },
  });
};

// Fetch specific email template by type
export const useEmailTemplate = (templateType: string | null) => {
  return useQuery({
    queryKey: ['emailTemplate', templateType],
    queryFn: async (): Promise<EmailTemplate> => {
      if (!templateType) throw new Error('Template type is required');
      
      const response = await apiGet(getApiUrl(`admin/email-templates/${templateType}/`));

      if (!response.ok) {
        throw new Error('Failed to fetch email template');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!templateType,
  });
};

// Update email template
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateType, payload }: { templateType: string; payload: UpdateEmailTemplatePayload }) => {
      const response = await apiPut(getApiUrl(`admin/email-templates/${templateType}/`), payload);

      if (!response.ok) {
        throw new Error('Failed to update email template');
      }

      return response.json();
    },
    onSuccess: (_, { templateType }) => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplate', templateType] });
      queryClient.invalidateQueries({ queryKey: ['emailTemplateTypes'] });
    },
  });
};
