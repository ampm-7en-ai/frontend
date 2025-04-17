
interface KnowledgeBaseItem {
  id: number;
  name: string;
  type: string;
  metadata: any;
  last_updated: string;
  training_status: string;
  status: string;
  knowledge_sources: any[];
  owner?: number;
  agents?: any[];
  is_selected?: boolean;
}

const KNOWLEDGE_STORAGE_KEY = 'newly_added_knowledge_base';
const EXPIRATION_TIME = 1000 * 60 * 5; // 5 minutes in milliseconds

/**
 * Store a newly created knowledge base in localStorage
 */
export const storeNewKnowledgeBase = (knowledgeBase: KnowledgeBaseItem): void => {
  try {
    const storageItem = {
      data: knowledgeBase.data,
      timestamp: Date.now(),
      expiration: Date.now() + EXPIRATION_TIME
    };
    localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify(storageItem));
    console.log('Knowledge base stored in localStorage:', knowledgeBase.data.id);
  } catch (error) {
    console.error('Error storing knowledge base in localStorage:', error);
  }
};

/**
 * Get the newly created knowledge base from localStorage
 */
export const getNewKnowledgeBase = (): KnowledgeBaseItem | null => {
  try {
    const storedItem = localStorage.getItem(KNOWLEDGE_STORAGE_KEY);
    if (!storedItem) return null;
    
    const { data, expiration } = JSON.parse(storedItem);
    
    // Check if data is expired
    if (Date.now() > expiration) {
      clearNewKnowledgeBase();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error retrieving knowledge base from localStorage:', error);
    return null;
  }
};

/**
 * Clear the newly created knowledge base from localStorage
 */
export const clearNewKnowledgeBase = (): void => {
  localStorage.removeItem(KNOWLEDGE_STORAGE_KEY);
};

/**
 * Check if a newly created knowledge base exists in localStorage
 */
export const hasNewKnowledgeBase = (): boolean => {
  const storedItem = localStorage.getItem(KNOWLEDGE_STORAGE_KEY);
  if (!storedItem) return false;
  
  try {
    const { expiration } = JSON.parse(storedItem);
    
    // Check if data is expired
    if (Date.now() > expiration) {
      clearNewKnowledgeBase();
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
