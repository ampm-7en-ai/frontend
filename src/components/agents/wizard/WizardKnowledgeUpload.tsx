
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import { Upload, FileText, Globe, Plus, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ModernButton from '@/components/dashboard/ModernButton';

// Define local SourceType for wizard usage
export type WizardSourceType = 'plainText' | 'document' | 'website' | string;

export interface WizardKnowledgeUploadProps {
  agentId: string | null;
  onKnowledgeAdd: (knowledge: { type: WizardSourceType; content: any; name: string }) => Promise<void>;
  onSkip: () => void;
}

const WizardKnowledgeUpload = ({ agentId, onKnowledgeAdd, onSkip }: WizardKnowledgeUploadProps) => {
  const [selectedSourceType, setSelectedSourceType] = useState<WizardSourceType>('plainText');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [manualUrls, setManualUrls] = useState<string[]>(['']);
  const [addUrlsManually, setAddUrlsManually] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSourceTypeChange = (sourceType: string) => {
    setSelectedSourceType(sourceType as WizardSourceType);
    // Reset form data when switching types
    setTitle('');
    setContent('');
    setWebsiteUrl('');
    setFiles(null);
    setManualUrls(['']);
    setAddUrlsManually(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const addUrlField = () => {
    setManualUrls([...manualUrls, '']);
  };

  const removeUrlField = (index: number) => {
    const newUrls = manualUrls.filter((_, i) => i !== index);
    setManualUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const updateUrlField = (index: number, value: string) => {
    const newUrls = [...manualUrls];
    newUrls[index] = value;
    setManualUrls(newUrls);
  };

  const getValidUrls = () => {
    return manualUrls.filter(url => url.trim() !== '');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your knowledge source.",
        variant: "destructive"
      });
      return;
    }

    let knowledgeContent: any;
    let actualSourceType = selectedSourceType;

    try {
      setIsUploading(true);

      switch (selectedSourceType) {
        case 'plainText':
          if (!content.trim()) {
            toast({
              title: "Content Required",
              description: "Please provide some text content.",
              variant: "destructive"
            });
            return;
          }
          knowledgeContent = content;
          break;

        case 'website':
          if (addUrlsManually) {
            const validUrls = getValidUrls();
            if (validUrls.length === 0) {
              toast({
                title: "URLs Required",
                description: "Please provide at least one valid URL.",
                variant: "destructive"
              });
              return;
            }
            knowledgeContent = validUrls;
          } else {
            if (!websiteUrl.trim()) {
              toast({
                title: "URL Required",
                description: "Please provide a website URL.",
                variant: "destructive"
              });
              return;
            }
            knowledgeContent = [websiteUrl];
          }
          break;

        case 'document':
          if (!files || files.length === 0) {
            toast({
              title: "File Required",
              description: "Please select at least one file to upload.",
              variant: "destructive"
            });
            return;
          }
          knowledgeContent = Array.from(files);
          break;

        default:
          toast({
            title: "Integration Coming Soon",
            description: "This integration will be available soon.",
            variant: "default"
          });
          return;
      }

      await onKnowledgeAdd({
        type: actualSourceType,
        content: knowledgeContent,
        name: title
      });

      // Reset form
      setTitle('');
      setContent('');
      setWebsiteUrl('');
      setFiles(null);
      setManualUrls(['']);
      setAddUrlsManually(false);

    } catch (error) {
      console.error('Error adding knowledge:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderSourceTypeContent = () => {
    switch (selectedSourceType) {
      case 'plainText':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Text Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your text content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'website':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addMultipleUrls"
                checked={addUrlsManually}
                onChange={(e) => setAddUrlsManually(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="addMultipleUrls">Add multiple URLs manually</Label>
            </div>

            {addUrlsManually ? (
              <div className="space-y-3">
                <Label>Website URLs</Label>
                {manualUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => updateUrlField(index, e.target.value)}
                      className="flex-1"
                    />
                    {manualUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrlField(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUrlField}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another URL
                </Button>
              </div>
            ) : (
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="files">Upload Files</Label>
              <Input
                id="files"
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, MD
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              This integration coming soon!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">Add Knowledge Source</h3>
        <p className="text-muted-foreground">
          Upload initial knowledge to help your agent provide better responses
        </p>
      </div>

      <div className="space-y-6">
        {/* Simple Source Type Selection */}
        <div>
          <Label className="text-base font-medium mb-4 block">Choose Source Type</Label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSourceTypeChange('plainText')}
              className={`p-4 border rounded-xl text-center transition-colors ${
                selectedSourceType === 'plainText'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Plain Text</p>
            </button>
            
            <button
              type="button"
              onClick={() => handleSourceTypeChange('website')}
              className={`p-4 border rounded-xl text-center transition-colors ${
                selectedSourceType === 'website'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Globe className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Website</p>
            </button>
            
            <button
              type="button"
              onClick={() => handleSourceTypeChange('document')}
              className={`p-4 border rounded-xl text-center transition-colors ${
                selectedSourceType === 'document'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Documents</p>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <Label htmlFor="title">Source Title</Label>
          <Input
            id="title"
            placeholder="Enter a descriptive title for this knowledge source"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Source Type Specific Content */}
        {renderSourceTypeContent()}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-border">
          <ModernButton
            onClick={onSkip}
            variant="outline"
          >
            Skip for Now
          </ModernButton>

          <ModernButton
            onClick={handleSubmit}
            disabled={isUploading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Knowledge...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Knowledge
              </>
            )}
          </ModernButton>
        </div>
      </div>
    </div>
  );
};

export default WizardKnowledgeUpload;
