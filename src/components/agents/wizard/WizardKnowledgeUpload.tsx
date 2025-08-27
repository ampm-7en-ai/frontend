import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Globe, AlignLeft, Upload, X, Sparkles, ArrowRight } from 'lucide-react';
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
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-200/30 dark:shadow-emerald-900/30'
    },
    {
      id: 'website' as WizardSourceType,
      title: 'Website URL',
      description: 'Crawl content from a webpage',
      icon: Globe,
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-200/30 dark:shadow-blue-900/30'
    },
    {
      id: 'plainText' as WizardSourceType,
      title: 'Plain Text',
      description: 'Enter text content directly',
      icon: AlignLeft,
      gradient: 'from-purple-500 to-indigo-600',
      shadowColor: 'shadow-purple-200/30 dark:shadow-purple-900/30'
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
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
          Add Knowledge Source
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          Give your agent some initial knowledge to work with <span className="text-slate-400">(Optional)</span>
        </p>
      </div>

      {/* Source Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sourceTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-lg border-2 group relative overflow-hidden',
              selectedType === type.id
                ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]',
              type.shadowColor
            )}
            onClick={() => setSelectedType(type.id)}
          >
            {/* Background gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
              type.gradient
            )} />
            
            <CardContent className="p-6 text-center relative">
              <div className={cn(
                'w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110',
                type.gradient,
                type.shadowColor
              )}>
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">
                {type.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {type.description}
              </p>
              
              {selectedType === type.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 space-y-6 border border-slate-200 dark:border-slate-700">
          {/* Source Name */}
          <div className="space-y-3">
            <Label htmlFor="source-name" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Source Name
            </Label>
            <Input
              id="source-name"
              placeholder="Enter a descriptive name for this knowledge source"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Content Input based on selected type */}
          {selectedType === 'document' && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upload Files</Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 transition-all duration-300 bg-white dark:bg-slate-700',
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-xl flex items-center justify-center">
                    <Upload className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">
                    Drop files here or{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-500 font-semibold underline decoration-2 underline-offset-2"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Supports PDF, DOCX, TXT files</p>
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
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
            <div className="space-y-3">
              <Label htmlFor="url-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Website URL
              </Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {selectedType === 'plainText' && (
            <div className="space-y-3">
              <Label htmlFor="text-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Text Content
              </Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text content here..."
                className="min-h-[120px] bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-blue-500/20 focus:border-blue-500"
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
          className="order-2 sm:order-1 border-slate-300 dark:border-slate-600"
        >
          Skip for Now
        </Button>
        
        <Button 
          onClick={handleAddKnowledge}
          disabled={!canProceed()}
          size="lg"
          className="order-1 sm:order-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-200/30 dark:shadow-blue-900/30 border-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Add Knowledge
        </Button>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
