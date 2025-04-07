
import React from 'react';
import { UploadedFile } from '@/types/knowledge';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface UploadedFilesProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: number) => void;
}

export const UploadedFiles: React.FC<UploadedFilesProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-medium">Uploaded Files</h3>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between border p-3 rounded-md"
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm truncate max-w-[250px]">{file.name}</div>
                <span className="text-xs text-muted-foreground">{file.size}</span>
              </div>
              {file.status === 'uploading' && (
                <div className="w-full mt-2">
                  <Progress value={file.progress} className="h-1" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {file.status === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {file.status === 'error' && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveFile(file.id)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
