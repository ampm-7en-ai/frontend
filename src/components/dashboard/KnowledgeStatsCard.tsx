
import React, { useMemo } from 'react';
import { ModernStatCard } from '@/components/ui/modern-stat-card';
import { Layers, BookOpen, FileSpreadsheet, Globe, FileText } from 'lucide-react';
import Folder from '../icons/library/Folder';
import TextFile from '../icons/library/TextFile';
import WebPage from '../icons/library/WebPage';
import SheetFile from '../icons/library/SheetFile';
import Typing from '../icons/library/Typing';

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
      if (source.type === 'document' || source.type === 'custom' || source.file) {
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
      icon: Folder,
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
    },
    {
      title: 'Document Files',
      value: stats.documentFiles,
      icon: TextFile,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Websites',
      value: stats.websites,
      icon: WebPage,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Spreadsheet Files',
      value: stats.spreadsheetFiles,
      icon: SheetFile,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Plain Text',
      value: stats.plainText,
      icon: Typing,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statItems.map((stat, index) => (
        <ModernStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          gradient={stat.gradient}
        />
      ))}
    </div>
  );
};

export default KnowledgeStatsCard;
