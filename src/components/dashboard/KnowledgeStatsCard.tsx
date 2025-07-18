
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
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400'
    },
    {
      title: 'Document Files',
      value: stats.documentFiles,
      icon: BookOpen,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Websites',
      value: stats.websites,
      icon: Globe,
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Spreadsheet Files',
      value: stats.spreadsheetFiles,
      icon: FileSpreadsheet,
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Plain Text',
      value: stats.plainText,
      icon: FileText,
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-5 gap-6">
          {statItems.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.bgColor} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {stat.title}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeStatsCard;
