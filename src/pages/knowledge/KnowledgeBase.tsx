
import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernInput } from '@/components/ui/modern-input';
import ModernButton from '@/components/dashboard/ModernButton';
import { ChevronRight, Search, FolderOpen, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { knowledgeApi } from '@/utils/api-config';
import { useQuery } from '@tanstack/react-query';
import { useAppTheme } from '@/hooks/useAppTheme';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all knowledge folders
  const { 
    data: folders, 
    isLoading: foldersLoading, 
    error: foldersError 
  } = useQuery({
    queryKey: ['knowledgeFolders'],
    queryFn: async () => {
      // Dummy data for testing UI
      return {
        message: "List of AgentKnowledgeFolders for your team owner",
        data: [
          {
            id: 1,
            name: "Marketing Agent Knowledge",
            agent: 1,
            owner: 1,
            created_at: "2025-07-17T11:14:41.680411Z",
            updated_at: "2025-07-17T11:14:41.680411Z"
          },
          {
            id: 2,
            name: "Customer Support Bot",
            agent: 2,
            owner: 1,
            created_at: "2025-07-16T09:30:15.123456Z",
            updated_at: "2025-07-18T14:22:33.987654Z"
          },
          {
            id: 3,
            name: "Sales Assistant AI",
            agent: 3,
            owner: 1,
            created_at: "2025-07-15T16:45:22.555777Z",
            updated_at: "2025-07-18T10:15:44.111222Z"
          },
          {
            id: 4,
            name: "Product Documentation Helper",
            agent: 4,
            owner: 1,
            created_at: "2025-07-14T08:20:11.333444Z",
            updated_at: "2025-07-17T13:55:28.666888Z"
          }
        ],
        status: "success"
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
            className="pl-10"
          />
        </div>
      </div>

      {/* Folders List */}
      <div className="space-y-2">
        {foldersLoading ? (
          // Modern Loading State
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-card-foreground bg-white dark:bg-slate-800 rounded-xl overflow-hidden border-0 shadow-none px-2 animate-pulse">
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-7 h-7 rounded-xl bg-muted/50"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-muted/50 rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-muted/30 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-muted/30 rounded"></div>
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
              className="text-card-foreground bg-white dark:bg-slate-800 rounded-xl overflow-hidden border-0 shadow-none px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleFolderClick(folder)}
            >
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary/80 to-primary">
                      <FolderOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate transition-colors duration-200">
                          {folder.name}
                        </h3>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Agent {folder.agent} • {formatDate(folder.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                        {formatDate(folder.updated_at)}
                      </span>
                    </div>
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu actions
                      }}
                    >
                      <MoreHorizontal className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                    </ModernButton>
                  </div>
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
