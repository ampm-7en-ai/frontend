
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SourceType } from './types';
import { mockSourceOptions } from './mockData';
import SourceTypeSelector from './SourceTypeSelector';
import UrlSourceInput from './UrlSourceInput';
import SourceList from './SourceList';
import { useToast } from '@/hooks/use-toast';

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSource: (sourceType: SourceType, sourceId?: number, crawlOption?: 'single' | 'children') => void;
}

const AddSourceDialog: React.FC<AddSourceDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAddSource 
}) => {
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | null>(null);
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [crawlUrls, setCrawlUrls] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newUrl, setNewUrl] = useState('');
  const { toast } = useToast();

  const handleSourceTypeSelect = (type: SourceType) => {
    setSelectedSourceType(type);
    setSelectedSources([]);
    setCrawlUrls([]);
  };

  const handleSourceSelect = (id: number) => {
    setSelectedSources(prev => {
      if (prev.includes(id)) {
        return prev.filter(sourceId => sourceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddUrl = () => {
    if (newUrl && !crawlUrls.includes(newUrl)) {
      setCrawlUrls(prev => [...prev, newUrl]);
      setNewUrl('');
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setProgress(0);

    if (selectedSourceType === 'url' && crawlUrls.length > 0) {
      for (const url of crawlUrls) {
        await onAddSource('url', undefined, 'children');
        setProgress(prev => Math.min(prev + (100 / crawlUrls.length), 100));
      }
    } else {
      for (const sourceId of selectedSources) {
        await onAddSource(selectedSourceType!, sourceId);
        setProgress(prev => Math.min(prev + (100 / selectedSources.length), 100));
      }
    }

    setIsTraining(false);
    onOpenChange(false);
  };

  return (
    <>
      <SourceTypeSelector onSourceTypeSelect={handleSourceTypeSelect} />

      <Dialog open={selectedSourceType !== null} onOpenChange={() => setSelectedSourceType(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add {selectedSourceType} Source</DialogTitle>
            <DialogDescription>
              Select the sources you want to add to your knowledge base
            </DialogDescription>
          </DialogHeader>

          {selectedSourceType === 'url' ? (
            <UrlSourceInput
              newUrl={newUrl}
              crawlUrls={crawlUrls}
              selectedSources={selectedSources}
              onNewUrlChange={setNewUrl}
              onAddUrl={handleAddUrl}
              onSourceSelect={handleSourceSelect}
            />
          ) : selectedSourceType && (
            <SourceList
              sourceType={selectedSourceType}
              sources={mockSourceOptions[selectedSourceType]}
              selectedSources={selectedSources}
              onSourceSelect={handleSourceSelect}
            />
          )}

          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setSelectedSourceType(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleTrain}
              disabled={isTraining || (selectedSources.length === 0 && crawlUrls.length === 0)}
            >
              {isTraining ? 'Training...' : 'Train Selected Sources'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddSourceDialog;
