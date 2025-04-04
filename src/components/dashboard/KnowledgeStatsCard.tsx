
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, BookOpen, FileSpreadsheet, Globe, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_ENDPOINTS, getAuthHeaders, getAccessToken } from '@/utils/api-config';

const KnowledgeStatsCard = () => {
  const fetchKnowledgeBases = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.KNOWLEDGEBASE}?status=active`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      throw error;
    }
  };

  const { data: knowledgeBases, isLoading } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: fetchKnowledgeBases,
    staleTime: 5 * 60 * 1000,
  });

  const stats = useMemo(() => {
    if (!knowledgeBases || isLoading) {
      return {
        totalSources: 0,
        documentSources: 0,
        documentFiles: 0,
        websiteSources: 0,
        spreadsheetSources: 0,
        spreadsheetRows: 0,
        plainTextSources: 0,
        plainTextChars: 0
      };
    }

    const result = {
      totalSources: knowledgeBases.length || 0,
      documentSources: 0,
      documentFiles: 0,
      websiteSources: 0,
      spreadsheetSources: 0,
      spreadsheetRows: 0,
      plainTextSources: 0,
      plainTextChars: 0
    };

    knowledgeBases.forEach(source => {
      // Count by source type
      if (source.type === 'docs') {
        result.documentSources++;
        // Count nested files for documents
        if (source.knowledge_sources) {
          result.documentFiles += source.knowledge_sources.length;
        }
      } else if (source.type === 'website') {
        result.websiteSources++;
      } else if (source.type === 'csv') {
        result.spreadsheetSources++;
        // Count total rows across all spreadsheets
        if (source.knowledge_sources) {
          source.knowledge_sources.forEach(ks => {
            if (ks.metadata && ks.metadata.no_of_rows) {
              result.spreadsheetRows += parseInt(ks.metadata.no_of_rows) || 0;
            }
          });
        }
      } else if (source.type === 'plain_text') {
        result.plainTextSources++;
        // Count total characters across all plaintext
        if (source.knowledge_sources && source.knowledge_sources[0]?.metadata?.no_of_chars) {
          result.plainTextChars += parseInt(source.knowledge_sources[0].metadata.no_of_chars) || 0;
        }
      }
    });

    return result;
  }, [knowledgeBases, isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Knowledge Management</CardTitle>
        <CardDescription>Overview of knowledge sources and content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Knowledge Sources"
            value={isLoading ? "..." : stats.totalSources}
            icon={<Layers className="h-4 w-4" />}
          />
          <StatCard
            title="Document Files"
            value={isLoading ? "..." : `${stats.documentFiles}`}
            icon={<BookOpen className="h-4 w-4" />}
            className="bg-blue-50"
          />
          <StatCard
            title="Website Sources"
            value={isLoading ? "..." : stats.websiteSources}
            icon={<Globe className="h-4 w-4" />}
            className="bg-green-50"
          />
          <StatCard
            title="Spreadsheet Rows"
            value={isLoading ? "..." : `${stats.spreadsheetRows.toLocaleString()}`}
            icon={<FileSpreadsheet className="h-4 w-4" />}
            className="bg-emerald-50"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeStatsCard;
