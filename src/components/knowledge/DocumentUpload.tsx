
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      // Check file type
      const fileType = file.type.toLowerCase();
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'
      ];
      
      if (!validTypes.includes(fileType)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOCX, or TXT files.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      onUpload(validFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileText className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm text-center text-muted-foreground mb-1">
          Drag and drop files here or click to browse
        </p>
        <p className="text-xs text-center text-muted-foreground">
          Supported file types: PDF, DOCX, TXT (Max 10MB)
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Select Files
      </Button>
    </div>
  );
};
