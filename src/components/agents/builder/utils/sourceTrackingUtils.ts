
import { KnowledgeSource } from '@/components/agents/knowledge/types';

export interface SourceProgress {
  id: number;
  title: string;
  type: string;
  position: number; // 1-based position in processing queue
  status: 'pending' | 'active' | 'completed' | 'failed';
  processed: boolean;
}

export interface ProgressState {
  sources: SourceProgress[];
  totalSources: number;
  currentSourceIndex: number;
  completedSources: number;
}

export class SourceTracker {
  private progressState: ProgressState;

  constructor(knowledgeSources: KnowledgeSource[]) {
    this.progressState = this.initializeProgressState(knowledgeSources);
  }

  private initializeProgressState(knowledgeSources: KnowledgeSource[]): ProgressState {
    // Filter out deleted sources and create ordered processing queue
    const activeSources = knowledgeSources.filter(
      source => source.trainingStatus !== 'deleted' && source.status !== 'deleted'
    );

    const sources: SourceProgress[] = activeSources.map((source, index) => ({
      id: source.id,
      title: source.title || source.name || 'Untitled Source',
      type: source.type || 'unknown',
      position: index + 1, // 1-based position
      status: 'pending',
      processed: false
    }));

    return {
      sources,
      totalSources: sources.length,
      currentSourceIndex: 0,
      completedSources: 0
    };
  }

  getProgressState(): ProgressState {
    return { ...this.progressState };
  }

  getCurrentSource(): SourceProgress | null {
    const activeSource = this.progressState.sources.find(s => s.status === 'active');
    return activeSource || null;
  }

  updateSourceStatus(sourceId: number, status: SourceProgress['status']): boolean {
    const sourceIndex = this.progressState.sources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) return false;

    const source = this.progressState.sources[sourceIndex];
    const previousStatus = source.status;
    
    // Update source status
    source.status = status;

    // Handle status transitions
    if (status === 'active' && previousStatus !== 'active') {
      // Mark previous sources as pending if they weren't completed
      this.progressState.sources.forEach((s, index) => {
        if (index < sourceIndex && s.status === 'active') {
          s.status = 'pending';
        }
      });
      this.progressState.currentSourceIndex = sourceIndex;
    }

    if (status === 'completed' && previousStatus !== 'completed') {
      source.processed = true;
      this.progressState.completedSources = this.progressState.sources.filter(s => s.processed).length;
    }

    return true;
  }

  getSourceByPosition(position: number): SourceProgress | null {
    return this.progressState.sources.find(s => s.position === position) || null;
  }

  getSourceById(id: number): SourceProgress | null {
    return this.progressState.sources.find(s => s.id === id) || null;
  }

  getCurrentProgress(): { current: number; total: number; percentage: number } {
    const current = this.progressState.currentSourceIndex + 1;
    const total = this.progressState.totalSources;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }

  getCompletionProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.progressState.completedSources;
    const total = this.progressState.totalSources;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  reset(): void {
    this.progressState.sources.forEach(source => {
      source.status = 'pending';
      source.processed = false;
    });
    this.progressState.currentSourceIndex = 0;
    this.progressState.completedSources = 0;
  }
}

export const createSourceTracker = (knowledgeSources: KnowledgeSource[]): SourceTracker => {
  return new SourceTracker(knowledgeSources);
};
