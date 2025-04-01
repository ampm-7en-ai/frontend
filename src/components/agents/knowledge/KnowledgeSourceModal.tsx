
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import ImportSourcesDialog from './ImportSourcesDialog';

// This is a compatibility component to avoid breaking imports
// It simply re-exports ImportSourcesDialog
const KnowledgeSourceModal = ImportSourcesDialog;

export default KnowledgeSourceModal;
