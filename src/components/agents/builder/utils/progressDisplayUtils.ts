import { SourceProgress } from './sourceTrackingUtils';

export interface ProgressDisplay {
  currentText: string;
  progressBar: string;
  statusIcon: string;
}

export const getSourceTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'website':
    case 'url':
      return '🌐';
    case 'file':
    case 'pdf':
      return '📄';
    case 'folder':
    case 'directory':
      return '📁';
    case 'google_drive':
      return '💾';
    default:
      return '📄';
  }
};

export const formatSourceName = (source: SourceProgress): string => {
  const icon = getSourceTypeIcon(source.type);
  let name = source.title;

  // Format website names to show domain
  if (source.type === 'website' || source.type === 'url') {
    try {
      const url = new URL(source.title);
      name = url.hostname;
    } catch {
      // Keep original title if URL parsing fails
    }
  }

  return `${icon} ${name}`;
};

export const createProgressBar = (percentage: number, width: number = 20): string => {
  const filledBars = Math.floor((percentage / 100) * width);
  const emptyBars = width - filledBars;
  return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
};

export const formatProgressDisplay = (
  current: number,
  total: number,
  percentage: number,
  sourceName?: string
): ProgressDisplay => {
  const currentText = sourceName 
    ? `[${current}/${total}] Extracting ${sourceName}...`
    : `Processing [${current}/${total}]`;

  const progressBar = createProgressBar(percentage);
  const statusIcon = percentage === 100 ? '✓' : current > 0 ? '⚡' : '⏳';

  return {
    currentText,
    progressBar: `[${progressBar}] ${percentage}% complete`,
    statusIcon
  };
};

export const getPhaseMessage = (phase: string, current?: number, total?: number): string => {
  switch (phase) {
    case 'extracting':
      return current && total 
        ? `Text extraction in progress... [${current}/${total}]`
        : 'Starting text extraction...';
    case 'extraction_completed':
      return '✓ Text extraction completed successfully';
    case 'embedding_start':
      return 'Generating AI embeddings...';
    case 'embedding_completed':
      return '✓ AI embedding generation completed';
    case 'completed':
      return '🎉 Training completed successfully';
    case 'failed':
      return '✗ Training process failed';
    default:
      return 'Training in progress...';
  }
};
