
import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernInput } from '@/components/ui/modern-input';
import ModernButton from '@/components/dashboard/ModernButton';
import { ChevronRight, Search, FolderOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL, getAuthHeaders, getAccessToken } from '@/utils/api-config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Badge } from "@/components/ui/badge";

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all knowledge folders with optimized cache settings
  const { 
    data: folders, 
    isLoading: foldersLoading, 
    error: foldersError
  } = useQuery({
    queryKey: ['knowledgeFolders'],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}knowledge-folders/`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge folders');
      }

      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });

  const filteredFolders = folders?.data?.filter((folder: any) => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleFolderClick = async (folder) => {
    // Navigate to the dedicated folder sources page using React Router
    navigate(`/knowledge/sources/${folder.agent}`);
  };

  const renderMainView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Folders</h1>
          <p className="text-muted-foreground">Manage your agent-specific knowledge folders</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <ModernInput
            variant="modern"
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Folders List */}
      <div className="space-y-3">
        {foldersLoading ? (
          // Modern Loading State
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/50 dark:bg-neutral-700/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted/50 rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-muted/50 rounded w-1/3 mb-1"></div>
                    <div className="h-3 bg-muted/30 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFolders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No knowledge folders found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search query.' : 'Create an agent to get started with knowledge folders.'}
            </p>
          </div>
        ) : (
          filteredFolders.map((folder, index) => (
            <div
              key={folder.id}
              className="bg-white/50 dark:bg-neutral-800/70 rounded-xl p-4 dark:border-slate-600/50 cursor-pointer hover:bg-white dark:hover:bg-neutral-800 transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleFolderClick(folder)}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {folder.name}
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Agent {folder.agent} • Created {formatDate(folder.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto p-6 pt-16">
      {renderMainView()}
    </div>
  );
};

export default KnowledgeBase;
