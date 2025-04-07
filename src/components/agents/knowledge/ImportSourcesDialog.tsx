
// This is a stub implementation since we can't modify the original file
// Let's create a prop type definition file that reflects what the component expects
<lov-write file_path="src/components/agents/knowledge/ImportSourcesDialog.d.ts">
import { KnowledgeSource } from '@/types/agent';

export interface ImportSourcesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceChange: (source: KnowledgeSource) => void;
}

declare const ImportSourcesDialog: React.FC<ImportSourcesDialogProps>;
export default ImportSourcesDialog;
