
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, BookOpen, FileSpreadsheet, Globe, FileText } from 'lucide-react';

interface KnowledgeStatsCardProps {
  sources?: any[];
}

const KnowledgeStatsCard = ({ sources = [] }: KnowledgeStatsCardProps) => {
  const stats = useMemo(() => {
    const result = {
      totalSources: sources.length || 0,
      documentFiles: 0,
      websites: 0,
      spreadsheetFiles: 0,
      plainText: 0
    };

    sources.forEach(source => {
      if (source.type === 'document' || source.file) {
        result.documentFiles++;
      } else if (source.type === 'website' || source.url) {
        result.websites++;
      } else if (source.type === 'spreadsheet' || source.type === 'csv') {
        result.spreadsheetFiles++;
      } else if (source.type === 'plain_text' || source.plain_text) {
        result.plainText++;
      }
    });

    return result;
  }, [sources]);

  const statItems = [
    {
      title: 'Total Sources',
      value: stats.totalSources,
      icon: Layers,
      bgColor: 'bg-gradient-to-br from-gray-500 to-gray-600'
    },
    {
      title: 'Document Files',
      value: stats.documentFiles,
      icon: BookOpen,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Websites',
      value: stats.websites,
      icon: Globe,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Spreadsheet Files',
      value: stats.spreadsheetFiles,
      icon: FileSpreadsheet,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Plain Text',
      value: stats.plainText,
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="mb-4">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.title}
                </div>
              </div>
            </div>
            <div className={`absolute top-4 right-4 p-2 rounded-xl ${stat.bgColor}`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KnowledgeStatsCard;
