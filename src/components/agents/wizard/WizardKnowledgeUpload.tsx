
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';

export type WizardSourceType = 'document' | 'website' | 'plainText';

interface WizardKnowledgeUploadProps {
  onKnowledgeAdd: (data: { type: WizardSourceType; content: any; name: string }) => void;
  onSkip: () => void;
}

const WizardKnowledgeUpload = ({ onKnowledgeAdd, onSkip }: WizardKnowledgeUploadProps) => {
  const [selectedType, setSelectedType] = useState<WizardSourceType | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [url, setUrl] = useState('');
  const [plainText, setPlainText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return ['.pdf', '.docx', '.txt'].includes(extension);
    });
    
    setFiles(validFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (!selectedType || !sourceName.trim()) return false;
    
    switch (selectedType) {
      case 'document':
        return files.length > 0;
      case 'website':
        return url.trim() !== '';
      case 'plainText':
        return plainText.trim() !== '';
      default:
        return false;
    }
  };

  const handleAddKnowledge = () => {
    if (!selectedType || !canProceed()) return;

    let content;
    switch (selectedType) {
      case 'document':
        content = files;
        break;
      case 'website':
        content = url;
        break;
      case 'plainText':
        content = plainText;
        break;
    }

    onKnowledgeAdd({
      type: selectedType,
      content,
      name: sourceName
    });
  };

  const handleSourceTypeSelect = (type: string) => {
    setSelectedType(type as WizardSourceType);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Add Knowledge Source
        </h3>
        <p className="text-muted-foreground">
          Give your agent some initial knowledge to work with <span className="text-muted-foreground/60">(Optional)</span>
        </p>
      </div>

      {/* Source Type Selection */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Choose Knowledge Type
        </Label>
        <SourceTypeSelector
          selectedType={selectedType || ''}
          onTypeSelect={handleSourceTypeSelect}
        />
      </div>

      {selectedType && (
        <div className="space-y-6 p-6 border border-border rounded-lg bg-muted/20">
          {/* Source Name */}
          <div className="space-y-2">
            <Label htmlFor="source-name" className="text-sm font-medium text-foreground">
              Source Name *
            </Label>
            <Input
              id="source-name"
              placeholder="Enter a descriptive name for this knowledge source"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="bg-background"
            />
          </div>

          {/* Content Input based on selected type */}
          {selectedType === 'document' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Upload Files *</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 transition-colors duration-200 bg-background',
                  isDragOver
                    ? 'border-primary bg-accent/50'
                    : 'border-border hover:border-muted-foreground/20'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground mb-1">
                    Drop files here or{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT files</p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                    >
                      <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="flex-1 text-sm text-foreground">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedType === 'website' && (
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm font-medium text-foreground">
                Website URL *
              </Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background"
              />
            </div>
          )}

          {selectedType === 'plainText' && (
            <div className="space-y-2">
              <Label htmlFor="text-input" className="text-sm font-medium text-foreground">
                Text Content *
              </Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text content here..."
                className="min-h-[120px] bg-background"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onSkip}
          size="lg"
          className="order-2 sm:order-1"
        >
          Skip for Now
        </Button>
        
        <Button 
          onClick={handleAddKnowledge}
          disabled={!canProceed()}
          size="lg"
          className="order-1 sm:order-2"
        >
          Add Knowledge
        </Button>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
