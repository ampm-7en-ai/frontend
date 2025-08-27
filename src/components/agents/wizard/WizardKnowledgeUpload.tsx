import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Globe, AlignLeft, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const sourceTypes = [
    {
      id: 'document' as WizardSourceType,
      title: 'Upload Document',
      description: 'PDF, DOCX, or TXT files',
      icon: FileText
    },
    {
      id: 'website' as WizardSourceType,
      title: 'Website URL',
      description: 'Crawl content from a webpage',
      icon: Globe
    },
    {
      id: 'plainText' as WizardSourceType,
      title: 'Plain Text',
      description: 'Enter text content directly',
      icon: AlignLeft
    }
  ];

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Add Knowledge Source
        </h3>
        <p className="text-muted-foreground">
          Give your agent some initial knowledge to work with <span className="text-muted-foreground/60">(Optional)</span>
        </p>
      </div>

      {/* Source Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sourceTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-colors duration-200 border-2',
              selectedType === type.id
                ? 'border-primary bg-accent/50'
                : 'border-border hover:border-muted-foreground/20'
            )}
            onClick={() => setSelectedType(type.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
                <type.icon className="h-5 w-5 text-foreground" />
              </div>
              <h4 className="font-medium text-sm text-foreground mb-1">
                {type.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {type.description}
              </p>
              
              {selectedType === type.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 border">
          {/* Source Name */}
          <div className="space-y-2">
            <Label htmlFor="source-name" className="text-sm font-medium text-foreground">
              Source Name
            </Label>
            <Input
              id="source-name"
              placeholder="Enter a descriptive name for this knowledge source"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
          </div>

          {/* Content Input based on selected type */}
          {selectedType === 'document' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Upload Files</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 transition-colors duration-200',
                  isDragOver
                    ? 'border-primary bg-accent/50'
                    : 'border-border hover:border-muted-foreground/20'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
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
                Website URL
              </Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {selectedType === 'plainText' && (
            <div className="space-y-2">
              <Label htmlFor="text-input" className="text-sm font-medium text-foreground">
                Text Content
              </Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text content here..."
                className="min-h-[100px]"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
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
