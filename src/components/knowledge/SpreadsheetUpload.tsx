
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpreadsheetUploadProps {
  onUpload: (files: File[]) => void;
}

export const SpreadsheetUpload: React.FC<SpreadsheetUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of 5MB`,
          variant: "destructive"
        });
        return false;
      }
      
      // Check file type
      const fileType = file.type.toLowerCase();
      const validTypes = [
        'text/csv', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(fileType)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type. Please upload CSV or Excel files.`,
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
        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm text-center text-muted-foreground mb-1">
          Drag and drop spreadsheet files here or click to browse
        </p>
        <p className="text-xs text-center text-muted-foreground">
          Supported file types: CSV, XLSX, XLS (Max 5MB)
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
        Select Spreadsheets
      </Button>
    </div>
  );
};
