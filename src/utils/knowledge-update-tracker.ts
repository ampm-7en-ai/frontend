
/**
 * Utility functions to track knowledge base updates across the application
 * without modifying ImportSourcesDialog.tsx or KnowledgeTrainingStatus.tsx
 */

// Constants for localStorage keys
export const KNOWLEDGE_SOURCE_ADDED_KEY = 'knowledgeSourceAdded';
export const KNOWLEDGE_SOURCE_TIMESTAMP_KEY = 'knowledgeSourceTimestamp';

/**
 * Mark that a new knowledge source has been added
 * This will trigger a refetch in KnowledgeBase.tsx
 */
export const markKnowledgeSourceAdded = (): void => {
  localStorage.setItem(KNOWLEDGE_SOURCE_ADDED_KEY, 'true');
  localStorage.setItem(KNOWLEDGE_SOURCE_TIMESTAMP_KEY, Date.now().toString());
  console.log('Knowledge source added marked for refetch');
};

/**
 * Check if a new knowledge source has been added
 * @returns {boolean} True if a new knowledge source has been added
 */
export const hasNewKnowledgeSource = (): boolean => {
  return localStorage.getItem(KNOWLEDGE_SOURCE_ADDED_KEY) === 'true';
};

/**
 * Get the timestamp of the last knowledge source update
 * @returns {number} Timestamp of the last update or 0 if none
 */
export const getKnowledgeUpdateTimestamp = (): number => {
  const timestamp = localStorage.getItem(KNOWLEDGE_SOURCE_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

/**
 * Clear the knowledge source added flag
 */
export const clearKnowledgeSourceAddedFlag = (): void => {
  localStorage.removeItem(KNOWLEDGE_SOURCE_ADDED_KEY);
};
