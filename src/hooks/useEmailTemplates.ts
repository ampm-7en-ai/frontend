
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken, getApiUrl } from '@/utils/api-config';

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
}

// Fetch all email template types
export const useEmailTemplateTypes = () => {
  return useQuery({
    queryKey: ['emailTemplateTypes'],
    queryFn: async (): Promise<EmailTemplateType[]> => {
      const token = getAccessToken();
      if (!token) throw new Error('No access token');

      const response = await fetch(getApiUrl('admin/email-templates/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
      
      const token = getAccessToken();
      if (!token) throw new Error('No access token');

      const response = await fetch(getApiUrl(`admin/email-templates/${templateType}/`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
      const token = getAccessToken();
      if (!token) throw new Error('No access token');

      const response = await fetch(getApiUrl(`admin/email-templates/${templateType}/`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

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
