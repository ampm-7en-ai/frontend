
import { useState, useRef } from 'react';
import { HistoryItem, SocketHistory, QueryData, ResponseData } from '@/types/history';

export const useSocketHistory = (numModels: number) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isPreparingNewMessage, setIsPreparingNewMessage] = useState(false);
  
  // Track ongoing queries
  const activeQueries = useRef<Map<string, {
    query: string;
    timestamp: Date;
    socketData: Map<number, { queryData: QueryData; responseData?: ResponseData }>;
  }>>(new Map());

  const handleQuerySent = (socketIndex: number, queryData: QueryData) => {
    console.log(`Query sent from socket ${socketIndex}:`, queryData);
    
    // Get or create active query entry
    let queryEntry = activeQueries.current.get(queryData.content);
    if (!queryEntry) {
      queryEntry = {
        query: queryData.content,
        timestamp: new Date(),
        socketData: new Map()
      };
      activeQueries.current.set(queryData.content, queryEntry);
    }
    
    // Add socket-specific query data
    queryEntry.socketData.set(socketIndex, { queryData });
  };

  const handleResponseReceived = (socketIndex: number, responseData: ResponseData) => {
    console.log(`Response received for socket ${socketIndex}:`, responseData);
    
    // Find the query this response belongs to
    for (const [queryContent, queryEntry] of activeQueries.current.entries()) {
      const socketData = queryEntry.socketData.get(socketIndex);
      if (socketData && socketData.queryData.id === responseData.queryId) {
        // Add response to the socket data
        socketData.responseData = responseData;
        
        // Check if all sockets have responded
        const allResponded = Array.from(queryEntry.socketData.values())
          .every(data => data.responseData);
        
        if (allResponded) {
          // Create history item
          createHistoryItem(queryEntry);
          // Clean up active query
          activeQueries.current.delete(queryContent);
        }
        break;
      }
    }
  };

  const createHistoryItem = (queryEntry: {
    query: string;
    timestamp: Date;
    socketData: Map<number, { queryData: QueryData; responseData?: ResponseData }>;
  }) => {
    const socketHistories: SocketHistory[] = [];
    
    for (const [socketIndex, data] of queryEntry.socketData.entries()) {
      if (data.queryData && data.responseData) {
        socketHistories.push({
          socketIndex,
          chatEndpoint: `chat${socketIndex + 1}`,
          queries: [{
            id: data.queryData.id,
            content: data.queryData.content,
            timestamp: data.queryData.timestamp,
            config: {
              response_model: data.queryData.config.model,
              temperature: data.queryData.config.temperature,
              system_prompt: data.queryData.config.systemPrompt
            }
          }],
          responses: [{
            id: data.responseData.id,
            queryId: data.responseData.queryId,
            content: data.responseData.content,
            timestamp: data.responseData.timestamp
          }]
        });
      }
    }
    
    const historyItem: HistoryItem = {
      id: `history-${Date.now()}`,
      query: queryEntry.query,
      timestamp: queryEntry.timestamp,
      socketHistories
    };
    
    setHistory(prev => [historyItem, ...prev]);
    console.log('Created history item:', historyItem);
  };

  const selectHistory = (item: HistoryItem) => {
    console.log('Selecting history item:', item);
    setSelectedHistoryId(item.id);
    setIsHistoryMode(true);
    setIsPreparingNewMessage(false);
  };

  const prepareNewMessage = () => {
    console.log('Preparing new message from history mode');
    setIsPreparingNewMessage(true);
    setIsHistoryMode(false);
    setSelectedHistoryId(null);
  };

  const exitHistoryMode = () => {
    console.log('Exiting history mode');
    setIsHistoryMode(false);
    setSelectedHistoryId(null);
    setIsPreparingNewMessage(false);
  };

  const clearHistory = () => {
    console.log('Clearing history');
    setHistory([]);
    activeQueries.current.clear();
    setIsHistoryMode(false);
    setSelectedHistoryId(null);
    setIsPreparingNewMessage(false);
  };

  const getSelectedHistoryItem = (): HistoryItem | null => {
    return history.find(item => item.id === selectedHistoryId) || null;
  };

  return {
    history,
    isHistoryMode,
    selectedHistoryId,
    isPreparingNewMessage,
    handleQuerySent,
    handleResponseReceived,
    selectHistory,
    prepareNewMessage,
    exitHistoryMode,
    getSelectedHistoryItem,
    setIsHistoryMode,
    setSelectedHistoryId,
    clearHistory
  };
};
