
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
      icon: FileText,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'website' as WizardSourceType,
      title: 'Website URL',
      description: 'Crawl content from a webpage',
      icon: Globe,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'plainText' as WizardSourceType,
      title: 'Plain Text',
      description: 'Enter text content directly',
      icon: AlignLeft,
      color: 'from-purple-500 to-indigo-600'
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
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Add Knowledge Source (Optional)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Give your agent some initial knowledge to work with
        </p>
      </div>

      {/* Source Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sourceTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md border-2',
              selectedType === type.id
                ? 'border-blue-500 dark:border-blue-400 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            )}
            onClick={() => setSelectedType(type.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={cn(
                'w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br flex items-center justify-center',
                type.color
              )}>
                <type.icon className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
                {type.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {type.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <div className="space-y-4">
          {/* Source Name */}
          <div className="space-y-2">
            <Label htmlFor="source-name">Source Name</Label>
            <Input
              id="source-name"
              placeholder="Enter a name for this knowledge source"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
          </div>

          {/* Content Input based on selected type */}
          {selectedType === 'document' && (
            <div className="space-y-2">
              <Label>Upload Files</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 transition-colors',
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Drop files here or{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-500"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-slate-500">PDF, DOCX, TXT files</p>
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
                      className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              <Label htmlFor="url-input">Website URL</Label>
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
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text content here..."
                className="min-h-[120px]"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onSkip}>
          Skip for Now
        </Button>
        
        <Button 
          onClick={handleAddKnowledge}
          disabled={!canProceed()}
        >
          Add Knowledge
        </Button>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
