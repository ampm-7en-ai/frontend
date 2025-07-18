
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Globe, AlignLeft, Upload, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFloatingToast } from '@/context/FloatingToastContext';
import { knowledgeApi, agentApi } from '@/utils/api-config';
import ModernButton from '@/components/dashboard/ModernButton';

type SourceType = 'url' | 'file' | 'text';

interface Agent {
  id: number;
  name: string;
  description: string;
}

const KnowledgeUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showToast, hideToast } = useFloatingToast();
  
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [plainText, setPlainText] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const response = await agentApi.getAll();
      const data = await response.json();
      setAgents(data.results || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      showToast({
        title: "Error",
        description: "Failed to load agents. Please try again.",
        variant: "error"
      });
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast({
        title: "Validation Error",
        description: "Please enter a title for your knowledge source.",
        variant: "error"
      });
      return;
    }

    if (!selectedAgentId) {
      showToast({
        title: "Validation Error",
        description: "Please select an agent.",
        variant: "error"
      });
      return;
    }

    // Validate based on source type
    if (sourceType === 'url' && !url.trim()) {
      showToast({
        title: "Validation Error",
        description: "Please enter a URL.",
        variant: "error"
      });
      return;
    }

    if (sourceType === 'file' && !file) {
      showToast({
        title: "Validation Error",
        description: "Please select a file.",
        variant: "error"
      });
      return;
    }

    if (sourceType === 'text' && !plainText.trim()) {
      showToast({
        title: "Validation Error",
        description: "Please enter some text content.",
        variant: "error"
      });
      return;
    }

    setIsLoading(true);
    const loadingToastId = showToast({
      title: "Creating...",
      description: "Adding your knowledge source",
      variant: "loading"
    });

    try {
      const payload: any = {
        agent_id: parseInt(selectedAgentId),
        title: title.trim()
      };

      // Add source-specific data
      if (sourceType === 'url') {
        payload.url = url.trim();
      } else if (sourceType === 'file') {
        payload.file = file;
      } else if (sourceType === 'text') {
        payload.plain_text = plainText.trim();
      }

      const response = await knowledgeApi.createSource(payload);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to create knowledge source: ${response.status}`);
      }

      const result = await response.json();
      
      hideToast(loadingToastId);
      showToast({
        title: "Success!",
        description: result.message || "Knowledge source created successfully",
        variant: "success"
      });

      // Reset form
      setTitle('');
      setUrl('');
      setFile(null);
      setPlainText('');
      setSelectedAgentId('');
      
      // Navigate back to knowledge base
      navigate('/knowledge');
      
    } catch (error) {
      console.error('Error creating knowledge source:', error);
      hideToast(loadingToastId);
      
      let errorMessage = "Failed to create knowledge source.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showToast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSourceInput = () => {
    switch (sourceType) {
      case 'url':
        return (
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input 
              id="url"
              variant="modern"
              size="lg"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input 
              id="file"
              variant="modern"
              size="lg"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
              onChange={handleFileChange}
              required
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea 
              id="text"
              placeholder="Enter your text content here..."
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              className="min-h-[200px] resize-none bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80 transition-all duration-200"
              required
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <ModernButton
          variant="outline"
          size="sm"
          onClick={() => navigate('/knowledge')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </ModernButton>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Knowledge Source</h1>
          <p className="text-muted-foreground">Add new content to your knowledge base</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Knowledge Source</CardTitle>
          <CardDescription>
            Choose the type of content you want to add and fill in the details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent Selection */}
            <div className="space-y-2">
              <Label htmlFor="agent">Select Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId} required>
                <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm rounded-xl focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 focus-visible:border-transparent hover:border-slate-300/80 dark:hover:border-slate-500/80 transition-all duration-200">
                  <SelectValue placeholder={isLoadingAgents ? "Loading agents..." : "Choose an agent"} />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                variant="modern"
                size="lg"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Source Type Selection */}
            <div className="space-y-4">
              <Label>Source Type</Label>
              <RadioGroup value={sourceType} onValueChange={(value) => setSourceType(value as SourceType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="url-type" />
                  <Label htmlFor="url-type" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="h-4 w-4" />
                    Website URL
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="file" id="file-type" />
                  <Label htmlFor="file-type" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Upload File
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text-type" />
                  <Label htmlFor="text-type" className="flex items-center gap-2 cursor-pointer">
                    <AlignLeft className="h-4 w-4" />
                    Plain Text
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Source Input */}
            {renderSourceInput()}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <ModernButton
                type="button"
                variant="outline"
                onClick={() => navigate('/knowledge')}
                disabled={isLoading}
              >
                Cancel
              </ModernButton>
              <ModernButton
                type="submit"
                disabled={isLoading || isLoadingAgents}
                className="px-6"
              >
                {isLoading ? 'Creating...' : 'Create Source'}
              </ModernButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeUpload;
