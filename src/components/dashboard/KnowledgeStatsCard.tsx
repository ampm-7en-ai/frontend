
import React, { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
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
      icon: <Layers className="h-5 w-5" />
    },
    {
      title: 'Document Files',
      value: stats.documentFiles,
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      title: 'Websites',
      value: stats.websites,
      icon: <Globe className="h-5 w-5" />
    },
    {
      title: 'Spreadsheet Files',
      value: stats.spreadsheetFiles,
      icon: <FileSpreadsheet className="h-5 w-5" />
    },
    {
      title: 'Plain Text',
      value: stats.plainText,
      icon: <FileText className="h-5 w-5" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default KnowledgeStatsCard;
