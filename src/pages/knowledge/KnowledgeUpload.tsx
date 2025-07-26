import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import ModernButton from '@/components/dashboard/ModernButton';
import { RefreshCw, Upload, File, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiUrl, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useKnowledge } from '@/hooks/useKnowledge';
import { useAgent } from '@/hooks/useAgent';
import { useSource } from '@/hooks/useSource';
import { useModal } from '@/hooks/use-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { useSettings } from '@/hooks/useSettings';

const providers = [
  {
    id: 'uploadFile',
    name: 'Upload File',
    description: 'Upload PDF, DOCX, TXT files',
    icon: Upload,
    comingSoon: false
  },
  {
    id: 'addText',
    name: 'Add Text',
    description: 'Add text directly',
    icon: File,
    comingSoon: false
  },
  {
    id: 'googleDrive',
    name: 'Google Drive',
    description: 'Import documents from Google Drive',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    comingSoon: false
  },
];

interface KnowledgeUploadProps {
  agentId: string;
  knowledgeId?: string;
  onSuccess?: () => void;
}

const KnowledgeUpload: React.FC<KnowledgeUploadProps> = ({ agentId, knowledgeId, onSuccess }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('uploadFile');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { onOpen } = useModal();
  const { data: settings } = useSettings();
  const { addKnowledge, updateKnowledge } = useKnowledge();
  const { getAgent } = useAgent();
  const { addSource } = useSource();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setUploadSuccess(null);
    setUploadError(null);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSourceTypeChange = (type: string) => {
    setSourceType(type);
    setUploadSuccess(null);
    setUploadError(null);
    setFiles([]);
    setContent('');
  };

  const handleSubmit = async () => {
    if (sourceType === 'uploadFile' && files.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    if (sourceType === 'addText' && content.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter some text content.",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the knowledge.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setUploadSuccess(null);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      let knowledgeIdToUse = knowledgeId || uuidv4();

      // Prepare form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('source_type', sourceType);
      if (sourceType === 'uploadFile') {
        formData.append('file', files[0]);
      } else if (sourceType === 'addText') {
        formData.append('content', content);
      }

      const apiUrl = knowledgeId ? getApiUrl(`knowledge/${knowledgeIdToUse}/`) : getApiUrl(`agents/${agentId}/knowledge/`);
      const method = knowledgeId ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method: method,
        headers: getAuthHeaders(token),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.message || `Failed to upload knowledge. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Knowledge upload response:', result);

      if (!knowledgeId) {
        // Create a new source for the knowledge
        const sourceData = {
          name: name,
          source_type: sourceType,
          agent_id: agentId,
          knowledge_id: knowledgeIdToUse,
        };

        const newSource = await addSource(sourceData);
        if (!newSource) {
          throw new Error("Failed to create source for the knowledge.");
        }
      } else {
        // Update the existing knowledge
        const updatedKnowledge = await updateKnowledge({
          id: knowledgeIdToUse,
          name: name,
          source_type: sourceType,
        });

        if (!updatedKnowledge) {
          throw new Error("Failed to update knowledge.");
        }
      }

      setUploadSuccess(true);
      setUploadError(null);

      toast({
        title: "Success",
        description: knowledgeId ? "Knowledge updated successfully." : "Knowledge added successfully.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading knowledge:', error);
      setUploadSuccess(false);
      setUploadError(error.message || "Failed to upload knowledge. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to upload knowledge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!knowledgeId) {
      console.warn("Cannot delete knowledge without an ID.");
      return;
    }

    onOpen('confirmDeleteKnowledge', { knowledgeId: knowledgeId, agentId: agentId });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Name Input */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Enter knowledge name"
          value={name}
          onChange={handleNameChange}
          disabled={isLoading}
        />
      </div>

      <Separator />

      {/* Source Type Selection */}
      <div>
        <Label>Source Type</Label>
        <div className="flex space-x-4 mt-2">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-3 rounded-md border ${sourceType === provider.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'} cursor-pointer`}
              onClick={() => handleSourceTypeChange(provider.id)}
            >
              <div className="flex items-center space-x-2">
                {provider.icon ? (
                  typeof provider.icon === 'string' ? (
                    <img src={provider.icon} alt={provider.name} className="w-5 h-5" />
                  ) : (
                    <provider.icon className="w-5 h-5" />
                  )
                ) : null}
                <span className="text-sm font-medium">{provider.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Upload File Section */}
      {sourceType === 'uploadFile' && (
        <div>
          <Label>Upload File</Label>
          <div
            {...getRootProps()}
            className={`mt-2 p-4 border-2 border-dashed rounded-md cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}`}
          >
            <input {...getInputProps()} disabled={isLoading} />
            <div className="text-center">
              {files.length === 0 ? (
                <>
                  <Upload className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isDragActive ? "Drop the file here..." : "Drag 'n' drop a file here, or click to select a file"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    (Only *.pdf, *.txt and *.docx files will be accepted)
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {files[0].name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Text Section */}
      {sourceType === 'addText' && (
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Enter text content"
            value={content}
            onChange={handleContentChange}
            className="mt-2"
            rows={5}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Upload Status */}
      {uploadSuccess !== null && (
        <div className={`p-3 rounded-md flex items-center space-x-2 ${uploadSuccess ? 'bg-green-500/10 border border-green-300 dark:border-green-700' : 'bg-red-500/10 border border-red-300 dark:border-red-700'}`}>
          {uploadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-sm text-green-500 dark:text-green-400">Upload successful!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span className="text-sm text-red-500 dark:text-red-400">Upload failed: {uploadError}</span>
            </>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        {knowledgeId && (
          <ModernButton
            variant="outline"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </ModernButton>
        )}
        <ModernButton
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Uploading... ({uploadProgress}%)
            </>
          ) : (
            knowledgeId ? 'Update Knowledge' : 'Add Knowledge'
          )}
        </ModernButton>
      </div>
    </div>
  );
};

export default KnowledgeUpload;
