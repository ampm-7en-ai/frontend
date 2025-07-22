
import { useQueryClient } from '@tanstack/react-query';

// Update folder sources cache after adding new sources
export const addSourcesTolderCache = (queryClient: any, agentId: string, newSources: any[]) => {
  console.log('📁 Adding sources to folder cache for agent:', agentId);
  console.log('📁 New sources to add:', newSources);
  
  queryClient.setQueryData(['folderSources', agentId], (oldData: any) => {
    console.log('📁 Current folder sources cache:', oldData);
    
    if (!oldData || !oldData.data) {
      console.log('⚠️ No existing folder data in cache');
      return oldData;
    }

    // Add new sources to the existing knowledge_sources array
    const currentSources = oldData.data.knowledge_sources?.knowledge_sources || 
                          oldData.data.knowledge_sources || 
                          [];
    
    const updatedSources = [...newSources, ...currentSources];
    
    const updatedData = {
      ...oldData,
      data: {
        ...oldData.data,
        knowledge_sources: {
          ...oldData.data.knowledge_sources,
          knowledge_sources: updatedSources
        }
      }
    };
    
    console.log('✅ Updated folder sources cache with new sources');
    console.log('📁 New cache data:', updatedData);
    
    return updatedData;
  });
  
  // Update knowledge folders cache with new source count
  queryClient.setQueryData(['knowledgeFolders'], (oldData: any) => {
    if (!oldData || !oldData.data) return oldData;
    
    const updatedFolders = oldData.data.map((folder: any) => {
      if (folder.agent.toString() === agentId) {
        return {
          ...folder,
          source_count: (folder.source_count || 0) + newSources.length,
          updated_at: new Date().toISOString()
        };
      }
      return folder;
    });
    
    console.log('🗂️ Updated knowledge folder source count for agent:', agentId);
    return {
      ...oldData,
      data: updatedFolders
    };
  });
  
  // CACHE-FIRST: Notify components without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['folderSources', agentId],
    exact: true,
    refetchType: 'none'
  });
  
  queryClient.invalidateQueries({ 
    queryKey: ['knowledgeFolders'],
    refetchType: 'none'
  });
  
  console.log('✅ Sources added to cache completed');
};

// Remove source from folder cache after deletion
export const removeSourceFromFolderCache = (queryClient: any, agentId: string, sourceId: string) => {
  console.log('🗑️ Removing source from folder cache for agent:', agentId, 'source:', sourceId);
  
  queryClient.setQueryData(['folderSources', agentId], (oldData: any) => {
    console.log('🗑️ Current folder sources cache:', oldData);
    
    if (!oldData || !oldData.data) {
      console.log('⚠️ No existing folder data in cache');
      return oldData;
    }

    // Remove source from knowledge_sources array
    const currentSources = oldData.data.knowledge_sources?.knowledge_sources || 
                          oldData.data.knowledge_sources || 
                          [];
    
    const filteredSources = currentSources.filter((source: any) => source.id !== sourceId);
    
    const updatedData = {
      ...oldData,
      data: {
        ...oldData.data,
        knowledge_sources: {
          ...oldData.data.knowledge_sources,
          knowledge_sources: filteredSources
        }
      }
    };
    
    console.log('✅ Removed source from folder cache');
    console.log('🗑️ Sources before:', currentSources.length, 'after:', filteredSources.length);
    
    return updatedData;
  });
  
  // Update knowledge folders cache with decreased source count
  queryClient.setQueryData(['knowledgeFolders'], (oldData: any) => {
    if (!oldData || !oldData.data) return oldData;
    
    const updatedFolders = oldData.data.map((folder: any) => {
      if (folder.agent.toString() === agentId) {
        return {
          ...folder,
          source_count: Math.max((folder.source_count || 1) - 1, 0),
          updated_at: new Date().toISOString()
        };
      }
      return folder;
    });
    
    console.log('🗂️ Updated knowledge folder source count for agent:', agentId);
    return {
      ...oldData,
      data: updatedFolders
    };
  });
  
  // CACHE-FIRST: Notify components without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['folderSources', agentId],
    exact: true,
    refetchType: 'none'
  });
  
  queryClient.invalidateQueries({ 
    queryKey: ['knowledgeFolders'],
    refetchType: 'none'
  });
  
  console.log('✅ Source removal from cache completed');
};

// Update source in folder cache after status change
export const updateSourceInFolderCache = (queryClient: any, agentId: string, updatedSource: any) => {
  console.log('🔄 Updating source in folder cache for agent:', agentId, 'source:', updatedSource);
  
  queryClient.setQueryData(['folderSources', agentId], (oldData: any) => {
    console.log('🔄 Current folder sources cache:', oldData);
    
    if (!oldData || !oldData.data) {
      console.log('⚠️ No existing folder data in cache');
      return oldData;
    }

    // Update source in knowledge_sources array
    const currentSources = oldData.data.knowledge_sources?.knowledge_sources || 
                          oldData.data.knowledge_sources || 
                          [];
    
    const updatedSources = currentSources.map((source: any) => 
      source.id === updatedSource.id ? { ...source, ...updatedSource } : source
    );
    
    const updatedData = {
      ...oldData,
      data: {
        ...oldData.data,
        knowledge_sources: {
          ...oldData.data.knowledge_sources,
          knowledge_sources: updatedSources
        }
      }
    };
    
    console.log('✅ Updated source in folder cache');
    
    return updatedData;
  });
  
  // CACHE-FIRST: Notify components without refetch
  queryClient.invalidateQueries({ 
    queryKey: ['folderSources', agentId],
    exact: true,
    refetchType: 'none'
  });
  
  console.log('✅ Source update in cache completed');
};
