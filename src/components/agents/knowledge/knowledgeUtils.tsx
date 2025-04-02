import React from 'react';
import { FileText, Globe, FileSpreadsheet, File, Database } from 'lucide-react';

// This function renders the appropriate icon based on source type
export const renderSourceIcon = (sourceType: string) => {
  switch (sourceType) {
    case 'pdf':
      return <FileText className="h-4 w-4 mr-2 text-red-600" />;
    case 'docx':
      return <FileText className="h-4 w-4 mr-2 text-blue-600" />;
    case 'website':
      return <Globe className="h-4 w-4 mr-2 text-green-600" />;
    case 'csv':
      return <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />;
    case 'plain_text':
      return <File className="h-4 w-4 mr-2 text-purple-600" />;
    case 'database':
      return <Database className="h-4 w-4 mr-2 text-orange-600" />;
    default:
      return <File className="h-4 w-4 mr-2 text-gray-600" />;
  }
};
