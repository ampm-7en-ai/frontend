import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import KnowledgeUploadEngine from '@/components/knowledge/KnowledgeUploadEngine';

const KnowledgeUpload = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[hsla(0,0%,0%,0.95)] transition-colors duration-200 p-8">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white/80 dark:bg-neutral-800/70 backdrop-blur-sm border-0 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-slate-800/20 transition-colors duration-200">
          <CardContent className="p-8">
            <KnowledgeUploadEngine
              mode="standalone"
              showAgentSelector={true}
              showBackButton={true}
              showTitle={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeUpload;