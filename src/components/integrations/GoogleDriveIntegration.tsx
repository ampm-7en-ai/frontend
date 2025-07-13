
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, FileText, Folder, Image, FileSpreadsheet } from 'lucide-react';

const GoogleDriveIntegration = () => {
  return (
    <div className="space-y-8">
      {/* Status Section */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Connected Successfully</p>
                <p className="text-sm text-green-700 dark:text-green-300">Your Google Drive account is linked and ready to use</p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Document Access</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Access and process documents from your Google Drive</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Folder className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Folder Management</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Organize and manage your files and folders</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Image className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">File Sharing</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Share files and collaborate with team members</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Real-time Sync</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Keep your files synchronized across all devices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">File Permissions</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ensure your AI agent has appropriate permissions to access the files you want to process.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Supported Formats</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">The integration supports various file formats including documents, spreadsheets, presentations, and images.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Privacy & Security</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your Google Drive data is processed securely and in compliance with privacy regulations.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-900 dark:text-amber-100">Important Notice</h4>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Make sure to regularly review the permissions granted to your AI agent and revoke access if no longer needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveIntegration;
