
import React from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ModernButton from '@/components/dashboard/ModernButton';
import { Brain, FileText } from 'lucide-react';
import { Icon } from '@/components/icons';

interface SystemPromptModalProps {
  value: string;
  onChange: (value: string) => void;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isTemplate?: boolean;
  onUseTemplate?: () => void;
}

export const SystemPromptModal = ({ 
  value, 
  onChange, 
  trigger, 
  open, 
  onOpenChange,
  isTemplate = false,
  onUseTemplate,
}: SystemPromptModalProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);

  const modalOpen = open !== undefined ? open : isOpen;
  const setModalOpen = onOpenChange || setIsOpen;

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(localValue);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setModalOpen(false);
  };

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate();
    }
  };

  return (
    <>
      {trigger && (
        <div onClick={() => setModalOpen(true)}>
          {trigger}
        </div>
      )}
      
      <ModernModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isTemplate ? "Template Preview" : "Edit System Prompt"}
        description={isTemplate 
          ? "This is a template for the selected agent type. You can use it as a starting point for your custom prompt."
          : "Define how your agent behaves and responds to users. This is the core instruction that guides all interactions."
        }
        size="4xl"
        fixedFooter
        footer={
          <div className="flex gap-3">
            <ModernButton variant="outline" onClick={handleCancel}>
              {isTemplate ? "Close" : "Cancel"}
            </ModernButton>
            {isTemplate ? (
              <ModernButton variant="primary" onClick={handleUseTemplate}>
                Use Template
              </ModernButton>
            ) : (
              <ModernButton variant="primary" onClick={handleSave}>
                Save Changes
              </ModernButton>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {isTemplate ? (
              <Icon type='plain' name={`Magic`} color='hsl(var(--primary))' />
            ) : (
              <Icon type='plain' name={`TextFile`} color='hsl(var(--primary))' />
            )}
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {isTemplate ? "Template Content" : "System Prompt"}
            </Label>
          </div>
          
          <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={isTemplate 
              ? "Template content will be displayed here..." 
              : "You are a helpful AI assistant. Always be polite, professional, and provide accurate information..."
            }
            className="min-h-[400px] resize-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            readOnly={isTemplate}
          />
          
          <div className={`${isTemplate ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'} p-4 rounded-xl border`}>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>{isTemplate ? "Template:" : "Tip:"}</strong> {isTemplate 
                ? "This template is designed for the selected agent type. Click 'Use Template' to replace your current system prompt with this content."
                : "Be specific about the agent's role, tone, and behavior. Include any constraints or special instructions that should guide the AI's responses."
              }
            </p>
          </div>
        </div>
      </ModernModal>
    </>
  );
};
